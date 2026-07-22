"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
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
import { HiPlus, HiCalendar, HiSearch, HiPencil, HiTrash, HiDownload } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  patient: { name: string };
  doctor: { name: string; specialty: { name: string } };
}

const statusColors: Record<string, string> = {
  SCHEDULED: "bg-blue-100 text-blue-800",
  IN_PROGRESS: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  NO_SHOW: "bg-gray-100 text-gray-800",
};

const statusLabels: Record<string, string> = {
  SCHEDULED: "Agendada",
  IN_PROGRESS: "Em Andamento",
  COMPLETED: "Concluída",
  CANCELLED: "Cancelada",
  NO_SHOW: "Não Compareceu",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [search, setSearch] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AppointmentInput>({
    resolver: zodResolver(appointmentSchema),
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    const res = await fetch("/api/appointments");
    if (res.ok) setAppointments(await res.json());
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };

  const onSubmit = async (data: AppointmentInput) => {
    setLoading(true);
    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PUT" : "POST";

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
        setEditingAppointment(null);
        fetchAppointments();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setSelectedPatient(appointment.patientId);
    setSelectedDoctor(appointment.doctorId);
    setValue("patientId", appointment.patientId);
    setValue("doctorId", appointment.doctorId);
    setValue("scheduledAt", appointment.scheduledAt.slice(0, 16));
    setValue("notes", appointment.notes || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta consulta?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Erro ao excluir:", error);
    }
  };

  const handleExportPDF = () => {
    const filteredAppointments = appointments.filter((a) => {
      const matchSearch = a.patient.name.toLowerCase().includes(search.toLowerCase());
      const appointmentDate = new Date(a.scheduledAt);
      const matchStart = !startDate || appointmentDate >= new Date(startDate);
      const matchEnd = !endDate || appointmentDate <= new Date(endDate + "T23:59:59");
      return matchSearch && matchStart && matchEnd;
    });

    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Relatório de Consultas", 14, 22);

    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);

    if (startDate || endDate) {
      const periodText = `Período: ${startDate || "Início"} até ${endDate || "Fim"}`;
      doc.text(periodText, 14, 36);
    }

    const tableData = filteredAppointments.map((a) => [
      a.patient.name,
      a.doctor.name,
      a.doctor.specialty.name,
      new Date(a.scheduledAt).toLocaleString("pt-BR"),
      statusLabels[a.status] || a.status,
    ]);

    autoTable(doc, {
      startY: startDate || endDate ? 42 : 36,
      head: [["Paciente", "Médico", "Especialidade", "Data/Hora", "Status"]],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
    });

    doc.save("consultas.pdf");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultas</h1>
          <p className="text-gray-500">Agendamento de consultas médicas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportPDF}>
            <HiDownload className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <HiPlus className="mr-2 h-4 w-4" />
              Nova Consulta
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAppointment ? "Editar Consulta" : "Agendar Consulta"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <select
                  value={selectedPatient}
                  onChange={(e) => {
                    setSelectedPatient(e.target.value);
                    setValue("patientId", e.target.value);
                  }}
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
                  value={selectedDoctor}
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setValue("doctorId", e.target.value);
                  }}
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
                {loading ? "Salvando..." : editingAppointment ? "Atualizar Consulta" : "Agendar Consulta"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiCalendar className="h-5 w-5" />
            Consultas Agendadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome do paciente..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">De:</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap">Até:</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Especialidade</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments
                .filter((a) => {
                  const matchSearch = a.patient.name.toLowerCase().includes(search.toLowerCase());
                  const appointmentDate = new Date(a.scheduledAt);
                  const matchStart = !startDate || appointmentDate >= new Date(startDate);
                  const matchEnd = !endDate || appointmentDate <= new Date(endDate + "T23:59:59");
                  return matchSearch && matchStart && matchEnd;
                })
                .map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.patient.name}</TableCell>
                  <TableCell>{a.doctor.name}</TableCell>
                  <TableCell>{a.doctor.specialty.name}</TableCell>
                  <TableCell>
                    {new Date(a.scheduledAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[a.status]}>
                      {statusLabels[a.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(a)}
                      >
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(a.id)}
                      >
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {appointments.filter((a) => {
                const matchSearch = a.patient.name.toLowerCase().includes(search.toLowerCase());
                const appointmentDate = new Date(a.scheduledAt);
                const matchStart = !startDate || appointmentDate >= new Date(startDate);
                const matchEnd = !endDate || appointmentDate <= new Date(endDate + "T23:59:59");
                return matchSearch && matchStart && matchEnd;
              }).length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    {(search || startDate || endDate) ? "Nenhum resultado encontrado" : "Nenhuma consulta agendada"}
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
