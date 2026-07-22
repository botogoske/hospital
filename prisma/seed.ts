import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Clean existing data in reverse dependency order
  await prisma.appointment.deleteMany();
  await prisma.bedReservation.deleteMany();
  await prisma.medicalRecord.deleteMany();
  await prisma.surgerySchedule.deleteMany();
  await prisma.surgeryMaterial.deleteMany();
  await prisma.surgery.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.user.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.bed.deleteMany();
  await prisma.specialty.deleteMany();

  // Create specialties
  const specialties = await Promise.all([
    prisma.specialty.create({ data: { name: "Cardiologia", description: "Estudo e tratamento do coração" } }),
    prisma.specialty.create({ data: { name: "Ortopedia", description: "Tratamento de ossos e articulações" } }),
    prisma.specialty.create({ data: { name: "Neurologia", description: "Estudo do sistema nervoso" } }),
    prisma.specialty.create({ data: { name: "Pediatria", description: "Cuidados com crianças" } }),
    prisma.specialty.create({ data: { name: "Dermatologia", description: "Tratamento de pele" } }),
    prisma.specialty.create({ data: { name: "Gastroenterologia", description: "Tratamento do sistema digestório" } }),
  ]);

  // Create doctors
  await Promise.all([
    prisma.doctor.create({
      data: {
        name: "Dr. João Silva",
        cpf: "111.111.111-11",
        crm: "CRM-12345",
        phone: "(11) 99999-1111",
        email: "joao.silva@hospital.com",
        specialtyId: specialties[0].id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dra. Maria Santos",
        cpf: "222.222.222-22",
        crm: "CRM-12346",
        phone: "(11) 99999-2222",
        email: "maria.santos@hospital.com",
        specialtyId: specialties[1].id,
      },
    }),
    prisma.doctor.create({
      data: {
        name: "Dr. Pedro Costa",
        cpf: "333.333.333-33",
        crm: "CRM-12347",
        phone: "(11) 99999-3333",
        email: "pedro.costa@hospital.com",
        specialtyId: specialties[2].id,
      },
    }),
  ]);

  // Create users
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "admin@hospital.com",
      password: hashedPassword,
      name: "Administrador",
      role: "ADMIN",
    },
  });

  const doctorUser = await bcrypt.hash("doctor123", 10);
  await prisma.user.create({
    data: {
      email: "dr.joao@hospital.com",
      password: doctorUser,
      name: "Dr. João Silva",
      role: "DOCTOR",
    },
  });

  // Create beds
  for (let floor = 1; floor <= 3; floor++) {
    for (let i = 1; i <= 10; i++) {
      await prisma.bed.create({
        data: {
          number: `${floor}${String(i).padStart(2, "0")}`,
          ward: `Ala ${floor}`,
          floor,
          bedType: i <= 2 ? "ICU" : "REGULAR",
          status: "AVAILABLE",
        },
      });
    }
  }

  // Create medications
  await Promise.all([
    prisma.medication.create({
      data: {
        name: "Paracetamol",
        manufacturer: "EMS",
        dosage: "500mg",
        concentration: "500mg/comprimido",
        category: "Analgésico",
        stockQuantity: 1000,
        unitPrice: 0.5,
      },
    }),
    prisma.medication.create({
      data: {
        name: "Amoxicilina",
        manufacturer: "Eurofarma",
        dosage: "500mg",
        concentration: "500mg/cápsula",
        category: "Antibiótico",
        stockQuantity: 500,
        unitPrice: 2.0,
      },
    }),
    prisma.medication.create({
      data: {
        name: "Ibuprofeno",
        manufacturer: "Medley",
        dosage: "400mg",
        concentration: "400mg/comprimido",
        category: "Anti-inflamatório",
        stockQuantity: 800,
        unitPrice: 0.8,
      },
    }),
  ]);

  // Create surgeries
  await Promise.all([
    prisma.surgery.create({
      data: {
        name: "Cirurgia Cardíaca",
        description: "Cirurgia de bypass coronário",
        duration: 240,
        riskLevel: "HIGH",
      },
    }),
    prisma.surgery.create({
      data: {
        name: "Apendicectomia",
        description: "Remoção do apêndice",
        duration: 60,
        riskLevel: "LOW",
      },
    }),
    prisma.surgery.create({
      data: {
        name: "Artroscopia",
        description: "Cirurgia articular minimamente invasiva",
        duration: 120,
        riskLevel: "MEDIUM",
      },
    }),
  ]);

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
