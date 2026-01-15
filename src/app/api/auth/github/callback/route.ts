import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const code = searchParams.get("code");
        const error = searchParams.get("error");

        if (error) {
            console.error("GitHub OAuth error:", error);
            return NextResponse.redirect(new URL("/?error=github_auth_failed", req.url));
        }

        if (!code) {
            return NextResponse.json({ error: "No code provided" }, { status: 400 });
        }

        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            return NextResponse.json({ error: "GitHub OAuth not configured" }, { status: 500 });
        }

        // Exchange code for access token
        const tokenResponse = await fetch("https://github.com/login/oauth/access_token", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                client_id: GITHUB_CLIENT_ID,
                client_secret: GITHUB_CLIENT_SECRET,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();

        if (tokenData.error) {
            console.error("GitHub token exchange error:", tokenData);
            return NextResponse.redirect(new URL("/?error=github_token_failed", req.url));
        }

        const accessToken = tokenData.access_token;

        // Get user info
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github.v3+json",
            },
        });

        const userData = await userResponse.json();

        // Connect to DB and ensure user exists
        await connectToDatabase();

        let dbUser = await User.findOne({ email: userData.email || userData.login }); // Fallback to login if email is private
        // Note: GitHub doesn't always provide email. We should handle that, but for now fallback to login is risky for uniqueness if it's not an email.
        // Better strategy: Use GitHub ID or try to get email. The scope requested user:email so we should have it.

        // Actually, let's rely on the strategy of creating a user if they don't exist.
        // We'll use their GitHub ID as a unique identifier if we were storing it, but our schema uses email.
        // Let's try to get the primary email if userData.email is null.
        let email = userData.email;
        if (!email) {
            const emailsResponse = await fetch("https://api.github.com/user/emails", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    Accept: "application/vnd.github.v3+json",
                },
            });
            const emails = await emailsResponse.json();
            const primaryEmail = emails.find((e: any) => e.primary && e.verified);
            if (primaryEmail) email = primaryEmail.email;
        }

        if (email) {
            dbUser = await User.findOne({ email });
            if (!dbUser) {
                // Create new user for GitHub login
                dbUser = await User.create({
                    name: userData.name || userData.login,
                    email: email,
                    password: "GITHUB_OAUTH_USER", // specific marker
                    avatar: userData.avatar_url,
                    isEmailVerified: true // GitHub verified
                });
            } else {
                // Update avatar if changed
                if (dbUser.avatar !== userData.avatar_url) {
                    dbUser.avatar = userData.avatar_url;
                    await dbUser.save();
                }
            }
        }

        // Store token in HTTP-only cookie (simple session management)
        const cookieStore = await cookies();
        cookieStore.set("github_token", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        // Store user info in cookie (keep consistent with DB user if possible)
        cookieStore.set("github_user", JSON.stringify({
            id: dbUser ? dbUser._id.toString() : userData.id,
            login: userData.login,
            name: dbUser ? dbUser.name : (userData.name || userData.login),
            email: email || userData.login,
            avatar_url: userData.avatar_url,
        }), {
            httpOnly: false, // Allow client-side access
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 30,
        });

        // Redirect to dashboard
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        return NextResponse.redirect(`${baseUrl}/`);
    } catch (error: any) {
        console.error("GitHub OAuth callback error:", error);
        return NextResponse.redirect(new URL("/?error=github_auth_error", req.url));
    }
}
