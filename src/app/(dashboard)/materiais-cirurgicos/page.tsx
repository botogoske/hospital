"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { surgeryMaterialSchema, type SurgeryMaterialInput } from "@/lib/validations";
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
import {
  HiPlus,
  HiPencil,
  HiTrash,
  HiDocumentDownload,
  HiSearch,
  HiExclamationCircle,
} from "react-icons/hi";
import { FaCut } from "react-icons/fa";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formStyles } from "@/styles/form-styles";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface Surgery {
  id: string;
  name: string;
}

interface SurgeryMaterial {
  id: string;
  code?: string | null;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minQuantity: number;
  unitPrice: number;
  description?: string | null;
  surgeryId?: string | null;
  surgery?: Surgery | null;
  createdAt?: string;
  updatedAt?: string;
}

const CATEGORIES = [
  "GERAL",
  "INSTRUMENTAL",
  "SUTURA E LIGADURA",
  "HEMOSTASIA",
  "SINTESE E DRENOS",
  "VESTUARIO E CAMPOS",
  "ORTOPEDIA",
  "DESCARTAVEIS",
];

const UNITS = ["UN", "CX", "PCT", "PAR", "AMP", "KIT", "RL"];

export default function MateriaisCirurgicosPage() {
  const [materials, setMaterials] = useState<SurgeryMaterial[]>([]);
  const [surgeries, setSurgeries] = useState<Surgery[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<SurgeryMaterial | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("TODAS");
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SurgeryMaterialInput>({
    resolver: zodResolver(surgeryMaterialSchema),
    defaultValues: {
      code: "",
      name: "",
      category: "GERAL",
      quantity: 0,
      unit: "UN",
      minQuantity: 10,
      unitPrice: 0,
      description: "",
      surgeryId: "",
    },
  });

  const fetchMaterials = async () => {
    try {
      const res = await fetch("/api/materiais-cirurgicos");
      if (res.ok) setMaterials(await res.json());
    } catch (error) {
      console.error("Erro ao carregar materiais cirúrgicos:", error);
    }
  };

  const fetchSurgeries = async () => {
    try {
      const res = await fetch("/api/surgeries");
      if (res.ok) setSurgeries(await res.json());
    } catch (error) {
      console.error("Erro ao carregar cirurgias:", error);
    }
  };

  useEffect(() => {
    fetchMaterials();
    fetchSurgeries();
  }, []);

  const onSubmit = async (data: SurgeryMaterialInput) => {
    setLoading(true);
    setFormError(null);
    try {
      const url = editingMaterial
        ? `/api/materiais-cirurgicos/${editingMaterial.id}`
        : "/api/materiais-cirurgicos";
      const method = editingMaterial ? "PUT" : "POST";

      const upperData = toUpper(data as unknown as Record<string, unknown>);
      const payload = {
        ...upperData,
        quantity: Number(data.quantity) || 0,
        minQuantity: Number(data.minQuantity) || 0,
        unitPrice: Number(data.unitPrice) || 0,
        surgeryId: data.surgeryId && data.surgeryId.trim() !== "" ? data.surgeryId : null,
      };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setOpen(false);
        reset();
        setEditingMaterial(null);
        setFormError(null);
        fetchMaterials();
      } else {
        const errorData = await res.json();
        setFormError(errorData.error || "Erro ao salvar material cirúrgico.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro ao conectar com o servidor";
      setFormError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (material: SurgeryMaterial) => {
    setFormError(null);
    setEditingMaterial(material);
    setValue("code", material.code || "");
    setValue("name", material.name);
    setValue("category", material.category || "GERAL");
    setValue("quantity", material.quantity);
    setValue("unit", material.unit || "UN");
    setValue("minQuantity", material.minQuantity);
    setValue("unitPrice", material.unitPrice);
    setValue("description", material.description || "");
    setValue("surgeryId", material.surgeryId || "");
    setOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setDeleteTargetId(id);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/materiais-cirurgicos/${deleteTargetId}`, {
        method: "DELETE",
      });
      if (res.ok) fetchMaterials();
    } finally {
      setDeleteConfirmOpen(false);
      setDeleteTargetId(null);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      reset();
      setEditingMaterial(null);
      setFormError(null);
    }
  };

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchesSearch =
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.code && m.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (m.description && m.description.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesCategory =
        selectedCategory === "TODAS" || m.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [materials, searchTerm, selectedCategory]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("RELATORIO DE MATERIAIS CIRURGICOS - HOSPITAL GREGUITO", 14, 15);
    doc.setFontSize(9);
    doc.text(`GERADO EM: ${new Date().toLocaleString("pt-BR")}`, 14, 22);

    const tableData = filteredMaterials.map((m) => [
      m.code || "-",
      m.name,
      m.category,
      `${m.quantity} ${m.unit}`,
      `${m.minQuantity} ${m.unit}`,
      `R$ ${m.unitPrice.toFixed(2)}`,
      m.surgery ? m.surgery.name : "GERAL",
    ]);

    autoTable(doc, {
      head: [
        [
          "CODIGO",
          "NOME",
          "CATEGORIA",
          "QTD ESTOQUE",
          "EST. MIN",
          "PRECO UNIT.",
          "VINCULO CIRURGICO",
        ],
      ],
      body: tableData,
      startY: 28,
      styles: { fontSize: 8, font: "monospace" },
      headStyles: { fillColor: [230, 25, 25] },
    });

    doc.save("materiais-cirurgicos.pdf");
  };

  const stats = useMemo(() => {
    const totalItems = materials.length;
    const totalQuantity = materials.reduce((acc, curr) => acc + curr.quantity, 0);
    const criticalStock = materials.filter(
      (m) => m.quantity <= m.minQuantity
    ).length;
    const totalValue = materials.reduce(
      (acc, curr) => acc + curr.quantity * curr.unitPrice,
      0
    );
    return { totalItems, totalQuantity, criticalStock, totalValue };
  }, [materials]);

  return (
    <div className="space-y-6 pb-8">
      {/* Header Banner */}
      <div className={formStyles.header.container}>
        <div className={formStyles.header.row}>
          <div className="flex items-center gap-4">
            <div className={formStyles.header.iconBox}>
              <FaCut className="h-5 w-5" />
            </div>
            <div>
              <h1 className={formStyles.header.title}>MATERIAIS CIRÚRGICOS</h1>
              <p className={formStyles.header.subtitle}>
                GESTÃO DE INSUMOS, INSTRUMENTAIS E MATERIAIS DE CENTRO CIRÚRGICO
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={exportPDF} className={formStyles.button.export}>
              <HiDocumentDownload className="h-4 w-4" />
              [ RELATÓRIO PDF ]
            </Button>

            <Dialog open={open} onOpenChange={handleOpenChange}>
              <DialogTrigger render={<Button className={formStyles.button.trigger} />}>
                <span className="flex items-center gap-2">
                  <HiPlus className="h-4 w-4" />
                  NOVO MATERIAL
                </span>
              </DialogTrigger>

              <DialogContent className={formStyles.dialog.content}>
                <DialogHeader className={formStyles.dialog.header}>
                  <DialogTitle className={formStyles.dialog.title}>
                    {editingMaterial
                      ? "[ EDITAR MATERIAL CIRÚRGICO ]"
                      : "[ NOVO MATERIAL CIRÚRGICO ]"}
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                  {formError && (
                    <div className="border border-[#E61919] bg-[#E61919]/10 p-3 font-mono text-xs text-[#E61919]">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>CÓDIGO / SKU</Label>
                      <Input
                        {...register("code")}
                        placeholder="EX: MAT-001"
                        className={formStyles.field.input}
                      />
                      {errors.code && (
                        <p className={formStyles.field.error}>
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>CATEGORIA *</Label>
                      <select
                        {...register("category")}
                        className={formStyles.field.select}
                      >
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                      {errors.category && (
                        <p className={formStyles.field.error}>
                          {errors.category.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>NOME DO MATERIAL *</Label>
                    <Input
                      {...register("name")}
                      placeholder="EX: PINÇA HEMOSTÁTICA HALSTED MOSQUITO 12.5CM"
                      className={formStyles.field.input}
                    />
                    {errors.name && (
                      <p className={formStyles.field.error}>{errors.name.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>QTD ESTOQUE *</Label>
                      <Input
                        type="number"
                        {...register("quantity", { valueAsNumber: true })}
                        className={formStyles.field.input}
                      />
                      {errors.quantity && (
                        <p className={formStyles.field.error}>
                          {errors.quantity.message}
                        </p>
                      )}
                    </div>

                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>UNIDADE *</Label>
                      <select
                        {...register("unit")}
                        className={formStyles.field.select}
                      >
                        {UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                      {errors.unit && (
                        <p className={formStyles.field.error}>{errors.unit.message}</p>
                      )}
                    </div>

                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>ESTOQUE MÍNIMO *</Label>
                      <Input
                        type="number"
                        {...register("minQuantity", { valueAsNumber: true })}
                        className={formStyles.field.input}
                      />
                      {errors.minQuantity && (
                        <p className={formStyles.field.error}>
                          {errors.minQuantity.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>VALOR UNITÁRIO (R$) *</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register("unitPrice", { valueAsNumber: true })}
                        className={formStyles.field.input}
                      />
                      {errors.unitPrice && (
                        <p className={formStyles.field.error}>
                          {errors.unitPrice.message}
                        </p>
                      )}
                    </div>

                    <div className={formStyles.field.wrapper}>
                      <Label className={formStyles.field.label}>
                        VÍNCULO COM CIRURGIA (OPCIONAL)
                      </Label>
                      <select
                        {...register("surgeryId")}
                        className={formStyles.field.select}
                      >
                        <option value="">-- NENHUMA (ESTOQUE GERAL) --</option>
                        {surgeries.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className={formStyles.field.wrapper}>
                    <Label className={formStyles.field.label}>DESCRIÇÃO / OBSERVAÇÕES</Label>
                    <Input
                      {...register("description")}
                      placeholder="EX: AÇO INOXIDÁVEL, ESTÉRIL, REUTILIZÁVEL"
                      className={formStyles.field.input}
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className={formStyles.button.primary}
                  >
                    {loading
                      ? "SALVANDO..."
                      : editingMaterial
                      ? "SALVAR ALTERAÇÕES"
                      : "CADASTRAR MATERIAL"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className={formStyles.stats.container}>
        <div className={formStyles.stats.item}>
          <p className={`${formStyles.stats.value} text-[#EAEAEA]`}>
            {stats.totalItems}
          </p>
          <p className={formStyles.stats.label}>ITENS CADASTRADOS</p>
        </div>
        <div className={formStyles.stats.item}>
          <p className={`${formStyles.stats.value} text-[#EAEAEA]`}>
            {stats.totalQuantity.toLocaleString("pt-BR")}
          </p>
          <p className={formStyles.stats.label}>VOLUME EM ESTOQUE</p>
        </div>
        <div className={formStyles.stats.item}>
          <p
            className={`${formStyles.stats.value} ${
              stats.criticalStock > 0 ? "text-[#E61919]" : "text-[#4AF626]"
            }`}
          >
            {stats.criticalStock}
          </p>
          <p className={formStyles.stats.label}>ESTOQUE CRÍTICO / MÍNIMO</p>
        </div>
        <div className={formStyles.stats.item}>
          <p className={`${formStyles.stats.value} text-[#4AF626]`}>
            R$ {stats.totalValue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </p>
          <p className={formStyles.stats.label}>VALOR TOTAL DO INVENTÁRIO</p>
        </div>
      </div>

      {/* Main Content Section */}
      <div className={formStyles.section.container}>
        <div className={formStyles.section.header}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h2 className={formStyles.section.title}>
              [ CATALOGO DE MATERIAIS CIRURGICOS ]
            </h2>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <HiSearch className={formStyles.search.icon} />
                <input
                  type="text"
                  placeholder="BUSCAR MATERIAL / CODIGO..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={formStyles.search.input}
                />
              </div>

              {/* Category filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-48 border border-[#222222] bg-[#0D0D0D] py-1.5 px-3 font-mono text-[10px] uppercase text-[#EAEAEA] rounded-none focus:border-[#E61919] focus:outline-none"
              >
                <option value="TODAS">TODAS AS CATEGORIAS</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <Table>
          <TableHeader>
            <TableRow className={formStyles.table.headerRow}>
              <TableHead className={formStyles.table.headerCell}>CÓDIGO</TableHead>
              <TableHead className={formStyles.table.headerCell}>NOME DO MATERIAL</TableHead>
              <TableHead className={formStyles.table.headerCell}>CATEGORIA</TableHead>
              <TableHead className={formStyles.table.headerCell}>ESTOQUE</TableHead>
              <TableHead className={formStyles.table.headerCell}>STATUS ESTOQUE</TableHead>
              <TableHead className={formStyles.table.headerCell}>VALOR UNIT.</TableHead>
              <TableHead className={formStyles.table.headerCell}>PROCEDIMENTO VINCULADO</TableHead>
              <TableHead className="text-right font-mono text-[9px] uppercase tracking-[0.12em] text-[#555555]">
                AÇÕES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMaterials.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className={formStyles.table.emptyState}>
                  NENHUM MATERIAL CIRÚRGICO ENCONTRADO
                </TableCell>
              </TableRow>
            ) : (
              filteredMaterials.map((material) => {
                const isCritical = material.quantity <= material.minQuantity;

                return (
                  <TableRow key={material.id} className={formStyles.table.bodyRow}>
                    <TableCell className={formStyles.table.cellMuted}>
                      {material.code || "-"}
                    </TableCell>
                    <TableCell>
                      <div>
                        <span className={formStyles.table.cellBold}>
                          {material.name}
                        </span>
                        {material.description && (
                          <p className="font-mono text-[9px] text-[#555555]">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className={formStyles.table.cellMuted}>
                      <span className="border border-[#222222] bg-[#0D0D0D] px-2 py-0.5 text-[9px]">
                        {material.category}
                      </span>
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      {material.quantity} {material.unit}
                    </TableCell>
                    <TableCell>
                      {isCritical ? (
                        <span className="inline-flex items-center gap-1.5 border border-[#E61919]/40 bg-[#E61919]/10 px-2 py-0.5 font-mono text-[9px] font-bold text-[#E61919]">
                          <HiExclamationCircle className="h-3 w-3" />
                          CRÍTICO (MIN: {material.minQuantity})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 border border-[#4AF626]/30 bg-[#4AF626]/10 px-2 py-0.5 font-mono text-[9px] text-[#4AF626]">
                          NORMAL (MIN: {material.minQuantity})
                        </span>
                      )}
                    </TableCell>
                    <TableCell className={formStyles.table.cell}>
                      R$ {material.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className={formStyles.table.cellMuted}>
                      {material.surgery ? material.surgery.name : "ESTOQUE GERAL"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(material)}
                          className={formStyles.button.edit}
                          title="Editar Material"
                        >
                          <HiPencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(material.id)}
                          className={formStyles.button.delete}
                          title="Excluir Material"
                        >
                          <HiTrash className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="[ CONFIRMAR EXCLUSÃO DE MATERIAL ]"
        description="TEM CERTEZA QUE DESEJA EXCLUIR ESTE MATERIAL CIRÚRGICO? ESTA AÇÃO NÃO PODERÁ SER DESFEITA."
      />
    </div>
  );
}
