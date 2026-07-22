"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  HiHome,
  HiUserGroup,
  HiCalendar,
  HiCog,
  HiBeaker,
  HiUsers,
  HiLogout,
} from "react-icons/hi";
import {
  FaUserMd,
  FaBed,
  FaNotesMedical,
  FaProcedures,
  FaStethoscope,
  FaHospital,
} from "react-icons/fa";

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: HiHome },
  { href: "/pacientes", label: "Pacientes", icon: HiUserGroup },
  { href: "/medicos", label: "Médicos", icon: FaUserMd },
  { href: "/especialidades", label: "Especialidades", icon: FaStethoscope },
  { href: "/funcionarios", label: "Funcionários", icon: HiUsers },
  { href: "/consultas", label: "Consultas", icon: HiCalendar },
  { href: "/cirurgias", label: "Cirurgias", icon: FaProcedures },
  { href: "/medicamentos", label: "Medicamentos", icon: HiBeaker },
  { href: "/leitos", label: "Leitos", icon: FaBed },
  { href: "/internamentos", label: "Internamentos", icon: FaHospital },
  { href: "/prontuarios", label: "Prontuários", icon: FaNotesMedical },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
      <div className="flex items-center gap-2 border-b border-gray-700 px-6 py-4">
        <HiCog className="h-8 w-8 text-blue-400" />
        <span className="text-xl font-bold">Hospital System</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-gray-700 px-3 py-4">
        <Link
          href="/login"
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <HiLogout className="h-5 w-5" />
          Sair
        </Link>
      </div>
    </div>
  );
}
