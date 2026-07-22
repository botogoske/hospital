"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema, type AdmissionInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HiPlus, HiTrash } from "react-icons/hi";
import { FaBed, FaCheckCircle } from "react-icons/fa";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface Bed {
  id: string;
  number: string;
  ward: string;
  status: string;
}

interface Admission {
  id: string;
  admissionDate: string;
  dischargeDate?: string;
  notes?: string;
  status: string;
  patient: { name: string };
  doctor: { name: string };
  bed: { number: string; ward: string };
}

const admissionStatusColors: Record<string, string> = {
  ACTIVE: "bg-green-100 text-green-800",
  DISCHARGED: "bg-blue-100 text-blue-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const admissionStatusLabels: Record<string, string> = {
  ACTIVE: "Ativo",
  DISCHARGED: "Alta",
  CANCELLED: "Cancelado",
};

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdmissionInput>({
    resolver: zodResolver(admissionSchema),
  });

  useEffect(() => {
    fetchAdmissions();
    fetchPatients();
    fetchDoctors();
    fetchBeds();
  }, []);

  const fetchAdmissions = async () => {
    const res = await fetch("/api/admissions");
    if (res.ok) setAdmissions(await res.json());
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };

  const fetchBeds = async () => {
    const res = await fetch("/api/beds");
    if (res.ok) setBeds(await res.json());
  };

  const onSubmit = async (data: AdmissionInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        fetchAdmissions();
        fetchBeds();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDischarge = async (id: string) => {
    if (!confirm("Confirmar alta do paciente?")) return;
    const res = await fetch(`/api/admissions/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: "DISCHARGED",
        dischargeDate: new Date().toISOString(),
      }),
    });
    if (res.ok) {
      fetchAdmissions();
      fetchBeds();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este internamento?")) return;
    const res = await fetch(`/api/admissions/${id}`, { method: "DELETE" });
    if (res.ok) {
      fetchAdmissions();
      fetchBeds();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Internamentos</h1>
          <p className="text-gray-500">Registros de internamento de pacientes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button />}>
            <HiPlus className="mr-2 h-4 w-4" />
            Novo Internamento
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Internamento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <select
                  {...register("patientId")}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">Selecione o paciente...</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {errors.patientId && (
                  <p className="text-sm text-red-500">{errors.patientId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Médico</Label>
                <select
                  {...register("doctorId")}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">Selecione o médico...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Leito</Label>
                <select
                  {...register("bedId")}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="">Selecione o leito...</option>
                  {beds
                    .filter((b) => b.status === "AVAILABLE")
                    .map((b) => (
                      <option key={b.id} value={b.id}>
                        Leito {b.number} - {b.ward}
                      </option>
                    ))}
                </select>
                {errors.bedId && (
                  <p className="text-sm text-red-500">{errors.bedId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Data de Internação</Label>
                <Input type="date" {...register("admissionDate")} />
                {errors.admissionDate && (
                  <p className="text-sm text-red-500">{errors.admissionDate.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input {...register("notes")} placeholder="Opcional" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Registrando..." : "Registrar Internamento"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaBed className="h-5 w-5" />
            Internamentos Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Leito</TableHead>
                <TableHead>Data Internação</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.patient.name}</TableCell>
                  <TableCell>{a.doctor.name}</TableCell>
                  <TableCell>
                    Leito {a.bed.number} - {a.bed.ward}
                  </TableCell>
                  <TableCell>
                    {new Date(a.admissionDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge className={admissionStatusColors[a.status]}>
                      {admissionStatusLabels[a.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {a.status === "ACTIVE" && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleDischarge(a.id)}
                          title="Dar alta"
                        >
                          <FaCheckCircle className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(a.id)}
                        title="Excluir"
                      >
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admissions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Nenhum internamento registrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
