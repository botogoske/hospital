import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const bed = await prisma.bed.update({
      where: { id },
      data: {
        number: data.number,
        ward: data.ward,
        floor: data.floor,
        bedType: data.bedType,
        status: data.status,
      },
    });
    return NextResponse.json(bed);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar leito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.bed.delete({ where: { id } });
    return NextResponse.json({ message: "Leito excluido com sucesso" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir leito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
