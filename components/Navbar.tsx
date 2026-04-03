"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, LogOut, Footprints, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function Navbar() {
    const { data: session, status } = useSession();
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    return (
        <nav className="navbar">
            {/* Brand */}
            <Link href="/" className="navbar-brand">
                <div className="navbar-logo">
                    <Footprints style={{ width: 18, height: 18, color: "#fff" }} />
                </div>
                <span className="navbar-title">StepTracker</span>
            </Link>

            {/* Actions */}
            <div className="navbar-actions">
                {mounted && (
                    <button
                        className="btn btn-icon"
                        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                        aria-label="Toggle theme"
                    >
                        {theme === "dark"
                            ? <Sun style={{ width: 15, height: 15, color: "#fbbf24" }} />
                            : <Moon style={{ width: 15, height: 15, color: "var(--accent)" }} />
                        }
                    </button>
                )}

                {status === "authenticated" && (
                    <>
                        <Link
                            href="/profile"
                            className="btn btn-icon"
                            title={session?.user?.name ?? "Profile"}
                            style={{
                                background: "var(--grad)",
                                border: "none",
                                color: "#fff",
                                fontWeight: 800,
                                fontSize: "0.8rem",
                            }}
                        >
                            {session?.user?.name?.[0]?.toUpperCase() ?? <User style={{ width: 15, height: 15 }} />}
                        </Link>

                        <button
                            className="btn btn-danger"
                            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                            title="Sign out"
                        >
                            <LogOut style={{ width: 15, height: 15 }} />
                        </button>
                    </>
                )}
            </div>
        </nav>
    );
}
