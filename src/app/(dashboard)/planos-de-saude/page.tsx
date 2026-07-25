"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthPlanSchema, type HealthPlanInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiSearch, HiShieldCheck, HiDocumentDownload } from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface HealthPlan { id: string; name: string; provider: string; registrationNumber: string; coverageType: string; isActive: boolean; _count: { appointments: number }; }

const coverageLabels: Record<string, string> = { BASIC: "BASICO", STANDARD: "STANDARD", PREMIUM: "PREMIUM" };
const coverageBorders: Record<string, string> = { BASIC: "border-l-[#555555]", STANDARD: "border-l-[#E61919]", PREMIUM: "border-l-[#E61919]" };

export default function HealthPlansPage() {
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingPlan, setEditingPlan] = useState<HealthPlan | null>(null);
  const [selectedCoverage, setSelectedCoverage] = useState("STANDARD");

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<HealthPlanInput>({
    resolver: zodResolver(healthPlanSchema),
    defaultValues: { coverageType: "STANDARD" },
  });

  useEffect(() => { fetchHealthPlans(); }, []);
  const fetchHealthPlans = async () => { const res = await fetch("/api/health-plans"); if (res.ok) setHealthPlans(await res.json()); };

  const onSubmit = async (data: HealthPlanInput) => {
    setLoading(true);
    try {
      const url = editingPlan ? `/api/health-plans/${editingPlan.id}` : "/api/health-plans";
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(toUpper(data)) });
      if (res.ok) { setOpen(false); reset({ coverageType: "STANDARD" }); setSelectedCoverage("STANDARD"); setEditingPlan(null); fetchHealthPlans(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (plan: HealthPlan) => {
    setEditingPlan(plan); setValue("name", plan.name); setValue("provider", plan.provider);
    setValue("registrationNumber", plan.registrationNumber); setValue("coverageType", plan.coverageType as "BASIC" | "STANDARD" | "PREMIUM");
    setValue("isActive", plan.isActive); setSelectedCoverage(plan.coverageType); setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano de saude?")) return;
    const res = await fetch(`/api/health-plans/${id}`, { method: "DELETE" });
    if (res.ok) fetchHealthPlans();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE PLANOS DE SAUDE", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${healthPlans.length} PLANO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "OPERADORA", "REGISTRO ANS", "COBERTURA", "CONSULTAS", "STATUS"]],
      body: healthPlans.map((p) => [
        p.name,
        p.provider,
        p.registrationNumber,
        coverageLabels[p.coverageType],
        p._count.appointments,
        p.isActive ? "ATIVO" : "INATIVO",
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`planos-de-saude_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  const filteredPlans = healthPlans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><HiShieldCheck className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">PLANOS DE SAUDE</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIE OS CONVENIOS E PLANOS DE SAUDE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className="flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset({ coverageType: "STANDARD" }); setSelectedCoverage("STANDARD"); setEditingPlan(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO PLANO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingPlan ? "[ EDITAR ] PLANO DE SAUDE" : "[ NOVO ] CADASTRAR PLANO DE SAUDE"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME DO PLANO</Label><Input {...register("name")} placeholder="EX: UNIMED GOLD" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; OPERADORA</Label><Input {...register("provider")} placeholder="EX: UNIMED" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.provider && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.provider.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NUMERO DE REGISTRO (ANS)</Label><Input {...register("registrationNumber")} placeholder="EX: 302147" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.registrationNumber && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.registrationNumber.message}</p>}</div>
                <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TIPO DE COBERTURA</Label>
                  <select value={selectedCoverage} onChange={(e) => { setSelectedCoverage(e.target.value); setValue("coverageType", e.target.value as "BASIC" | "STANDARD" | "PREMIUM"); }}
                    className="flex w-full border border-[#333333] bg-[#0D0D0D] px-3 py-2 font-mono text-xs text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none">
                    <option value="BASIC">BASICO</option><option value="STANDARD">STANDARD</option><option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                {editingPlan && (
                  <div className="flex items-center gap-2 border border-[#222222] bg-[#0D0D0D] px-3 py-2">
                    <input type="checkbox" id="isActive" defaultChecked={editingPlan.isActive} onChange={(e) => setValue("isActive", e.target.checked)} className="h-3.5 w-3.5 accent-[#E61919]" />
                    <Label htmlFor="isActive" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EAEAEA]">PLANO ATIVO</Label>
                  </div>
                )}
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingPlan ? "[ ATUALIZAR PLANO ]" : "[ CADASTRAR PLANO ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4 space-y-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ PLANOS CADASTRADOS ]</span>
          <div className="relative">
            <HiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]" />
            <input placeholder="BUSCAR POR NOME OU OPERADORA..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-[#222222] bg-[#0D0D0D] py-1.5 pl-9 pr-3 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:outline-none rounded-none" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NOME</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">OPERADORA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">REGISTRO ANS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">COBERTURA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CONSULTAS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">STATUS</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{plan.name}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{plan.provider}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#777777]">{plan.registrationNumber}</TableCell>
                  <TableCell><span className={`inline-block border-l-2 ${coverageBorders[plan.coverageType] || "border-l-[#333333]"} pl-2 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]`}>[ {coverageLabels[plan.coverageType]} ]</span></TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{plan._count.appointments}</TableCell>
                  <TableCell><span className={`font-mono text-[10px] uppercase tracking-wider ${plan.isActive ? "text-[#4AF626]" : "text-[#E61919]"}`}>[ {plan.isActive ? "ATIVO" : "INATIVO"} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(plan)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(plan.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans.length === 0 && <TableRow><TableCell colSpan={7} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">{search ? "NENHUM RESULTADO ENCONTRADO" : "NENHUM PLANO DE SAUDE CADASTRADO"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
