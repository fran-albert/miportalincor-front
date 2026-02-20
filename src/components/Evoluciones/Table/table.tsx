import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
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
import { Button } from "@/components/ui/button";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { getEvolutionColumns, EvolutionTableRow } from "./columns";

const PAGE_SIZE = 20;

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
      desc: true,
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
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: PAGE_SIZE,
      },
    },
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

  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex;

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

      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t">
        <div className="text-sm text-gray-600">
          Mostrando {table.getRowModel().rows.length} de {data.length} evolución{data.length !== 1 ? 'es' : ''}
        </div>

        {pageCount > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">
              Página {currentPage + 1} de {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
