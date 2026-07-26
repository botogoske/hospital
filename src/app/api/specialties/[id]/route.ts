import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const specialty = await prisma.specialty.update({
      where: { id },
      data,
    });
    return NextResponse.json(specialty);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao atualizar especialidade";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.specialty.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir especialidade";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
