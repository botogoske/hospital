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
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaBed className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">LEITOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIAMENTO DE LEITOS DO HOSPITAL</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className="flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset({ bedType: "REGULAR", floor: 1 }); setSelectedType("REGULAR"); setEditingBed(null); } }}>
              <DialogTrigger render={<Button />}>
                <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO LEITO</span>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
                <DialogHeader className="border-b border-[#222222] px-6 py-4">
                  <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingBed ? "[ EDITAR ] LEITO" : "[ NOVO ] CADASTRAR LEITO"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NUMERO DO LEITO</Label><Input {...register("number")} placeholder="EX: 101-A" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.number && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.number.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ALA</Label><Input {...register("ward")} placeholder="EX: CARDIOLOGIA" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.ward && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.ward.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ANDAR</Label><Input type="number" {...register("floor", { valueAsNumber: true })} placeholder="EX: 1" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.floor && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.floor.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TIPO DE LEITO</Label>
                    <select value={selectedType} onChange={(e) => { setSelectedType(e.target.value); setValue("bedType", e.target.value as "REGULAR" | "ICU" | "EMERGENCY" | "PEDIATRIC"); }}
                      className="flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none">
                      <option value="REGULAR">REGULAR</option><option value="ICU">UTI</option><option value="EMERGENCY">EMERGENCIA</option><option value="PEDIATRIC">PEDIATRICO</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingBed ? "[ ATUALIZAR LEITO ]" : "[ CADASTRAR LEITO ]"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid gap-px bg-[#222222] border border-[#222222] sm:grid-cols-4">
        {[
          { label: "TOTAL", value: stats.total, color: "text-[#EAEAEA]" },
          { label: "DISPONIVEIS", value: stats.available, color: "text-[#4AF626]" },
          { label: "OCUPADOS", value: stats.occupied, color: "text-[#E61919]" },
          { label: "MANUTENCAO", value: stats.maintenance, color: "text-[#E61919]" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111111] p-4 text-center">
            <div className={`font-mono text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] mt-1">[ {s.label} ]</div>
          </div>
        ))}
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ MAPA DE LEITOS ]</span>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]" />
            <input placeholder="BUSCAR POR NUMERO OU ALA..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#222222] bg-[#0D0D0D] py-1.5 pl-9 pr-3 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:outline-none rounded-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NUMERO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ALA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ANDAR</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TIPO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">STATUS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBeds.map((bed) => (
                <TableRow key={bed.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] font-bold text-[#EAEAEA]">{bed.number}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{bed.ward}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{bed.floor}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{bedTypeLabels[bed.bedType]}</TableCell>
                  <TableCell><span className={`inline-block border-l-2 ${bedStatusBorders[bed.status] || "border-l-[#333333]"} pl-2 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]`}>[ {bedStatusLabels[bed.status]} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(bed)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(bed.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredBeds.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">{search ? "NENHUM RESULTADO ENCONTRADO" : "NENHUM LEITO CADASTRADO"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
