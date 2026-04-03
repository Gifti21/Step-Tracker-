import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, name: true, email: true, image: true, weight: true, strideLength: true, dailyGoal: true },
    });
    return NextResponse.json(user);
}

export async function PATCH(req: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const { name, weight, strideLength, dailyGoal } = await req.json();
    const user = await prisma.user.update({
        where: { id: session.user.id },
        data: { name, weight, strideLength, dailyGoal },
    });
    return NextResponse.json(user);
}
