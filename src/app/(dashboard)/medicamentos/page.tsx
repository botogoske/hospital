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
import { formStyles } from "@/styles/form-styles";

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
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}><HiBeaker className="h-5 w-5" /></div>
            <div>
              <h1 className={formStyles.header.title}>MEDICAMENTOS</h1>
              <p className={formStyles.header.subtitle}>GERENCIE O ESTOQUE DE MEDICAMENTOS</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditingMedication(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className={formStyles.button.trigger}><HiPlus className="h-3.5 w-3.5" /> NOVO MEDICAMENTO</span>
            </DialogTrigger>
            <DialogContent className={formStyles.dialog.content}>
              <DialogHeader className={formStyles.dialog.header}>
                <DialogTitle className={formStyles.dialog.title}>{editingMedication ? "[ EDITAR ] MEDICAMENTO" : "[ NOVO ] CADASTRAR MEDICAMENTO"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; NOME</Label><Input {...register("name")} className={formStyles.field.input} />{errors.name && <p className={formStyles.field.error}>{errors.name.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; FABRICANTE</Label><Input {...register("manufacturer")} className={formStyles.field.input} />{errors.manufacturer && <p className={formStyles.field.error}>{errors.manufacturer.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; DOSAGEM</Label><Input {...register("dosage")} placeholder="EX: 500MG" className={formStyles.field.input} />{errors.dosage && <p className={formStyles.field.error}>{errors.dosage.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; CONCENTRACAO</Label><Input {...register("concentration")} className={formStyles.field.input} />{errors.concentration && <p className={formStyles.field.error}>{errors.concentration.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; CATEGORIA</Label><Input {...register("category")} placeholder="EX: ANALGESICO" className={formStyles.field.input} />{errors.category && <p className={formStyles.field.error}>{errors.category.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; QUANTIDADE EM ESTOQUE</Label><Input type="number" {...register("stockQuantity", { valueAsNumber: true })} className={formStyles.field.input} />{errors.stockQuantity && <p className={formStyles.field.error}>{errors.stockQuantity.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; PRECO UNITARIO (R$)</Label><Input type="number" step="0.01" {...register("unitPrice", { valueAsNumber: true })} className={formStyles.field.input} />{errors.unitPrice && <p className={formStyles.field.error}>{errors.unitPrice.message}</p>}</div>
                </div>
                <Button type="submit" className={formStyles.button.primary} disabled={loading}>{loading ? "[ SALVANDO... ]" : editingMedication ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}><span className={formStyles.section.title}>[ LISTA DE MEDICAMENTOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>NOME</TableHead>
                <TableHead className={formStyles.table.headerCell}>FABRICANTE</TableHead>
                <TableHead className={formStyles.table.headerCell}>DOSAGEM</TableHead>
                <TableHead className={formStyles.table.headerCell}>CATEGORIA</TableHead>
                <TableHead className={formStyles.table.headerCell}>ESTOQUE</TableHead>
                <TableHead className={formStyles.table.headerCell}>PRECO</TableHead>
                <TableHead className={`${formStyles.table.headerCell} text-right`}>ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((m) => (
                <TableRow key={m.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{m.name}</TableCell>
                  <TableCell className={formStyles.table.cellMuted}>{m.manufacturer}</TableCell>
                  <TableCell className={formStyles.table.cell}>{m.dosage}</TableCell>
                  <TableCell className={formStyles.table.cellMuted}>{m.category}</TableCell>
                  <TableCell><span className={`font-mono text-[11px] font-bold ${m.stockQuantity < 10 ? "text-[#E61919]" : "text-[#EAEAEA]"}`}>{m.stockQuantity}</span></TableCell>
                  <TableCell className={formStyles.table.cell}>{m.unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className={formStyles.button.edit} onClick={() => handleEdit(m)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className={formStyles.button.delete} onClick={() => handleDelete(m.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {medications.length === 0 && <TableRow><TableCell colSpan={7} className={formStyles.table.emptyState}>NENHUM MEDICAMENTO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
