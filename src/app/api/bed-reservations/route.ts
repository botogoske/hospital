import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const reservations = await prisma.bedReservation.findMany({
    include: { bed: true, patient: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(reservations);
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const reservation = await prisma.bedReservation.create({
      data: {
        bedId: data.bedId,
        patientId: data.patientId,
        checkIn: new Date(data.checkIn),
        checkOut: data.checkOut ? new Date(data.checkOut) : null,
      },
      include: { bed: true, patient: true },
    });

    await prisma.bed.update({
      where: { id: data.bedId },
      data: { status: "OCCUPIED" },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erro ao reservar leito";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
