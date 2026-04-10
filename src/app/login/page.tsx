"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import toast from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)", display: "flex",
      alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{ width: 420 }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            fontSize: 10, fontWeight: 700, letterSpacing: "4px",
            color: "var(--accent)", textTransform: "uppercase", marginBottom: 10,
          }}>
            M.A. Kamil Farma (Pvt.) Ltd.
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ddeef8", lineHeight: 1.2, marginBottom: 6 }}>
            Pharmaceutical<br />Document System
          </h1>
          <p style={{ color: "var(--muted)", fontSize: 12 }}>
            DRAP-Licensed · GMP Compliant · Batch Documentation
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: 10, padding: 28,
        }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: 14 }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                color: "var(--muted)", marginBottom: 5,
                letterSpacing: "0.8px", textTransform: "uppercase",
              }}>
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@makamilfarma.com"
                style={{
                  width: "100%", padding: "9px 12px",
                  background: "var(--bg)", border: "1px solid var(--border2)",
                  borderRadius: 6, color: "var(--text)", fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: "block", fontSize: 10, fontWeight: 700,
                color: "var(--muted)", marginBottom: 5,
                letterSpacing: "0.8px", textTransform: "uppercase",
              }}>
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%", padding: "9px 12px",
                  background: "var(--bg)", border: "1px solid var(--border2)",
                  borderRadius: 6, color: "var(--text)", fontSize: 13,
                  outline: "none",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "10px 0",
                background: loading ? "var(--border)" : "var(--accent)",
                color: loading ? "var(--muted)" : "#fff",
                border: "none", borderRadius: 6,
                fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                letterSpacing: "0.3px",
              }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </button>
          </form>

          <div style={{
            marginTop: 20, paddingTop: 16,
            borderTop: "1px solid var(--border)",
            fontSize: 11, color: "var(--muted)", textAlign: "center",
          }}>
            Contact your system administrator to request access or reset your password.
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: 16, fontSize: 11, color: "var(--muted)" }}>
          {process.env.NEXT_PUBLIC_DRAP_LICENSE}
        </div>
      </div>
    </div>
  );
}
