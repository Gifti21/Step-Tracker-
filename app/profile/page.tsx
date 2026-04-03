"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, User, Weight, Target, Footprints, LogOut, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Profile {
    name: string;
    email: string;
    weight: number;
    strideLength: number;
    dailyGoal: number;
}

export default function ProfilePage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch("/api/profile")
            .then(r => { if (r.status === 401) router.push("/auth/signin"); return r.json(); })
            .then(setProfile);
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(profile),
        });
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    if (!profile) return (
        <div className="min-h-screen bg-mesh flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
        </div>
    );

    return (
        <div className="min-h-screen bg-mesh p-4 pb-10 flex flex-col items-center gap-6">
            <div className="w-full max-w-sm pt-8 flex items-center justify-between">
                <Link href="/" className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-lg font-bold text-white">Profile</h1>
                <button onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-red-400 hover:text-red-300 transition-colors">
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center gap-2">
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black text-white"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                    {profile.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <p className="text-white font-semibold">{profile.name || "Anonymous"}</p>
                <p className="text-white/40 text-sm">{profile.email}</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSave} className="glass-card rounded-3xl p-6 w-full max-w-sm flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3 h-3" /> Name
                    </label>
                    <input type="text" value={profile.name ?? ""} onChange={e => setProfile({ ...profile, name: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Weight className="w-3 h-3" /> Weight (kg)
                    </label>
                    <input type="number" min={30} max={300} step={0.1}
                        value={profile.weight}
                        onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                    <p className="text-xs text-white/30">Used for accurate calorie calculation</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Footprints className="w-3 h-3" /> Stride Length (m)
                    </label>
                    <input type="number" min={0.3} max={1.5} step={0.01}
                        value={profile.strideLength}
                        onChange={e => setProfile({ ...profile, strideLength: parseFloat(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                    <p className="text-xs text-white/30">Average: 0.78m. Taller = longer stride</p>
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-white/50 uppercase tracking-wider flex items-center gap-1.5">
                        <Target className="w-3 h-3" /> Daily Goal (steps)
                    </label>
                    <input type="number" min={1000} max={100000} step={500}
                        value={profile.dailyGoal}
                        onChange={e => setProfile({ ...profile, dailyGoal: parseInt(e.target.value) })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-colors" />
                </div>

                <button type="submit" disabled={saving}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-white text-sm transition-all active:scale-95 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}>
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? "✓ Saved" : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </form>
        </div>
    );
}
