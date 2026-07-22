"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { medicalRecordSchema, type MedicalRecordInput } from "@/lib/validations";
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
import { HiPlus, HiPencil, HiTrash } from "react-icons/hi";
import { FaNotesMedical } from "react-icons/fa";

interface Patient {
  id: string;
  name: string;
}

interface Doctor {
  id: string;
  name: string;
}

interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  diagnosis: string;
  treatment: string;
  notes?: string;
  visitDate: string;
  patient: { name: string };
  doctor: { name: string };
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MedicalRecordInput>({
    resolver: zodResolver(medicalRecordSchema),
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
    fetchDoctors();
  }, []);

  const fetchRecords = async () => {
    const res = await fetch("/api/medical-records");
    if (res.ok) setRecords(await res.json());
  };

  const fetchPatients = async () => {
    const res = await fetch("/api/patients");
    if (res.ok) setPatients(await res.json());
  };

  const fetchDoctors = async () => {
    const res = await fetch("/api/doctors");
    if (res.ok) setDoctors(await res.json());
  };

  const onSubmit = async (data: MedicalRecordInput) => {
    setLoading(true);
    try {
      const url = editingRecord
        ? `/api/medical-records/${editingRecord.id}`
        : "/api/medical-records";
      const method = editingRecord ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        setOpen(false);
        reset();
        setSelectedPatient("");
        setSelectedDoctor("");
        setEditingRecord(null);
        fetchRecords();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MedicalRecord) => {
    setEditingRecord(record);
    setSelectedPatient(record.patientId);
    setSelectedDoctor(record.doctorId);
    setValue("patientId", record.patientId);
    setValue("doctorId", record.doctorId);
    setValue("diagnosis", record.diagnosis);
    setValue("treatment", record.treatment);
    setValue("notes", record.notes || "");
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este prontuário?")) return;
    const res = await fetch(`/api/medical-records/${id}`, { method: "DELETE" });
    if (res.ok) fetchRecords();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Prontuários</h1>
          <p className="text-gray-500">Registros médicos dos pacientes</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { reset(); setSelectedPatient(""); setSelectedDoctor(""); setEditingRecord(null); } }}>
          <DialogTrigger render={<Button />}>
            <HiPlus className="mr-2 h-4 w-4" />
            Novo Prontuário
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRecord ? "Editar Prontuário" : "Cadastrar Prontuário"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Paciente</Label>
                <Select
                  value={selectedPatient}
                  onValueChange={(value) => { if (!value) return;
                    setSelectedPatient(value);
                    setValue("patientId", value);
                  }}
                  items={patients.map((p) => ({ value: p.id, label: p.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o paciente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patientId && (
                  <p className="text-sm text-red-500">{errors.patientId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Médico</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={(value) => { if (!value) return;
                    setSelectedDoctor(value);
                    setValue("doctorId", value);
                  }}
                  items={doctors.map((d) => ({ value: d.id, label: d.name }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o médico..." />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((d) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Diagnóstico</Label>
                <Input {...register("diagnosis")} />
                {errors.diagnosis && (
                  <p className="text-sm text-red-500">{errors.diagnosis.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Tratamento</Label>
                <Input {...register("treatment")} />
                {errors.treatment && (
                  <p className="text-sm text-red-500">{errors.treatment.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Observações</Label>
                <Input {...register("notes")} placeholder="Opcional" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Salvando..." : editingRecord ? "Atualizar" : "Cadastrar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaNotesMedical className="h-5 w-5" />
            Lista de Prontuários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Médico</TableHead>
                <TableHead>Diagnóstico</TableHead>
                <TableHead>Tratamento</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.patient.name}</TableCell>
                  <TableCell>{r.doctor.name}</TableCell>
                  <TableCell>{r.diagnosis}</TableCell>
                  <TableCell>{r.treatment}</TableCell>
                  <TableCell>
                    {new Date(r.visitDate).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon-sm" onClick={() => handleEdit(r)}>
                        <HiPencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => handleDelete(r.id)}>
                        <HiTrash className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {records.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500">
                    Nenhum prontuário cadastrado
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
