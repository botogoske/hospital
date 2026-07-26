"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  surgeryScheduleSchema,
  type SurgeryScheduleInput,
} from "@/lib/validations";
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
import { HiPlus, HiPencil, HiTrash, HiDocumentDownload } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaProcedures } from "react-icons/fa";
import {
  formStyles,
  statusColors,
  statusBadgeStyle,
} from "@/styles/form-styles";

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

const surgeryStatusLabels: Record<string, string> = {
  SCHEDULED: "AGENDADA",
  IN_PROGRESS: "EM ANDAMENTO",
  COMPLETED: "CONCLUIDA",
  CANCELLED: "CANCELADA",
};
const riskLabels: Record<string, string> = {
  LOW: "BAIXO",
  MEDIUM: "MEDIO",
  HIGH: "ALTO",
  CRITICAL: "CRITICO",
};
const riskBorders: Record<string, string> = {
  LOW: "border-l-[#4AF626]",
  MEDIUM: "border-l-[#E61919]",
  HIGH: "border-l-[#E61919]",
  CRITICAL: "border-l-[#E61919]",
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
  const [editingSchedule, setEditingSchedule] =
    useState<SurgerySchedule | null>(null);

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
        body: JSON.stringify(toUpper(data)),
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
    const res = await fetch(`/api/surgery-schedules/${id}`, {
      method: "DELETE",
    });
    if (res.ok) fetchSchedules();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE CIRURGIAS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${schedules.length} CIRURGIA(S) AGENDADA(S)`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "CIRURGIA",
          "PACIENTE",
          "CIRURGIAO",
          "DATA/HORA",
          "RISCO",
          "STATUS",
          "OBSERVACOES",
        ],
      ],
      body: schedules.map((s) => [
        s.surgery.name,
        s.patient.name,
        s.doctor.name,
        new Date(s.scheduledAt).toLocaleString("pt-BR"),
        riskLabels[s.surgery.riskLevel] || s.surgery.riskLevel,
        surgeryStatusLabels[s.status] || s.status,
        s.notes || "—",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`cirurgias_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <FaProcedures className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>CIRURGIAS</h1>
              <p className={formStyles.header.subtitle}>
                AGENDAMENTO DE CIRURGIAS
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}>
              <HiDocumentDownload className="h-3.5 w-3.5" />
              EXPORTAR PDF
            </button>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  reset();
                  setSelectedPatient("");
                  setSelectedDoctor("");
                  setSelectedSurgery("");
                  setEditingSchedule(null);
                }
              }}
            >
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" /> NOVA CIRURGIA
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingSchedule
                      ? "[ EDITAR ] CIRURGIA"
                      : "[ NOVO ] AGENDAR CIRURGIA"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; CIRURGIA
                    </Label>
                    <Select
                      value={selectedSurgery}
                      onValueChange={(v) => {
                        if (!v) return;
                        setSelectedSurgery(v);
                        setValue("surgeryId", v);
                      }}
                      items={surgeries.map((s) => ({
                        value: s.id,
                        label: `${s.name} - RISCO: ${riskLabels[s.riskLevel]}`,
                      }))}
                    >
                      <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]">
                        <SelectValue placeholder="SELECIONE A CIRURGIA..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-[#333333] bg-[#111111]">
                        {surgeries.map((s) => (
                          <SelectItem
                            key={s.id}
                            value={s.id}
                            className="font-mono text-xs"
                          >
                            {s.name} - RISCO: {riskLabels[s.riskLevel]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.surgeryId && (
                      <p className={formStyles.field.error}>
                        {errors.surgeryId.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; PACIENTE
                    </Label>
                    <Select
                      value={selectedPatient}
                      onValueChange={(v) => {
                        if (!v) return;
                        setSelectedPatient(v);
                        setValue("patientId", v);
                      }}
                      items={patients.map((p) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                    >
                      <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]">
                        <SelectValue placeholder="SELECIONE O PACIENTE..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-[#333333] bg-[#111111]">
                        {patients.map((p) => (
                          <SelectItem
                            key={p.id}
                            value={p.id}
                            className="font-mono text-xs"
                          >
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.patientId && (
                      <p className={formStyles.field.error}>
                        {errors.patientId.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; CIRURGIAO
                    </Label>
                    <Select
                      value={selectedDoctor}
                      onValueChange={(v) => {
                        if (!v) return;
                        setSelectedDoctor(v);
                        setValue("doctorId", v);
                      }}
                      items={doctors.map((d) => ({
                        value: d.id,
                        label: d.name,
                      }))}
                    >
                      <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]">
                        <SelectValue placeholder="SELECIONE O CIRURGIAO..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-none border-[#333333] bg-[#111111]">
                        {doctors.map((d) => (
                          <SelectItem
                            key={d.id}
                            value={d.id}
                            className="font-mono text-xs"
                          >
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                  <Button
                    type="submit"
                    className={formStyles.button.primary}
                    disabled={loading}
                  >
                    {loading
                      ? "[ SALVANDO... ]"
                      : editingSchedule
                        ? "[ ATUALIZAR ]"
                        : "[ AGENDAR CIRURGIA ]"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <span className={formStyles.section.title}>
            [ CIRURGIAS AGENDADAS ]
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>
                  CIRURGIA
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  PACIENTE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  CIRURGIAO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  DATA/HORA
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  RISCO
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
              {schedules.map((s) => (
                <TableRow key={s.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {s.surgery.name}
                  </TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {s.patient.name}
                  </TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {s.doctor.name}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {new Date(s.scheduledAt).toLocaleString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`${statusBadgeStyle} ${statusColors[s.surgery.riskLevel.toLowerCase() as keyof typeof statusColors] || "border-l-[#333333]"}`}
                    >
                      [ {riskLabels[s.surgery.riskLevel]} ]
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]">
                      [ {surgeryStatusLabels[s.status] || s.status} ]
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className={formStyles.button.edit}
                        onClick={() => handleEdit(s)}
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={formStyles.button.delete}
                        onClick={() => handleDelete(s.id)}
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {schedules.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className={formStyles.table.emptyState}
                  >
                    NENHUMA CIRURGIA AGENDADA
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
