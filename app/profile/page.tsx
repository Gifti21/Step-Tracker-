"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { ArrowLeft, User, Weight, Target, Footprints, LogOut, Save, Loader2 } from "lucide-react";
import Link from "next/link";

interface Profile { name: string; email: string; weight: number; strideLength: number; dailyGoal: number; }

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

    const save = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profile) return;
        setSaving(true);
        await fetch("/api/profile", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
        setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
    };

    if (!profile) return (
        <div className="bg-mesh min-h-screen flex items-center justify-center">
            <Loader2 className="w-6 h-6 spin" style={{ color: "var(--accent)" }} />
        </div>
    );

    const fields = [
        {
            label: "Name", icon: User, type: "text", val: profile.name ?? "", hint: "",
            onChange: (v: string) => setProfile({ ...profile, name: v })
        },
        {
            label: "Weight (kg)", icon: Weight, type: "number", val: String(profile.weight), hint: "Used for calorie calculation",
            onChange: (v: string) => setProfile({ ...profile, weight: parseFloat(v) })
        },
        {
            label: "Stride Length (m)", icon: Footprints, type: "number", val: String(profile.strideLength), hint: "Average: 0.78m",
            onChange: (v: string) => setProfile({ ...profile, strideLength: parseFloat(v) })
        },
        {
            label: "Daily Goal (steps)", icon: Target, type: "number", val: String(profile.dailyGoal), hint: "",
            onChange: (v: string) => setProfile({ ...profile, dailyGoal: parseInt(v) })
        },
    ];

    return (
        <div className="bg-mesh min-h-screen safe-top safe-bottom flex flex-col items-center px-4 pb-8 gap-6 max-w-lg mx-auto w-full">
            <div className="w-full pt-4 flex items-center justify-between">
                <Link href="/" className="btn-ghost w-10 h-10" style={{ borderRadius: "var(--radius-sm)" }}>
                    <ArrowLeft className="w-4 h-4" />
                </Link>
                <h1 className="text-lg font-black" style={{ color: "var(--text)" }}>Profile</h1>
                <button onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="btn-ghost w-10 h-10" style={{ borderRadius: "var(--radius-sm)", color: "var(--danger)" }}>
                    <LogOut className="w-4 h-4" />
                </button>
            </div>

            <div className="flex flex-col items-center gap-3 fade-up">
                <div className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-black text-white"
                    style={{ background: "var(--grad)", boxShadow: "0 8px 32px rgba(139,92,246,0.4)" }}>
                    {profile.name?.[0]?.toUpperCase() ?? "?"}
                </div>
                <div className="text-center">
                    <p className="font-bold text-lg" style={{ color: "var(--text)" }}>{profile.name || "Anonymous"}</p>
                    <p className="text-sm" style={{ color: "var(--text-muted)" }}>{profile.email}</p>
                </div>
            </div>

            <form onSubmit={save} className="glass rounded-3xl p-6 w-full flex flex-col gap-5 fade-up" style={{ animationDelay: "0.1s" }}>
                {fields.map(({ label, icon: Icon, type, val, hint, onChange }) => (
                    <div key={label} className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5" style={{ color: "var(--text-faint)" }}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </label>
                        <input type={type} value={val} onChange={e => onChange(e.target.value)} className="input" />
                        {hint && <p className="text-xs" style={{ color: "var(--text-faint)" }}>{hint}</p>}
                    </div>
                ))}

                <button type="submit" disabled={saving} className="btn-primary mt-1">
                    {saving ? <Loader2 className="w-4 h-4 spin" /> : saved ? "✓ Saved" : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
            </form>
        </div>
    );
}
