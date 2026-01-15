"use client";

import { useState } from "react";
import styles from "./AuthPage.module.css";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import { signIn, signUp, signInWithGitHub, getGitHubUser } from "@/lib/auth";

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export default function AuthPage({ onAuthSuccess }: AuthPageProps) {
  const [mode, setMode] = useState<"login" | "signup" | "verify">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Handle Resend Verification
  const handleResendVerification = async () => {
    setIsLoading(true);
    setSuccessMsg("");
    setError("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccessMsg("Verification email resent!");
      } else {
        setError(data.error || "Failed to resend email");
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
        const result = await signUp(name, email, password);

        if (result.needsVerification) {
          setMode("verify");
          setIsLoading(false);
          return;
        }

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      } else {
        const result = await signIn(email, password);

        if (result.needsVerification) {
          setMode("verify");
          setError(result.error || "Please verify your email");
          setIsLoading(false);
          return;
        }

        if (result.error) {
          setError(result.error);
          setIsLoading(false);
          return;
        }
      }
      // Success - proceed to dashboard
      onAuthSuccess();
    } catch (err) {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  };

  // ----- VERIFICATION CHECK SCREEN -----
  if (mode === "verify") {
    return (
      <main className="mesh-background">
        <div className={styles.container}>
          <div className={styles.brand}>
            <h1 className={styles.logo}>SKETCHY</h1>
          </div>

          <div className={styles.card} style={{ maxWidth: "480px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "2rem" }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "#00d2be",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "1.5rem"
              }}>
                <Mail size={40} color="white" />
              </div>
              <h2 style={{ fontSize: "1.75rem", fontWeight: "700", marginBottom: "0.75rem", color: "var(--ws-ink)" }}>
                Check Your Email!
              </h2>
              <p style={{ color: "#64748b", fontSize: "1rem" }}>
                We've sent a confirmation link to:
              </p>
              <div style={{
                background: "#f1f5f9",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                marginTop: "1rem",
                width: "100%",
                fontWeight: "600",
                color: "var(--ws-ink)",
                border: "1px solid #e2e8f0"
              }}>
                {email}
              </div>
            </div>

            <div style={{
              background: "#f8fafc",
              borderRadius: "12px",
              padding: "1.5rem",
              marginBottom: "2rem",
              textAlign: "left",
              border: "1px solid #e2e8f0"
            }}>
              <h3 style={{ color: "var(--ws-ink)", fontSize: "1rem", marginBottom: "1rem" }}>Next steps:</h3>
              <ol style={{ color: "#64748b", paddingLeft: "1.25rem", lineHeight: "1.6", margin: 0 }}>
                <li>Open the email from Sketchy</li>
                <li>Click the verification link</li>
                <li>Come back and log in!</li>
              </ol>
            </div>

            <div style={{ textAlign: "center" }}>
              <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
                Didn't receive it? {successMsg ? <span style={{ color: "green", fontWeight: "bold" }}>{successMsg}</span> : "Check your spam folder."}
              </p>

              {!successMsg && (
                <button
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00d2be",
                    cursor: "pointer",
                    fontWeight: "600",
                    marginBottom: "1.5rem",
                    textDecoration: "underline"
                  }}
                >
                  Resend Email
                </button>
              )}

              <button
                className={styles.submitBtn}
                onClick={() => setMode("login")}
              >
                <ArrowRight size={18} style={{ transform: "rotate(180deg)" }} />
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mesh-background">
      <div className={styles.container}>
        {/* Logo / Brand */}
        <div className={styles.brand}>
          <h1 className={styles.logo}>SKETCHY</h1>
          <p className={styles.tagline}>Draw it. Build it. Ship it.</p>
        </div>

        {/* Auth Card */}
        <div className={styles.card}>
          {/* Tab Switcher */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${mode === "login" ? styles.activeTab : ""}`}
              onClick={() => { setMode("login"); setError(""); }}
            >
              Login
            </button>
            <button
              className={`${styles.tab} ${mode === "signup" ? styles.activeTab : ""}`}
              onClick={() => { setMode("signup"); setError(""); }}
            >
              Sign Up
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className={styles.form}>
            {mode === "signup" && (
              <div className={styles.inputGroup}>
                <User size={18} className={styles.inputIcon} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={styles.input}
                  required
                  disabled={isLoading}
                />
              </div>
            )}

            <div className={styles.inputGroup}>
              <Mail size={18} className={styles.inputIcon} />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.inputGroup}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
                minLength={8}
                disabled={isLoading}
              />
            </div>

            {mode === "signup" && (
              <p className={styles.passwordHint}>
                Password: 8+ chars, uppercase, lowercase, special character
              </p>
            )}

            <button type="submit" className={styles.submitBtn} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 size={18} className={styles.spinner} />
                  {mode === "login" ? "Logging in..." : "Creating account..."}
                </>
              ) : (
                <>
                  {mode === "login" ? "Login" : "Create Account"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className={styles.divider}>
            <span>or continue with</span>
          </div>

          {/* OAuth Buttons */}
          <div className={styles.oauthButtons}>
            <button className={styles.oauthBtn} disabled title="Google login not yet implemented">
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button
              className={styles.oauthBtn}
              onClick={() => {
                // Check if already authenticated via GitHub
                const githubUser = getGitHubUser();
                if (githubUser) {
                  // Already authenticated - go directly to dashboard
                  onAuthSuccess();
                } else {
                  // Not authenticated - start OAuth flow
                  signInWithGitHub();
                }
              }}
            >
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className={styles.footer}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className={styles.switchBtn}
            onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
          >
            {mode === "login" ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </main>
  );
}
