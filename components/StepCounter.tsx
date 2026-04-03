"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, RotateCcw, Zap, MapPin, Flame, Footprints } from "lucide-react";

const THRESHOLD = 12;
const COOLDOWN = 300;

function Ring({ value, size = 240, stroke = 16 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const done = value >= 100;
    return (
        <svg width={size} height={size} className="ring-svg absolute inset-0">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={done ? "url(#g2)" : "url(#g1)"}
                strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(.4,0,.2,1)" }} />
            <defs>
                <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function StepCounter() {
    const [steps, setSteps] = useState(0);
    const [goal, setGoal] = useState(10000);
    const [stride, setStride] = useState(0.78);
    const [weight, setWeight] = useState(70);
    const [tracking, setTracking] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [saved, setSaved] = useState(false);
    const [offline, setOffline] = useState(false);

    const lastTime = useRef(0);
    const lastAccel = useRef({ x: 0, y: 0, z: 0 });
    const saveTimer = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef<number | null>(null);
    const goalRef = useRef(goal);
    goalRef.current = goal;

    const doSave = useCallback((count: number) => {
        fetch("/api/steps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ steps: count, goal: goalRef.current }),
        })
            .then(() => { setSaved(true); setTimeout(() => setSaved(false), 1500); })
            .catch(() => { pendingRef.current = count; });
    }, []);

    const scheduleSave = useCallback((count: number, isOffline: boolean) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        if (isOffline) { pendingRef.current = count; return; }
        saveTimer.current = setTimeout(() => doSave(count), 2000);
    }, [doSave]);

    useEffect(() => {
        setMobile("DeviceMotionEvent" in window);
        setOffline(!navigator.onLine);

        const onOffline = () => setOffline(true);
        const onOnline = () => {
            setOffline(false);
            if (pendingRef.current !== null) {
                doSave(pendingRef.current);
                pendingRef.current = null;
            }
        };

        window.addEventListener("offline", onOffline);
        window.addEventListener("online", onOnline);

        Promise.all([
            fetch("/api/steps").then(r => r.json()).catch(() => ({})),
            fetch("/api/profile").then(r => r.json()).catch(() => ({})),
        ]).then(([s, p]) => {
            if (s?.steps != null) setSteps(s.steps);
            if (p?.dailyGoal) setGoal(p.dailyGoal);
            if (p?.strideLength) setStride(p.strideLength);
            if (p?.weight) setWeight(p.weight);
        });

        return () => {
            window.removeEventListener("offline", onOffline);
            window.removeEventListener("online", onOnline);
        };
    }, [doSave]);

    const handleMotion = useCallback((e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity;
        if (!a) return;
        const x = a.x ?? 0, y = a.y ?? 0, z = a.z ?? 0;
        const delta = Math.abs(x - lastAccel.current.x) + Math.abs(y - lastAccel.current.y) + Math.abs(z - lastAccel.current.z);
        lastAccel.current = { x, y, z };
        const now = Date.now();
        if (delta > THRESHOLD && now - lastTime.current > COOLDOWN) {
            lastTime.current = now;
            setSteps(p => { const n = p + 1; scheduleSave(n, offline); return n; });
            setBounce(true); setTimeout(() => setBounce(false), 200);
        }
    }, [scheduleSave, offline]);

    const start = async () => {
        if (mobile) {
            const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
            if (typeof DME.requestPermission === "function") {
                const p = await DME.requestPermission();
                if (p !== "granted") return;
            }
            window.addEventListener("devicemotion", handleMotion);
        }
        setTracking(true);
    };

    const stop = useCallback(() => {
        window.removeEventListener("devicemotion", handleMotion);
        setTracking(false);
    }, [handleMotion]);

    const reset = () => {
        stop();
        setSteps(0);
        doSave(0);
    };

    const tap = () => {
        if (!tracking) return;
        setSteps(p => { const n = p + 1; scheduleSave(n, offline); return n; });
        setBounce(true); setTimeout(() => setBounce(false), 200);
    };

    const dist = parseFloat((steps * stride).toFixed(2));
    const kcal = parseFloat((steps * 0.0005 * weight * 9.81 * stride).toFixed(1));
    const pct = Math.min((steps / goal) * 100, 100);
    const done = steps >= goal;

    return (
        <div className="w-full flex flex-col items-center gap-5 fade-up" style={{ animationDelay: "0.1s" }}>

            {/* Ring */}
            <div
                className={tracking ? "pulse-glow" : ""}
                style={{ position: "relative", width: 240, height: 240, borderRadius: "50%", cursor: mobile ? "default" : "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                onClick={!mobile ? tap : undefined}
            >
                <Ring value={pct} />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, zIndex: 1 }}>
                    <span
                        className={`font-black tracking-tight leading-none ${bounce ? "bounce-in" : ""} ${done ? "" : "grad-text"}`}
                        style={{ fontSize: "clamp(2.5rem,10vw,3.5rem)", color: done ? "var(--success)" : undefined }}
                    >
                        {steps.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-faint)" }}>steps</span>
                    <span style={{ fontSize: "0.72rem", color: "var(--text-faint)", marginTop: 2 }}>{Math.round(pct)}% of {goal.toLocaleString()}</span>
                </div>
            </div>

            {done && (
                <div className="flex items-center gap-2 fade-up" style={{
                    padding: "0.5rem 1.25rem", borderRadius: "var(--radius-full)",
                    background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)",
                    color: "var(--success)", fontSize: "0.875rem", fontWeight: 600,
                }}>
                    <Zap className="w-4 h-4" /> Goal reached — amazing!
                </div>
            )}

            {!mobile && tracking && (
                <p style={{ fontSize: "0.75rem", color: "var(--accent)", marginTop: -8 }}>Tap the ring to count steps</p>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "0.75rem", width: "100%" }}>
                {[
                    {
                        icon: <MapPin className="w-4 h-4" style={{ color: "#60a5fa" }} />, bg: "rgba(96,165,250,0.12)",
                        val: dist >= 1000 ? `${(dist / 1000).toFixed(1)}` : `${dist}`, unit: dist >= 1000 ? "km" : "m"
                    },
                    {
                        icon: <Flame className="w-4 h-4" style={{ color: "#fb923c" }} />, bg: "rgba(251,146,60,0.12)",
                        val: `${kcal}`, unit: "kcal"
                    },
                    {
                        icon: <Footprints className="w-4 h-4" style={{ color: "var(--accent)" }} />, bg: "rgba(139,92,246,0.12)",
                        val: Math.max(goal - steps, 0).toLocaleString(), unit: "left"
                    },
                ].map((s, i) => (
                    <div key={i} className="glass" style={{ borderRadius: "var(--radius)", padding: "0.75rem", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: s.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>{s.icon}</div>
                        <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1 }}>{s.val}</span>
                        <span style={{ fontSize: "0.7rem", color: "var(--text-faint)" }}>{s.unit}</span>
                    </div>
                ))}
            </div>

            {/* Save indicator */}
            <div style={{ height: 16, display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "0.75rem", color: "var(--success)", opacity: saved ? 1 : 0, transition: "opacity 0.3s" }}>
                    ✓ {offline ? "Saved locally" : "Saved"}
                </span>
            </div>

            {/* Controls */}
            <div style={{ display: "flex", gap: "0.75rem", width: "100%", marginTop: -8 }}>
                {!tracking ? (
                    <button onClick={start} className="btn-primary" style={{ flex: 1, borderRadius: "var(--radius)" }}>
                        <Play className="w-4 h-4" /> Start Tracking
                    </button>
                ) : (
                    <button onClick={stop} className="btn-primary" style={{ flex: 1, borderRadius: "var(--radius)", background: "linear-gradient(135deg,#dc2626,#ef4444)" }}>
                        <Square className="w-4 h-4" /> Stop
                    </button>
                )}
                <button onClick={reset} className="btn-ghost" style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)" }}>
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
