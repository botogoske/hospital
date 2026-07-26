"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { specialtySchema, type SpecialtyInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
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
import { HiPlus, HiPencil, HiTrash, HiDocumentDownload } from "react-icons/hi";
import { FaStethoscope } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";

interface Specialty {
  id: string;
  name: string;
  description?: string;
  _count: { doctors: number };
}

export default function SpecialtiesPage() {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SpecialtyInput>({ resolver: zodResolver(specialtySchema) });

  useEffect(() => {
    fetchSpecialties();
  }, []);
  const fetchSpecialties = async () => {
    const res = await fetch("/api/specialties");
    if (res.ok) setSpecialties(await res.json());
  };

  const onSubmit = async (data: SpecialtyInput) => {
    setLoading(true);
    try {
      const url = editingSpecialty
        ? `/api/specialties/${editingSpecialty.id}`
        : "/api/specialties";
      const method = editingSpecialty ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toUpper(data)),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setEditingSpecialty(null);
        fetchSpecialties();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (specialty: Specialty) => {
    setEditingSpecialty(specialty);
    setValue("name", specialty.name);
    setValue("description", specialty.description || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir esta especialidade?")) return;
    const res = await fetch(`/api/specialties/${id}`, { method: "DELETE" });
    if (res.ok) fetchSpecialties();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE ESPECIALIDADES", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${specialties.length} ESPECIALIDADE(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "DESCRICAO", "MEDICOS"]],
      body: specialties.map((s) => [
        s.name,
        s.description || "—",
        s._count.doctors,
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`especialidades_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <FaStethoscope className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>ESPECIALIDADES</h1>
              <p className={formStyles.header.subtitle}>
                GERENCIE AS ESPECIALIDADES MEDICAS
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
                  setEditingSpecialty(null);
                }
              }}
            >
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" /> NOVA ESPECIALIDADE
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingSpecialty
                      ? "[ EDITAR ] ESPECIALIDADE"
                      : "[ NOVO ] CADASTRAR ESPECIALIDADE"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>&gt; NOME</Label>
                    <Input
                      {...register("name")}
                      placeholder="EX: CARDIOLOGIA"
                      className={formStyles.field.input}
                    />
                    {errors.name && (
                      <p className={formStyles.field.error}>
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>
                      &gt; DESCRICAO
                    </Label>
                    <Input
                      {...register("description")}
                      placeholder="OPCIONAL"
                      className={formStyles.field.input}
                    />
                  </div>
                  <Button
                    type="submit"
                    className={formStyles.button.primary}
                    disabled={loading}
                  >
                    {loading
                      ? "[ SALVANDO... ]"
                      : editingSpecialty
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
          <span className={formStyles.section.title}>
            [ LISTA DE ESPECIALIDADES ]
          </span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className={formStyles.table.headerRow}>
                <TableHead className={formStyles.table.headerCell}>
                  NOME
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  DESCRICAO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  MEDICOS
                </TableHead>
                <TableHead
                  className={`${formStyles.table.headerCell} text-right`}
                >
                  ACOES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {specialties.map((s) => (
                <TableRow key={s.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {s.name}
                  </TableCell>
                  <TableCell className={formStyles.table.cellMuted}>
                    {s.description || "—"}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {s._count.doctors}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className={formStyles.button.edit}
                        onClick={() => handleEdit(s)}
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={formStyles.button.delete}
                        onClick={() => handleDelete(s.id)}
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {specialties.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className={formStyles.table.emptyState}
                  >
                    NENHUMA ESPECIALIDADE CADASTRADA
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
