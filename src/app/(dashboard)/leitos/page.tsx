"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FaBed } from "react-icons/fa";

interface Bed {
  id: string;
  number: string;
  ward: string;
  floor: number;
  status: string;
  bedType: string;
}

const bedStatusColors: Record<string, string> = {
  AVAILABLE: "bg-green-100 text-green-800",
  OCCUPIED: "bg-red-100 text-red-800",
  MAINTENANCE: "bg-yellow-100 text-yellow-800",
  RESERVED: "bg-blue-100 text-blue-800",
};

const bedStatusLabels: Record<string, string> = {
  AVAILABLE: "Disponível",
  OCCUPIED: "Ocupado",
  MAINTENANCE: "Manutenção",
  RESERVED: "Reservado",
};

const bedTypeLabels: Record<string, string> = {
  REGULAR: "Regular",
  ICU: "UTI",
  EMERGENCY: "Emergência",
  PEDIATRIC: "Pediátrico",
};

export default function BedsPage() {
  const [beds, setBeds] = useState<Bed[]>([]);

  useEffect(() => {
    fetchBeds();
  }, []);

  const fetchBeds = async () => {
    const res = await fetch("/api/beds");
    if (res.ok) setBeds(await res.json());
  };

  const stats = {
    total: beds.length,
    available: beds.filter((b) => b.status === "AVAILABLE").length,
    occupied: beds.filter((b) => b.status === "OCCUPIED").length,
    maintenance: beds.filter((b) => b.status === "MAINTENANCE").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Leitos</h1>
        <p className="text-gray-500">Gerenciamento de leitos do hospital</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.available}</div>
            <div className="text-sm text-gray-500">Disponíveis</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.occupied}</div>
            <div className="text-sm text-gray-500">Ocupados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.maintenance}</div>
            <div className="text-sm text-gray-500">Manutenção</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FaBed className="h-5 w-5" />
            Mapa de Leitos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Ala</TableHead>
                <TableHead>Andar</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {beds.map((bed) => (
                <TableRow key={bed.id}>
                  <TableCell className="font-medium">{bed.number}</TableCell>
                  <TableCell>{bed.ward}</TableCell>
                  <TableCell>{bed.floor}</TableCell>
                  <TableCell>{bedTypeLabels[bed.bedType]}</TableCell>
                  <TableCell>
                    <Badge className={bedStatusColors[bed.status]}>
                      {bedStatusLabels[bed.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
              {beds.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500">
                    Nenhum leito cadastrado
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
