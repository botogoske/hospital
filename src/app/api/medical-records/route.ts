import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const records = await prisma.medicalRecord.findMany({
    include: { patient: true, doctor: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(records);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const record = await prisma.medicalRecord.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
      },
      include: { patient: true, doctor: true },
    });
    return NextResponse.json(record, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar prontuário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
