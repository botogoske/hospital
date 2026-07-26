"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { admissionSchema, type AdmissionInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiTrash, HiDocumentDownload } from "react-icons/hi";
import { FaBed, FaCheckCircle } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles, statusColors, statusBadgeStyle } from "@/styles/form-styles";

interface Patient { id: string; name: string; }
interface Doctor { id: string; name: string; }
interface Bed { id: string; number: string; ward: string; status: string; }
interface Admission {
  id: string; admissionDate: string; predictedDischargeDate?: string; dischargeDate?: string; notes?: string; status: string;
  patient: { name: string }; doctor: { name: string }; bed: { number: string; ward: string };
}

const admissionStatusLabels: Record<string, string> = { ACTIVE: "ATIVO", DISCHARGED: "ALTA", CANCELLED: "CANCELADO" };
const admissionStatusBorders: Record<string, string> = { ACTIVE: "border-l-[#4AF626]", DISCHARGED: "border-l-[#555555]", CANCELLED: "border-l-[#E61919]" };

export default function AdmissionsPage() {
  const [admissions, setAdmissions] = useState<Admission[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [beds, setBeds] = useState<Bed[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AdmissionInput>({ resolver: zodResolver(admissionSchema) });

  useEffect(() => { fetchAdmissions(); fetchPatients(); fetchDoctors(); fetchBeds(); }, []);

  const fetchAdmissions = async () => { const res = await fetch("/api/admissions"); if (res.ok) setAdmissions(await res.json()); };
  const fetchPatients = async () => { const res = await fetch("/api/patients"); if (res.ok) setPatients(await res.json()); };
  const fetchDoctors = async () => { const res = await fetch("/api/doctors"); if (res.ok) setDoctors(await res.json()); };
  const fetchBeds = async () => { const res = await fetch("/api/beds"); if (res.ok) setBeds(await res.json()); };

  const onSubmit = async (data: AdmissionInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset(); fetchAdmissions(); fetchBeds(); }
    } finally { setLoading(false); }
  };

  const handleDischarge = async (id: string) => {
    if (!confirm("Confirmar alta do paciente?")) return;
    const res = await fetch(`/api/admissions/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "DISCHARGED", dischargeDate: new Date().toISOString() }) });
    if (res.ok) { fetchAdmissions(); fetchBeds(); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este internamento?")) return;
    const res = await fetch(`/api/admissions/${id}`, { method: "DELETE" });
    if (res.ok) { fetchAdmissions(); fetchBeds(); }
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE INTERNAMENTOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${admissions.length} INTERNAMENTO(S) REGISTRADO(S)`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "PACIENTE",
          "MEDICO",
          "LEITO",
          "DATA INTERNACAO",
          "PREVISAO ALTA",
          "DATA ALTA",
          "STATUS",
          "OBSERVACOES",
        ],
      ],
      body: admissions.map((a) => [
        a.patient.name,
        a.doctor.name,
        `LEITO ${a.bed.number} - ${a.bed.ward}`,
        new Date(a.admissionDate).toLocaleDateString("pt-BR"),
        a.predictedDischargeDate ? new Date(a.predictedDischargeDate).toLocaleDateString("pt-BR") : "—",
        a.dischargeDate ? new Date(a.dischargeDate).toLocaleDateString("pt-BR") : "—",
        admissionStatusLabels[a.status] || a.status,
        a.notes || "—",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`internamentos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}><FaBed className="h-5 w-5" /></div>
            <div>
              <h1 className={formStyles.header.title}>INTERNAMENTOS</h1>
              <p className={formStyles.header.subtitle}>REGISTROS DE INTERNAMENTO DE PACIENTES</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}><HiPlus className="h-3.5 w-3.5" /> NOVO INTERNAMENTO</span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>[ NOVO ] REGISTRAR INTERNAMENTO</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; PACIENTE</Label>
                    <select {...register("patientId")} className={formStyles.field.select}>
                      <option value="">SELECIONE O PACIENTE...</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    {errors.patientId && <p className={formStyles.field.error}>{errors.patientId.message}</p>}
                  </div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; MEDICO</Label>
                    <select {...register("doctorId")} className={formStyles.field.select}>
                      <option value="">SELECIONE O MEDICO...</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    {errors.doctorId && <p className={formStyles.field.error}>{errors.doctorId.message}</p>}
                  </div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; LEITO</Label>
                    <select {...register("bedId")} className={formStyles.field.select}>
                      <option value="">SELECIONE O LEITO...</option>{beds.filter((b) => b.status === "AVAILABLE").map((b) => <option key={b.id} value={b.id}>LEITO {b.number} - {b.ward}</option>)}
                    </select>
                    {errors.bedId && <p className={formStyles.field.error}>{errors.bedId.message}</p>}
                  </div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; DATA DE INTERNACAO</Label><Input type="date" {...register("admissionDate")} className={formStyles.field.input} />{errors.admissionDate && <p className={formStyles.field.error}>{errors.admissionDate.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; PREVISAO DE ALTA</Label><Input type="date" {...register("predictedDischargeDate")} className={formStyles.field.input} /></div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; OBSERVACOES</Label><Input {...register("notes")} placeholder="OPCIONAL" className={formStyles.field.input} /></div>
                  <Button type="submit" className={formStyles.button.primary} disabled={loading}>{loading ? "[ REGISTRANDO... ]" : "[ REGISTRAR INTERNAMENTO ]"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}><span className={formStyles.section.title}>[ INTERNAMENTOS REGISTRADOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>PACIENTE</TableHead>
                <TableHead className={formStyles.table.headerCell}>MEDICO</TableHead>
                <TableHead className={formStyles.table.headerCell}>LEITO</TableHead>
                <TableHead className={formStyles.table.headerCell}>DATA INTERNACAO</TableHead>
                <TableHead className={formStyles.table.headerCell}>PREVISAO ALTA</TableHead>
                <TableHead className={formStyles.table.headerCell}>STATUS</TableHead>
                <TableHead className={`${formStyles.table.headerCell} text-right`}>ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((a) => (
                <TableRow key={a.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{a.patient.name}</TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{a.doctor.name}</TableCell>
                  <TableCell className={formStyles.table.cell}>LEITO {a.bed.number} - {a.bed.ward}</TableCell>
                  <TableCell className={formStyles.table.cell}>{new Date(a.admissionDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className={formStyles.table.cell}>{a.predictedDischargeDate ? new Date(a.predictedDischargeDate).toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell><span className={`${statusBadgeStyle} ${statusColors[a.status.toLowerCase() as keyof typeof statusColors] || "border-l-[#333333]"}`}>[ {admissionStatusLabels[a.status] || a.status} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {a.status === "ACTIVE" && (
                        <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#4AF626]/10 hover:text-[#4AF626] transition-colors" onClick={() => handleDischarge(a.id)} title="Dar alta"><FaCheckCircle className="h-3.5 w-3.5" /></button>
                      )}
                      <button className={formStyles.button.delete} onClick={() => handleDelete(a.id)} title="Excluir"><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admissions.length === 0 && <TableRow><TableCell colSpan={7} className={formStyles.table.emptyState}>NENHUM INTERNAMENTO REGISTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
