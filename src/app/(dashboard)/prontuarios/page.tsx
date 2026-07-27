"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  medicalRecordSchema,
  type MedicalRecordInput,
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
import { FaNotesMedical } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Patient {
  id: string;
  name: string;
}
interface Doctor {
  id: string;
  name: string;
}
interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  visitDate: string;
  patient: { name: string };
  doctor: { name: string };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch("/api/medical-records");
    if (res.ok) setRecords(await res.json());
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };

  const onSubmit = async (data: MedicalRecordInput) => {
    setLoading(true);
    try {
      const url = editingRecord
        ? `/api/medical-records/${editingRecord.id}`
        : "/api/medical-records";
      const method = editingRecord ? "PUT" : "POST";
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
        setEditingRecord(null);
        fetchRecords();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setSelectedPatient(record.patientId);
    setSelectedDoctor(record.doctorId);
    setValue("patientId", record.patientId);
    setValue("doctorId", record.doctorId);
    setValue("diagnosis", record.diagnosis);
    setValue("treatment", record.treatment);
    setValue("notes", record.notes || "");
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const res = await fetch(`/api/medical-records/${deleteTargetId}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE PRONTUARIOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${records.length} PRONTUARIO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [
        [
          "PACIENTE",
          "MEDICO",
          "DIAGNOSTICO",
          "TRATAMENTO",
          "DATA",
          "OBSERVACOES",
        ],
      ],
      body: records.map((r) => [
        r.patient.name,
        r.doctor.name,
        r.diagnosis,
        r.treatment,
        new Date(r.visitDate).toLocaleDateString("pt-BR"),
        r.notes || "—",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`prontuarios_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <FaNotesMedical className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>PRONTUARIOS</h1>
              <p className={formStyles.header.subtitle}>
                REGISTROS MEDICOS DOS PACIENTES
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}>
              <HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF
            </button>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  reset();
                  setSelectedPatient("");
                  setSelectedDoctor("");
                  setEditingRecord(null);
                }
              }}
            >
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" /> NOVO PRONTUARIO
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingRecord
                      ? "[ EDITAR ] PRONTUARIO"
                      : "[ NOVO ] CADASTRAR PRONTUARIO"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className="flex-1 space-y-1.5">
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
                      <SelectTrigger className="w-full rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]">
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
                  <div className="flex-1 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; MEDICO
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
                      <SelectTrigger className="w-full rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]">
                        <SelectValue placeholder="SELECIONE O MEDICO..." />
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
                      &gt; DIAGNOSTICO
                    </Label>
                    <Input
                      {...register("diagnosis")}
                      className={formStyles.field.input}
                    />
                    {errors.diagnosis && (
                      <p className={formStyles.field.error}>
                        {errors.diagnosis.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; TRATAMENTO
                    </Label>
                    <Input
                      {...register("treatment")}
                      className={formStyles.field.input}
                    />
                    {errors.treatment && (
                      <p className={formStyles.field.error}>
                        {errors.treatment.message}
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
                      : editingRecord
                        ? "[ ATUALIZAR ]"
                        : "[ CADASTRAR ]"}
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
            [ LISTA DE PRONTUARIOS ]
          </span>
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
                  DIAGNOSTICO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  TRATAMENTO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  DATA
                </TableHead>
                <TableHead
                  className={`${formStyles.table.headerCell} text-right`}
                >
                  ACOES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {r.patient.name}
                  </TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {r.doctor.name}
                  </TableCell>
                  <TableCell className={formStyles.table.cellMuted}>
                    {r.diagnosis}
                  </TableCell>
                  <TableCell className={formStyles.table.cellMuted}>
                    {r.treatment}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {new Date(r.visitDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className={formStyles.button.edit}
                        onClick={() => handleEdit(r)}
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={formStyles.button.delete}
                        onClick={() => { setDeleteTargetId(r.id); setDeleteConfirmOpen(true); }}
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className={formStyles.table.emptyState}
                  >
                    NENHUM PRONTUARIO CADASTRADO
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
        title="EXCLUIR PRONTUARIO"
        description="Tem certeza que deseja excluir este prontuario? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
}
