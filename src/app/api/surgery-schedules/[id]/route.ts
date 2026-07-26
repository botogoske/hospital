import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (data.scheduledAt) data.scheduledAt = new Date(data.scheduledAt);
    const schedule = await prisma.surgerySchedule.update({
      where: { id },
      data,
      include: { surgery: true, doctor: true, patient: true },
    });
    return NextResponse.json(schedule);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar cirurgia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.surgerySchedule.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir cirurgia";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
