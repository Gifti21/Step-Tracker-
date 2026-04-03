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
    const [justRegistered, setJustRegistered] = useState(false);

    useEffect(() => {
        const e = params.get("email");
        if (e) setEmail(e);
        if (params.get("registered")) setJustRegistered(true);
    }, [params]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        const res = await signIn("credentials", { email, password, redirect: false });
        setLoading(false);
        if (res?.error) setError("Invalid email or password");
        else router.push("/");
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                        <Footprints className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-black text-white">Welcome back</h1>
                    {justRegistered
                        ? <p className="text-sm text-emerald-400">Account created! Sign in below</p>
                        : <p className="text-sm text-white/40">Sign in to your account</p>
                    }
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors" />
                        </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wider">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••" required
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors" />
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                    <button type="submit" disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In"}
                    </button>
                </form>

                <p className="text-center text-sm text-white/40">
                    No account?{" "}
                    <Link href="/auth/signup" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default function SignIn() {
    return (
        <Suspense>
            <SignInForm />
        </Suspense>
    );
}
