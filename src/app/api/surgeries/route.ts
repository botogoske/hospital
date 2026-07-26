import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const surgeries = await prisma.surgery.findMany({
    include: { materials: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(surgeries);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const surgery = await prisma.surgery.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        riskLevel: data.riskLevel,
      },
    });
    if (data.materials?.length > 0) {
      await prisma.surgeryMaterial.createMany({
        data: data.materials.map(
          (m: { name: string; quantity: number; unit: string }) => ({
            surgeryId: surgery.id,
            name: m.name,
            quantity: m.quantity,
            unit: m.unit,
          }),
        ),
      });
    }
    return NextResponse.json(surgery, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar cirurgia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
