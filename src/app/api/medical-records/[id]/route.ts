import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const record = await prisma.medicalRecord.update({
      where: { id },
      data: {
        patientId: data.patientId,
        doctorId: data.doctorId,
        diagnosis: data.diagnosis,
        treatment: data.treatment,
        notes: data.notes,
      },
      include: { patient: true, doctor: true },
    });
    return NextResponse.json(record);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar prontuário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.medicalRecord.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir prontuário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
