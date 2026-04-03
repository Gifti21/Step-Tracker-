import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StepCounter from "@/components/StepCounter";
import StepHistory from "@/components/StepHistory";
import Navbar from "@/components/Navbar";
import OfflineBanner from "@/components/OfflineBanner";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <>
      <OfflineBanner />
      <div className="bg-mesh" style={{ minHeight: "100dvh" }}>
        <div style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: "0 1rem 3rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1.5rem",
        }}>
          <div style={{ width: "100%", paddingTop: "1.25rem" }}>
            <Navbar />
          </div>

          <div className="fade-up" style={{ textAlign: "center" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--text-faint)", marginBottom: 4 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <h1 className="grad-text" style={{ fontSize: "2rem", fontWeight: 900, letterSpacing: "-0.02em" }}>
              StepTracker
            </h1>
          </div>

          <StepCounter />
          <StepHistory />
        </div>
      </div>
    </>
  );
}
