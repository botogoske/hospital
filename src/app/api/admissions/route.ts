import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const admissions = await prisma.admission.findMany({
    include: { patient: true, doctor: true, bed: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(admissions);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    data.admissionDate = new Date(data.admissionDate);
    if (data.predictedDischargeDate) data.predictedDischargeDate = new Date(data.predictedDischargeDate);
    const admission = await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.create({
        data: {
          patientId: data.patientId,
          doctorId: data.doctorId,
          bedId: data.bedId,
          admissionDate: data.admissionDate,
          predictedDischargeDate: data.predictedDischargeDate || null,
          notes: data.notes,
        },
        include: { patient: true, doctor: true, bed: true },
      });
      await tx.bed.update({
        where: { id: data.bedId },
        data: { status: "OCCUPIED" },
      });
      return admission;
    });
    return NextResponse.json(admission, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao registrar internamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
