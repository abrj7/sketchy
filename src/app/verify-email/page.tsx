"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

// Separate component to wrap in Suspense for useSearchParams
function VerifyEmailContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState("Verifying your email...");

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("No verification token found.");
            return;
        }

        // Verify token
        fetch(`/api/auth/verify-email?token=${token}`)
            .then(async (res) => {
                const data = await res.json();
                if (res.ok) {
                    setStatus("success");
                    setMessage("Email verified successfully!");
                    // Optional: Redirect to login after 3 seconds
                    setTimeout(() => {
                        router.push("/");
                    }, 3000);
                } else {
                    setStatus("error");
                    setMessage(data.error || "Verification failed. The link may be invalid or expired.");
                }
            })
            .catch(() => {
                setStatus("error");
                setMessage("Something went wrong. Please try again later.");
            });
    }, [token, router]);

    return (
        <div style={{ maxWidth: "480px", width: "100%", background: "white", padding: "2.5rem", borderRadius: "16px", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)", textAlign: "center" }}>
            {status === "loading" && (
                <>
                    <Loader2 size={64} className="animate-spin" color="#00d2be" style={{ margin: "0 auto 1.5rem" }} />
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Verifying...
                    </h1>
                    <p style={{ color: "#64748b" }}>Please wait while we verify your email address.</p>
                </>
            )}

            {status === "success" && (
                <>
                    <CheckCircle size={64} color="#22c55e" style={{ margin: "0 auto 1.5rem" }} />
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Email Verified!
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: "2rem" }}>
                        Your account has been successfully verified. You will be redirected to the login page shortly.
                    </p>
                    <Link href="/" style={{ display: "inline-block", background: "#00d2be", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}>
                        Go to Login
                    </Link>
                </>
            )}

            {status === "error" && (
                <>
                    <XCircle size={64} color="#ef4444" style={{ margin: "0 auto 1.5rem" }} />
                    <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#1e293b" }}>
                        Verification Failed
                    </h1>
                    <p style={{ color: "#64748b", marginBottom: "2rem" }}>
                        {message}
                    </p>
                    <Link href="/" style={{ display: "inline-block", background: "#334155", color: "white", padding: "0.75rem 1.5rem", borderRadius: "8px", fontWeight: "600", textDecoration: "none" }}>
                        Back to Home
                    </Link>
                </>
            )}
            <style jsx global>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f0f9ff", padding: "1rem" }}>
            <Suspense fallback={<div>Loading...</div>}>
                <VerifyEmailContent />
            </Suspense>
        </main>
    );
}
