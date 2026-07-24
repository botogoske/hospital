"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FaBed } from "react-icons/fa";

interface Bed { id: string; number: string; ward: string; floor: number; status: string; bedType: string; }

const bedStatusLabels: Record<string, string> = { AVAILABLE: "DISPONIVEL", OCCUPIED: "OCUPADO", MAINTENANCE: "MANUTENCAO", RESERVED: "RESERVADO" };
const bedStatusBorders: Record<string, string> = { AVAILABLE: "border-l-[#4AF626]", OCCUPIED: "border-l-[#E61919]", MAINTENANCE: "border-l-[#E61919]", RESERVED: "border-l-[#555555]" };
const bedTypeLabels: Record<string, string> = { REGULAR: "REGULAR", ICU: "UTI", EMERGENCY: "EMERGENCIA", PEDIATRIC: "PEDIATRICO" };

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);

  useEffect(() => { fetchBeds(); }, []);
  const fetchBeds = async () => { const res = await fetch("/api/beds"); if (res.ok) setBeds(await res.json()); };

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === "AVAILABLE").length,
    occupied: beds.filter((b) => b.status === "OCCUPIED").length,
    maintenance: beds.filter((b) => b.status === "MAINTENANCE").length,
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><FaBed className="h-5 w-5" /></div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">LEITOS</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIAMENTO DE LEITOS DO HOSPITAL</p>
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
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ MAPA DE LEITOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NUMERO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ALA</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ANDAR</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TIPO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">STATUS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beds.map((bed) => (
                <TableRow key={bed.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] font-bold text-[#EAEAEA]">{bed.number}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{bed.ward}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{bed.floor}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{bedTypeLabels[bed.bedType]}</TableCell>
                  <TableCell><span className={`inline-block border-l-2 ${bedStatusBorders[bed.status] || "border-l-[#333333]"} pl-2 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA]`}>[ {bedStatusLabels[bed.status]} ]</span></TableCell>
                </TableRow>
              ))}
              {beds.length === 0 && <TableRow><TableCell colSpan={5} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM LEITO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
