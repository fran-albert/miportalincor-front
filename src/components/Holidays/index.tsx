import { useState, useMemo } from "react";
import {
  useHolidays,
  useCreateHoliday,
  useDeleteHoliday,
  useSyncHolidays,
} from "@/hooks/Holiday/useHolidays";
import { Holiday, HolidayType, HolidaySource } from "@/types/Holiday/Holiday";
import LoadingAnimation from "@/components/Loading/loading";
import { PageHeader } from "@/components/PageHeader";
import {
  Calendar,
  Plus,
  Trash2,
  RefreshCw,
  Search,
  Globe,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const HolidayTypeLabels: Record<HolidayType, string> = {
  [HolidayType.INAMOVIBLE]: "Inamovible",
  [HolidayType.TRASLADABLE]: "Trasladable",
  [HolidayType.PUENTE]: "Puente",
};

const HolidayTypeBadgeColors: Record<HolidayType, string> = {
  [HolidayType.INAMOVIBLE]: "bg-blue-100 text-blue-800",
  [HolidayType.TRASLADABLE]: "bg-amber-100 text-amber-800",
  [HolidayType.PUENTE]: "bg-purple-100 text-purple-800",
};

const HolidaysComponent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showSyncDialog, setShowSyncDialog] = useState(false);
  const [holidayToDelete, setHolidayToDelete] = useState<Holiday | null>(null);

  // Form state for adding new holiday
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayDescription, setNewHolidayDescription] = useState("");
  const [newHolidayType, setNewHolidayType] = useState<HolidayType>(
    HolidayType.INAMOVIBLE
  );

  // Sync year selection
  const [syncYear, setSyncYear] = useState<number>(new Date().getFullYear());

  const { data: holidays, isLoading } = useHolidays();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const syncHolidays = useSyncHolidays();

  // Get unique years from holidays
  const availableYears = useMemo(() => {
    if (!holidays) return [];
    const years = new Set(holidays.map((h) => h.date.substring(0, 4)));
    return Array.from(years).sort().reverse();
  }, [holidays]);

  // Filter holidays
  const filteredHolidays = useMemo(() => {
    if (!holidays) return [];

    return holidays
      .filter((holiday) => {
        // Year filter
        if (yearFilter !== "all" && !holiday.date.startsWith(yearFilter)) {
          return false;
        }

        // Search filter
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase();
          const description = holiday.description?.toLowerCase() || "";
          const date = holiday.date;
          return description.includes(query) || date.includes(query);
        }

        return true;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [holidays, yearFilter, searchQuery]);

  const handleAddHoliday = async () => {
    if (!newHolidayDate) {
      toast.error("Debe seleccionar una fecha");
      return;
    }

    try {
      await createHoliday.mutateAsync({
        date: newHolidayDate,
        description: newHolidayDescription || undefined,
        type: newHolidayType,
      });
      toast.success("Feriado agregado correctamente");
      setShowAddDialog(false);
      setNewHolidayDate("");
      setNewHolidayDescription("");
      setNewHolidayType(HolidayType.INAMOVIBLE);
    } catch {
      toast.error("Error al agregar el feriado");
    }
  };

  const handleDeleteHoliday = async () => {
    if (!holidayToDelete) return;

    try {
      await deleteHoliday.mutateAsync(holidayToDelete.id);
      toast.success("Feriado eliminado correctamente");
      setHolidayToDelete(null);
    } catch {
      toast.error("Error al eliminar el feriado");
    }
  };

  const handleSyncHolidays = async () => {
    try {
      const result = await syncHolidays.mutateAsync(syncYear);
      toast.success(
        `Sincronizacion completada: ${result.created} creados, ${result.updated} actualizados, ${result.skipped} sin cambios`
      );
      setShowSyncDialog(false);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      toast.error(`Error al sincronizar: ${errorMessage}`);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return dateStr;
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Administracion" },
    { label: "Feriados" },
  ];

  if (isLoading) {
    return <LoadingAnimation />;
  }

  // Generate year options for sync (2016 to next year)
  const currentYear = new Date().getFullYear();
  const syncYearOptions = Array.from(
    { length: currentYear - 2016 + 2 },
    (_, i) => 2016 + i
  ).reverse();

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Feriados"
        description="Gestione los feriados del sistema. Los turnos no se pueden agendar en dias feriados."
        icon={<Calendar className="h-6 w-6" />}
        badge={holidays?.length}
      />

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar feriado..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger className="w-full sm:w-32">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowSyncDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Sincronizar
              </Button>
              <Button
                onClick={() => setShowAddDialog(true)}
                className="flex-1 sm:flex-none"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Fecha</TableHead>
                  <TableHead>Descripcion</TableHead>
                  <TableHead className="w-[120px]">Tipo</TableHead>
                  <TableHead className="w-[100px]">Origen</TableHead>
                  <TableHead className="w-[80px] text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHolidays.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-gray-500"
                    >
                      {searchQuery || yearFilter !== "all"
                        ? "No se encontraron feriados con ese criterio"
                        : "No hay feriados cargados. Use el boton 'Sincronizar' para cargar los feriados de Argentina."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.id}>
                      <TableCell>
                        <div className="font-medium">{holiday.date}</div>
                        <div className="text-xs text-gray-500 capitalize">
                          {formatDate(holiday.date).split(",")[0]}
                        </div>
                      </TableCell>
                      <TableCell>{holiday.description || "-"}</TableCell>
                      <TableCell>
                        {holiday.type ? (
                          <Badge
                            variant="secondary"
                            className={
                              HolidayTypeBadgeColors[holiday.type as HolidayType]
                            }
                          >
                            {HolidayTypeLabels[holiday.type as HolidayType]}
                          </Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {holiday.source === HolidaySource.API_ARGENTINA ? (
                          <div className="flex items-center gap-1 text-blue-600">
                            <Globe className="h-3 w-3" />
                            <span className="text-xs">API</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-600">
                            <PenLine className="h-3 w-3" />
                            <span className="text-xs">Manual</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setHolidayToDelete(holiday)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Mostrando {filteredHolidays.length} de {holidays?.length || 0}{" "}
            feriados
          </div>
        </CardContent>
      </Card>

      {/* Add Holiday Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Feriado</DialogTitle>
            <DialogDescription>
              Agregue un nuevo feriado manualmente. Los turnos no podran
              agendarse en esta fecha.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="holiday-date">Fecha *</Label>
              <Input
                id="holiday-date"
                type="date"
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-description">Descripcion</Label>
              <Input
                id="holiday-description"
                placeholder="Ej: Dia de la Independencia"
                value={newHolidayDescription}
                onChange={(e) => setNewHolidayDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="holiday-type">Tipo de feriado</Label>
              <Select
                value={newHolidayType}
                onValueChange={(v) => setNewHolidayType(v as HolidayType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={HolidayType.INAMOVIBLE}>
                    Inamovible
                  </SelectItem>
                  <SelectItem value={HolidayType.TRASLADABLE}>
                    Trasladable
                  </SelectItem>
                  <SelectItem value={HolidayType.PUENTE}>Puente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAddHoliday}
              disabled={createHoliday.isPending}
            >
              {createHoliday.isPending ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Sync Dialog */}
      <Dialog open={showSyncDialog} onOpenChange={setShowSyncDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sincronizar Feriados</DialogTitle>
            <DialogDescription>
              Sincronice los feriados oficiales de Argentina desde la API de
              ArgentinaDatos. Los feriados existentes seran actualizados si hay
              cambios.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sync-year">Año a sincronizar</Label>
              <Select
                value={syncYear.toString()}
                onValueChange={(v) => setSyncYear(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {syncYearOptions.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                Datos disponibles desde 2016 hasta {currentYear + 1}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSyncDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSyncHolidays}
              disabled={syncHolidays.isPending}
            >
              {syncHolidays.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Sincronizando...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Sincronizar {syncYear}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!holidayToDelete}
        onOpenChange={(open) => !open && setHolidayToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar feriado</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estas seguro de que deseas eliminar el feriado "
              {holidayToDelete?.description || holidayToDelete?.date}"? Los
              turnos podran agendarse en esta fecha.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteHoliday}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteHoliday.isPending}
            >
              {deleteHoliday.isPending ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default HolidaysComponent;
