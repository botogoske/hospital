"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicationSchema, type MedicationInput } from "@/lib/validations";
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
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { HiBeaker } from "react-icons/hi";

interface Medication {
  id: string;
  name: string;
  manufacturer: string;
  dosage: string;
  concentration: string;
  category: string;
  stockQuantity: number;
  unitPrice: number;
}

export default function MedicationsPage() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MedicationInput>({
    resolver: zodResolver(medicationSchema),
  });

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    const res = await fetch("/api/medications");
    if (res.ok) setMedications(await res.json());
  };

  const onSubmit = async (data: MedicationInput) => {
    setLoading(true);
    try {
      const url = editingMedication
        ? `/api/medications/${editingMedication.id}`
        : "/api/medications";
      const method = editingMedication ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setEditingMedication(null);
        fetchMedications();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (medication: Medication) => {
    setEditingMedication(medication);
    setValue("name", medication.name);
    setValue("manufacturer", medication.manufacturer);
    setValue("dosage", medication.dosage);
    setValue("concentration", medication.concentration);
    setValue("category", medication.category);
    setValue("stockQuantity", medication.stockQuantity);
    setValue("unitPrice", medication.unitPrice);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este medicamento?")) return;
    const res = await fetch(`/api/medications/${id}`, { method: "DELETE" });
    if (res.ok) fetchMedications();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medicamentos</h1>
          <p className="text-gray-500">Gerencie o estoque de medicamentos</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setEditingMedication(null); } }}>
          <DialogTrigger render={<Button />}>
            <HiPlus className="mr-2 h-4 w-4" />
            Novo Medicamento
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMedication ? "Editar Medicamento" : "Cadastrar Medicamento"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input {...register("name")} />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Fabricante</Label>
                  <Input {...register("manufacturer")} />
                  {errors.manufacturer && (
                    <p className="text-sm text-red-500">{errors.manufacturer.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Dosagem</Label>
                  <Input {...register("dosage")} placeholder="Ex: 500mg" />
                  {errors.dosage && (
                    <p className="text-sm text-red-500">{errors.dosage.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Concentração</Label>
                  <Input {...register("concentration")} />
                  {errors.concentration && (
                    <p className="text-sm text-red-500">{errors.concentration.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Categoria</Label>
                  <Input {...register("category")} placeholder="Ex: Analgésico" />
                  {errors.category && (
                    <p className="text-sm text-red-500">{errors.category.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Quantidade em Estoque</Label>
                  <Input type="number" {...register("stockQuantity", { valueAsNumber: true })} />
                  {errors.stockQuantity && (
                    <p className="text-sm text-red-500">{errors.stockQuantity.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Preço Unitário (R$)</Label>
                  <Input type="number" step="0.01" {...register("unitPrice", { valueAsNumber: true })} />
                  {errors.unitPrice && (
                    <p className="text-sm text-red-500">{errors.unitPrice.message}</p>
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : editingMedication ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiBeaker className="h-5 w-5" />
            Lista de Medicamentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Fabricante</TableHead>
                <TableHead>Dosagem</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Estoque</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {medications.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-medium">{m.name}</TableCell>
                  <TableCell>{m.manufacturer}</TableCell>
                  <TableCell>{m.dosage}</TableCell>
                  <TableCell>{m.category}</TableCell>
                  <TableCell>
                    <span
                      className={
                        m.stockQuantity < 10 ? "font-bold text-red-600" : ""
                      }
                    >
                      {m.stockQuantity}
                    </span>
                  </TableCell>
                  <TableCell>
                    {m.unitPrice.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(m)}>
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(m.id)}>
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {medications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    Nenhum medicamento cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
