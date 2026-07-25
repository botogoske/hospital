"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicationSchema, type MedicationInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiBeaker, HiDocumentDownload } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Medication { id: string; name: string; manufacturer: string; dosage: string; concentration: string; category: string; stockQuantity: number; unitPrice: number; }

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<MedicationInput>({ resolver: zodResolver(medicationSchema) });

  useEffect(() => { fetchMedications(); }, []);
  const fetchMedications = async () => { const res = await fetch("/api/medications"); if (res.ok) setMedications(await res.json()); };

  const onSubmit = async (data: MedicationInput) => {
    setLoading(true);
    try {
      const url = editingMedication ? `/api/medications/${editingMedication.id}` : "/api/medications";
      const method = editingMedication ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset(); setEditingMedication(null); fetchMedications(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue("name", medication.name); setValue("manufacturer", medication.manufacturer); setValue("dosage", medication.dosage);
    setValue("concentration", medication.concentration); setValue("category", medication.category);
    setValue("stockQuantity", medication.stockQuantity); setValue("unitPrice", medication.unitPrice);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return;
    const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
    if (res.ok) fetchMedications();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE MEDICAMENTOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${medications.length} MEDICAMENTO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "FABRICANTE", "DOSAGEM", "CATEGORIA", "ESTOQUE", "PRECO"]],
      body: medications.map((m) => [
        m.name,
        m.manufacturer,
        m.dosage,
        m.category,
        m.stockQuantity,
        m.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`medicamentos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><HiBeaker className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">MEDICAMENTOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIE O ESTOQUE DE MEDICAMENTOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className="flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditingMedication(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO MEDICAMENTO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingMedication ? "[ EDITAR ] MEDICAMENTO" : "[ NOVO ] CADASTRAR MEDICAMENTO"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME</Label><Input {...register("name")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; FABRICANTE</Label><Input {...register("manufacturer")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.manufacturer && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.manufacturer.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DOSAGEM</Label><Input {...register("dosage")} placeholder="EX: 500MG" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.dosage && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.dosage.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CONCENTRACAO</Label><Input {...register("concentration")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.concentration && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.concentration.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CATEGORIA</Label><Input {...register("category")} placeholder="EX: ANALGESICO" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.category && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.category.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; QUANTIDADE EM ESTOQUE</Label><Input type="number" {...register("stockQuantity", { valueAsNumber: true })} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.stockQuantity && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.stockQuantity.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; PRECO UNITARIO (R$)</Label><Input type="number" step="0.01" {...register("unitPrice", { valueAsNumber: true })} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.unitPrice && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.unitPrice.message}</p>}</div>
                </div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingMedication ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ LISTA DE MEDICAMENTOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NOME</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">FABRICANTE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">DOSAGEM</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CATEGORIA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ESTOQUE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">PRECO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((m) => (
                <TableRow key={m.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{m.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{m.manufacturer}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{m.dosage}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{m.category}</TableCell>
                  <TableCell><span className={`font-mono text-[11px] font-bold ${m.stockQuantity < 10 ? "text-[#E61919]" : "text-[#EAEAEA]"}`}>{m.stockQuantity}</span></TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{m.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(m)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(m.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {medications.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM MEDICAMENTO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
