import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTodayDate } from "@/lib/utils";

function calcDistance(steps: number, stride: number) {
    return parseFloat((steps * stride).toFixed(2));
}

function calcCalories(steps: number, weight: number) {
    return parseFloat((steps * 0.0005 * weight * 9.81 * 0.78).toFixed(1));
}

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const today = getTodayDate();
    const data = await prisma.stepSession.findUnique({
        where: { userId_date: { userId: session.user.id, date: today } },
    });
    return NextResponse.json(data ?? { steps: 0, distance: 0, calories: 0, goal: 10000 });
}

export async function POST(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { steps, goal } = await req.json();
    const today = getTodayDate();
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const distance = calcDistance(steps, user?.strideLength ?? 0.78);
    const calories = calcCalories(steps, user?.weight ?? 70);
    const dailyGoal = goal ?? user?.dailyGoal ?? 10000;

    const record = await prisma.stepSession.upsert({
        where: { userId_date: { userId: session.user.id, date: today } },
        update: { steps, distance, calories, goal: dailyGoal },
        create: { userId: session.user.id, date: today, steps, distance, calories, goal: dailyGoal },
    });
    return NextResponse.json(record);
}
