"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { patientSchema, type PatientInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { maskCpf, maskPhone, maskCep, maskRg } from "@/lib/masks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { HiPlus, HiPencil, HiTrash, HiSearch, HiUserGroup } from "react-icons/hi";

interface Patient {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email?: string;
  rg: string;
  address: string;
  cep: string;
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

  const handleCpfChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cpf", maskCpf(e.target.value), { shouldValidate: true });
  }, [setValue]);

  const handlePhoneChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("phone", maskPhone(e.target.value), { shouldValidate: true });
  }, [setValue]);

  const handleCepChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("cep", maskCep(e.target.value), { shouldValidate: true });
  }, [setValue]);

  const handleRgChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValue("rg", maskRg(e.target.value), { shouldValidate: true });
  }, [setValue]);

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
        body: JSON.stringify(toUpper(data)),
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
    setValue("cep", patient.cep);
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
      {/* Page Title */}
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white">
              <HiUserGroup className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">
                GESTAO DE PACIENTES
              </h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">
                CADASTRE, EDITE E CONSULTE AS INFORMACOES MEDICAS DOS PACIENTES
              </p>
            </div>
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
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515] transition-colors">
                <HiPlus className="h-3.5 w-3.5" />
                NOVO PACIENTE
              </span>
            </DialogTrigger>

            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">
                  {editingPatient ? "[ EDITAR ] CADASTRO DO PACIENTE" : "[ NOVO ] CADASTRAR PACIENTE"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME COMPLETO</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("name")} />
                    {errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CPF</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("cpf")} onChange={handleCpfChange} maxLength={14} placeholder="000.000.000-00" />
                    {errors.cpf && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.cpf.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; RG</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("rg")} onChange={handleRgChange} maxLength={12} placeholder="XX.XXX.XXX-X" />
                    {errors.rg && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.rg.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TELEFONE / WHATSAPP</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("phone")} onChange={handlePhoneChange} maxLength={15} placeholder="(00) 00000-0000" />
                    {errors.phone && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.phone.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; EMAIL</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" type="email" {...register("email")} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DATA DE NASCIMENTO</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" type="date" {...register("birthDate")} />
                    {errors.birthDate && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.birthDate.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TIPO SANGUINEO</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("bloodType")} placeholder="A+, O-, B+, etc" />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ENDERECO RESIDENCIAL</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("address")} />
                    {errors.address && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.address.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CEP</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("cep")} onChange={handleCepChange} maxLength={9} placeholder="00000-000" />
                    {errors.cep && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.cep.message}</p>}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ALERGIAS / OBSERVACOES</Label>
                    <Input className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" {...register("allergies")} placeholder="EX: ALERGIA A PENICILINA" />
                  </div>
                </div>

                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>
                  {loading ? "[ SALVANDO REGISTRO... ]" : editingPatient ? "[ ATUALIZAR PACIENTE ]" : "[ CADASTRAR PACIENTE ]"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Table */}
      <div className="border border-[#222222] bg-[#111111]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#222222] px-6 py-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">
            [ LISTA DE PACIENTES REGISTRADOS ] ({filteredPatients.length})
          </span>
          <div className="relative w-full md:w-72">
            <HiSearch className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#555555]" />
            <input
              type="text"
              placeholder="FILTRAR POR NOME, CPF OU FONE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-[#222222] bg-[#0D0D0D] py-1.5 pl-9 pr-3 font-mono text-[10px] uppercase tracking-wider text-[#EAEAEA] placeholder:text-[#444444] focus:border-[#E61919] focus:outline-none rounded-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">PACIENTE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CPF</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TELEFONE</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CEP</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">TIPO SANGUINEO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NASCIMENTO</TableHead>
                <TableHead className="text-right font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ACOES</TableHead>
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
                  <TableRow key={p.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-[#1A1A1A] border border-[#333333] font-mono text-[10px] font-bold text-[#777777]">
                          {initials}
                        </div>
                        <div>
                          <p className="font-mono text-[11px] uppercase tracking-wider text-[#EAEAEA]">{p.name}</p>
                          {p.email && <p className="font-mono text-[9px] uppercase text-[#444444]">{p.email}</p>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{p.cpf}</TableCell>
                    <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{p.phone}</TableCell>
                    <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{p.cep}</TableCell>
                    <TableCell>
                      {p.bloodType ? (
                        <span className="inline-flex items-center gap-1 border border-[#E61919]/30 bg-[#E61919]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#E61919]">
                          {p.bloodType}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-[#444444]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-[11px] text-[#EAEAEA]">
                      {new Date(p.birthDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(p)}>
                          <HiPencil className="h-3.5 w-3.5" />
                        </button>
                        <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(p.id)}>
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">
                    NENHUM PACIENTE ENCONTRADO.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
