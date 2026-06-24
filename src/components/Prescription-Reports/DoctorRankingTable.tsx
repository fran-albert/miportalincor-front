import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { PrescriptionReportByDoctor } from "@/types/Prescription-Reports/Prescription-Reports";

interface DoctorRankingTableProps {
  data: PrescriptionReportByDoctor[] | undefined;
  isLoading: boolean;
}

type SortField = "doctorName" | "completed" | "pending" | "rejected" | "avgProcessingTimeHours";
type SortDirection = "asc" | "desc";

export function DoctorRankingTable({ data, isLoading }: DoctorRankingTableProps) {
  const [sortField, setSortField] = useState<SortField>("completed");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  const sortedData = useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      const numA = typeof aVal === "number" ? aVal : 0;
      const numB = typeof bVal === "number" ? bVal : 0;
      return sortDirection === "asc" ? numA - numB : numB - numA;
    });
  }, [data, sortField, sortDirection]);

  const formatHours = (hours: number): string => {
    if (hours < 1) return `${Math.round(hours * 60)} min`;
    if (hours < 24) return `${hours.toFixed(1)} hs`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    return `${days}d ${remainingHours}hs`;
  };

  const SortButton = ({ field, label }: { field: SortField; label: string }) => (
    <Button
      variant="ghost"
      size="sm"
      className="h-auto p-0 font-medium hover:bg-transparent"
      onClick={() => handleSort(field)}
    >
      {label}
      <ArrowUpDown className="ml-1 h-3 w-3" />
    </Button>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-bold text-greenPrimary">
          Ranking de Médicos
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !sortedData.length ? (
          <p className="text-center text-gray-500 py-10">
            No hay datos disponibles para el período seleccionado.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">#</TableHead>
                  <TableHead>
                    <SortButton field="doctorName" label="Médico" />
                  </TableHead>
                  <TableHead>Especialidades</TableHead>
                  <TableHead className="text-right">
                    <SortButton field="completed" label="Completadas" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="pending" label="Pendientes" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="rejected" label="Rechazadas" />
                  </TableHead>
                  <TableHead className="text-right">
                    <SortButton field="avgProcessingTimeHours" label="Tiempo Prom." />
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.map((doctor, index) => (
                  <TableRow key={doctor.doctorId}>
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {doctor.doctorName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {doctor.specialities.join(", ") || "—"}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-green-600">
                      {doctor.completed}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-amber-600">
                      {doctor.pending}
                    </TableCell>
                    <TableCell className="text-right font-semibold text-red-600">
                      {doctor.rejected}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {formatHours(doctor.avgProcessingTimeHours)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
