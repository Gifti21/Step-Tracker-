import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET last 7 days history
export async function GET() {
    const sessions = await prisma.stepSession.findMany({
        orderBy: { date: "desc" },
        take: 7,
    });
    return NextResponse.json(sessions);
}
