import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate, stepsToDistance, stepsToCalories } from "@/lib/utils";

export async function GET() {
    const today = getTodayDate();
    const session = await prisma.stepSession.findFirst({ where: { date: today } });
    return NextResponse.json(session ?? { steps: 0, distance: 0, calories: 0, goal: 10000 });
}

export async function POST(req: NextRequest) {
    const { steps, goal } = await req.json();
    const today = getTodayDate();
    const distance = stepsToDistance(steps);
    const calories = stepsToCalories(steps);

    // find existing session for today
    const existing = await prisma.stepSession.findFirst({ where: { date: today } });

    let session;
    if (existing) {
        session = await prisma.stepSession.update({
            where: { id: existing.id },
            data: { steps, distance, calories, goal },
        });
    } else {
        session = await prisma.stepSession.create({
            data: { date: today, steps, distance, calories, goal },
        });
    }

    return NextResponse.json(session);
}
