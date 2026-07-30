import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const materials = await prisma.surgeryMaterial.findMany({
      include: {
        surgery: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(materials);
  } catch (error: unknown) {
    console.error("Erro GET /api/materiais-cirurgicos:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao buscar materiais cirúrgicos";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    if (!data.name || data.name.trim().length < 3) {
      return NextResponse.json(
        { error: "Nome do material deve ter no mínimo 3 caracteres" },
        { status: 400 }
      );
    }

    const material = await prisma.surgeryMaterial.create({
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

    return NextResponse.json(material, { status: 201 });
  } catch (error: unknown) {
    console.error("Erro POST /api/materiais-cirurgicos:", error);
    const message =
      error instanceof Error ? error.message : "Erro ao criar material cirúrgico";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
