"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { employeeSchema, type EmployeeInput } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HiPlus, HiPencil, HiTrash, HiUsers } from "react-icons/hi";

interface Employee { id: string; name: string; cpf: string; phone: string; email: string; address: string; position: string; salary: number; admissionDate: string; }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EmployeeInput>({ resolver: zodResolver(employeeSchema) });

  useEffect(() => { fetchEmployees(); }, []);
  const fetchEmployees = async () => { const res = await fetch("/api/employees"); if (res.ok) setEmployees(await res.json()); };

  const onSubmit = async (data: EmployeeInput) => {
    setLoading(true);
    try {
      const url = editingEmployee ? `/api/employees/${editingEmployee.id}` : "/api/employees";
      const method = editingEmployee ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      if (res.ok) { setOpen(false); reset(); setEditingEmployee(null); fetchEmployees(); }
    } finally { setLoading(false); }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setValue("name", employee.name); setValue("cpf", employee.cpf); setValue("phone", employee.phone);
    setValue("email", employee.email); setValue("address", employee.address); setValue("position", employee.position);
    setValue("salary", employee.salary); setValue("admissionDate", employee.admissionDate.split("T")[0]);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este funcionario?")) return;
    const res = await fetch(`/api/employees/${id}`, { method: "DELETE" });
    if (res.ok) fetchEmployees();
  };

  return (
    <div className="space-y-6">
      <div className="border border-[#222222] bg-[#111111] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center bg-[#E61919] text-white"><HiUsers className="h-5 w-5" /></div>
            <div>
              <h1 className="text-3xl font-black uppercase tracking-[-0.05em] text-[#EAEAEA] leading-none">FUNCIONARIOS</h1>
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555555] mt-1">GERENCIE OS FUNCIONARIOS DO HOSPITAL</p>
            </div>
          </div>
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditingEmployee(null); } }}>
            <DialogTrigger render={<Button />}>
              <span className="flex items-center gap-2 border border-[#E61919] bg-[#E61919] px-3 py-2 font-mono text-[10px] uppercase tracking-[0.08em] text-white hover:bg-[#CC1515]"><HiPlus className="h-3.5 w-3.5" /> NOVO FUNCIONARIO</span>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto border border-[#333333] bg-[#111111] p-0 rounded-none shadow-none">
              <DialogHeader className="border-b border-[#222222] px-6 py-4">
                <DialogTitle className="font-mono text-sm uppercase tracking-[0.1em] text-[#EAEAEA]">{editingEmployee ? "[ EDITAR ] FUNCIONARIO" : "[ NOVO ] CADASTRAR FUNCIONARIO"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; NOME</Label><Input {...register("name")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.name && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.name.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CPF</Label><Input {...register("cpf")} placeholder="000.000.000-00" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.cpf && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.cpf.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; TELEFONE</Label><Input {...register("phone")} placeholder="(00) 00000-0000" className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.phone && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.phone.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; EMAIL</Label><Input type="email" {...register("email")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.email && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.email.message}</p>}</div>
                  <div className="col-span-2 space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; ENDERECO</Label><Input {...register("address")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.address && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.address.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; CARGO</Label><Input {...register("position")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.position && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.position.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; SALARIO</Label><Input type="number" step="0.01" {...register("salary", { valueAsNumber: true })} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.salary && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.salary.message}</p>}</div>
                  <div className="space-y-1.5"><Label className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#777777]">&gt; DATA DE ADMISSAO</Label><Input type="date" {...register("admissionDate")} className="rounded-none border-[#333333] bg-[#0D0D0D] font-mono text-xs text-[#EAEAEA] focus:border-[#E61919] focus:ring-0" />{errors.admissionDate && <p className="font-mono text-[10px] uppercase text-[#E61919]">{errors.admissionDate.message}</p>}</div>
                </div>
                <Button type="submit" className="w-full rounded-none bg-[#E61919] text-white font-mono text-[11px] uppercase tracking-[0.08em] hover:bg-[#CC1515] h-10" disabled={loading}>{loading ? "[ SALVANDO... ]" : editingEmployee ? "[ ATUALIZAR ]" : "[ CADASTRAR ]"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="border border-[#222222] bg-[#111111]">
        <div className="border-b border-[#222222] px-6 py-4"><span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#777777]">[ LISTA DE FUNCIONARIOS ]</span></div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#222222] bg-[#0D0D0D] hover:bg-[#0D0D0D]">
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">NOME</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CPF</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">CARGO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">SALARIO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium">ADMISSAO</TableHead>
                <TableHead className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555] font-medium text-right">ACOES</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((e) => (
                <TableRow key={e.id} className="border-b border-[#1A1A1A] hover:bg-[#141414] transition-colors">
                  <TableCell className="font-mono text-[11px] uppercase text-[#EAEAEA]">{e.name}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{e.cpf}</TableCell>
                  <TableCell className="font-mono text-[11px] uppercase text-[#777777]">{e.position}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{e.salary.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</TableCell>
                  <TableCell className="font-mono text-[11px] text-[#EAEAEA]">{new Date(e.admissionDate).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#1A1A1A] hover:text-[#EAEAEA] transition-colors" onClick={() => handleEdit(e)}><HiPencil className="h-3.5 w-3.5" /></button>
                      <button className="flex h-7 w-7 items-center justify-center text-[#555555] hover:bg-[#E61919]/10 hover:text-[#E61919] transition-colors" onClick={() => handleDelete(e.id)}><HiTrash className="h-3.5 w-3.5" /></button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && <TableRow><TableCell colSpan={6} className="py-8 text-center font-mono text-[11px] uppercase tracking-wider text-[#444444]">NENHUM FUNCIONARIO CADASTRADO</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
