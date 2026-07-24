"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { healthPlanSchema, type HealthPlanInput } from "@/lib/validations";
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
import { Badge } from "@/components/ui/badge";
import { HiPlus, HiPencil, HiTrash, HiSearch, HiShieldCheck } from "react-icons/hi";

interface HealthPlan {
  id: string;
  name: string;
  provider: string;
  registrationNumber: string;
  coverageType: string;
  isActive: boolean;
  _count: { appointments: number };
}

const coverageLabels: Record<string, string> = {
  BASIC: "Básico",
  STANDARD: "Padrão",
  PREMIUM: "Premium",
};

const coverageColors: Record<string, string> = {
  BASIC: "bg-slate-100 text-slate-700",
  STANDARD: "bg-blue-100 text-blue-800",
  PREMIUM: "bg-amber-100 text-amber-800",
};

export default function HealthPlansPage() {
  const [healthPlans, setHealthPlans] = useState<HealthPlan[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [editingPlan, setEditingPlan] = useState<HealthPlan | null>(null);
  const [selectedCoverage, setSelectedCoverage] = useState("STANDARD");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<HealthPlanInput>({
    resolver: zodResolver(healthPlanSchema),
    defaultValues: { coverageType: "STANDARD" },
  });

  useEffect(() => {
    fetchHealthPlans();
  }, []);

  const fetchHealthPlans = async () => {
    const res = await fetch("/api/health-plans");
    if (res.ok) setHealthPlans(await res.json());
  };

  const onSubmit = async (data: HealthPlanInput) => {
    setLoading(true);
    try {
      const url = editingPlan
        ? `/api/health-plans/${editingPlan.id}`
        : "/api/health-plans";
      const method = editingPlan ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset({ coverageType: "STANDARD" });
        setSelectedCoverage("STANDARD");
        setEditingPlan(null);
        fetchHealthPlans();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: HealthPlan) => {
    setEditingPlan(plan);
    setValue("name", plan.name);
    setValue("provider", plan.provider);
    setValue("registrationNumber", plan.registrationNumber);
    setValue("coverageType", plan.coverageType as "BASIC" | "STANDARD" | "PREMIUM");
    setValue("isActive", plan.isActive);
    setSelectedCoverage(plan.coverageType);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano de saúde?")) return;
    const res = await fetch(`/api/health-plans/${id}`, { method: "DELETE" });
    if (res.ok) fetchHealthPlans();
  };

  const filteredPlans = healthPlans.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.provider.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Planos de Saúde</h1>
          <p className="text-gray-500">Gerencie os convênios e planos de saúde</p>
        </div>
        <Dialog
          open={open}
          onOpenChange={(v) => {
            setOpen(v);
            if (!v) {
              reset({ coverageType: "STANDARD" });
              setSelectedCoverage("STANDARD");
              setEditingPlan(null);
            }
          }}
        >
          <DialogTrigger render={<Button />}>
            <HiPlus className="mr-2 h-4 w-4" />
            Novo Plano
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingPlan ? "Editar Plano de Saúde" : "Cadastrar Plano de Saúde"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Nome do Plano</Label>
                <Input {...register("name")} placeholder="Ex: Unimed Gold" />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Operadora</Label>
                <Input {...register("provider")} placeholder="Ex: Unimed" />
                {errors.provider && (
                  <p className="text-sm text-red-500">{errors.provider.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Número de Registro (ANS)</Label>
                <Input
                  {...register("registrationNumber")}
                  placeholder="Ex: 302147"
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-red-500">
                    {errors.registrationNumber.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tipo de Cobertura</Label>
                <select
                  value={selectedCoverage}
                  onChange={(e) => {
                    setSelectedCoverage(e.target.value);
                    setValue(
                      "coverageType",
                      e.target.value as "BASIC" | "STANDARD" | "PREMIUM"
                    );
                  }}
                  className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:border-ring focus:ring-3 focus:ring-ring/50"
                >
                  <option value="BASIC">Básico</option>
                  <option value="STANDARD">Padrão</option>
                  <option value="PREMIUM">Premium</option>
                </select>
              </div>
              {editingPlan && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    defaultChecked={editingPlan.isActive}
                    onChange={(e) => setValue("isActive", e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <Label htmlFor="isActive">Plano Ativo</Label>
                </div>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? "Salvando..."
                  : editingPlan
                  ? "Atualizar Plano"
                  : "Cadastrar Plano"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HiShieldCheck className="h-5 w-5" />
            Planos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <HiSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou operadora..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Operadora</TableHead>
                <TableHead>Registro ANS</TableHead>
                <TableHead>Cobertura</TableHead>
                <TableHead>Consultas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell className="font-medium">{plan.name}</TableCell>
                  <TableCell>{plan.provider}</TableCell>
                  <TableCell>{plan.registrationNumber}</TableCell>
                  <TableCell>
                    <Badge className={coverageColors[plan.coverageType]}>
                      {coverageLabels[plan.coverageType]}
                    </Badge>
                  </TableCell>
                  <TableCell>{plan._count.appointments}</TableCell>
                  <TableCell>
                    <Badge
                      className={
                        plan.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(plan)}
                      >
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(plan.id)}
                      >
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredPlans.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500">
                    {search
                      ? "Nenhum resultado encontrado"
                      : "Nenhum plano de saúde cadastrado"}
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
