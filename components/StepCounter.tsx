"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, Square, RotateCcw, Zap, MapPin, Flame, Footprints, Timer } from "lucide-react";

// ── Algorithm constants ─────────────────────────────────────────────────────
const THRESHOLD = 10;      // min delta magnitude to count a step
const COOLDOWN = 280;     // ms between steps (prevents double-counting)
const ALPHA = 0.15;    // low-pass filter coefficient (smooths noise)
const SIZE = 240;
const STROKE = 16;

// ── Ring SVG ────────────────────────────────────────────────────────────────
function Ring({ value }: { value: number }) {
    const r = (SIZE - STROKE) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const done = value >= 100;
    return (
        <svg width={SIZE} height={SIZE} className="ring-svg">
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none" stroke="rgba(139,92,246,0.1)" strokeWidth={STROKE} />
            <circle cx={SIZE / 2} cy={SIZE / 2} r={r} fill="none"
                stroke={done ? "url(#gDone)" : "url(#gPurple)"}
                strokeWidth={STROKE} strokeDasharray={circ} strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s cubic-bezier(.4,0,.2,1)" }}
            />
            <defs>
                <linearGradient id="gPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="gDone" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    );
}

// ── Format seconds as MM:SS ─────────────────────────────────────────────────
function formatTime(sec: number) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function StepCounter() {
    const [steps, setSteps] = useState(0);
    const [goal, setGoal] = useState(10000);
    const [stride, setStride] = useState(0.78);
    const [weight, setWeight] = useState(70);
    const [tracking, setTracking] = useState(false);
    const [mobile, setMobile] = useState(false);
    const [bounce, setBounce] = useState(false);
    const [saved, setSaved] = useState(false);
    const [elapsed, setElapsed] = useState(0);   // session seconds

    // Refs (avoid stale closures)
    const lastTime = useRef(0);
    const filteredRef = useRef({ x: 0, y: 0, z: 0 });  // low-pass filtered accel
    const saveTimer = useRef<NodeJS.Timeout | null>(null);
    const pendingRef = useRef<number | null>(null);
    const offlineRef = useRef(false);
    const goalRef = useRef(goal);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    goalRef.current = goal;

    // ── Save helper ──────────────────────────────────────────────────────────
    const doSave = useCallback((count: number) => {
        fetch("/api/steps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ steps: count, goal: goalRef.current }),
        })
            .then(() => { setSaved(true); setTimeout(() => setSaved(false), 1500); })
            .catch(() => { pendingRef.current = count; });
    }, []);

    const scheduleSave = useCallback((count: number) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        if (offlineRef.current) { pendingRef.current = count; return; }
        saveTimer.current = setTimeout(() => doSave(count), 2000);
    }, [doSave]);

    // ── Step flash ─────────────────────────────────────────────────────────
    const flashBounce = useCallback(() => {
        setBounce(true);
        setTimeout(() => setBounce(false), 250);
    }, []);

    // ── Mount: detect capabilities, fetch today's data ──────────────────────
    useEffect(() => {
        setMobile("DeviceMotionEvent" in window);
        offlineRef.current = !navigator.onLine;

        const onOffline = () => { offlineRef.current = true; };
        const onOnline = () => {
            offlineRef.current = false;
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

    // ── Session timer ────────────────────────────────────────────────────────
    useEffect(() => {
        if (tracking) {
            setElapsed(0);
            timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [tracking]);

    // ── Motion handler (improved: low-pass filter + magnitude peak detection) ─
    const handleMotion = useCallback((e: DeviceMotionEvent) => {
        const a = e.accelerationIncludingGravity;
        if (!a) return;

        const rx = a.x ?? 0, ry = a.y ?? 0, rz = a.z ?? 0;

        // Low-pass filter to remove high-frequency noise
        const fx = filteredRef.current;
        const smoothX = fx.x + ALPHA * (rx - fx.x);
        const smoothY = fx.y + ALPHA * (ry - fx.y);
        const smoothZ = fx.z + ALPHA * (rz - fx.z);
        filteredRef.current = { x: smoothX, y: smoothY, z: smoothZ };

        // Magnitude of acceleration
        const mag = Math.sqrt(smoothX * smoothX + smoothY * smoothY + smoothZ * smoothZ);

        // Simple peak detection: threshold + cooldown
        const now = Date.now();
        if (mag > THRESHOLD && now - lastTime.current > COOLDOWN) {
            lastTime.current = now;
            setSteps(prev => {
                const next = prev + 1;
                scheduleSave(next);
                return next;
            });
            flashBounce();
        }
    }, [scheduleSave, flashBounce]);

    // ── Start / Stop ─────────────────────────────────────────────────────────
    const start = async () => {
        if (mobile) {
            const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
            if (typeof DME.requestPermission === "function") {
                const perm = await DME.requestPermission();
                if (perm !== "granted") return;
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
        setElapsed(0);
        doSave(0);
    };

    // Desktop tap-to-count
    const tap = () => {
        if (!tracking) return;
        setSteps(prev => {
            const next = prev + 1;
            scheduleSave(next);
            return next;
        });
        flashBounce();
    };

    // ── Derived stats ────────────────────────────────────────────────────────
    const dist = parseFloat((steps * stride).toFixed(2));
    const kcal = parseFloat((steps * 0.0005 * weight * 9.81 * stride).toFixed(1));
    const pct = Math.min((steps / goal) * 100, 100);
    const done = steps >= goal;

    return (
        <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>

            {/* Ring */}
            <div
                className={`ring-container ${tracking ? "pulse-glow" : ""}`}
                style={{ width: SIZE, height: SIZE, cursor: !mobile ? "pointer" : "default" }}
                onClick={!mobile ? tap : undefined}
                title={!mobile ? (tracking ? "Tap to add a step" : undefined) : undefined}
            >
                <Ring value={pct} />
                <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    gap: 4, zIndex: 1,
                }}>
                    <span
                        className={bounce ? "bounce-in" : ""}
                        style={{
                            fontSize: "clamp(2.6rem,11vw,3.4rem)",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                            lineHeight: 1,
                            ...(done
                                ? { color: "var(--success)" }
                                : { background: "linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }
                            ),
                        }}
                    >
                        {steps.toLocaleString()}
                    </span>
                    <span style={{ fontSize: "0.62rem", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-faint)" }}>steps</span>
                    <span style={{ fontSize: "0.68rem", color: "var(--text-faint)" }}>{Math.round(pct)}% of {goal.toLocaleString()}</span>

                    {/* Session timer */}
                    {tracking && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4, color: "var(--accent)", fontSize: "0.65rem", fontWeight: 700 }}>
                            <Timer style={{ width: 11, height: 11 }} />
                            {formatTime(elapsed)}
                        </div>
                    )}
                </div>
            </div>

            {/* Goal reached badge */}
            {done && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "0.5rem 1.25rem", borderRadius: "var(--r-full)", background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "var(--success)", fontSize: "0.875rem", fontWeight: 600 }}>
                    <Zap style={{ width: 15, height: 15 }} /> Goal reached — amazing work! 🎉
                </div>
            )}

            {/* Desktop hint */}
            {!mobile && (
                <p style={{ fontSize: "0.75rem", color: tracking ? "var(--accent)" : "var(--text-faint)", fontWeight: tracking ? 600 : 400, marginTop: -4 }}>
                    {tracking ? "👆 Tap the ring to count steps" : "Press Start, then tap the ring to count"}
                </p>
            )}

            {/* Stats */}
            <div className="stats-grid">
                {[
                    { icon: <MapPin style={{ width: 16, height: 16, color: "#60a5fa" }} />, bg: "rgba(96,165,250,0.12)", val: dist >= 1000 ? `${(dist / 1000).toFixed(2)}` : `${dist}`, unit: dist >= 1000 ? "km" : "meters" },
                    { icon: <Flame style={{ width: 16, height: 16, color: "#fb923c" }} />, bg: "rgba(251,146,60,0.12)", val: `${kcal}`, unit: "calories" },
                    { icon: <Footprints style={{ width: 16, height: 16, color: "var(--accent)" }} />, bg: "var(--accent-light)", val: Math.max(goal - steps, 0).toLocaleString(), unit: "to goal" },
                ].map((s, i) => (
                    <div key={i} className="stat-card">
                        <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                        <span style={{ fontSize: "1rem", fontWeight: 800, color: "var(--text)", lineHeight: 1 }}>{s.val}</span>
                        <span style={{ fontSize: "0.62rem", color: "var(--text-faint)", textAlign: "center" }}>{s.unit}</span>
                    </div>
                ))}
            </div>

            {/* Save indicator */}
            <p style={{ fontSize: "0.75rem", color: "var(--success)", opacity: saved ? 1 : 0, transition: "opacity 0.3s", height: 16 }}>
                ✓ {offlineRef.current ? "Saved locally" : "Saved"}
            </p>

            {/* Controls */}
            <div style={{ display: "flex", gap: "0.75rem", width: "100%" }}>
                {!tracking ? (
                    <button onClick={start} className="btn btn-primary" style={{ flex: 1 }}>
                        <Play style={{ width: 16, height: 16 }} /> Start Tracking
                    </button>
                ) : (
                    <button onClick={stop} className="btn btn-primary" style={{ flex: 1, background: "linear-gradient(135deg,#dc2626,#ef4444)", boxShadow: "0 4px 18px rgba(239,68,68,0.35)" }}>
                        <Square style={{ width: 16, height: 16 }} /> Stop Tracking
                    </button>
                )}
                <button onClick={reset} className="btn btn-icon" style={{ width: 48, height: 48 }}>
                    <RotateCcw style={{ width: 16, height: 16 }} />
                </button>
            </div>

        </div>
    );
}
