"use client";
import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineBanner() {
    const [offline, setOffline] = useState(false);

    useEffect(() => {
        const on = () => setOffline(true);
        const off = () => setOffline(false);
        setOffline(!navigator.onLine);
        window.addEventListener("offline", on);
        window.addEventListener("online", off);
        return () => { window.removeEventListener("offline", on); window.removeEventListener("online", off); };
    }, []);

    if (!offline) return null;

    return (
        <div className="offline-banner">
            <WifiOff style={{ display: "inline", width: 14, height: 14, marginRight: 6, verticalAlign: "middle" }} />
            You&apos;re offline — steps will sync when reconnected
        </div>
    );
}
