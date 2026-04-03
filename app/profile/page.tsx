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
            .then(r => { if (r.status === 401) { router.push("/auth/signin"); } return r.json(); })
            .then(setProfile)
            .catch(() => router.push("/auth/signin"));
    }, [router]);

    const save = async (e: React.FormEvent) => {
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
        setTimeout(() => setSaved(false), 2500);
    };

    if (!profile) return (
        <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100dvh" }}>
            <Loader2 className="spin" style={{ width: 32, height: 32, color: "var(--accent)" }} />
        </div>
    );

    return (
        <div className="page">
            <div className="container">

                {/* Top bar */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: "1.25rem" }}>
                    <Link href="/" className="btn btn-icon" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <ArrowLeft style={{ width: 16, height: 16 }} />
                    </Link>
                    <h1 style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)" }}>My Profile</h1>
                    <button
                        className="btn btn-danger"
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        title="Sign out"
                        style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                    >
                        <LogOut style={{ width: 15, height: 15 }} />
                    </button>
                </div>

                {/* Avatar section */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: "1.5rem" }}>
                    <div style={{
                        width: 80, height: 80, borderRadius: "50%",
                        background: "linear-gradient(135deg,#7c3aed,#ec4899)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "1.75rem", fontWeight: 900, color: "#fff",
                        boxShadow: "0 4px 24px rgba(124,58,237,0.4)",
                    }}>
                        {profile.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div style={{ textAlign: "center" }}>
                        <p style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text)" }}>{profile.name || "Anonymous"}</p>
                        <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", marginTop: 2 }}>{profile.email}</p>
                    </div>
                </div>

                {/* Settings form */}
                <form onSubmit={save} className="card" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>

                    <div className="field">
                        <label className="label"><User style={{ width: 12, height: 12 }} /> Display name</label>
                        <input type="text" value={profile.name ?? ""} onChange={e => setProfile({ ...profile, name: e.target.value })} className="input" placeholder="Your name" />
                    </div>

                    <div className="field">
                        <label className="label"><Weight style={{ width: 12, height: 12 }} /> Body weight (kg)</label>
                        <input type="number" min={30} max={300} step={0.1} value={profile.weight}
                            onChange={e => setProfile({ ...profile, weight: parseFloat(e.target.value) })} className="input" />
                        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Used for accurate calorie calculation</p>
                    </div>

                    <div className="field">
                        <label className="label"><Footprints style={{ width: 12, height: 12 }} /> Stride length (m)</label>
                        <input type="number" min={0.3} max={1.5} step={0.01} value={profile.strideLength}
                            onChange={e => setProfile({ ...profile, strideLength: parseFloat(e.target.value) })} className="input" />
                        <p style={{ fontSize: "0.72rem", color: "var(--text-faint)" }}>Average is 0.78m — adjust for your height</p>
                    </div>

                    <div className="field">
                        <label className="label"><Target style={{ width: 12, height: 12 }} /> Daily step goal</label>
                        <input type="number" min={1000} max={100000} step={500} value={profile.dailyGoal}
                            onChange={e => setProfile({ ...profile, dailyGoal: parseInt(e.target.value) })} className="input" />
                    </div>

                    <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: 4 }}>
                        {saving
                            ? <Loader2 style={{ width: 18, height: 18 }} className="spin" />
                            : saved
                                ? <><Save style={{ width: 16, height: 16 }} /> Saved!</>
                                : <><Save style={{ width: 16, height: 16 }} /> Save Changes</>
                        }
                    </button>

                </form>

            </div>
        </div>
    );
}
