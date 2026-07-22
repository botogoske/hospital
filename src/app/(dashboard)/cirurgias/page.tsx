"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  surgeryScheduleSchema,
  type SurgeryScheduleInput,
} from "@/lib/validations";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { FaProcedures } from "react-icons/fa";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface Surgery {
  id: string;
  name: string;
  riskLevel: string;
}

interface SurgerySchedule {
  id: string;
  surgeryId: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  patient: { name: string };
  doctor: { name: string };
  surgery: { name: string; riskLevel: string };
}

const surgeryStatusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

const surgeryStatusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
};

const riskColors: Record<string, string> = {
  LOW: "bg-green-100 text-green-800",
  MEDIUM: "bg-yellow-100 text-yellow-800",
  HIGH: "bg-orange-100 text-orange-800",
  CRITICAL: "bg-red-100 text-red-800",
};

const riskLabels: Record<string, string> = {
  LOW: "Baixo",
  MEDIUM: "Médio",
  HIGH: "Alto",
  CRITICAL: "Crítico",
};

export default function SurgeriesPage() {
  const [schedules, setSchedules] = useState<SurgerySchedule[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedSurgery, setSelectedSurgery] = useState("");
  const [editingSchedule, setEditingSchedule] = useState<SurgerySchedule | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SurgeryScheduleInput>({
    resolver: zodResolver(surgeryScheduleSchema),
  });

  useEffect(() => {
    fetchSchedules();
    fetchPatients();
    fetchDoctors();
    fetchSurgeries();
  }, []);

  const fetchSchedules = async () => {
    const res = await fetch("/api/surgery-schedules");
    if (res.ok) setSchedules(await res.json());
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };

  const fetchSurgeries = async () => {
    const res = await fetch("/api/surgeries");
    if (res.ok) setSurgeries(await res.json());
  };

  const onSubmit = async (data: SurgeryScheduleInput) => {
    setLoading(true);
    try {
      const url = editingSchedule
        ? `/api/surgery-schedules/${editingSchedule.id}`
        : "/api/surgery-schedules";
      const method = editingSchedule ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setSelectedPatient("");
        setSelectedDoctor("");
        setSelectedSurgery("");
        setEditingSchedule(null);
        fetchSchedules();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (schedule: SurgerySchedule) => {
    setEditingSchedule(schedule);
    setSelectedSurgery(schedule.surgeryId);
    setSelectedPatient(schedule.patientId);
    setSelectedDoctor(schedule.doctorId);
    setValue("surgeryId", schedule.surgeryId);
    setValue("patientId", schedule.patientId);
    setValue("doctorId", schedule.doctorId);
    setValue("scheduledAt", schedule.scheduledAt.slice(0, 16));
    setValue("notes", schedule.notes || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta cirurgia?")) return;
    const res = await fetch(`/api/surgery-schedules/${id}`, { method: "DELETE" });
    if (res.ok) fetchSchedules();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cirurgias</h1>
          <p className="text-gray-500">Agendamento de cirurgias</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSelectedPatient(""); setSelectedDoctor(""); setSelectedSurgery(""); setEditingSchedule(null); } }}>
          <DialogTrigger render={<Button />}>
            <HiPlus className="mr-2 h-4 w-4" />
            Nova Cirurgia
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSchedule ? "Editar Cirurgia" : "Agendar Cirurgia"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Cirurgia</Label>
                <Select
                  value={selectedSurgery}
                  onValueChange={(value) => { if (!value) return;
                    setSelectedSurgery(value);
                    setValue("surgeryId", value);
                  }}
                  items={surgeries.map((s) => ({ value: s.id, label: `${s.name} - Risco: ${riskLabels[s.riskLevel]}` }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a cirurgia..." />
                  </SelectTrigger>
                  <SelectContent>
                    {surgeries.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name} - Risco: {riskLabels[s.riskLevel]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.surgeryId && (
                  <p className="text-sm text-red-500">{errors.surgeryId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select
                  value={selectedPatient}
                  onValueChange={(value) => { if (!value) return;
                    setSelectedPatient(value);
                    setValue("patientId", value);
                  }}
                  items={patients.map((p) => ({ value: p.id, label: p.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patientId && (
                  <p className="text-sm text-red-500">{errors.patientId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Cirurgião</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={(value) => { if (!value) return;
                    setSelectedDoctor(value);
                    setValue("doctorId", value);
                  }}
                  items={doctors.map((d) => ({ value: d.id, label: d.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o cirurgião..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Data e Hora</Label>
                <Input type="datetime-local" {...register("scheduledAt")} />
                {errors.scheduledAt && (
                  <p className="text-sm text-red-500">{errors.scheduledAt.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input {...register("notes")} placeholder="Opcional" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : editingSchedule ? "Atualizar" : "Agendar Cirurgia"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaProcedures className="h-5 w-5" />
            Cirurgias Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cirurgia</TableHead>
                <TableHead>Paciente</TableHead>
                <TableHead>Cirurgião</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Risco</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.surgery.name}</TableCell>
                  <TableCell>{s.patient.name}</TableCell>
                  <TableCell>{s.doctor.name}</TableCell>
                  <TableCell>
                    {new Date(s.scheduledAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge className={riskColors[s.surgery.riskLevel]}>
                      {riskLabels[s.surgery.riskLevel]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={surgeryStatusColors[s.status]}>
                      {surgeryStatusLabels[s.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(s)}>
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(s.id)}>
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nenhuma cirurgia agendada
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
