import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  CalendarRange,
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RotateCcw,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  useAllConsultationTypes,
  useDeactivateConsultationType,
  useUpdateConsultationType,
} from "@/hooks/ConsultationType";
import { ConsultationType } from "@/types/ConsultationType/ConsultationType";
import { ConsultationTypeDialog } from "./ConsultationTypeDialog";

export function ConsultationTypesManager() {
  const { consultationTypes, isLoading } = useAllConsultationTypes();
  const { mutateAsync: deactivateType, isPending: isDeactivating } = useDeactivateConsultationType();
  const { mutateAsync: updateType, isPending: isReactivating } = useUpdateConsultationType();
  const { showSuccess, showError } = useToastContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [typeToDeactivate, setTypeToDeactivate] = useState<ConsultationType | null>(null);

  const sortedTypes = [...consultationTypes].sort((left, right) => {
    if (left.displayOrder !== right.displayOrder) {
      return left.displayOrder - right.displayOrder;
    }

    return left.name.localeCompare(right.name, "es");
  });

  const handleCreate = () => {
    setSelectedType(null);
    setDialogOpen(true);
  };

  const handleEdit = (consultationType: ConsultationType) => {
    setSelectedType(consultationType);
    setDialogOpen(true);
  };

  const handleConfirmDeactivate = (consultationType: ConsultationType) => {
    setTypeToDeactivate(consultationType);
    setDeactivateDialogOpen(true);
  };

  const handleDeactivate = async () => {
    if (!typeToDeactivate) {
      return;
    }

    try {
      await deactivateType(typeToDeactivate.id);
      showSuccess("Tipo de turno desactivado");
      setDeactivateDialogOpen(false);
      setTypeToDeactivate(null);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError("Error al desactivar", axiosError.response?.data?.message);
    }
  };

  const handleReactivate = async (consultationType: ConsultationType) => {
    try {
      await updateType({ id: consultationType.id, dto: { isActive: true } });
      showSuccess("Tipo de turno reactivado");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError("Error al reactivar", axiosError.response?.data?.message);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-10 w-1/4 rounded bg-gray-200" />
            <div className="h-48 rounded bg-gray-200" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2">
              <CalendarRange className="h-5 w-5" />
              Tipos de Turno
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Gestiona el catálogo que usa secretaría al crear turnos y preserva métricas ordenadas.
            </p>
          </div>

          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo tipo
          </Button>
        </CardHeader>

        <CardContent>
          {sortedTypes.length === 0 ? (
            <div className="py-10 text-center text-muted-foreground">
              <CalendarRange className="mx-auto mb-3 h-12 w-12 opacity-50" />
              <p>No hay tipos de turno configurados.</p>
              <Button variant="link" onClick={handleCreate}>
                Crear el primero
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Orden</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTypes.map((consultationType) => (
                  <TableRow key={consultationType.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{consultationType.name}</p>
                        {consultationType.description && (
                          <p className="max-w-md truncate text-sm text-muted-foreground">
                            {consultationType.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{consultationType.defaultDurationMinutes} min</TableCell>
                    <TableCell>{consultationType.displayOrder}</TableCell>
                    <TableCell>
                      <Badge variant={consultationType.isActive ? "default" : "secondary"}>
                        {consultationType.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {consultationType.color ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="h-4 w-4 rounded-full border"
                            style={{ backgroundColor: consultationType.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {consultationType.color}
                          </span>
                        </div>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(consultationType)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          {consultationType.isActive ? (
                            <DropdownMenuItem onClick={() => handleConfirmDeactivate(consultationType)}>
                              <Power className="mr-2 h-4 w-4" />
                              Desactivar
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleReactivate(consultationType)}
                              disabled={isReactivating}
                            >
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Activar
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConsultationTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        consultationType={selectedType}
      />

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar tipo de turno</AlertDialogTitle>
            <AlertDialogDescription>
              {typeToDeactivate ? (
                <>
                  El tipo <strong>{typeToDeactivate.name}</strong> dejará de aparecer en los
                  selectores activos, pero seguirá existiendo en el histórico.
                </>
              ) : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivate} disabled={isDeactivating}>
              Desactivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
