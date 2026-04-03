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
        setLoading(true); setError("");
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });
        if (!res.ok) {
            try { const d = await res.json(); setError(d.error ?? "Something went wrong"); }
            catch { setError("Something went wrong. Please try again."); }
            setLoading(false); return;
        }
        router.push(`/auth/signin?registered=1&email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="bg-mesh min-h-screen flex items-center justify-center p-4 safe-top safe-bottom">
            <div className="glass rounded-3xl p-8 w-full fade-up" style={{ maxWidth: 400 }}>
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--grad)" }}>
                        <Footprints className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>Create account</h1>
                        <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Start tracking your steps today</p>
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    {[
                        { label: "Name", type: "text", val: name, set: setName, ph: "Your name", icon: User, ac: "name" },
                        { label: "Email", type: "email", val: email, set: setEmail, ph: "you@example.com", icon: Mail, ac: "email" },
                        { label: "Password", type: "password", val: password, set: setPassword, ph: "Min 8 characters", icon: Lock, ac: "new-password" },
                    ].map(({ label, type, val, set, ph, icon: Icon, ac }) => (
                        <div key={label} className="flex flex-col gap-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>{label}</label>
                            <div className="relative">
                                <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                                <input type={type} value={val} onChange={e => set(e.target.value)}
                                    placeholder={ph} autoComplete={ac}
                                    required={label !== "Name"} minLength={label === "Password" ? 8 : undefined}
                                    className="input" style={{ paddingLeft: "2.5rem" }} />
                            </div>
                        </div>
                    ))}

                    {error && (
                        <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ color: "var(--danger)", background: "rgba(239,68,68,0.1)" }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary mt-1">
                        {loading ? <Loader2 className="w-4 h-4 spin" /> : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="font-semibold" style={{ color: "var(--accent)" }}>Sign in</Link>
                </p>
            </div>
        </div>
    );
}
