"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bedSchema, type BedInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaBed } from "react-icons/fa";
import { HiPlus, HiPencil, HiTrash, HiSearch, HiDocumentDownload } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles, statusColors, statusBadgeStyle } from "@/styles/form-styles";

interface Bed { id: string; number: string; ward: string; floor: number; status: string; bedType: string; }

const bedStatusLabels: Record<string, string> = { AVAILABLE: "DISPONIVEL", OCCUPIED: "OCUPADO", MAINTENANCE: "MANUTENCAO", RESERVED: "RESERVADO" };
const bedStatusBorders: Record<string, string> = { AVAILABLE: "border-l-[#4AF626]", OCCUPIED: "border-l-[#E61919]", MAINTENANCE: "border-l-[#E61919]", RESERVED: "border-l-[#555555]" };
const bedTypeLabels: Record<string, string> = { REGULAR: "REGULAR", ICU: "UTI", EMERGENCY: "EMERGENCIA", PEDIATRIC: "PEDIATRICO" };

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingBed, setEditingBed] = useState<Bed | null>(null);
  const [selectedType, setSelectedType] = useState("REGULAR");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BedInput>({
    resolver: zodResolver(bedSchema),
    defaultValues: { bedType: "REGULAR", floor: 1 },
  });

  useEffect(() => { fetchBeds(); }, []);
  const fetchBeds = async () => { const res = await fetch("/api/beds"); if (res.ok) setBeds(await res.json()); };

  const onSubmit = async (data: BedInput) => {
    setLoading(true);
    try {
      const url = editingBed ? `/api/beds/${editingBed.id}` : "/api/beds";
      const method = editingBed ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset({ bedType: "REGULAR", floor: 1 }); setSelectedType("REGULAR"); setEditingBed(null); fetchBeds(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (bed: Bed) => {
    setEditingBed(bed); setValue("number", bed.number); setValue("ward", bed.ward);
    setValue("floor", bed.floor); setValue("bedType", bed.bedType as "REGULAR" | "ICU" | "EMERGENCY" | "PEDIATRIC");
    setSelectedType(bed.bedType); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este leito?")) return;
    const res = await fetch(`/api/beds/${id}`, { method: "DELETE" });
    if (res.ok) fetchBeds();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE LEITOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${beds.length} LEITO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NUMERO", "ALA", "ANDAR", "TIPO", "STATUS"]],
      body: beds.map((b) => [
        b.number,
        b.ward,
        b.floor,
        bedTypeLabels[b.bedType],
        bedStatusLabels[b.status],
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`leitos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === "AVAILABLE").length,
    occupied: beds.filter((b) => b.status === "OCCUPIED").length,
    maintenance: beds.filter((b) => b.status === "MAINTENANCE").length,
  };

  const filteredBeds = beds.filter((b) =>
    b.number.toLowerCase().includes(search.toLowerCase()) || b.ward.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}><FaBed className="h-5 w-5" /></div>
            <div>
              <h1 className={formStyles.header.title}>LEITOS</h1>
              <p className={formStyles.header.subtitle}>GERENCIAMENTO DE LEITOS DO HOSPITAL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset({ bedType: "REGULAR", floor: 1 }); setSelectedType("REGULAR"); setEditingBed(null); } }}>
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}><HiPlus className="h-3.5 w-3.5" /> NOVO LEITO</span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>{editingBed ? "[ EDITAR ] LEITO" : "[ NOVO ] CADASTRAR LEITO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; NUMERO DO LEITO</Label><Input {...register("number")} placeholder="EX: 101-A" className={formStyles.field.input} />{errors.number && <p className={formStyles.field.error}>{errors.number.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; ALA</Label><Input {...register("ward")} placeholder="EX: CARDIOLOGIA" className={formStyles.field.input} />{errors.ward && <p className={formStyles.field.error}>{errors.ward.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; ANDAR</Label><Input type="number" {...register("floor", { valueAsNumber: true })} placeholder="EX: 1" className={formStyles.field.input} />{errors.floor && <p className={formStyles.field.error}>{errors.floor.message}</p>}</div>
                  <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; TIPO DE LEITO</Label>
                    <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setValue("bedType", e.target.value as "REGULAR" | "ICU" | "EMERGENCY" | "PEDIATRIC"); }}
                      className={formStyles.field.select}>
                      <option value="REGULAR">REGULAR</option><option value="ICU">UTI</option><option value="EMERGENCY">EMERGENCIA</option><option value="PEDIATRIC">PEDIATRICO</option>
                    </select>
                  </div>
                  <Button type="submit" className={formStyles.button.primary} disabled={loading}>{loading ? "[ SALVANDO... ]" : editingBed ? "[ ATUALIZAR LEITO ]" : "[ CADASTRAR LEITO ]"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.stats.container}>
        {[
          { label: "TOTAL", value: stats.total, color: "text-[#EAEAEA]" },
          { label: "DISPONIVEIS", value: stats.available, color: "text-[#4AF626]" },
          { label: "OCUPADOS", value: stats.occupied, color: "text-[#E61919]" },
          { label: "MANUTENCAO", value: stats.maintenance, color: "text-[#E61919]" },
        ].map((s) => (
          <div key={s.label} className={formStyles.stats.item}>
            <div className={`${formStyles.stats.value} ${s.color}`}>{s.value}</div>
            <div className={formStyles.stats.label}>[ {s.label} ]</div>
          </div>
        ))}
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <span className={formStyles.section.title}>[ MAPA DE LEITOS ]</span>
          <div className={formStyles.search.wrapper}>
            <HiSearch className={formStyles.search.icon} />
            <input placeholder="BUSCAR POR NUMERO OU ALA..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={formStyles.search.input} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>NUMERO</TableHead>
                <TableHead className={formStyles.table.headerCell}>ALA</TableHead>
                <TableHead className={formStyles.table.headerCell}>ANDAR</TableHead>
                <TableHead className={formStyles.table.headerCell}>TIPO</TableHead>
                <TableHead className={formStyles.table.headerCell}>STATUS</TableHead>
                <TableHead className={`${formStyles.table.headerCell} text-right`}>ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBeds.map((bed) => (
                <TableRow key={bed.id} className={formStyles.table.bodyRow}>
                  <TableCell className={formStyles.table.cellBold}>{bed.number}</TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{bed.ward}</TableCell>
                  <TableCell className={formStyles.table.cell}>{bed.floor}</TableCell>
                  <TableCell className={formStyles.table.cellMuted}>{bedTypeLabels[bed.bedType]}</TableCell>
                  <TableCell><span className={`${statusBadgeStyle} ${statusColors[bed.status.toLowerCase() as keyof typeof statusColors] || "border-l-[#333333]"}`}>[ {bedStatusLabels[bed.status]} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className={formStyles.button.edit} onClick={() => handleEdit(bed)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className={formStyles.button.delete} onClick={() => handleDelete(bed.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBeds.length === 0 && <TableRow><TableCell colSpan={6} className={formStyles.table.emptyState}>{search ? "NENHUM RESULTADO ENCONTRADO" : "NENHUM LEITO CADASTRADO"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
