import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (data.birthDate) data.birthDate = new Date(data.birthDate);
    const patient = await prisma.patient.update({
      where: { id },
      data,
    });
    return NextResponse.json(patient);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar paciente";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.patient.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir paciente";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
