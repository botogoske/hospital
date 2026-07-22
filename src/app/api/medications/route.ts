import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const medications = await prisma.medication.findMany({
    orderBy: { name: "asc" },
  });
  return NextResponse.json(medications);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const medication = await prisma.medication.create({ data });
    return NextResponse.json(medication, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar medicamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
