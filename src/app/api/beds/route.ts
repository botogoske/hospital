import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const beds = await prisma.bed.findMany({
    orderBy: [{ floor: "asc" }, { number: "asc" }],
  });
  return NextResponse.json(beds);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const bed = await prisma.bed.create({ data });
    return NextResponse.json(bed, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar leito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
