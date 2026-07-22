import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { patient: true, doctor: { include: { specialty: true } } },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(appointments);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const appointment = await prisma.appointment.create({
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: { patient: true, doctor: true },
    });
    return NextResponse.json(appointment, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao agendar consulta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
