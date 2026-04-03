"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <nav className="w-full flex items-center justify-between">
            {session?.user ? (
                <Link href="/profile"
                    className="flex items-center gap-2.5 px-3 py-2 rounded-2xl transition-all"
                    style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black text-white"
                        style={{ background: "var(--grad)" }}>
                        {session.user.name?.[0]?.toUpperCase() ?? <User className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-sm font-semibold" style={{ color: "var(--text-muted)" }}>
                        {session.user.name?.split(" ")[0] ?? "Profile"}
                    </span>
                </Link>
            ) : <div />}

            {mounted && (
                <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="btn-ghost w-10 h-10" style={{ borderRadius: "var(--radius-sm)" }}
                    aria-label="Toggle theme">
                    {theme === "dark"
                        ? <Sun className="w-4 h-4" style={{ color: "#fbbf24" }} />
                        : <Moon className="w-4 h-4" style={{ color: "var(--accent)" }} />}
                </button>
            )}
        </nav>
    );
}
