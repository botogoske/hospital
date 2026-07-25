"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, type DoctorInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { maskCpf, maskPhone } from "@/lib/masks";
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
import { FaUserMd } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Doctor { id: string; name: string; cpf: string; crm: string; phone: string; email: string; specialtyId: string; specialty: { id: string; name: string }; }
interface Specialty { id: string; name: string; }

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<DoctorInput>({ resolver: zodResolver(doctorSchema) });

  const handleCpfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cpf", maskCpf(e.target.value), { shouldValidate: true });
  }, [setValue]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("phone", maskPhone(e.target.value), { shouldValidate: true });
  }, [setValue]);

  useEffect(() => { fetchDoctors(); fetchSpecialties(); }, []);

  const fetchDoctors = async () => { const res = await fetch("/api/doctors"); if (res.ok) setDoctors(await res.json()); };
  const fetchSpecialties = async () => { const res = await fetch("/api/specialties"); if (res.ok) setSpecialties(await res.json()); };

  const onSubmit = async (data: DoctorInput) => {
    setLoading(true);
    try {
      const url = editingDoctor ? `/api/doctors/${editingDoctor.id}` : "/api/doctors";
      const method = editingDoctor ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset(); setSelectedSpecialty(""); setEditingDoctor(null); fetchDoctors(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setSelectedSpecialty(doctor.specialtyId);
    setValue("name", doctor.name); setValue("cpf", doctor.cpf); setValue("crm", doctor.crm);
    setValue("phone", doctor.phone); setValue("email", doctor.email); setValue("specialtyId", doctor.specialtyId);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este medico?")) return;
    const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
    if (res.ok) fetchDoctors();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE MEDICOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${doctors.length} MEDICO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "CPF", "CRM", "TELEFONE", "EMAIL", "ESPECIALIDADE"]],
      body: doctors.map((d) => [
        d.name,
        d.cpf,
        d.crm,
        d.phone,
        d.email,
        d.specialty.name,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`medicos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaUserMd className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">MEDICOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIE OS MEDICOS DO HOSPITAL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className="flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSelectedSpecialty(""); setEditingDoctor(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO MEDICO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingDoctor ? "[ EDITAR ] MEDICO" : "[ NOVO ] CADASTRAR MEDICO"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME</Label><Input {...register("name")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CPF</Label><Input {...register("cpf")} onChange={handleCpfChange} maxLength={14} placeholder="000.000.000-00" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.cpf && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.cpf.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CRM</Label><Input {...register("crm")} placeholder="CRM-00000" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.crm && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.crm.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TELEFONE</Label><Input {...register("phone")} onChange={handlePhoneChange} maxLength={15} placeholder="(00) 00000-0000" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.phone && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.phone.message}</p>}</div>
                  <div className="col-span-2 space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; EMAIL</Label><Input type="email" {...register("email")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.email && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.email.message}</p>}</div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ESPECIALIDADE</Label>
                    <Select value={selectedSpecialty} onValueChange={(value) => { if (!value) return; setSelectedSpecialty(value); setValue("specialtyId", value); }} items={specialties.map((s) => ({ value: s.id, label: s.name }))}>
                      <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919]"><SelectValue placeholder="SELECIONE..." /></SelectTrigger>
                      <SelectContent className="rounded-none border-[#333333] bg-[#111111]">{specialties.map((s) => <SelectItem key={s.id} value={s.id} className="font-mono text-xs">{s.name}</SelectItem>)}</SelectContent>
                    </Select>
                    {errors.specialtyId && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.specialtyId.message}</p>}
                  </div>
                </div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>
                  {loading ? "[ SALVANDO... ]" : editingDoctor ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ LISTA DE MEDICOS ]</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NOME</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CRM</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TELEFONE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ESPECIALIDADE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{d.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{d.crm}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{d.phone}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{d.specialty.name}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(d)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(d.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {doctors.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM MEDICO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
