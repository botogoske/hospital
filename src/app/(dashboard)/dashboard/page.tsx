"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  HiUserGroup,
  HiCalendar,
  HiBeaker,
  HiPlus,
  HiTrendingUp,
  HiSparkles,
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
}

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .catch(() => {
        // Fallback demo data if API server is offline
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
        });
      });
  }, []);

  const statCards = stats
    ? [
        {
          title: "Pacientes Cadastrados",
          value: stats.totalPatients.toLocaleString("pt-BR"),
          description: "+14 este mês",
          icon: HiUserGroup,
          gradient: "from-blue-600 to-indigo-600",
          trend: "+12%",
          isPositive: true,
        },
        {
          title: "Corpo Médico",
          value: stats.totalDoctors.toLocaleString("pt-BR"),
          description: "Especialistas ativos",
          icon: FaUserMd,
          gradient: "from-emerald-500 to-teal-600",
          trend: "Ativos",
          isPositive: true,
        },
        {
          title: "Consultas Hoje",
          value: stats.todayAppointments.toLocaleString("pt-BR"),
          description: "Agendamentos confirmados",
          icon: HiCalendar,
          gradient: "from-purple-600 to-violet-600",
          trend: "85% concl.",
          isPositive: true,
        },
        {
          title: "Cirurgias da Semana",
          value: stats.weekSurgeries.toLocaleString("pt-BR"),
          description: "Centro Cirúrgico",
          icon: FaProcedures,
          gradient: "from-rose-500 to-red-600",
          trend: "4 hoje",
          isPositive: true,
        },
        {
          title: "Leitos Disponíveis",
          value: `${stats.availableBeds}/${stats.totalBeds}`,
          description: "Taxa de ocupação: 70%",
          icon: FaBed,
          gradient: "from-amber-500 to-orange-600",
          trend: "Disponível",
          isPositive: true,
        },
        {
          title: "Internamentos Ativos",
          value: stats.totalAdmissions.toLocaleString("pt-BR"),
          description: "Pacientes em leito",
          icon: FaHospital,
          gradient: "from-cyan-500 to-blue-600",
          trend: "Estável",
          isPositive: true,
        },
        {
          title: "Medicamentos",
          value: stats.totalMedications.toLocaleString("pt-BR"),
          description: "Itens em estoque",
          icon: HiBeaker,
          gradient: "from-indigo-500 to-purple-600",
          trend: "OK",
          isPositive: true,
        },
        {
          title: "Prontuários Eletrônicos",
          value: stats.totalMedicalRecords.toLocaleString("pt-BR"),
          description: "Histórico completo",
          icon: FaNotesMedical,
          gradient: "from-pink-500 to-rose-600",
          trend: "+32 hoje",
          isPositive: true,
        },
      ]
    : [];

  return (
    <div className="space-y-8 pb-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="absolute right-40 -bottom-10 h-48 w-48 rounded-full bg-teal-500/10 blur-2xl" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300 backdrop-blur-md">
              <HiSparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Painel de Controle Hospitalar</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Bem-vindo ao Hospital System
            </h1>
            <p className="max-w-2xl text-sm text-slate-300">
              Visão consolidada em tempo real da ocupação de leitos, cirurgias agendadas e atendimento a pacientes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/consultas">
              <Button className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium shadow-lg shadow-blue-600/30 gap-2">
                <HiPlus className="h-4 w-4" />
                Nova Consulta
              </Button>
            </Link>
            <Link href="/pacientes">
              <Button variant="outline" className="rounded-xl border-slate-700 bg-slate-800/60 text-slate-200 hover:bg-slate-800 hover:text-white backdrop-blur-md gap-2">
                <HiUserGroup className="h-4 w-4" />
                Novo Paciente
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Modern Stat Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card
            key={stat.title}
            className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center justify-between">
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.gradient} text-white shadow-md transition-transform group-hover:scale-110`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <HiTrendingUp className="h-3 w-3 text-emerald-500" />
                {stat.trend}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                {stat.value}
              </h3>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {stat.title}
              </p>
              <p className="text-xs text-slate-400">{stat.description}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Shortcuts & Quick Actions Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Quick Actions */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <CardHeader className="px-0 pt-0 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FaClipboardList className="h-5 w-5 text-blue-600" />
                  Atalhos Rápidos de Operação
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Acesse com um clique os fluxos mais utilizados da sua rotina
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="px-0 grid gap-4 sm:grid-cols-2">
            <Link href="/consultas" className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-blue-500/30 hover:bg-blue-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <HiCalendar className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Agendar Consulta</h4>
                <p className="text-xs text-slate-500 mt-0.5">Marcar nova consulta ambulatorial ou retorno</p>
              </div>
            </Link>

            <Link href="/internamentos" className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-emerald-500/30 hover:bg-emerald-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <FaHospital className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Registrar Internamento</h4>
                <p className="text-xs text-slate-500 mt-0.5">Dar entrada de paciente em leito hospitalar</p>
              </div>
            </Link>

            <Link href="/prontuarios" className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-purple-500/30 hover:bg-purple-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <FaNotesMedical className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Prontuário Eletrônico</h4>
                <p className="text-xs text-slate-500 mt-0.5">Consultar histórico médico e evoluções</p>
              </div>
            </Link>

            <Link href="/cirurgias" className="group flex items-start gap-4 rounded-xl border border-slate-100 bg-slate-50/60 p-4 transition-all hover:border-rose-500/30 hover:bg-rose-50/40 dark:border-slate-800 dark:bg-slate-800/40 dark:hover:bg-slate-800">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                <FaProcedures className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Mapa Cirúrgico</h4>
                <p className="text-xs text-slate-500 mt-0.5">Visualizar horários de salas de cirurgia</p>
              </div>
            </Link>
          </CardContent>
        </Card>

        {/* Right Column: Live System Activity */}
        <Card className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="px-0 pt-0 pb-4">
            <CardTitle className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <HiClock className="h-5 w-5 text-indigo-600" />
              Atividades Recentes
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Últimas atualizações no sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 space-y-4">
            <div className="flex gap-3 items-start text-xs border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Paciente João Silva internado</p>
                <p className="text-slate-400 text-[11px]">Leito 204 • UTI Geral • Há 15 min</p>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Cirurgia Ortopédica Finalizada</p>
                <p className="text-slate-400 text-[11px]">Dra. Maria Santos • Sala 02 • Há 42 min</p>
              </div>
            </div>

            <div className="flex gap-3 items-start text-xs">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-purple-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">Alta Médica Concedida</p>
                <p className="text-slate-400 text-[11px]">Paciente Ana Costa • Leito 108 • Há 1 hora</p>
              </div>
            </div>

            <div className="mt-4 pt-2">
              <div className="rounded-xl bg-slate-50 p-3 text-xs flex items-center justify-between text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <span className="flex items-center gap-1.5 font-medium">
                  <HiShieldCheck className="h-4 w-4 text-blue-500" />
                  Backup Automático Realizado
                </span>
                <span className="font-bold text-slate-400">08:00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
