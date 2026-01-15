import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import connectToDatabase from "@/lib/mongodb";
import User from "@/lib/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        await connectToDatabase();

        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return NextResponse.json(
                { message: "If this email is registered, a verification link has been sent." },
                { status: 200 }
            );
        }

        if (user.isEmailVerified) {
            return NextResponse.json(
                { message: "Email is already verified. Please log in." },
                { status: 400 }
            );
        }

        // Generate new token
        const verificationToken = crypto.randomBytes(32).toString("hex");
        const verificationTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        user.verificationToken = verificationToken;
        user.verificationTokenExpiry = verificationTokenExpiry;
        await user.save();

        // Send email
        await sendVerificationEmail(user.email, verificationToken, user.name);

        return NextResponse.json(
            { message: "Verification email resent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Resend verification error:", error);
        return NextResponse.json(
            { error: "An error occurred" },
            { status: 500 }
        );
    }
}
