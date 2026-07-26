import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const medication = await prisma.medication.update({
      where: { id },
      data,
    });
    return NextResponse.json(medication);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar medicamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.medication.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir medicamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
