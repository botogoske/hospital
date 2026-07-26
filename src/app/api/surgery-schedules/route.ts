import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const schedules = await prisma.surgerySchedule.findMany({
    include: { surgery: true, doctor: true, patient: true },
    orderBy: { scheduledAt: "desc" },
  });
  return NextResponse.json(schedules);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const schedule = await prisma.surgerySchedule.create({
      data: {
        surgeryId: data.surgeryId,
        doctorId: data.doctorId,
        patientId: data.patientId,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
      },
      include: { surgery: true, doctor: true, patient: true },
    });
    return NextResponse.json(schedule, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao agendar cirurgia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
