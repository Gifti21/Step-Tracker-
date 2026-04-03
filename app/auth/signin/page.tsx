"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Footprints, Mail, Lock, Loader2 } from "lucide-react";

function SignInForm() {
    const router = useRouter();
    const params = useSearchParams();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [registered, setRegistered] = useState(false);

    useEffect(() => {
        const e = params.get("email");
        if (e) setEmail(e);
        if (params.get("registered")) setRegistered(true);
    }, [params]);

    const submit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true); setError("");
        const res = await signIn("credentials", { email, password, redirect: false });
        setLoading(false);
        if (res?.error) setError("Invalid email or password");
        else router.push("/");
    };

    return (
        <div className="bg-mesh min-h-screen flex items-center justify-center p-4 safe-top safe-bottom">
            <div className="glass rounded-3xl p-8 w-full fade-up" style={{ maxWidth: 400 }}>
                <div className="flex flex-col items-center gap-3 mb-8">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: "var(--grad)" }}>
                        <Footprints className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-center">
                        <h1 className="text-2xl font-black" style={{ color: "var(--text)" }}>Welcome back</h1>
                        {registered
                            ? <p className="text-sm mt-1" style={{ color: "var(--success)" }}>Account created — sign in below</p>
                            : <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>Sign in to continue</p>}
                    </div>
                </div>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required autoComplete="email"
                                className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-faint)" }}>Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--text-faint)" }} />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" required autoComplete="current-password"
                                className="input" style={{ paddingLeft: "2.5rem" }} />
                        </div>
                    </div>

                    {error && (
                        <p className="text-sm text-center py-2 px-3 rounded-xl" style={{ color: "var(--danger)", background: "rgba(239,68,68,0.1)" }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" disabled={loading} className="btn-primary mt-1">
                        {loading ? <Loader2 className="w-4 h-4 spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: "var(--text-muted)" }}>
                    No account?{" "}
                    <Link href="/auth/signup" className="font-semibold" style={{ color: "var(--accent)" }}>Sign up</Link>
                </p>
            </div>
        </div>
    );
}

export default function SignIn() {
    return <Suspense><SignInForm /></Suspense>;
}
