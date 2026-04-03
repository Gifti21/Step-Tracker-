import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import StepCounter from "@/components/StepCounter";
import StepHistory from "@/components/StepHistory";
import Navbar from "@/components/Navbar";
import { Footprints } from "lucide-react";

export default async function Home() {
  const session = await auth();
  if (!session) redirect("/auth/signin");

  return (
    <main className="min-h-screen bg-mesh p-4 pb-10 flex flex-col items-center gap-6">
      <div className="w-full max-w-sm pt-8 flex flex-col gap-4">
        <Navbar />
        <div className="flex flex-col items-center gap-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #ec4899)" }}>
              <Footprints className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">StepTracker</h1>
          </div>
          <p className="text-sm text-white/40">
            {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      <StepCounter />
      <StepHistory />
    </main>
  );
}
