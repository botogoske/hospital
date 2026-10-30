import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient, Prisma } from "../src/generated/prisma/client";
import { Pool, type QueryResultRow } from "pg";

type Row = QueryResultRow & Record<string, unknown>;

const sourceUrl = process.env.SOURCE_DATABASE_URL;
const destinationUrl = process.env.DATABASE_URL ?? "file:./dev.db";

if (!sourceUrl) {
  throw new Error("SOURCE_DATABASE_URL must point to the PostgreSQL database to import.");
}

const source = new Pool({ connectionString: sourceUrl });
const destination = new PrismaClient({
  adapter: new PrismaBetterSqlite3({ url: destinationUrl }),
});

async function readTable(table: string): Promise<Row[]> {
  const result = await source.query<Row>(`SELECT * FROM "${table}"`);
  return result.rows;
}

async function assertDestinationIsEmpty() {
  const tables = [
    "User",
    "Employee",
    "Doctor",
    "Specialty",
    "Patient",
    "Medication",
    "Surgery",
    "SurgerySchedule",
    "SurgeryMaterial",
    "MedicalRecord",
    "Bed",
    "BedReservation",
    "Admission",
    "HealthPlan",
    "Appointment",
  ];

  for (const table of tables) {
    const result = await destination.$queryRawUnsafe<{ count: number }[]>(
      `SELECT COUNT(*) AS count FROM "${table}"`,
    );

    if (result[0]?.count > 0) {
      throw new Error(
        `SQLite destination table "${table}" is not empty. Use a new database file.`,
      );
    }
  }
}

async function main() {
  await assertDestinationIsEmpty();

  await destination.$transaction(async (tx) => {
    await tx.user.createMany({
      data: (await readTable("User")) as Prisma.UserCreateManyInput[],
    });
    await tx.specialty.createMany({
      data: (await readTable("Specialty")) as Prisma.SpecialtyCreateManyInput[],
    });
    await tx.employee.createMany({
      data: (await readTable("Employee")) as Prisma.EmployeeCreateManyInput[],
    });
    await tx.doctor.createMany({
      data: (await readTable("Doctor")) as Prisma.DoctorCreateManyInput[],
    });
    await tx.patient.createMany({
      data: (await readTable("Patient")) as Prisma.PatientCreateManyInput[],
    });
    await tx.medication.createMany({
      data: (await readTable("Medication")) as Prisma.MedicationCreateManyInput[],
    });
    await tx.surgery.createMany({
      data: (await readTable("Surgery")) as Prisma.SurgeryCreateManyInput[],
    });
    await tx.bed.createMany({
      data: (await readTable("Bed")) as Prisma.BedCreateManyInput[],
    });
    await tx.healthPlan.createMany({
      data: (await readTable("HealthPlan")) as Prisma.HealthPlanCreateManyInput[],
    });
    await tx.surgeryMaterial.createMany({
      data: (await readTable(
        "SurgeryMaterial",
      )) as Prisma.SurgeryMaterialCreateManyInput[],
    });
    await tx.surgerySchedule.createMany({
      data: (await readTable(
        "SurgerySchedule",
      )) as Prisma.SurgeryScheduleCreateManyInput[],
    });
    await tx.medicalRecord.createMany({
      data: (await readTable(
        "MedicalRecord",
      )) as Prisma.MedicalRecordCreateManyInput[],
    });
    await tx.bedReservation.createMany({
      data: (await readTable(
        "BedReservation",
      )) as Prisma.BedReservationCreateManyInput[],
    });
    await tx.admission.createMany({
      data: (await readTable("Admission")) as Prisma.AdmissionCreateManyInput[],
    });
    await tx.appointment.createMany({
      data: (await readTable(
        "Appointment",
      )) as Prisma.AppointmentCreateManyInput[],
    });
  });

  console.log("PostgreSQL data imported into SQLite successfully.");
}

main()
  .catch((error) => {
    console.error("PostgreSQL to SQLite import failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await source.end();
    await destination.$disconnect();
  });
