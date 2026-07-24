import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const healthPlans = await prisma.healthPlan.findMany({
    include: { _count: { select: { appointments: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(healthPlans);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const healthPlan = await prisma.healthPlan.create({
      data: {
        name: data.name,
        provider: data.provider,
        registrationNumber: data.registrationNumber,
        coverageType: data.coverageType,
        isActive: data.isActive ?? true,
      },
    });
    return NextResponse.json(healthPlan, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao criar plano de saúde";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
