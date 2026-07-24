"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicalRecordSchema, type MedicalRecordInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { FaNotesMedical } from "react-icons/fa";

interface Patient { id: string; name: string; }
interface Doctor { id: string; name: string; }
interface MedicalRecord {
  id: string; patientId: string; doctorId: string; diagnosis: string; treatment: string; notes?: string; visitDate: string;
  patient: { name: string }; doctor: { name: string };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MedicalRecordInput>({ resolver: zodResolver(medicalRecordSchema) });

  useEffect(() => { fetchRecords(); fetchPatients(); fetchDoctors(); }, []);

  const fetchRecords = async () => { const res = await fetch("/api/medical-records"); if (res.ok) setRecords(await res.json()); };
  const fetchPatients = async () => { const res = await fetch("/api/patients"); if (res.ok) setPatients(await res.json()); };
  const fetchDoctors = async () => { const res = await fetch("/api/doctors"); if (res.ok) setDoctors(await res.json()); };

  const onSubmit = async (data: MedicalRecordInput) => {
    setLoading(true);
    try {
      const url = editingRecord ? `/api/medical-records/${editingRecord.id}` : "/api/medical-records";
      const method = editingRecord ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { setOpen(false); reset(); setSelectedPatient(""); setSelectedDoctor(""); setEditingRecord(null); fetchRecords(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record); setSelectedPatient(record.patientId); setSelectedDoctor(record.doctorId);
    setValue("patientId", record.patientId); setValue("doctorId", record.doctorId);
    setValue("diagnosis", record.diagnosis); setValue("treatment", record.treatment); setValue("notes", record.notes || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este prontuario?")) return;
    const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaNotesMedical className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">PRONTUARIOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">REGISTROS MEDICOS DOS PACIENTES</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSelectedPatient(""); setSelectedDoctor(""); setEditingRecord(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO PRONTUARIO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingRecord ? "[ EDITAR ] PRONTUARIO" : "[ NOVO ] CADASTRAR PRONTUARIO"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; PACIENTE</Label>
                  <Select value={selectedPatient} onValueChange={(v) => { if (!v) return; setSelectedPatient(v); setValue("patientId", v); }} items={patients.map((p) => ({ value: p.id, label: p.name }))}>
                    <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]"><SelectValue placeholder="SELECIONE O PACIENTE..." /></SelectTrigger>
                    <SelectContent className="rounded-none border-[#333333] bg-[#111111]">{patients.map((p) => <SelectItem key={p.id} value={p.id} className="font-mono text-xs">{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.patientId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.patientId.message}</p>}
                </div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; MEDICO</Label>
                  <Select value={selectedDoctor} onValueChange={(v) => { if (!v) return; setSelectedDoctor(v); setValue("doctorId", v); }} items={doctors.map((d) => ({ value: d.id, label: d.name }))}>
                    <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA]"><SelectValue placeholder="SELECIONE O MEDICO..." /></SelectTrigger>
                    <SelectContent className="rounded-none border-[#333333] bg-[#111111]">{doctors.map((d) => <SelectItem key={d.id} value={d.id} className="font-mono text-xs">{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                  {errors.doctorId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.doctorId.message}</p>}
                </div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DIAGNOSTICO</Label><Input {...register("diagnosis")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.diagnosis && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.diagnosis.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TRATAMENTO</Label><Input {...register("treatment")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.treatment && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.treatment.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; OBSERVACOES</Label><Input {...register("notes")} placeholder="OPCIONAL" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" /></div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingRecord ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ LISTA DE PRONTUARIOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">PACIENTE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">MEDICO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">DIAGNOSTICO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TRATAMENTO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">DATA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{r.patient.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{r.doctor.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{r.diagnosis}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{r.treatment}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{new Date(r.visitDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(r)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(r.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM PRONTUARIO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
