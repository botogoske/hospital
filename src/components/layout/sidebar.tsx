"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiBeaker,
  HiUsers,
  HiLogout,
  HiShieldCheck,
} from "react-icons/hi";
import {
  FaUserMd,
  FaBed,
  FaNotesMedical,
  FaProcedures,
  FaStethoscope,
  FaHospital,
} from "react-icons/fa";

const menuGroups = [
  {
    title: "NAV",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: HiHome },
    ],
  },
  {
    title: "ATENDIMENTO CLINICO",
    items: [
      { href: "/pacientes", label: "Pacientes", icon: HiUserGroup },
      { href: "/consultas", label: "Consultas", icon: HiCalendar },
      { href: "/cirurgias", label: "Cirurgias", icon: FaProcedures },
      { href: "/internamentos", label: "Internamentos", icon: FaHospital },
      { href: "/prontuarios", label: "Prontuarios", icon: FaNotesMedical },
    ],
  },
  {
    title: "RECURSOS & EQUIPE",
    items: [
      { href: "/medicos", label: "Medicos", icon: FaUserMd },
      { href: "/especialidades", label: "Especialidades", icon: FaStethoscope },
      { href: "/funcionarios", label: "Funcionarios", icon: HiUsers },
      { href: "/medicamentos", label: "Medicamentos", icon: HiBeaker },
      { href: "/leitos", label: "Leitos", icon: FaBed },
      { href: "/planos-de-saude", label: "Planos de Saude", icon: HiShieldCheck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-[#222222] bg-[#080808] text-[#EAEAEA] shadow-[4px_0_24px_rgba(0,0,0,0.5)]">
      {/* Brand Header */}
      <div className="border-b border-[#222222] px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center bg-[#E61919] text-white">
            <FaHospital className="h-4 w-4" />
          </div>
          <div>
            <span className="text-sm font-black uppercase tracking-[-0.03em] text-[#EAEAEA] leading-none block">
              HOSPITAL GREGUITO
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#777777] block mt-1">
              GESTAO INTELIGENTE
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 sidebar-scrollbar">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <h3 className="px-2 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-[#444444]">
              [ {group.title} ]
            </h3>
            <div className="space-y-px">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 px-3 py-2 text-xs font-medium uppercase tracking-wide transition-all duration-150",
                      isActive
                        ? "bg-[#E61919] text-white border-l-2 border-l-[#E61919]"
                        : "text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] border-l-2 border-l-transparent"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-3.5 w-3.5 transition-colors",
                        isActive ? "text-white" : "text-[#555555] group-hover:text-[#E61919]"
                      )}
                    />
                    <span className="font-mono text-[11px]">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="border-t border-[#222222] p-4 space-y-3">
        {/* Occupation bar */}
        <div className="bg-[#111111] border border-[#222222] p-3">
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777]">
            <span>[ OCUPACAO GERAL ]</span>
            <span className="text-[#4AF626] font-bold">74%</span>
          </div>
          <div className="mt-2 h-1 w-full bg-[#1A1A1A] overflow-hidden flex">
            <div className="h-full bg-[#4AF626] w-[74%]" />
            <div className="h-full bg-[#222222] flex-1" />
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 border border-[#333333] bg-[#111111] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777] transition-all hover:border-[#E61919]/40 hover:bg-[#E61919]/10 hover:text-[#E61919]"
        >
          <HiLogout className="h-3.5 w-3.5" />
          <span>[ ENCERRAR SESSAO ]</span>
        </Link>
      </div>
    </aside>
  );
}
