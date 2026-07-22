import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const employees = await prisma.employee.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(employees);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    data.admissionDate = new Date(data.admissionDate);
    const employee = await prisma.employee.create({ data });
    return NextResponse.json(employee, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao criar funcionário";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
