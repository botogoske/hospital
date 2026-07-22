import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const doctors = await prisma.doctor.findMany({
    include: { specialty: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(doctors);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const doctor = await prisma.doctor.create({
      data,
      include: { specialty: true },
    });
    return NextResponse.json(doctor, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar médico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
