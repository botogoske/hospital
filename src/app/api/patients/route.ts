import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const patients = await prisma.patient.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(patients);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    data.birthDate = new Date(data.birthDate);
    const patient = await prisma.patient.create({ data });
    return NextResponse.json(patient, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar paciente";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
