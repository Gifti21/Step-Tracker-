"use client";

import { useEffect, useState } from "react";
import { TrendingUp, CheckCircle } from "lucide-react";

interface Session {
    id: number;
    date: string;
    steps: number;
    distance: number;
    calories: number;
    goal: number;
}

const GRAD = "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)";
const GRAD_GREEN = "linear-gradient(135deg,#059669,#34d399)";

export default function StepHistory() {
    const [history, setHistory] = useState<Session[]>([]);

    useEffect(() => {
        fetch("/api/steps/history")
            .then(r => r.json())
            .then(d => { if (Array.isArray(d)) setHistory(d); })
            .catch(() => { });
    }, []);

    if (!history.length) return null;

    const max = Math.max(...history.map(s => s.steps), 1);
    const avg = Math.round(history.reduce((a, s) => a + s.steps, 0) / history.length);
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="glass" style={{ borderRadius: 24, padding: "1.25rem", width: "100%" }}>
            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(139,92,246,0.15)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <TrendingUp style={{ width: 16, height: 16, color: "var(--accent)" }} />
                    </div>
                    <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--text)" }}>Weekly Activity</span>
                </div>
                <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: "0.65rem", color: "var(--text-faint)", marginBottom: 2 }}>Daily avg</p>
                    <p style={{ fontSize: "0.875rem", fontWeight: 900, background: GRAD, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                        {avg.toLocaleString()}
                    </p>
                </div>
            </div>

            {/* Bar chart */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80, marginBottom: "1.25rem" }}>
                {[...history].reverse().map(s => {
                    const h = Math.max((s.steps / max) * 100, 4);
                    const isToday = s.date === today;
                    const met = s.steps >= s.goal;
                    const day = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
                    return (
                        <div key={s.id} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                            <div style={{ width: "100%", display: "flex", alignItems: "flex-end", height: 64 }}>
                                <div style={{
                                    width: "100%",
                                    height: `${h}%`,
                                    minHeight: 3,
                                    borderRadius: "6px 6px 0 0",
                                    background: met ? GRAD_GREEN : isToday ? GRAD : "rgba(255,255,255,0.08)",
                                    transition: "height 0.7s cubic-bezier(.4,0,.2,1)",
                                    position: "relative",
                                    overflow: "hidden",
                                }}>
                                    {isToday && <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.12)", animation: "pulse 2s infinite" }} />}
                                </div>
                            </div>
                            <span style={{ fontSize: "0.6rem", fontWeight: isToday ? 700 : 400, color: isToday ? "var(--accent)" : "var(--text-faint)" }}>
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* List */}
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                {history.map(s => {
                    const pct = Math.min((s.steps / s.goal) * 100, 100);
                    const isToday = s.date === today;
                    const met = s.steps >= s.goal;
                    const label = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                        <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    {met && <CheckCircle style={{ width: 12, height: 12, color: "var(--success)" }} />}
                                    <span style={{ fontSize: "0.78rem", fontWeight: isToday ? 700 : 500, color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
                                        {isToday ? "Today" : label}
                                    </span>
                                </div>
                                <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "var(--text)" }}>
                                    {s.steps.toLocaleString()}
                                </span>
                            </div>
                            <div style={{ width: "100%", height: 5, borderRadius: 999, background: "var(--surface-hover)", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: met ? GRAD_GREEN : GRAD, transition: "width 0.7s cubic-bezier(.4,0,.2,1)" }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
