"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";

interface Session {
    id: number;
    date: string;
    steps: number;
    distance: number;
    calories: number;
    goal: number;
}

export default function StepHistory() {
    const [history, setHistory] = useState<Session[]>([]);

    useEffect(() => {
        fetch("/api/steps/history")
            .then((r) => r.json())
            .then((data) => Array.isArray(data) ? setHistory(data) : setHistory([]));
    }, []);

    if (!history.length) return null;

    const maxSteps = Math.max(...history.map((s) => s.steps), 1);
    const totalSteps = history.reduce((a, s) => a + s.steps, 0);
    const avgSteps = Math.round(totalSteps / history.length);

    return (
        <div className="glass-card rounded-3xl p-5 w-full max-w-sm mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <span className="text-sm font-semibold text-white/80">Weekly Activity</span>
                </div>
                <div className="text-right">
                    <p className="text-xs text-white/40">Avg / day</p>
                    <p className="text-sm font-bold gradient-text">{avgSteps.toLocaleString()}</p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end justify-between gap-1.5 h-24 mb-4">
                {[...history].reverse().map((s) => {
                    const heightPct = (s.steps / maxSteps) * 100;
                    const isToday = s.date === new Date().toISOString().split("T")[0];
                    const goalMet = s.steps >= s.goal;
                    const day = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });

                    return (
                        <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-full flex items-end justify-center" style={{ height: 80 }}>
                                <div
                                    className="w-full rounded-t-lg transition-all duration-500 relative overflow-hidden"
                                    style={{
                                        height: `${Math.max(heightPct, 4)}%`,
                                        background: goalMet
                                            ? "linear-gradient(to top, #10b981, #34d399)"
                                            : isToday
                                                ? "linear-gradient(to top, #7c3aed, #a855f7)"
                                                : "rgba(255,255,255,0.08)",
                                    }}
                                >
                                    {isToday && (
                                        <div className="absolute inset-0 bg-white/10 animate-pulse" />
                                    )}
                                </div>
                            </div>
                            <span className={`text-xs ${isToday ? "text-purple-400 font-semibold" : "text-white/30"}`}>
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* List */}
            <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                {history.map((s) => {
                    const pct = Math.min((s.steps / s.goal) * 100, 100);
                    const isToday = s.date === new Date().toISOString().split("T")[0];
                    const label = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                    });

                    return (
                        <div key={s.id} className="flex flex-col gap-1">
                            <div className="flex justify-between items-center">
                                <span className={`text-xs ${isToday ? "text-purple-400 font-medium" : "text-white/40"}`}>
                                    {isToday ? "Today" : label}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-white/30">{s.distance >= 1000 ? `${(s.distance / 1000).toFixed(1)}km` : `${s.distance}m`}</span>
                                    <span className="text-xs font-semibold text-white/70">{s.steps.toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="w-full h-1 rounded-full bg-white/5 overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-700"
                                    style={{
                                        width: `${pct}%`,
                                        background: pct >= 100
                                            ? "linear-gradient(to right, #10b981, #34d399)"
                                            : "linear-gradient(to right, #7c3aed, #a855f7)",
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
