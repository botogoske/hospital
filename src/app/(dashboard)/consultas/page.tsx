"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema, type AppointmentInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  HiPlus,
  HiCalendar,
  HiSearch,
  HiPencil,
  HiTrash,
  HiDownload,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  formStyles,
  statusColors,
  statusBadgeStyle,
} from "@/styles/form-styles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Patient {
  id: string;
  name: string;
}
interface Doctor {
  id: string;
  name: string;
}
interface HealthPlan {
  id: string;
  name: string;
  provider: string;
}
interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  healthPlanId?: string;
  scheduledAt: string;
  status: string;
  notes?: string;
  patient: { name: string };
  doctor: { name: string; specialty: { name: string } };
  healthPlan?: { name: string; provider: string } | null;
}

const statusLabels: Record<string, string> = {
  SCHEDULED: "AGENDADA",
  IN_PROGRESS: "EM ANDAMENTO",
  COMPLETED: "CONCLUIDA",
  CANCELLED: "CANCELADA",
  NO_SHOW: "NAO COMPARECEU",
};

const statusBorders: Record<string, string> = {
  SCHEDULED: "border-l-[#E61919]",
  IN_PROGRESS: "border-l-[#E61919]",
  COMPLETED: "border-l-[#4AF626]",
  CANCELLED: "border-l-[#555555]",
  NO_SHOW: "border-l-[#333333]",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedHealthPlan, setSelectedHealthPlan] = useState("");
  const [search, setSearch] = useState("");
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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
    fetchHealthPlans();
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
  const fetchHealthPlans = async () => {
    const res = await fetch("/api/health-plans");
    if (res.ok) setHealthPlans(await res.json());
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
        body: JSON.stringify(toUpper(data)),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setSelectedPatient("");
        setSelectedDoctor("");
        setSelectedHealthPlan("");
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
    setSelectedHealthPlan(appointment.healthPlanId || "");
    setValue("patientId", appointment.patientId);
    setValue("doctorId", appointment.doctorId);
    setValue("healthPlanId", appointment.healthPlanId || "");
    setValue("scheduledAt", appointment.scheduledAt.slice(0, 16));
    setValue("notes", appointment.notes || "");
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const res = await fetch(`/api/appointments/${deleteTargetId}`, { method: "DELETE" });
    if (res.ok) fetchAppointments();
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const handleExportPDF = () => {
    const filtered = appointments.filter((a) => {
      const matchSearch = a.patient.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const d = new Date(a.scheduledAt);
      const matchStart = !startDate || d >= new Date(startDate);
      const matchEnd = !endDate || d <= new Date(endDate + "T23:59:59");
      return matchSearch && matchStart && matchEnd;
    });
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Relatorio de Consultas", 14, 22);
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString("pt-BR")}`, 14, 30);
    const tableData = filtered.map((a) => [
      a.patient.name,
      a.doctor.name,
      a.doctor.specialty.name,
      a.healthPlan
        ? `${a.healthPlan.name} (${a.healthPlan.provider})`
        : "Particular",
      new Date(a.scheduledAt).toLocaleString("pt-BR"),
      statusLabels[a.status] || a.status,
    ]);
    autoTable(doc, {
      startY: 36,
      head: [
        ["Paciente", "Medico", "Especialidade", "Plano", "Data/Hora", "Status"],
      ],
      body: tableData,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [230, 25, 25] },
    });
    doc.save("consultas.pdf");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <HiCalendar className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>CONSULTAS</h1>
              <p className={formStyles.header.subtitle}>
                AGENDAMENTO DE CONSULTAS MEDICAS
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExportPDF}
              className={formStyles.button.export}
            >
              <HiDownload className="h-3.5 w-3.5" />
              EXPORTAR PDF
            </button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" />
                  NOVA CONSULTA
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingAppointment
                      ? "[ EDITAR ] CONSULTA"
                      : "[ NOVO ] AGENDAR CONSULTA"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; PACIENTE
                    </Label>
                    <select
                      value={selectedPatient}
                      onChange={(e) => {
                        setSelectedPatient(e.target.value);
                        setValue("patientId", e.target.value);
                      }}
                      className={formStyles.field.select}
                    >
                      <option value="">SELECIONE O PACIENTE...</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.patientId && (
                      <p className={formStyles.field.error}>
                        {errors.patientId.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; MEDICO
                    </Label>
                    <select
                      value={selectedDoctor}
                      onChange={(e) => {
                        setSelectedDoctor(e.target.value);
                        setValue("doctorId", e.target.value);
                      }}
                      className={formStyles.field.select}
                    >
                      <option value="">SELECIONE O MEDICO...</option>
                      {doctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    {errors.doctorId && (
                      <p className={formStyles.field.error}>
                        {errors.doctorId.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; DATA E HORA
                    </Label>
                    <Input
                      type="datetime-local"
                      {...register("scheduledAt")}
                      className={formStyles.field.input}
                    />
                    {errors.scheduledAt && (
                      <p className={formStyles.field.error}>
                        {errors.scheduledAt.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; OBSERVACOES
                    </Label>
                    <Input
                      {...register("notes")}
                      placeholder="OPCIONAL"
                      className={formStyles.field.input}
                    />
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; PLANO DE SAUDE
                    </Label>
                    <select
                      value={selectedHealthPlan}
                      onChange={(e) => {
                        setSelectedHealthPlan(e.target.value);
                        setValue("healthPlanId", e.target.value || undefined);
                      }}
                      className={formStyles.field.select}
                    >
                      <option value="">PARTICULAR (SEM CONVENIO)</option>
                      {healthPlans.map((hp) => (
                        <option key={hp.id} value={hp.id}>
                          {hp.name} ({hp.provider})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="submit"
                    className={formStyles.button.primary}
                    disabled={loading}
                  >
                    {loading
                      ? "[ SALVANDO... ]"
                      : editingAppointment
                        ? "[ ATUALIZAR CONSULTA ]"
                        : "[ AGENDAR CONSULTA ]"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <span className={formStyles.section.title}>
            [ CONSULTAS AGENDADAS ]
          </span>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <HiSearch className={formStyles.search.icon} />
              <input
                placeholder="BUSCAR POR NOME DO PACIENTE..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={formStyles.search.input}
              />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555]">
                  DE:
                </Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-36 rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-[10px] text-[#EAEAEA] focus:border-[#E61919] focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label className="whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555]">
                  ATE:
                </Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-36 rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-[10px] text-[#EAEAEA] focus:border-[#E61919] focus:ring-0"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>
                  PACIENTE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  MEDICO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  ESPECIALIDADE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  PLANO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  DATA/HORA
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  STATUS
                </TableHead>
                <TableHead
                  className={`${formStyles.table.headerCell} text-right`}
                >
                  ACOES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments
                .filter((a) => {
                  const matchSearch = a.patient.name
                    .toLowerCase()
                    .includes(search.toLowerCase());
                  const d = new Date(a.scheduledAt);
                  return (
                    matchSearch &&
                    (!startDate || d >= new Date(startDate)) &&
                    (!endDate || d <= new Date(endDate + "T23:59:59"))
                  );
                })
                .map((a) => (
                  <TableRow key={a.id} className={formStyles.table.bodyRow}>
                    <TableCell className={`${formStyles.table.cell} uppercase`}>
                      {a.patient.name}
                    </TableCell>
                    <TableCell className={`${formStyles.table.cell} uppercase`}>
                      {a.doctor.name}
                    </TableCell>
                    <TableCell className={formStyles.table.cellMuted}>
                      {a.doctor.specialty.name}
                    </TableCell>
                    <TableCell className={`${formStyles.table.cell} uppercase`}>
                      {a.healthPlan ? (
                        a.healthPlan.name
                      ) : (
                        <span className="text-[#444444]">PARTICULAR</span>
                      )}
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {new Date(a.scheduledAt).toLocaleString("pt-BR")}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`${statusBadgeStyle} ${statusColors[a.status.toLowerCase() as keyof typeof statusColors] || "border-l-[#333333]"}`}
                      >
                        [ {statusLabels[a.status] || a.status} ]
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className={formStyles.button.edit}
                          onClick={() => handleEdit(a)}
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className={formStyles.button.delete}
                          onClick={() => { setDeleteTargetId(a.id); setDeleteConfirmOpen(true); }}
                        >
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              {appointments.filter((a) => {
                const matchSearch = a.patient.name
                  .toLowerCase()
                  .includes(search.toLowerCase());
                const d = new Date(a.scheduledAt);
                return (
                  matchSearch &&
                  (!startDate || d >= new Date(startDate)) &&
                  (!endDate || d <= new Date(endDate + "T23:59:59"))
                );
              }).length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className={formStyles.table.emptyState}
                  >
                    {search || startDate || endDate
                      ? "NENHUM RESULTADO ENCONTRADO"
                      : "NENHUMA CONSULTA AGENDADA"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="EXCLUIR CONSULTA"
        description="Tem certeza que deseja excluir esta consulta? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
}
