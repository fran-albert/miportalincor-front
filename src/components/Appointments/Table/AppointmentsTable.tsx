import { useState, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { Skeleton } from "@/components/ui/skeleton";
import { getAppointmentColumns } from "./columns";
import { DoctorSelect } from "../Select/DoctorSelect";
import { useAppointments, useAppointmentMutations } from "@/hooks/Appointments";
import {
  AppointmentFullResponseDto,
  AppointmentStatus,
  AppointmentStatusLabels
} from "@/types/Appointment/Appointment";
import { formatDateForCalendar } from "@/common/helpers/timezone";
import { Search, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AppointmentsTableProps {
  onView?: (appointment: AppointmentFullResponseDto) => void;
  onEdit?: (appointment: AppointmentFullResponseDto) => void;
  className?: string;
}

export const AppointmentsTable = ({
  onView,
  onEdit,
  className
}: AppointmentsTableProps) => {
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // Filters
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState("");

  const { appointments, isLoading, total } = useAppointments({
    doctorId: selectedDoctorId,
    dateFrom: selectedDate ? formatDateForCalendar(selectedDate) : undefined,
    dateTo: selectedDate ? formatDateForCalendar(selectedDate) : undefined,
    status: selectedStatus,
    limit: 100
  });

  const { changeStatus, deleteAppointment } = useAppointmentMutations();

  const handleChangeStatus = async (id: number, status: AppointmentStatus) => {
    try {
      await changeStatus.mutateAsync({ id, status });
      toast({
        title: "Estado actualizado",
        description: "El estado del turno se actualizó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado",
      });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Está seguro que desea eliminar este turno?")) return;
    try {
      await deleteAppointment.mutateAsync(id);
      toast({
        title: "Turno eliminado",
        description: "El turno se eliminó correctamente",
      });
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el turno",
      });
    }
  };

  const columns = useMemo(
    () =>
      getAppointmentColumns({
        onView,
        onEdit,
        onChangeStatus: handleChangeStatus,
        onDelete: handleDelete,
      }),
    [onView, onEdit]
  );

  // Filter by search term (patient name)
  const filteredAppointments = useMemo(() => {
    if (!searchTerm) return appointments;
    const term = searchTerm.toLowerCase();
    return appointments.filter(
      (apt) =>
        apt.patient?.firstName?.toLowerCase().includes(term) ||
        apt.patient?.lastName?.toLowerCase().includes(term)
    );
  }, [appointments, searchTerm]);

  const table = useReactTable({
    data: filteredAppointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  });

  const clearFilters = () => {
    setSelectedDoctorId(undefined);
    setSelectedDate(undefined);
    setSelectedStatus(undefined);
    setSearchTerm("");
  };

  const hasActiveFilters = selectedDoctorId || selectedDate || selectedStatus || searchTerm;

  return (
    <div className={className}>
      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar paciente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="w-64">
          <DoctorSelect
            value={selectedDoctorId}
            onValueChange={setSelectedDoctorId}
            placeholder="Filtrar por médico"
          />
        </div>

        <div className="w-40">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
          />
        </div>

        <div className="w-48">
          <Select
            value={selectedStatus}
            onValueChange={setSelectedStatus}
          >
            <SelectTrigger>
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(AppointmentStatusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters} className="h-10">
            <X className="h-4 w-4 mr-1" />
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  {columns.map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No se encontraron turnos
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between py-4">
        <div className="text-sm text-muted-foreground">
          Mostrando {filteredAppointments.length} de {total} turnos
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsTable;
