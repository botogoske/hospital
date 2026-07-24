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
  HiSparkles,
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
    title: "Geral",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: HiHome },
    ],
  },
  {
    title: "Atendimento Clínico",
    items: [
      { href: "/pacientes", label: "Pacientes", icon: HiUserGroup },
      { href: "/consultas", label: "Consultas", icon: HiCalendar },
      { href: "/cirurgias", label: "Cirurgias", icon: FaProcedures },
      { href: "/internamentos", label: "Internamentos", icon: FaHospital },
      { href: "/prontuarios", label: "Prontuários", icon: FaNotesMedical },
    ],
  },
  {
    title: "Recursos & Equipe",
    items: [
      { href: "/medicos", label: "Médicos", icon: FaUserMd },
      { href: "/especialidades", label: "Especialidades", icon: FaStethoscope },
      { href: "/funcionarios", label: "Funcionários", icon: HiUsers },
      { href: "/medicamentos", label: "Medicamentos", icon: HiBeaker },
      { href: "/leitos", label: "Leitos", icon: FaBed },
      { href: "/planos-de-saude", label: "Planos de Saúde", icon: HiShieldCheck },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-200">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-800/80 px-6 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-teal-400 text-white shadow-lg shadow-blue-500/25">
          <FaHospital className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
            Hospital Greguito
          </span>
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
            <HiSparkles className="h-3 w-3 text-amber-400" /> Gestão Inteligente
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-6 scrollbar-thin">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 font-semibold"
                        : "text-slate-400 hover:bg-slate-800/70 hover:text-slate-100"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "h-4 w-4 transition-transform group-hover:scale-110",
                        isActive ? "text-white" : "text-slate-400 group-hover:text-blue-400"
                      )}
                    />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Profile / Logout */}
      <div className="border-t border-slate-800/80 p-4">
        <div className="mb-3 rounded-xl bg-slate-800/50 p-3 border border-slate-700/50">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ocupação Geral</span>
            <span className="font-semibold text-emerald-400">74%</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 w-[74%]" />
          </div>
        </div>

        <Link
          href="/login"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-800/40 px-3 py-2 text-xs font-semibold text-slate-300 transition-all hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30"
        >
          <HiLogout className="h-4 w-4 text-red-400" />
          <span>Encerrar Sessão</span>
        </Link>
      </div>
    </aside>
  );
}
