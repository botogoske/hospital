import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [
    totalPatients,
    totalDoctors,
    todayAppointments,
    weekSurgeries,
    availableBeds,
    totalBeds,
    totalMedications,
    totalMedicalRecords,
    totalEmployees,
    totalAdmissions,
  ] = await Promise.all([
    prisma.patient.count(),
    prisma.doctor.count(),
    prisma.appointment.count({
      where: {
        scheduledAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.surgerySchedule.count({
      where: {
        scheduledAt: {
          gte: new Date(),
          lt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      },
    }),
    prisma.bed.count({ where: { status: "AVAILABLE" } }),
    prisma.bed.count(),
    prisma.medication.count(),
    prisma.medicalRecord.count(),
    prisma.employee.count(),
    prisma.admission.count({ where: { status: "ACTIVE" } }),
  ]);

  return NextResponse.json({
    totalPatients,
    totalDoctors,
    todayAppointments,
    weekSurgeries,
    availableBeds,
    totalBeds,
    totalMedications,
    totalMedicalRecords,
    totalEmployees,
    totalAdmissions,
  });
}
