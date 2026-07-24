import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();
    const healthPlan = await prisma.healthPlan.update({
      where: { id },
      data: {
        name: data.name,
        provider: data.provider,
        registrationNumber: data.registrationNumber,
        coverageType: data.coverageType,
        isActive: data.isActive,
      },
    });
    return NextResponse.json(healthPlan);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao atualizar plano de saúde";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.healthPlan.delete({ where: { id } });
    return NextResponse.json({ message: "Plano de saúde excluído com sucesso" });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir plano de saúde";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
