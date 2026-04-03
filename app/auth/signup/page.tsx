"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Footprints, Mail, Lock, User, Loader2 } from "lucide-react";

export default function SignUp() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            try { const d = await res.json(); setError(d.error ?? "Something went wrong."); }
            catch { setError("Something went wrong. Please try again."); }
            setLoading(false);
            return;
        }
        router.push(`/auth/signin?registered=1&email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="page auth-page">
            <div className="auth-card fade-up">

                {/* Logo */}
                <div className="auth-logo">
                    <Footprints style={{ width: 28, height: 28, color: "#fff" }} />
                </div>

                {/* Heading */}
                <div style={{ textAlign: "center", marginBottom: "1.75rem" }}>
                    <h1 style={{ fontSize: "1.5rem", fontWeight: 900, color: "var(--text)", marginBottom: 6 }}>
                        Create your account
                    </h1>
                    <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
                        Start tracking your steps today
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    <div className="field">
                        <label className="label">
                            <User style={{ width: 12, height: 12 }} /> Full name
                        </label>
                        <div className="input-wrap">
                            <User className="input-icon" style={{ width: 16, height: 16 }} />
                            <input
                                type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="Your name" autoComplete="name"
                                className="input has-icon"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">
                            <Mail style={{ width: 12, height: 12 }} /> Email address
                        </label>
                        <div className="input-wrap">
                            <Mail className="input-icon" style={{ width: 16, height: 16 }} />
                            <input
                                type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required autoComplete="email"
                                className="input has-icon"
                            />
                        </div>
                    </div>

                    <div className="field">
                        <label className="label">
                            <Lock style={{ width: 12, height: 12 }} /> Password
                        </label>
                        <div className="input-wrap">
                            <Lock className="input-icon" style={{ width: 16, height: 16 }} />
                            <input
                                type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Minimum 8 characters" required minLength={8} autoComplete="new-password"
                                className="input has-icon"
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: "var(--r)", padding: "0.75rem 1rem", color: "var(--danger)", fontSize: "0.85rem", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 4 }}>
                        {loading ? <Loader2 style={{ width: 18, height: 18 }} className="spin" /> : "Create Account"}
                    </button>
                </form>

                {/* Footer */}
                <p style={{ textAlign: "center", marginTop: "1.5rem", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link href="/auth/signin" style={{ color: "var(--accent)", fontWeight: 700, textDecoration: "none" }}>
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    );
}
