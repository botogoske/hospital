import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const material = await prisma.surgeryMaterial.findUnique({
      where: { id },
      include: {
        surgery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!material) {
      return NextResponse.json(
        { error: "Material cirúrgico não encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(material);
  } catch (error: unknown) {
    console.error("Erro GET /api/materiais-cirurgicos/[id]:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao buscar material cirúrgico";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const material = await prisma.surgeryMaterial.update({
      where: { id },
      data: {
        code: data.code && data.code.trim() !== "" ? data.code.trim() : null,
        name: data.name.trim(),
        category: data.category || "GERAL",
        quantity: typeof data.quantity === "number" ? data.quantity : Number(data.quantity) || 0,
        unit: data.unit || "UN",
        minQuantity: typeof data.minQuantity === "number" ? data.minQuantity : Number(data.minQuantity) || 10,
        unitPrice: typeof data.unitPrice === "number" ? data.unitPrice : Number(data.unitPrice) || 0,
        description: data.description && data.description.trim() !== "" ? data.description.trim() : null,
        surgeryId: data.surgeryId && data.surgeryId.trim() !== "" ? data.surgeryId : null,
      },
      include: {
        surgery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(material);
  } catch (error: unknown) {
    console.error("Erro PUT /api/materiais-cirurgicos/[id]:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar material cirúrgico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.surgeryMaterial.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Erro DELETE /api/materiais-cirurgicos/[id]:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao excluir material cirúrgico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
