"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, User } from "lucide-react";

export default function Navbar() {
    const { data: session } = useSession();
    const { theme, setTheme } = useTheme();

    return (
        <nav className="w-full max-w-sm mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
                {session?.user && (
                    <Link href="/profile"
                        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all hover:scale-105"
                        style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
                        {session.user.name?.[0]?.toUpperCase() ?? <User className="w-4 h-4" />}
                    </Link>
                )}
            </div>

            <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-9 h-9 glass-card rounded-xl flex items-center justify-center text-white/60 hover:text-white transition-all active:scale-95"
            >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
        </nav>
    );
}
