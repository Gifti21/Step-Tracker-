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

    return (
        <div className={`offline-banner ${offline ? "show" : ""}`}>
            <WifiOff className="inline w-3.5 h-3.5 mr-1.5 -mt-0.5" />
            You&apos;re offline — steps will sync when reconnected
        </div>
    );
}
