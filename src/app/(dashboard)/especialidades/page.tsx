"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { specialtySchema, type SpecialtyInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiDocumentDownload } from "react-icons/hi";
import { FaStethoscope } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Specialty { id: string; name: string; description?: string; _count: { doctors: number }; }

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<SpecialtyInput>({ resolver: zodResolver(specialtySchema) });

  useEffect(() => { fetchSpecialties(); }, []);
  const fetchSpecialties = async () => { const res = await fetch("/api/specialties"); if (res.ok) setSpecialties(await res.json()); };

  const onSubmit = async (data: SpecialtyInput) => {
    setLoading(true);
    try {
      const url = editingSpecialty ? `/api/specialties/${editingSpecialty.id}` : "/api/specialties";
      const method = editingSpecialty ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset(); setEditingSpecialty(null); fetchSpecialties(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (specialty: Specialty) => { setEditingSpecialty(specialty); setValue("name", specialty.name); setValue("description", specialty.description || ""); setOpen(true); };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta especialidade?")) return;
    const res = await fetch(`/api/specialties/${id}`, { method: "DELETE" });
    if (res.ok) fetchSpecialties();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE ESPECIALIDADES", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${specialties.length} ESPECIALIDADE(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "DESCRICAO", "MEDICOS"]],
      body: specialties.map((s) => [
        s.name,
        s.description || "—",
        s._count.doctors,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`especialidades_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaStethoscope className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">ESPECIALIDADES</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIE AS ESPECIALIDADES MEDICAS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className="flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditingSpecialty(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVA ESPECIALIDADE</span>
            </DialogTrigger>
            <DialogContent className="border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingSpecialty ? "[ EDITAR ] ESPECIALIDADE" : "[ NOVO ] CADASTRAR ESPECIALIDADE"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME</Label><Input {...register("name")} placeholder="EX: CARDIOLOGIA" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DESCRICAO</Label><Input {...register("description")} placeholder="OPCIONAL" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" /></div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingSpecialty ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ LISTA DE ESPECIALIDADES ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NOME</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">DESCRICAO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">MEDICOS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((s) => (
                <TableRow key={s.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{s.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{s.description || "—"}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{s._count.doctors}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(s)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(s.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {specialties.length === 0 && <TableRow><TableCell colSpan={4} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUMA ESPECIALIDADE CADASTRADA</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
