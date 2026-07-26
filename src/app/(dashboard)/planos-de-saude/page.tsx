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
import { formStyles, statusColors, statusBadgeStyle } from "@/styles/form-styles";

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
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}><HiShieldCheck className="h-5 w-5" /></div>
            <div>
              <h1 className={formStyles.header.title}>PLANOS DE SAUDE</h1>
              <p className={formStyles.header.subtitle}>GERENCIE OS CONVENIOS E PLANOS DE SAUDE</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}><HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF</button>
            <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset({ coverageType: "STANDARD" }); setSelectedCoverage("STANDARD"); setEditingPlan(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className={formStyles.button.trigger}><HiPlus className="h-3.5 w-3.5" /> NOVO PLANO</span>
            </DialogTrigger>
            <DialogContent className={formStyles.dialog.content}>
              <DialogHeader className={formStyles.dialog.header}>
                <DialogTitle className={formStyles.dialog.title}>{editingPlan ? "[ EDITAR ] PLANO DE SAUDE" : "[ NOVO ] CADASTRAR PLANO DE SAUDE"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; NOME DO PLANO</Label><Input {...register("name")} placeholder="EX: UNIMED GOLD" className={formStyles.field.input} />{errors.name && <p className={formStyles.field.error}>{errors.name.message}</p>}</div>
                <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; OPERADORA</Label><Input {...register("provider")} placeholder="EX: UNIMED" className={formStyles.field.input} />{errors.provider && <p className={formStyles.field.error}>{errors.provider.message}</p>}</div>
                <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; NUMERO DE REGISTRO (ANS)</Label><Input {...register("registrationNumber")} placeholder="EX: 302147" className={formStyles.field.input} />{errors.registrationNumber && <p className={formStyles.field.error}>{errors.registrationNumber.message}</p>}</div>
                <div className={formStyles.field.wrapper}><Label className={formStyles.field.label}>&gt; TIPO DE COBERTURA</Label>
                  <select value={selectedCoverage} onChange={(e) => { setSelectedCoverage(e.target.value); setValue("coverageType", e.target.value as "BASIC" | "STANDARD" | "PREMIUM"); }}
                    className={formStyles.field.select}>
                    <option value="BASIC">BASICO</option><option value="STANDARD">STANDARD</option><option value="PREMIUM">PREMIUM</option>
                  </select>
                </div>
                {editingPlan && (
                  <div className="flex items-center gap-2 border border-[#222222] bg-[#0D0D0D] px-3 py-2">
                    <input type="checkbox" id="isActive" defaultChecked={editingPlan.isActive} onChange={(e) => setValue("isActive", e.target.checked)} className="h-3.5 w-3.5 accent-[#E61919]" />
                    <Label htmlFor="isActive" className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EAEAEA]">PLANO ATIVO</Label>
                  </div>
                )}
                <Button type="submit" className={formStyles.button.primary} disabled={loading}>{loading ? "[ SALVANDO... ]" : editingPlan ? "[ ATUALIZAR PLANO ]" : "[ CADASTRAR PLANO ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <span className={formStyles.section.title}>[ PLANOS CADASTRADOS ]</span>
          <div className={formStyles.search.wrapper}>
            <HiSearch className={formStyles.search.icon} />
            <input placeholder="BUSCAR POR NOME OU OPERADORA..." value={search} onChange={(e) => setSearch(e.target.value)}
              className={formStyles.search.input} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>NOME</TableHead>
                <TableHead className={formStyles.table.headerCell}>OPERADORA</TableHead>
                <TableHead className={formStyles.table.headerCell}>REGISTRO ANS</TableHead>
                <TableHead className={formStyles.table.headerCell}>COBERTURA</TableHead>
                <TableHead className={formStyles.table.headerCell}>CONSULTAS</TableHead>
                <TableHead className={formStyles.table.headerCell}>STATUS</TableHead>
                <TableHead className={`${formStyles.table.headerCell} text-right`}>ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{plan.name}</TableCell>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>{plan.provider}</TableCell>
                  <TableCell className={formStyles.table.cellMuted}>{plan.registrationNumber}</TableCell>
                  <TableCell><span className={`${statusBadgeStyle} ${statusColors[plan.coverageType.toLowerCase() as keyof typeof statusColors] || "border-l-[#333333]"}`}>[ {coverageLabels[plan.coverageType]} ]</span></TableCell>
                  <TableCell className={formStyles.table.cell}>{plan._count.appointments}</TableCell>
                  <TableCell><span className={`font-mono text-[10px] uppercase tracking-wider ${plan.isActive ? "text-[#4AF626]" : "text-[#E61919]"}`}>[ {plan.isActive ? "ATIVO" : "INATIVO"} ]</span></TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className={formStyles.button.edit} onClick={() => handleEdit(plan)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className={formStyles.button.delete} onClick={() => handleDelete(plan.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans.length === 0 && <TableRow><TableCell colSpan={7} className={formStyles.table.emptyState}>{search ? "NENHUM RESULTADO ENCONTRADO" : "NENHUM PLANO DE SAUDE CADASTRADO"}</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
