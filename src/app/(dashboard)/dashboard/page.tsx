"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  HiUserGroup,
  HiCalendar,
  HiBeaker,
  HiPlus,
  HiClock,
  HiShieldCheck,
} from "react-icons/hi";
import {
  FaUserMd,
  FaBed,
  FaProcedures,
  FaNotesMedical,
  FaHospital,
  FaClipboardList,
} from "react-icons/fa";

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  todayAppointments: number;
  weekSurgeries: number;
  availableBeds: number;
  totalBeds: number;
  totalMedications: number;
  totalMedicalRecords: number;
  totalEmployees: number;
  totalAdmissions: number;
  totalHealthPlans: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {
        setStats({
          totalPatients: 1248,
          totalDoctors: 42,
          todayAppointments: 28,
          weekSurgeries: 14,
          availableBeds: 18,
          totalBeds: 60,
          totalMedications: 350,
          totalMedicalRecords: 2150,
          totalEmployees: 110,
          totalAdmissions: 32,
          totalHealthPlans: 8,
        });
      });
  }, []);

  const statCards = stats
    ? [
        {
          title: "PACIENTES",
          value: stats.totalPatients.toLocaleString("pt-BR"),
          description: "+14 ESTE MES",
          icon: HiUserGroup,
          accent: true,
        },
        {
          title: "CORPO MEDICO",
          value: stats.totalDoctors.toLocaleString("pt-BR"),
          description: "ESPECIALISTAS ATIVOS",
          icon: FaUserMd,
          accent: false,
        },
        {
          title: "CONSULTAS HOJE",
          value: stats.todayAppointments.toLocaleString("pt-BR"),
          description: "AGENDAMENTOS CONFIRMADOS",
          icon: HiCalendar,
          accent: false,
        },
        {
          title: "CIRURGIAS SEMANA",
          value: stats.weekSurgeries.toLocaleString("pt-BR"),
          description: "CENTRO CIRURGICO",
          icon: FaProcedures,
          accent: false,
        },
        {
          title: "LEITOS DISPONIVEIS",
          value: `${stats.availableBeds}/${stats.totalBeds}`,
          description: "OCUPACAO: 70%",
          icon: FaBed,
          accent: false,
        },
        {
          title: "INTERNAMENTOS",
          value: stats.totalAdmissions.toLocaleString("pt-BR"),
          description: "PACIENTES EM LEITO",
          icon: FaHospital,
          accent: false,
        },
        {
          title: "MEDICAMENTOS",
          value: stats.totalMedications.toLocaleString("pt-BR"),
          description: "ITENS EM ESTOQUE",
          icon: HiBeaker,
          accent: false,
        },
        {
          title: "PRONTUARIOS",
          value: stats.totalMedicalRecords.toLocaleString("pt-BR"),
          description: "HISTORICO COMPLETO",
          icon: FaNotesMedical,
          accent: false,
        },
        {
          title: "PLANOS DE SAUDE",
          value: stats.totalHealthPlans.toLocaleString("pt-BR"),
          description: "CONVENIOS ATIVOS",
          icon: HiShieldCheck,
          accent: false,
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-8">
      {/* Welcome Banner */}
      <div className="border border-[#222222] bg-[#111111] relative">
        {/* Red accent bar */}
        <div className="absolute top-0 left-0 h-1 w-full bg-[#E61919]" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 p-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 border border-[#333333] bg-[#0D0D0D] px-3 py-1 font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">
              <span className="text-[#E61919]"></span>
              <span>PAINEL DE CONTROLE HOSPITALAR</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#EAEAEA] leading-none">
              BEM-VINDO AO
              <br />
              <span className="text-[#E61919]">HOSPITAL GREGUITO</span>
            </h1>
            <p className="font-mono text-[11px] uppercase tracking-[0.06em] text-[#555555] max-w-xl">
              VISAO CONSOLIDADA EM TEMPO REAL DA OCUPACAO DE LEITOS, CIRURGIAS
              AGENDADAS E ATENDIMENTO A PACIENTES.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <Link
              href="/consultas"
              className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515] transition-colors"
            >
              <HiPlus className="h-3.5 w-3.5" />
              NOVA CONSULTA
            </Link>
            <Link
              href="/pacientes"
              className="flex items-center gap-2 border border-[#333333] bg-[#1A1A1A] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] text-[#EAEAEA] hover:border-[#555555] transition-colors"
            >
              <HiUserGroup className="h-3.5 w-3.5" />
              NOVO PACIENTE
            </Link>
          </div>
        </div>

        {/* Metadata bar */}
        <div className="border-t border-[#222222] bg-[#0A0A0A] px-6 py-2 flex items-center justify-between">
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#333333]">
            REV 2.6 &middot; UNIT / D-01
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#333333]">
            {new Date().toLocaleDateString("pt-BR")}{" "}
            {new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid gap-px bg-[#222222] border border-[#222222] grid-cols-3">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="bg-[#111111] p-5 group hover:bg-[#141414] transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div
                className={`flex h-8 w-8 items-center justify-center ${stat.accent ? "bg-[#E61919] text-white" : "bg-[#1A1A1A] text-[#777777] border border-[#333333]"} transition-colors group-hover:text-[#EAEAEA]`}
              >
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[#444444]">
                {stat.accent ? ">>> ACTIVE" : "[ OK ]"}
              </span>
            </div>
            <div className="space-y-1">
              <p className="font-mono text-2xl font-bold tracking-tight text-[#EAEAEA]">
                {stat.value}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-widest text-[#555555]">
                {stat.title}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#333333]">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Shortcuts & Quick Actions Grid */}
      <div className="grid gap-px bg-[#222222] border border-[#222222] lg:grid-cols-3">
        {/* Left Column: Quick Actions */}
        <div className="bg-[#111111] p-6 lg:col-span-2">
          <div className="border-b border-[#222222] pb-4 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FaClipboardList className="h-4 w-4 text-[#E61919]" />
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EAEAEA]">
                [ ATALHOS RAPIDOS DE OPERACAO ]
              </span>
            </div>
          </div>
          <div className="grid gap-px bg-[#222222] sm:grid-cols-2">
            <Link
              href="/consultas"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#E61919] group-hover:text-white group-hover:border-[#E61919] transition-colors">
                <HiCalendar className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  AGENDAR CONSULTA
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  MARCAR NOVA CONSULTA AMBULATORIAL OU RETORNO
                </p>
              </div>
            </Link>

            <Link
              href="/internamentos"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#4AF626] group-hover:text-black group-hover:border-[#4AF626] transition-colors">
                <FaHospital className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  REGISTRAR INTERNAMENTO
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  DAR ENTRADA DE PACIENTE EM LEITO HOSPITALAR
                </p>
              </div>
            </Link>

            <Link
              href="/prontuarios"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#E61919] group-hover:text-white group-hover:border-[#E61919] transition-colors">
                <FaNotesMedical className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  PRONTUARIO ELETRONICO
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  CONSULTAR HISTORICO MEDICO E EVOLUCOES
                </p>
              </div>
            </Link>

            <Link
              href="/cirurgias"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#E61919] group-hover:text-white group-hover:border-[#E61919] transition-colors">
                <FaProcedures className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  MAPA CIRURGICO
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  VISUALIZAR HORARIOS DE SALAS DE CIRURGIA
                </p>
              </div>
            </Link>

            <Link
              href="/planos-de-saude"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#4AF626] group-hover:text-black group-hover:border-[#4AF626] transition-colors">
                <HiShieldCheck className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  PLANOS DE SAUDE
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  GERENCIAR CONVENIOS E COBERTURAS
                </p>
              </div>
            </Link>

            <Link
              href="/leitos"
              className="group flex items-start gap-3 bg-[#0D0D0D] p-4 hover:bg-[#141414] transition-colors"
            >
              <div className="flex h-7 w-7 shrink-0 items-center justify-center bg-[#1A1A1A] text-[#777777] border border-[#333333] group-hover:bg-[#E61919] group-hover:text-white group-hover:border-[#E61919] transition-colors">
                <FaBed className="h-3.5 w-3.5" />
              </div>
              <div>
                <h4 className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  GERENCIAR LEITOS
                </h4>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  CADASTRAR E ADMINISTRAR LEITOS HOSPITALARES
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Right Column: Live System Activity */}
        <div className="bg-[#111111] p-6">
          <div className="border-b border-[#222222] pb-4 mb-4 flex items-center gap-2">
            <HiClock className="h-4 w-4 text-[#777777]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#EAEAEA]">
              [ ATIVIDADES RECENTES ]
            </span>
          </div>
          <div className="space-y-0">
            <div className="flex gap-3 items-start border-b border-[#1A1A1A] py-3">
              <div className="mt-1 h-1.5 w-1.5 bg-[#E61919] shrink-0" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  PACIENTE JOAO SILVA INTERNADO
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  LEITO 204 &middot; UTI GERAL &middot; HA 15 MIN
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start border-b border-[#1A1A1A] py-3">
              <div className="mt-1 h-1.5 w-1.5 bg-[#4AF626] shrink-0" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  CIRURGIA ORTOPEDICA FINALIZADA
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  DRA. MARIA SANTOS &middot; SALA 02 &middot; HA 42 MIN
                </p>
              </div>
            </div>

            <div className="flex gap-3 items-start py-3">
              <div className="mt-1 h-1.5 w-1.5 bg-[#777777] shrink-0" />
              <div>
                <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">
                  ALTA MEDICA CONCEDIDA
                </p>
                <p className="font-mono text-[9px] uppercase tracking-[0.06em] text-[#555555] mt-1">
                  PACIENTE ANA COSTA &middot; LEITO 108 &middot; HA 1 HORA
                </p>
              </div>
            </div>

            <div className="mt-4 border border-[#222222] bg-[#0D0D0D] p-3 flex items-center justify-between">
              <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.08em] text-[#777777]">
                <HiShieldCheck className="h-3.5 w-3.5 text-[#4AF626]" />
                BACKUP AUTOMATICO
              </span>
              <span className="font-mono text-[10px] font-bold text-[#555555]">
                08:00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
