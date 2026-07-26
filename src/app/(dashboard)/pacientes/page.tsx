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
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiSearch,
  HiUserGroup,
  HiDocumentDownload,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";

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

  const handleCpfChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("cpf", maskCpf(e.target.value), { shouldValidate: true });
    },
    [setValue],
  );

  const handlePhoneChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("phone", maskPhone(e.target.value), { shouldValidate: true });
    },
    [setValue],
  );

  const handleCepChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("cep", maskCep(e.target.value), { shouldValidate: true });
    },
    [setValue],
  );

  const handleRgChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setValue("rg", maskRg(e.target.value), { shouldValidate: true });
    },
    [setValue],
  );

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
      p.phone.includes(searchTerm),
  );

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE PACIENTES", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${filteredPatients.length} PACIENTE(S)`,
      14,
      22,
    );

    autoTable(doc, {
      startY: 28,
      head: [
        [
          "NOME",
          "CPF",
          "RG",
          "TELEFONE",
          "EMAIL",
          "TIPO SANG.",
          "NASCIMENTO",
          "CEP",
          "ENDERECO",
        ],
      ],
      body: filteredPatients.map((p) => [
        p.name,
        p.cpf,
        p.rg,
        p.phone,
        p.email || "—",
        p.bloodType || "—",
        new Date(p.birthDate).toLocaleDateString("pt-BR"),
        p.cep,
        p.address,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`pacientes_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Page Title */}
      <div className={formStyles.header.container}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <HiUserGroup className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>
                GESTAO DE PACIENTES
              </h1>
              <p className={formStyles.header.subtitle}>
                CADASTRE, EDITE E CONSULTE AS INFORMACOES MEDICAS DOS PACIENTES
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={exportPdf}
              className={formStyles.button.export}
            >
              <HiDocumentDownload className="h-3.5 w-3.5" />
              EXPORTAR PDF
            </button>
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
              <span className={formStyles.button.trigger}>
                <HiPlus className="h-3.5 w-3.5" />
                NOVO PACIENTE
              </span>
            </DialogTrigger>

            <DialogContent className={formStyles.dialog.content}>
              <DialogHeader className={formStyles.dialog.header}>
                <DialogTitle className={formStyles.dialog.title}>
                  {editingPatient
                    ? "[ EDITAR ] CADASTRO DO PACIENTE"
                    : "[ NOVO ] CADASTRAR PACIENTE"}
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-4">
                  {/* NOME - linha inteira */}
                  <div className="col-span-4 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; NOME COMPLETO
                    </Label>
                    <Input
                      className={`${formStyles.field.input} h-10`}
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className={formStyles.field.error}>
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  {/* CPF + RG - mesma linha */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; CPF
                    </Label>
                    <Input
                      className={formStyles.field.input}
                      {...register("cpf")}
                      onChange={handleCpfChange}
                      maxLength={14}
                      placeholder="000.000.000-00"
                    />
                    {errors.cpf && (
                      <p className={formStyles.field.error}>
                        {errors.cpf.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; RG
                    </Label>
                    <Input
                      className={formStyles.field.input}
                      {...register("rg")}
                      onChange={handleRgChange}
                      maxLength={12}
                      placeholder="XX.XXX.XXX-X"
                    />
                    {errors.rg && (
                      <p className={formStyles.field.error}>
                        {errors.rg.message}
                      </p>
                    )}
                  </div>

                  {/* TELEFONE */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; TELEFONE / WHATSAPP
                    </Label>
                    <Input
                      className={`${formStyles.field.input} h-10`}
                      {...register("phone")}
                      onChange={handlePhoneChange}
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                    />
                    {errors.phone && (
                      <p className={formStyles.field.error}>
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  {/* DATA NASCIMENTO */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; DATA DE NASCIMENTO
                    </Label>
                    <Input
                      className={`${formStyles.field.input} h-10`}
                      type="date"
                      {...register("birthDate")}
                    />
                    {errors.birthDate && (
                      <p className={formStyles.field.error}>
                        {errors.birthDate.message}
                      </p>
                    )}
                  </div>

                  {/* EMAIL - linha inteira */}
                  <div className="col-span-4 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; EMAIL
                    </Label>
                    <Input
                      className={`${formStyles.field.input} h-10`}
                      type="email"
                      {...register("email")}
                    />
                  </div>

                  {/* TIPO SANGUINEO + CEP mesma linha */}
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; TIPO SANGUINEO
                    </Label>
                    <Input
                      className={formStyles.field.input}
                      {...register("bloodType")}
                      placeholder="A+, O-, B+"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; CEP
                    </Label>
                    <Input
                      className={formStyles.field.input}
                      {...register("cep")}
                      onChange={handleCepChange}
                      maxLength={9}
                      placeholder="00000-000"
                    />
                    {errors.cep && (
                      <p className={formStyles.field.error}>
                        {errors.cep.message}
                      </p>
                    )}
                  </div>
                  <div className="col-span-4 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; ENDERECO RESIDENCIAL
                    </Label>
                    <Input
                      className={`${formStyles.field.input} h-10`}
                      {...register("address")}
                    />
                    {errors.address && (
                      <p className={formStyles.field.error}>
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  {/* ALERGIAS - linha inteira */}
                  <div className="col-span-4 space-y-1.5">
                    <Label className={formStyles.field.label}>
                      &gt; ALERGIAS / OBSERVACOES
                    </Label>
                    <Input
                      className={formStyles.field.input}
                      {...register("allergies")}
                      placeholder="EX: ALERGIA A PENICILINA"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className={formStyles.button.primary}
                  disabled={loading}
                >
                  {loading
                    ? "[ SALVANDO REGISTRO... ]"
                    : editingPatient
                      ? "[ ATUALIZAR PACIENTE ]"
                      : "[ CADASTRAR PACIENTE ]"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={formStyles.section.container}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-[#222222] px-6 py-4">
          <span className={formStyles.section.title}>
            [ LISTA DE PACIENTES REGISTRADOS ] ({filteredPatients.length})
          </span>
          <div className="relative w-full md:w-72">
            <HiSearch className={formStyles.search.icon} />
            <input
              type="text"
              placeholder="FILTRAR POR NOME, CPF OU FONE..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={formStyles.search.input}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>
                  PACIENTE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  CPF
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  TELEFONE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  CEP
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  TIPO SANGUINEO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  NASCIMENTO
                </TableHead>
                <TableHead className={`${formStyles.table.headerCell} text-right`}>
                  ACOES
                </TableHead>
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
                  <TableRow
                    key={p.id}
                    className={formStyles.table.bodyRow}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center bg-[#1A1A1A] border border-[#333333] font-mono text-[10px] font-bold text-[#777777]">
                          {initials}
                        </div>
                        <div>
                          <p className={`${formStyles.table.cell} uppercase tracking-wider`}>
                            {p.name}
                          </p>
                          {p.email && (
                            <p className="font-mono text-[9px] uppercase text-[#444444]">
                              {p.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {p.cpf}
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {p.phone}
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {p.cep}
                    </TableCell>
                    <TableCell>
                      {p.bloodType ? (
                        <span className="inline-flex items-center gap-1 border border-[#E61919]/30 bg-[#E61919]/10 px-2 py-0.5 font-mono text-[10px] font-bold uppercase text-[#E61919]">
                          {p.bloodType}
                        </span>
                      ) : (
                        <span className="font-mono text-[10px] text-[#444444]">
                          —
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {new Date(p.birthDate).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          className={formStyles.button.edit}
                          onClick={() => handleEdit(p)}
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          className={formStyles.button.delete}
                          onClick={() => handleDelete(p.id)}
                        >
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filteredPatients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className={formStyles.table.emptyState}
                  >
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
