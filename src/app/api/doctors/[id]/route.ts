import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const doctor = await prisma.doctor.update({
      where: { id },
      data,
      include: { specialty: true },
    });
    return NextResponse.json(doctor);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar médico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir médico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
