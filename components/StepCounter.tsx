"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Footprints, Play, Square, RotateCcw, Zap, MapPin, Flame } from "lucide-react";

const STEP_THRESHOLD = 12;
const STEP_COOLDOWN = 300;

function RingProgress({ value, size = 220, stroke = 14 }: { value: number; size?: number; stroke?: number }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (value / 100) * circ;
    const isComplete = value >= 100;

    return (
        <svg width={size} height={size} className="ring-progress absolute">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
            <circle
                cx={size / 2} cy={size / 2} r={r} fill="none"
                stroke={isComplete ? "url(#greenGrad)" : "url(#purpleGrad)"}
                strokeWidth={stroke}
                strokeDasharray={circ}
                strokeDashoffset={offset}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
            />
            <defs>
                <linearGradient id="purpleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#7c3aed" />
                    <stop offset="50%" stopColor="#a855f7" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <linearGradient id="greenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
            </defs>
        </svg>
    );
}

export default function StepCounter() {
    const [steps, setSteps] = useState(0);
    const [goal, setGoal] = useState(10000);
    const [strideLength, setStrideLength] = useState(0.78);
    const [weight, setWeight] = useState(70);
    const [isTracking, setIsTracking] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [bouncing, setBouncing] = useState(false);
    const [justSaved, setJustSaved] = useState(false);
    const lastStepTime = useRef(0);
    const lastAccel = useRef({ x: 0, y: 0, z: 0 });
    const saveTimer = useRef<NodeJS.Timeout | null>(null);

    const distance = parseFloat((steps * strideLength).toFixed(2));
    const calories = parseFloat((steps * 0.0005 * weight * 9.81 * strideLength).toFixed(1));
    const progress = Math.min((steps / goal) * 100, 100);
    const isGoalReached = steps >= goal;

    useEffect(() => {
        setIsMobile(typeof window !== "undefined" && "DeviceMotionEvent" in window);

        // load profile + today's steps in parallel
        Promise.all([
            fetch("/api/steps").then(r => r.json()),
            fetch("/api/profile").then(r => r.json()),
        ]).then(([stepData, profile]) => {
            setSteps(stepData.steps ?? 0);
            if (profile.dailyGoal) setGoal(profile.dailyGoal);
            if (profile.strideLength) setStrideLength(profile.strideLength);
            if (profile.weight) setWeight(profile.weight);
        });
    }, []);

    const triggerBounce = () => {
        setBouncing(true);
        setTimeout(() => setBouncing(false), 150);
    };

    const saveSteps = useCallback((count: number, currentGoal: number) => {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            fetch("/api/steps", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ steps: count, goal: currentGoal }),
            }).then(() => {
                setJustSaved(true);
                setTimeout(() => setJustSaved(false), 1500);
            });
        }, 2000);
    }, []);

    const handleMotion = useCallback((event: DeviceMotionEvent) => {
        const accel = event.accelerationIncludingGravity;
        if (!accel) return;
        const x = accel.x ?? 0;
        const y = accel.y ?? 0;
        const z = accel.z ?? 0;
        const delta =
            Math.abs(x - lastAccel.current.x) +
            Math.abs(y - lastAccel.current.y) +
            Math.abs(z - lastAccel.current.z);
        lastAccel.current = { x, y, z };
        const now = Date.now();
        if (delta > STEP_THRESHOLD && now - lastStepTime.current > STEP_COOLDOWN) {
            lastStepTime.current = now;
            setSteps((prev) => {
                const next = prev + 1;
                saveSteps(next, goal);
                return next;
            });
            triggerBounce();
        }
    }, [saveSteps, goal]);

    const startTracking = async () => {
        if (isMobile) {
            const DME = DeviceMotionEvent as unknown as { requestPermission?: () => Promise<string> };
            if (typeof DME.requestPermission === "function") {
                const perm = await DME.requestPermission();
                if (perm !== "granted") return;
            }
            window.addEventListener("devicemotion", handleMotion);
        }
        setIsTracking(true);
    };

    const stopTracking = () => {
        window.removeEventListener("devicemotion", handleMotion);
        setIsTracking(false);
    };

    const reset = () => {
        stopTracking();
        setSteps(0);
        fetch("/api/steps", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ steps: 0, goal }),
        });
    };

    const tapStep = () => {
        if (!isTracking) return;
        setSteps((prev) => {
            const next = prev + 1;
            saveSteps(next, goal);
            return next;
        });
        triggerBounce();
    };

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm mx-auto">

            {/* Ring + step count */}
            <div
                className={`relative flex items-center justify-center cursor-pointer select-none ${isTracking ? "pulse-active" : ""} ${isGoalReached ? "glow-green" : "glow-purple"}`}
                style={{ width: 220, height: 220, borderRadius: "50%" }}
                onClick={!isMobile ? tapStep : undefined}
            >
                <RingProgress value={progress} />
                <div className="flex flex-col items-center z-10">
                    <span className={`text-6xl font-black tracking-tight ${bouncing ? "step-bounce" : ""} ${isGoalReached ? "text-emerald-400" : "gradient-text"}`}>
                        {steps.toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40 mt-1 uppercase tracking-widest">steps</span>
                    <span className="text-xs text-white/30 mt-0.5">{Math.round(progress)}% of {goal.toLocaleString()}</span>
                </div>
            </div>

            {isGoalReached && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium">
                    <Zap className="w-4 h-4" /> Goal reached! Amazing work
                </div>
            )}

            {!isMobile && isTracking && (
                <p className="text-xs text-purple-400/70 -mt-2">Tap the ring to count steps</p>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-3 w-full">
                <div className="glass-card stat-card rounded-2xl p-3 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-400" />
                    </div>
                    <span className="text-base font-bold text-white">
                        {distance >= 1000 ? `${(distance / 1000).toFixed(1)}` : distance}
                    </span>
                    <span className="text-xs text-white/40">{distance >= 1000 ? "km" : "meters"}</span>
                </div>

                <div className="glass-card stat-card rounded-2xl p-3 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <Flame className="w-4 h-4 text-orange-400" />
                    </div>
                    <span className="text-base font-bold text-white">{calories}</span>
                    <span className="text-xs text-white/40">kcal</span>
                </div>

                <div className="glass-card stat-card rounded-2xl p-3 flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <Footprints className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-base font-bold text-white">
                        {Math.max(goal - steps, 0).toLocaleString()}
                    </span>
                    <span className="text-xs text-white/40">to goal</span>
                </div>
            </div>

            {/* Save indicator */}
            <div className={`text-xs transition-opacity duration-300 -mt-2 ${justSaved ? "opacity-100 text-emerald-400" : "opacity-0"}`}>
                ✓ Saved
            </div>

            {/* Controls */}
            <div className="flex gap-3 w-full -mt-2">
                {!isTracking ? (
                    <button onClick={startTracking}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm transition-all active:scale-95"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #a855f7, #ec4899)" }}>
                        <Play className="w-4 h-4" /> Start Tracking
                    </button>
                ) : (
                    <button onClick={stopTracking}
                        className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-white text-sm bg-red-500/80 hover:bg-red-500 transition-all active:scale-95">
                        <Square className="w-4 h-4" /> Stop
                    </button>
                )}
                <button onClick={reset}
                    className="w-12 h-12 rounded-2xl glass-card flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
