"use client";

import { useState } from "react";
import { HiSearch, HiBell, HiShieldCheck } from "react-icons/hi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-[#222222] bg-[#0D0D0D] px-6">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-72 md:w-96">
          <HiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]" />
          <input
            type="text"
            placeholder="BUSCAR PACIENTE, MEDICO, PRONTUARIO..."
            className="w-full border border-[#222222] bg-[#0A0A0A] py-2 pl-10 pr-16 font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:outline-none rounded-none"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#333333] bg-[#111111] px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#777777]">
            CTRL+K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 border border-[#333333] bg-[#111111] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.08em] text-[#4AF626]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping bg-[#4AF626] opacity-75"></span>
            <span className="relative inline-flex h-1.5 w-1.5 bg-[#4AF626]"></span>
          </span>
          <HiShieldCheck className="h-3 w-3" />
          <span>[ SYS OK ]</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            className="relative flex h-8 w-8 items-center justify-center text-[#777777] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <HiBell className="h-4 w-4" />
            <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-[#E61919]" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 border border-[#333333] bg-[#111111] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#222222] px-4 py-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EAEAEA]">[ NOTIFICACOES ]</span>
                <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#E61919] cursor-pointer hover:underline">MARCAR COMO LIDAS</span>
              </div>
              <div className="p-4">
                <div className="flex gap-3 items-start">
                  <div className="h-1.5 w-1.5 mt-1.5 bg-[#E61919] shrink-0" />
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">NOVO AGENDAMENTO DE CIRURGIA</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555555] mt-1">HA 10 MINUTOS POR DR. RICARDO</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-[#222222]" />

        {/* User Chip */}
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8 border border-[#E61919] rounded-none">
            <AvatarImage src="/avatar-doctor.png" alt="Dr. Admin" />
            <AvatarFallback className="bg-[#E61919] text-white font-mono font-bold text-[10px] rounded-none">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">DR. ADMINISTRADOR</p>
            <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#555555]">GESTAO GERAL</p>
          </div>
        </div>
      </div>
    </header>
  );
}
