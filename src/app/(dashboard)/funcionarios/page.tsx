"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/lib/validations";
import { toUpper } from "@/lib/utils";
import { maskCpf, maskPhone, maskCep } from "@/lib/masks";
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
  HiUsers,
  HiDocumentDownload,
} from "react-icons/hi";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";

interface Employee {
  id: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;
  address: string;
  cep: string;
  position: string;
  salary: number;
  admissionDate: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<EmployeeInput>({ resolver: zodResolver(employeeSchema) });

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

  useEffect(() => {
    fetchEmployees();
  }, []);
  const fetchEmployees = async () => {
    const res = await fetch("/api/employees");
    if (res.ok) setEmployees(await res.json());
  };

  const onSubmit = async (data: EmployeeInput) => {
    setLoading(true);
    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : "/api/employees";
      const method = editingEmployee ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toUpper(data)),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setEditingEmployee(null);
        fetchEmployees();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setValue("name", employee.name);
    setValue("cpf", employee.cpf);
    setValue("phone", employee.phone);
    setValue("email", employee.email);
    setValue("address", employee.address);
    setValue("cep", employee.cep);
    setValue("position", employee.position);
    setValue("salary", employee.salary);
    setValue("admissionDate", employee.admissionDate.split("T")[0]);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionario?")) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) fetchEmployees();
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.text("RELATORIO DE FUNCIONARIOS", 14, 15);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(
      `GERADO EM: ${new Date().toLocaleDateString("pt-BR")} | TOTAL: ${employees.length} FUNCIONARIO(S)`,
      14,
      22,
    );
    autoTable(doc, {
      startY: 28,
      head: [["NOME", "CPF", "CARGO", "SALARIO", "ADMISSAO"]],
      body: employees.map((e) => [
        e.name,
        e.cpf,
        e.position,
        e.salary.toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        }),
        new Date(e.admissionDate).toLocaleDateString("pt-BR"),
      ]),
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [230, 25, 25], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });
    doc.save(`funcionarios_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <HiUsers className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>FUNCIONARIOS</h1>
              <p className={formStyles.header.subtitle}>
                GERENCIE OS FUNCIONARIOS DO HOSPITAL
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
                  setEditingEmployee(null);
                }
              }}
            >
              <DialogTrigger render={<Button />}>
                <span className={formStyles.button.trigger}>
                  <HiPlus className="h-3.5 w-3.5" /> NOVO FUNCIONARIO
                </span>
              </DialogTrigger>
              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingEmployee
                      ? "[ EDITAR ] FUNCIONARIO"
                      : "[ NOVO ] CADASTRAR FUNCIONARIO"}
                  </DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="p-6 space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="col-span-2 space-y-1.5">
                      <Label className={formStyles.field.label}>
                        &gt; NOME
                      </Label>
                      <Input
                        {...register("name")}
                        className={`${formStyles.field.input} h-11`}
                      />
                      {errors.name && (
                        <p className={formStyles.field.error}>
                          {errors.name.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
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
                    <div className="space-y-1.5">
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
                        &gt; ENDERECO
                      </Label>
                      <Input
                        {...register("address")}
                        className={`${formStyles.field.input} h-11`}
                      />
                      {errors.address && (
                        <p className={formStyles.field.error}>
                          {errors.address.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={formStyles.field.label}>&gt; CEP</Label>
                      <Input
                        {...register("cep")}
                        onChange={handleCepChange}
                        maxLength={9}
                        placeholder="00000-000"
                        className={formStyles.field.input}
                      />
                      {errors.cep && (
                        <p className={formStyles.field.error}>
                          {errors.cep.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
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
                        &gt; CARGO
                      </Label>
                      <Input
                        {...register("position")}
                        className={`${formStyles.field.input} h-11`}
                      />
                      {errors.position && (
                        <p className={formStyles.field.error}>
                          {errors.position.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={formStyles.field.label}>
                        &gt; SALARIO
                      </Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("salary", { valueAsNumber: true })}
                        className={formStyles.field.input}
                      />
                      {errors.salary && (
                        <p className={formStyles.field.error}>
                          {errors.salary.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <Label className={formStyles.field.label}>
                        &gt; DATA DE ADMISSAO
                      </Label>
                      <Input
                        type="date"
                        {...register("admissionDate")}
                        className={formStyles.field.input}
                      />
                      {errors.admissionDate && (
                        <p className={formStyles.field.error}>
                          {errors.admissionDate.message}
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
                      : editingEmployee
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
            [ LISTA DE FUNCIONARIOS ]
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
                  CPF
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  CARGO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  SALARIO
                </TableHead>
                <TableHead className={formStyles.table.headerCell}>
                  ADMISSAO
                </TableHead>
                <TableHead
                  className={`${formStyles.table.headerCell} text-right`}
                >
                  ACOES
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} className={formStyles.table.bodyRow}>
                  <TableCell className={`${formStyles.table.cell} uppercase`}>
                    {e.name}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {e.cpf}
                  </TableCell>
                  <TableCell className={formStyles.table.cellMuted}>
                    {e.position}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {e.salary.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell className={formStyles.table.cell}>
                    {new Date(e.admissionDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button
                        className={formStyles.button.edit}
                        onClick={() => handleEdit(e)}
                      >
                        <HiPencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        className={formStyles.button.delete}
                        onClick={() => handleDelete(e.id)}
                      >
                        <HiTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className={formStyles.table.emptyState}
                  >
                    NENHUM FUNCIONARIO CADASTRADO
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
