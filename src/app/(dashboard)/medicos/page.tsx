"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { doctorSchema, type DoctorInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { maskCpf, maskPhone } from "@/lib/masks";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiDocumentDownload } from "react-icons/hi";
import { FaUserMd } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Doctor {
  id: string;
  name: string;
  cpf: string;
  crm: string;
  phone: string;
  email: string;
  specialtyId: string;
  specialty: { id: string; name: string };
}
interface Specialty {
  id: string;
  name: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<DoctorInput>({ resolver: zodResolver(doctorSchema) });

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

  useEffect(() => {
    fetchDoctors();
    fetchSpecialties();
  }, []);

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };
  const fetchSpecialties = async () => {
    const res = await fetch("/api/specialties");
    if (res.ok) setSpecialties(await res.json());
  };

  const onSubmit = async (data: DoctorInput) => {
    setLoading(true);
    try {
      const url = editingDoctor
        ? `/api/doctors/${editingDoctor.id}`
        : "/api/doctors";
      const method = editingDoctor ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toUpper(data)),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setSelectedSpecialty("");
        setEditingDoctor(null);
        fetchDoctors();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setSelectedSpecialty(doctor.specialtyId);
    setValue("name", doctor.name);
    setValue("cpf", doctor.cpf);
    setValue("crm", doctor.crm);
    setValue("phone", doctor.phone);
    setValue("email", doctor.email);
    setValue("specialtyId", doctor.specialtyId);
    setOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    const res = await fetch(`/api/doctors/${deleteTargetId}`, { method: "DELETE" });
    if (res.ok) fetchDoctors();
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE MEDICOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${doctors.length} MEDICO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "CPF", "CRM", "TELEFONE", "EMAIL", "ESPECIALIDADE"]],
      body: doctors.map((d) => [
        d.name,
        d.cpf,
        d.crm,
        d.phone,
        d.email,
        d.specialty.name,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`medicos_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <FaUserMd className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>MEDICOS</h1>
              <p className={formStyles.header.subtitle}>
                GERENCIE OS MEDICOS DO HOSPITAL
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={exportPdf} className={formStyles.button.export}>
              <HiDocumentDownload className="h-3.5 w-3.5" /> EXPORTAR PDF
            </button>
            <Dialog
              open={open}
              onOpenChange={(v) => {
                setOpen(v);
                if (!v) {
                  reset();
                  setSelectedSpecialty("");
                  setEditingDoctor(null);
                }
              }}
            >
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" /> NOVO MEDICO
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingDoctor
                      ? "[ EDITAR ] MEDICO"
                      : "[ NOVO ] CADASTRAR MEDICO"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>
                        &gt; NOME
                      </Label>
                      <Input
                        {...register("name")}
                        className={formStyles.field.input}
                      />
                      {errors.name && (
                        <p className={formStyles.field.error}>
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>&gt; CPF</Label>
                      <Input
                        {...register("cpf")}
                        onChange={handleCpfChange}
                        maxLength={14}
                        placeholder="000.000.000-00"
                        className={formStyles.field.input}
                      />
                      {errors.cpf && (
                        <p className={formStyles.field.error}>
                          {errors.cpf.message}
                        </p>
                      )}
                    </div>
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>&gt; CRM</Label>
                      <Input
                        {...register("crm")}
                        placeholder="CRM-00000"
                        className={formStyles.field.input}
                      />
                      {errors.crm && (
                        <p className={formStyles.field.error}>
                          {errors.crm.message}
                        </p>
                      )}
                    </div>
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>
                        &gt; TELEFONE
                      </Label>
                      <Input
                        {...register("phone")}
                        onChange={handlePhoneChange}
                        maxLength={15}
                        placeholder="(00) 00000-0000"
                        className={formStyles.field.input}
                      />
                      {errors.phone && (
                        <p className={formStyles.field.error}>
                          {errors.phone.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className={formStyles.field.label}>
                        &gt; EMAIL
                      </Label>
                      <Input
                        type="email"
                        {...register("email")}
                        className={formStyles.field.input}
                      />
                      {errors.email && (
                        <p className={formStyles.field.error}>
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <Label className={formStyles.field.label}>
                        &gt; ESPECIALIDADE
                      </Label>
                      <Select
                        value={selectedSpecialty}
                        onValueChange={(value) => {
                          if (!value) return;
                          setSelectedSpecialty(value);
                          setValue("specialtyId", value);
                        }}
                        items={specialties.map((s) => ({
                          value: s.id,
                          label: s.name,
                        }))}
                      >
                        <SelectTrigger className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919]">
                          <SelectValue placeholder="SELECIONE..." />
                        </SelectTrigger>
                        <SelectContent className="rounded-none border-[#333333] bg-[#111111]">
                          {specialties.map((s) => (
                            <SelectItem
                              key={s.id}
                              value={s.id}
                              className="font-mono text-xs"
                            >
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.specialtyId && (
                        <p className={formStyles.field.error}>
                          {errors.specialtyId.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className={formStyles.button.primary}
                    disabled={loading}
                  >
                    {loading
                      ? "[ SALVANDO... ]"
                      : editingDoctor
                        ? "[ ATUALIZAR ]"
                        : "[ CADASTRAR ]"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <span className={formStyles.section.title}>[ LISTA DE MEDICOS ]</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>
                  NOME
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  CRM
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  TELEFONE
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  ESPECIALIDADE
                </TableHead>
                <TableHead
                  className={`${formStyles.table.headerCell} text-right`}
                >
                  ACOES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {doctors.map((d) => (
                <TableRow key={d.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {d.name}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {d.crm}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {d.phone}
                  </TableCell>
                  <TableCell className={formStyles.table.cellMuted}>
                    {d.specialty.name}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className={formStyles.button.edit}
                        onClick={() => handleEdit(d)}
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={formStyles.button.delete}
                        onClick={() => { setDeleteTargetId(d.id); setDeleteConfirmOpen(true); }}
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {doctors.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className={formStyles.table.emptyState}
                  >
                    NENHUM MEDICO CADASTRADO
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="EXCLUIR MEDICO"
        description="Tem certeza que deseja excluir este medico? Esta ação não pode ser desfeita."
        onConfirm={handleDelete}
      />
    </div>
  );
}
