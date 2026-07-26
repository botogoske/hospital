import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        healthPlanId: data.healthPlanId || null,
        scheduledAt: new Date(data.scheduledAt),
        notes: data.notes,
        status: data.status,
      },
      include: {
        patient: true,
        doctor: { include: { specialty: true } },
        healthPlan: true,
      },
    });
    return NextResponse.json(appointment);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar consulta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.appointment.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Consulta excluída com sucesso" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir consulta";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
