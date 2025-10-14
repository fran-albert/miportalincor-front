import * as React from "react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  evaluationTypes: { id: number; name: string }[];
  onAddClick?: () => void;
  isFetching?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  evaluationTypes,
  isFetching = false,
  onAddClick,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const [selectedEvaluationType, setSelectedEvaluationType] = React.useState<
    string | null
  >(null);

  const filteredData = React.useMemo(() => {
    if (selectedEvaluationType && selectedEvaluationType !== "all") {
      return data.filter((item) => {
        const itemWithEvaluation = item as { medicalEvaluation?: { evaluationType?: { id: number } } };
        const evaluationTypeId = itemWithEvaluation.medicalEvaluation?.evaluationType?.id;

        return evaluationTypeId === Number(selectedEvaluationType);
      });
    }
    return data;
  }, [data, selectedEvaluationType]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: { sorting },
  });

  return (
    <>
      <div className="flex items-center justify-between m-4">
        <h2 className="text-2xl font-bold text-greenPrimary">
          Lista de Exámenes
        </h2>
        <div className="flex items-center space-x-4">
          <Select
            value={selectedEvaluationType || "all"}
            onValueChange={(value) => setSelectedEvaluationType(value)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filtrar por tipo de evaluación" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {evaluationTypes.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {onAddClick && (
            <Button
              onClick={onAddClick}
              className="ml-4 bg-greenPrimary text-white px-4 py-2 rounded-md"
            >
              Nuevo Examen
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-lg overflow-hidden shadow-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-greenPrimary">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="py-2 px-6 text-left text-sm font-semibold text-white"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {isFetching ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-10 text-center text-gray-900"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredData.length ? (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-gray-50 transition duration-150 ease-in-out"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className="py-2 px-6 border-b border-gray-200"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-10 text-center text-gray-900"
                  >
                    No hay resultados para este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
