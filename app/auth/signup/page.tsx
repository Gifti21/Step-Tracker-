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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        // 1. Create account
        const res = await fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password }),
        });

        if (!res.ok) {
            try {
                const data = await res.json();
                setError(data.error ?? "Something went wrong");
            } catch {
                setError("Something went wrong. Please try again.");
            }
            setLoading(false);
            return;
        }

        // 2. Redirect to sign in — faster than calling signIn() which adds a round trip
        router.push(`/auth/signin?registered=1&email=${encodeURIComponent(email)}`);
    };

    return (
        <div className="min-h-screen bg-mesh flex items-center justify-center p-4">
            <div className="glass-card rounded-3xl p-8 w-full max-w-sm flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                        <Footprints className="w-6 h-6 text-white" />
                    </div>
                    <h1 className="text-xl font-black text-white">Create account</h1>
                    <p className="text-sm text-white/40">Start tracking your steps today</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-xs text-white/50 uppercase tracking-wider">Name</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                            <input type="text" value={name} onChange={e => setName(e.target.value)}
                                placeholder="Your name"
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors" />
                        </div>
                    </div>

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
                                placeholder="Min 8 characters" required minLength={8}
                                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-purple-500/50 transition-colors" />
                        </div>
                    </div>

                    {error && <p className="text-xs text-red-400 text-center">{error}</p>}

                    <button type="submit" disabled={loading}
                        className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                    </button>
                </form>

                <p className="text-center text-sm text-white/40">
                    Already have an account?{" "}
                    <Link href="/auth/signin" className="text-purple-400 hover:text-purple-300 transition-colors">
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}
