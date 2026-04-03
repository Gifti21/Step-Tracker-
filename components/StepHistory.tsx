"use client";

import { useEffect, useState } from "react";
import { TrendingUp, CheckCircle } from "lucide-react";

interface Session {
  id: number; date: string; steps: number;
  distance: number; calories: number; goal: number;
}

const GRAD = "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)";
const GRAD_GREEN = "linear-gradient(135deg,#059669,#34d399)";

export default function StepHistory() {
  const [history, setHistory] = useState<Session[]>([]);

  useEffect(() => {
    fetch("/api/steps/history")
      .then(r => r.json())
      .then(d => Array.isArray(d) ? setHistory(d) :
    if (!history.length) return null;

    const max = Math.max(...history.map(s => s.steps), 1);
    const avg = Math.round(history.reduce((a, s) => a + s.steps, 0) / history.length);
    const today = new Date().toISOString().split("T")[0];

    return (
        <div className="glass rounded-3xl p-5 w-full fade-up" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "rgba(139,92,246,0.15)" }}>
                        <TrendingUp className="w-4 h-4" style={{ color: "var(--accent)" }} />
                    </div>
                    <span className="text-sm font-bold" style={{ color: "var(--text)" }}>Weekly Activity</span>
                </div>
                <div className="text-right">
                    <p className="text-xs" style={{ color: "var(--text-faint)" }}>Daily avg</p>
                    <p className="text-sm font-black grad-text">{avg.toLocaleString()}</p>
                </div>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-2 mb-5" style={{ height: 80 }}>
                {[...history].reverse().map(s => {
                    const h = Math.max((s.steps / max) * 100, 3);
                    const isToday = s.date === today;
                    const met = s.steps >= s.goal;
                    const day = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short" });
                    return (
                        <div key={s.id} className="flex flex-col items-center gap-1 flex-1">
                            <div className="w-full flex items-end" style={{ height: 64 }}>
                                <div className="w-full rounded-t-lg overflow-hidden relative transition-all duration-700"
                                    style={{
                                        height: `${h}%`,
                                        background: met ? "var(--grad-green)" : isToday ? "var(--grad)" : "var(--surface-hover)",
                                        minHeight: 3,
                                    }}>
                                    {isToday && <div className="absolute inset-0 animate-pulse" style={{ background: "rgba(255,255,255,0.15)" }} />}
                                </div>
                            </div>
                            <span className="text-xs font-medium" style={{ color: isToday ? "var(--accent)" : "var(--text-faint)", fontSize: "0.65rem" }}>
                                {day}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* List */}
            <div className="flex flex-col gap-3" style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                {history.map(s => {
                    const pct = Math.min((s.steps / s.goal) * 100, 100);
                    const isToday = s.date === today;
                    const met = s.steps >= s.goal;
                    const label = new Date(s.date + "T00:00:00").toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
                    return (
                        <div key={s.id} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-1.5">
                                    {met && <CheckCircle className="w-3 h-3" style={{ color: "var(--success)" }} />}
                                    <span className="text-xs font-semibold" style={{ color: isToday ? "var(--accent)" : "var(--text-muted)" }}>
                                        {isToday ? "Today" : label}
                                    </span>
                                </div>
                                <span className="text-xs font-bold" style={{ color: "var(--text)" }}>{s.steps.toLocaleString()}</span>
                            </div>
                            <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--surface-hover)" }}>
                                <div className="h-full rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%`, background: met ? "var(--grad-green)" : "var(--grad)" }} />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
