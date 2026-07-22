"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  HiUserGroup,
  HiCalendar,
  HiBeaker,
  HiCog,
} from "react-icons/hi";
import { FaUserMd, FaBed, FaProcedures, FaNotesMedical, FaHospital } from "react-icons/fa";

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
      .then(setStats);
  }, []);

  const statCards = stats
    ? [
        {
          title: "Pacientes",
          value: stats.totalPatients.toLocaleString("pt-BR"),
          description: "Cadastrados no sistema",
          icon: HiUserGroup,
          color: "bg-blue-500",
        },
        {
          title: "Médicos",
          value: stats.totalDoctors.toLocaleString("pt-BR"),
          description: "Ativos no hospital",
          icon: FaUserMd,
          color: "bg-green-500",
        },
        {
          title: "Consultas Hoje",
          value: stats.todayAppointments.toLocaleString("pt-BR"),
          description: "Agendadas para hoje",
          icon: HiCalendar,
          color: "bg-purple-500",
        },
        {
          title: "Cirurgias",
          value: stats.weekSurgeries.toLocaleString("pt-BR"),
          description: "Agendadas esta semana",
          icon: FaProcedures,
          color: "bg-red-500",
        },
        {
          title: "Leitos Disponíveis",
          value: `${stats.availableBeds}/${stats.totalBeds}`,
          description: "Disponíveis de total",
          icon: FaBed,
          color: "bg-yellow-500",
        },
        {
          title: "Internamentos",
          value: stats.totalAdmissions.toLocaleString("pt-BR"),
          description: "Ativos no momento",
          icon: FaHospital,
          color: "bg-orange-500",
        },
        {
          title: "Medicamentos",
          value: stats.totalMedications.toLocaleString("pt-BR"),
          description: "Cadastrados",
          icon: HiBeaker,
          color: "bg-indigo-500",
        },
        {
          title: "Prontuários",
          value: stats.totalMedicalRecords.toLocaleString("pt-BR"),
          description: "Registrados",
          icon: FaNotesMedical,
          color: "bg-pink-500",
        },
        {
          title: "Funcionários",
          value: stats.totalEmployees.toLocaleString("pt-BR"),
          description: "Ativos no hospital",
          icon: HiCog,
          color: "bg-teal-500",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">
          Visão geral do sistema de gestão hospitalar
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">
                {stat.title}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <CardDescription>{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
