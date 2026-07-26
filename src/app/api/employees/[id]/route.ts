import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data = await request.json();
    if (data.admissionDate) data.admissionDate = new Date(data.admissionDate);
    const employee = await prisma.employee.update({
      where: { id },
      data,
    });
    return NextResponse.json(employee);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar funcionário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.employee.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao excluir funcionário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
