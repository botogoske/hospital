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
import { HiPlus, HiTrash } from "react-icons/hi";
import { FaBed, FaCheckCircle } from "react-icons/fa";

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

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaBed className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">INTERNAMENTOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">REGISTROS DE INTERNAMENTO DE PACIENTES</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO INTERNAMENTO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">[ NOVO ] REGISTRAR INTERNAMENTO</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; PACIENTE</Label>
                  <select {...register("patientId")} className="flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none">
                    <option value="">SELECIONE O PACIENTE...</option>{patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  {errors.patientId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.patientId.message}</p>}
                </div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; MEDICO</Label>
                  <select {...register("doctorId")} className="flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none">
                    <option value="">SELECIONE O MEDICO...</option>{doctors.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  {errors.doctorId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.doctorId.message}</p>}
                </div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; LEITO</Label>
                  <select {...register("bedId")} className="flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none">
                    <option value="">SELECIONE O LEITO...</option>{beds.filter((b) => b.status === "AVAILABLE").map((b) => <option key={b.id} value={b.id}>LEITO {b.number} - {b.ward}</option>)}
                  </select>
                  {errors.bedId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.bedId.message}</p>}
                </div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DATA DE INTERNACAO</Label><Input type="date" {...register("admissionDate")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.admissionDate && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.admissionDate.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; PREVISAO DE ALTA</Label><Input type="date" {...register("predictedDischargeDate")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" /></div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; OBSERVACOES</Label><Input {...register("notes")} placeholder="OPCIONAL" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" /></div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ REGISTRANDO... ]" : "[ REGISTRAR INTERNAMENTO ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ INTERNAMENTOS REGISTRADOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">PACIENTE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">MEDICO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">LEITO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">DATA INTERNACAO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">PREVISAO ALTA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">STATUS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admissions.map((a) => (
                <TableRow key={a.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{a.patient.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{a.doctor.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">LEITO {a.bed.number} - {a.bed.ward}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{new Date(a.admissionDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{a.predictedDischargeDate ? new Date(a.predictedDischargeDate).toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell><span className={`inline-block border-l-2 ${admissionStatusBorders[a.status] || "border-l-[#333333]"} pl-2 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]`}>[ {admissionStatusLabels[a.status] || a.status} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {a.status === "ACTIVE" && (
                        <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#4AF626]/10 hover:text-[#4AF626] transition-colors" onClick={() => handleDischarge(a.id)} title="Dar alta"><FaCheckCircle className="h-3.5 w-3.5" /></button>
                      )}
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(a.id)} title="Excluir"><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {admissions.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM INTERNAMENTO REGISTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
