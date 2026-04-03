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
      <div className="page">
        <div className="container">
          <Navbar />
          <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
            <p style={{ fontSize: "0.7rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--text-faint)" }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <StepCounter />
          <StepHistory />
        </div>
      </div>
    </>
  );
}
