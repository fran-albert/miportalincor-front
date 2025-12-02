import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "lucide-react";
import { getEvolutionColumns, EvolutionTableRow } from "./columns";

interface EvolutionTableProps {
  data: EvolutionTableRow[];
  onView: (evolucion: EvolutionTableRow) => void;
  onEdit: (evolucion: EvolutionTableRow) => void;
  onDelete: (evolucion: EvolutionTableRow) => void;
  onPrint: (evolucion: EvolutionTableRow) => void;
  isLoading?: boolean;
  currentUserId?: number;
}

export default function EvolutionTable({
  data,
  onView,
  onEdit,
  onDelete,
  onPrint,
  isLoading = false,
  currentUserId
}: EvolutionTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    {
      id: "fechaConsulta",
      desc: true, // Más recientes primero
    },
  ]);

  const columns = getEvolutionColumns({
    onView,
    onEdit,
    onDelete,
    onPrint,
    currentUserId
  });

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  if (isLoading) {
    return (
      <div className="border rounded-lg">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm ml-3">Cargando evoluciones...</p>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="h-12 w-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-medium">No hay evoluciones registradas</p>
          <p className="text-gray-400 text-sm mt-1">
            Haz clic en "Agregar Evolución" para crear la primera
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-gray-50">
              {headerGroup.headers.map((header) => (
                <TableHead
                  key={header.id}
                  className="font-semibold text-gray-700"
                  style={{ width: header.getSize() }}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={(e) => {
                // Solo abrir modal si se hace click en el área de motivo o fecha
                const target = e.target as HTMLElement;
                const isActionArea = target.closest('[data-action-area]') ||
                                   target.closest('button') ||
                                   target.closest('[role="button"]');

                if (!isActionArea) {
                  onView(row.original);
                }
              }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="py-3"
                  data-action-area={cell.column.id === 'acciones' || cell.column.id === 'ver'}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Información de resultados */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          Mostrando {data.length} evolución{data.length !== 1 ? 'es' : ''}
        </div>
        <div className="text-xs text-gray-500">
          Ordenado por fecha de consulta (más recientes primero)
        </div>
      </div>
    </div>
  );
}