"use client";

import { useState } from "react";
import { HiSearch, HiBell, HiSparkles, HiShieldCheck } from "react-icons/hi";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header() {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-6 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* Left: Quick Search */}
      <div className="flex items-center gap-4">
        <div className="relative w-72 md:w-96">
          <HiSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar paciente, médico, prontuário..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-10 pr-12 text-sm text-slate-700 transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-200 dark:placeholder:text-slate-500 dark:focus:border-blue-400"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 border border-slate-200 shadow-2xs dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions & User Profile */}
      <div className="flex items-center gap-4">
        {/* Status indicator */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          </span>
          <HiShieldCheck className="h-3.5 w-3.5" />
          <span>Sistema Operacional</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
          >
            <HiBell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600 ring-2 ring-white dark:ring-slate-900" />
          </Button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">Notificações</span>
                <span className="text-xs text-blue-600 dark:text-blue-400 cursor-pointer font-medium hover:underline">Marcar como lidas</span>
              </div>
              <div className="mt-3 space-y-3">
                <div className="flex gap-3 items-start text-xs">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                    <HiSparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800 dark:text-slate-200">Novo agendamento de cirurgia</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">Há 10 minutos por Dr. Ricardo</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

        {/* User Chip */}
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border-2 border-blue-500/30 ring-2 ring-blue-500/10">
            <AvatarImage src="/avatar-doctor.png" alt="Dr. Admin" />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs">
              AD
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left md:block">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">Dr. Administrador</p>
            <p className="text-[11px] text-slate-400 font-medium">Gestão Geral</p>
          </div>
        </div>
      </div>
    </header>
  );
}
