import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const specialties = await prisma.specialty.findMany({
    include: { _count: { select: { doctors: true } } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(specialties);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const specialty = await prisma.specialty.create({ data });
    return NextResponse.json(specialty, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar especialidade";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
