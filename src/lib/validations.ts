import { z } from "zod";
import { validateCpf, validatePhone, validateCep, validateRg } from "./masks";

export const loginSchema = z.object({
  username: z.string().min(1, "Nome de usuário é obrigatório"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
});

export const employeeSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve ter o formato 000.000.000-00")
    .refine((val) => validateCpf(val), "CPF inválido"),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Telefone deve ter o formato (00) 00000-0000")
    .refine((val) => validatePhone(val), "Telefone inválido"),
  email: z.string().email("Email inválido"),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  cep: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP deve ter o formato 00000-000")
    .refine((val) => validateCep(val), "CEP inválido"),
  position: z.string().min(2, "Cargo é obrigatório"),
  salary: z.number().min(0, "Salário deve ser positivo"),
  admissionDate: z.string().min(1, "Data de admissão é obrigatória"),
});

export const doctorSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve ter o formato 000.000.000-00")
    .refine((val) => validateCpf(val), "CPF inválido"),
  crm: z.string().min(5, "CRM é obrigatório"),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Telefone deve ter o formato (00) 00000-0000")
    .refine((val) => validatePhone(val), "Telefone inválido"),
  email: z.string().email("Email inválido"),
  specialtyId: z.string().min(1, "Especialidade é obrigatória"),
});

export const patientSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  cpf: z
    .string()
    .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve ter o formato 000.000.000-00")
    .refine((val) => validateCpf(val), "CPF inválido"),
  rg: z
    .string()
    .regex(/^\d{2}\.\d{3}\.\d{3}-?[\dXx]$/, "RG deve ter o formato XX.XXX.XXX-X")
    .refine((val) => validateRg(val), "RG inválido"),
  phone: z
    .string()
    .regex(/^\(\d{2}\)\s?\d{4,5}-\d{4}$/, "Telefone deve ter o formato (00) 00000-0000")
    .refine((val) => validatePhone(val), "Telefone inválido"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  address: z.string().min(5, "Endereço deve ter no mínimo 5 caracteres"),
  cep: z
    .string()
    .regex(/^\d{5}-\d{3}$/, "CEP deve ter o formato 00000-000")
    .refine((val) => validateCep(val), "CEP inválido"),
  birthDate: z.string().min(1, "Data de nascimento é obrigatória"),
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
});

export const medicationSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  manufacturer: z.string().min(2, "Fabricante é obrigatório"),
  dosage: z.string().min(1, "Dosagem é obrigatória"),
  concentration: z.string().min(1, "Concentração é obrigatória"),
  category: z.string().min(1, "Categoria é obrigatória"),
  stockQuantity: z.number().min(0, "Quantidade deve ser positiva"),
  unitPrice: z.number().min(0, "Preço deve ser positivo"),
});

export const surgerySchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
  duration: z.number().min(1, "Duração é obrigatória"),
  riskLevel: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

export const surgeryScheduleSchema = z.object({
  surgeryId: z.string().min(1, "Cirurgia é obrigatória"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  scheduledAt: z.string().min(1, "Data e hora são obrigatórios"),
  notes: z.string().optional(),
});

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  healthPlanId: z.string().optional(),
  scheduledAt: z.string().min(1, "Data e hora são obrigatórios"),
  notes: z.string().optional(),
});

export const healthPlanSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  provider: z.string().min(2, "Operadora é obrigatória"),
  registrationNumber: z.string().min(3, "Número de registro é obrigatório"),
  coverageType: z.enum(["BASIC", "STANDARD", "PREMIUM"]),
  isActive: z.boolean().optional(),
});

export const bedSchema = z.object({
  number: z.string().min(1, "Número é obrigatório"),
  ward: z.string().min(1, "Ala é obrigatória"),
  floor: z.number().min(1, "Andar é obrigatório"),
  bedType: z.enum(["REGULAR", "ICU", "EMERGENCY", "PEDIATRIC"]),
});

export const bedReservationSchema = z.object({
  bedId: z.string().min(1, "Leito é obrigatório"),
  patientId: z.string().min(1, "Paciente é obrigatório"),
  checkIn: z.string().min(1, "Data de check-in é obrigatória"),
  checkOut: z.string().optional(),
});

export const medicalRecordSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  diagnosis: z.string().min(3, "Diagnóstico é obrigatório"),
  treatment: z.string().min(3, "Tratamento é obrigatório"),
  notes: z.string().optional(),
});

export const specialtySchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  description: z.string().optional(),
});

export const surgeryMaterialSchema = z.object({
  name: z.string().min(3, "Nome deve ter no mínimo 3 caracteres"),
  quantity: z.number().min(1, "Quantidade deve ser positiva"),
  unit: z.string().min(1, "Unidade é obrigatória"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type EmployeeInput = z.infer<typeof employeeSchema>;
export type DoctorInput = z.infer<typeof doctorSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type MedicationInput = z.infer<typeof medicationSchema>;
export type SurgeryInput = z.infer<typeof surgerySchema>;
export type SurgeryScheduleInput = z.infer<typeof surgeryScheduleSchema>;
export type AppointmentInput = z.infer<typeof appointmentSchema>;
export type BedInput = z.infer<typeof bedSchema>;
export type BedReservationInput = z.infer<typeof bedReservationSchema>;
export type MedicalRecordInput = z.infer<typeof medicalRecordSchema>;
export type SpecialtyInput = z.infer<typeof specialtySchema>;
export type SurgeryMaterialInput = z.infer<typeof surgeryMaterialSchema>;

export const admissionSchema = z.object({
  patientId: z.string().min(1, "Paciente é obrigatório"),
  doctorId: z.string().min(1, "Médico é obrigatório"),
  bedId: z.string().min(1, "Leito é obrigatório"),
  admissionDate: z.string().min(1, "Data de internação é obrigatória"),
  notes: z.string().optional(),
});

export type AdmissionInput = z.infer<typeof admissionSchema>;
export type HealthPlanInput = z.infer<typeof healthPlanSchema>;
