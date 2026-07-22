import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = await request.json();

    const admission = await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.update({
        where: { id },
        data: {
          status: data.status,
          dischargeDate: data.dischargeDate
            ? new Date(data.dischargeDate)
            : undefined,
        },
        include: { patient: true, doctor: true, bed: true },
      });

      if (data.status === "DISCHARGED" || data.status === "CANCELLED") {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: "AVAILABLE" },
        });
      }

      return admission;
    });

    return NextResponse.json(admission);
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao atualizar internamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      const admission = await tx.admission.delete({
        where: { id },
      });

      if (admission.status === "ACTIVE") {
        await tx.bed.update({
          where: { id: admission.bedId },
          data: { status: "AVAILABLE" },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao excluir internamento";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
