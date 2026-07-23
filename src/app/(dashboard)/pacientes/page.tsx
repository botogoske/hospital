"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiSearch, HiUserGroup, HiHeart } from "react-icons/hi";

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  rg: string;
  address: string;
  birthDate: string;
  bloodType?: string;
  allergies?: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PatientInput>({
    resolver: zodResolver(patientSchema),
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const onSubmit = async (data: PatientInput) => {
    setLoading(true);
    try {
      const url = editingPatient
        ? `/api/patients/${editingPatient.id}`
        : "/api/patients";
      const method = editingPatient ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setEditingPatient(null);
        fetchPatients();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setValue("name", patient.name);
    setValue("cpf", patient.cpf);
    setValue("rg", patient.rg);
    setValue("phone", patient.phone);
    setValue("email", patient.email || "");
    setValue("address", patient.address);
    setValue("birthDate", patient.birthDate.split("T")[0]);
    setValue("bloodType", patient.bloodType || "");
    setValue("allergies", patient.allergies || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este paciente?")) return;
    const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
    if (res.ok) fetchPatients();
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.cpf.includes(searchTerm) ||
      p.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Top Title & Primary Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <HiUserGroup className="h-7 w-7 text-blue-600" />
            Gestão de Pacientes
          </h1>
          <p className="text-sm text-slate-500">
            Cadastre, edite e consulte as informações médicas dos pacientes.
          </p>
        </div>

        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              reset();
              setEditingPatient(null);
            }
          }}
        >
          <DialogTrigger render={<Button />}>
            <span className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-blue-600/30 transition-all hover:bg-blue-500">
              <HiPlus className="h-4 w-4" />
              Novo Paciente
            </span>
          </DialogTrigger>

          <DialogContent className="max-h-[90vh] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPatient ? "Editar Cadastral do Paciente" : "Cadastrar Novo Paciente"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nome Completo</Label>
                  <Input className="rounded-xl" {...register("name")} />
                  {errors.name && (
                    <p className="text-xs text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">CPF</Label>
                  <Input className="rounded-xl" {...register("cpf")} placeholder="000.000.000-00" />
                  {errors.cpf && (
                    <p className="text-xs text-red-500">{errors.cpf.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">RG</Label>
                  <Input className="rounded-xl" {...register("rg")} />
                  {errors.rg && (
                    <p className="text-xs text-red-500">{errors.rg.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Telefone / WhatsApp</Label>
                  <Input className="rounded-xl" {...register("phone")} placeholder="(00) 00000-0000" />
                  {errors.phone && (
                    <p className="text-xs text-red-500">{errors.phone.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</Label>
                  <Input className="rounded-xl" type="email" {...register("email")} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Data de Nascimento</Label>
                  <Input className="rounded-xl" type="date" {...register("birthDate")} />
                  {errors.birthDate && (
                    <p className="text-xs text-red-500">{errors.birthDate.message}</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tipo Sanguíneo</Label>
                  <Input className="rounded-xl" {...register("bloodType")} placeholder="A+, O-, B+, etc" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Endereço Residencial</Label>
                  <Input className="rounded-xl" {...register("address")} />
                  {errors.address && (
                    <p className="text-xs text-red-500">{errors.address.message}</p>
                  )}
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Alergias / Observações</Label>
                  <Input className="rounded-xl" {...register("allergies")} placeholder="Ex: Alergia à Penicilina" />
                </div>
              </div>

              <Button type="submit" className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-500 mt-4 h-10 font-semibold" disabled={loading}>
                {loading ? "Salvando Registro..." : editingPatient ? "Atualizar Paciente" : "Cadastrar Paciente"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Card with Search */}
      <Card className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4">
          <CardTitle className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            Lista de Pacientes Registrados ({filteredPatients.length})
          </CardTitle>
          <div className="relative w-full md:w-72">
            <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filtrar por nome, CPF ou fone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-xs text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-800/40">
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Paciente</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">CPF</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Telefone</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tipo Sanguíneo</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nascimento</TableHead>
                  <TableHead className="text-right text-xs font-semibold text-slate-600 dark:text-slate-400">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((p) => {
                  const initials = p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("");
                  return (
                    <TableRow key={p.id} className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-900 dark:text-slate-100 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                            {initials}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm">{p.name}</p>
                            {p.email && <p className="text-[11px] text-slate-400">{p.email}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300 font-mono">{p.cpf}</TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">{p.phone}</TableCell>
                      <TableCell>
                        {p.bloodType ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/60">
                            <HiHeart className="h-3 w-3" />
                            {p.bloodType}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600 dark:text-slate-300">
                        {new Date(p.birthDate).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon-sm" className="rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800" onClick={() => handleEdit(p)}>
                            <HiPencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon-sm" className="rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40" onClick={() => handleDelete(p.id)}>
                            <HiTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredPatients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-slate-400">
                      Nenhum paciente encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
