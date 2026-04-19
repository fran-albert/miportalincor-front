import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Power,
  RotateCcw,
  Stethoscope,
} from "lucide-react";
import { ConsultationTypeDialog } from "@/components/ConsultationTypes";
import {
  useDeactivateConsultationType,
  useOwnConsultationTypes,
  useUpdateConsultationType,
} from "@/hooks/ConsultationType";
import { ConsultationType } from "@/types/ConsultationType/ConsultationType";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface DoctorOwnConsultationTypesCardProps {
  doctorId: number;
  readOnly?: boolean;
}

export function DoctorOwnConsultationTypesCard({
  doctorId,
  readOnly = false,
}: DoctorOwnConsultationTypesCardProps) {
  const { consultationTypes, isLoading } = useOwnConsultationTypes(doctorId);
  const { mutateAsync: deactivateType, isPending: isDeactivating } =
    useDeactivateConsultationType();
  const { mutateAsync: updateType, isPending: isReactivating } =
    useUpdateConsultationType();
  const { showError, showSuccess } = useToastContext();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<ConsultationType | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [typeToDeactivate, setTypeToDeactivate] =
    useState<ConsultationType | null>(null);

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

  const handleDeactivate = async () => {
    if (!typeToDeactivate) {
      return;
    }

    try {
      await deactivateType(typeToDeactivate.id);
      showSuccess("Tipo propio desactivado");
      setDeactivateDialogOpen(false);
      setTypeToDeactivate(null);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError("Error al desactivar", axiosError.response?.data?.message);
    }
  };

  const handleReactivate = async (consultationType: ConsultationType) => {
    try {
      await updateType({
        id: consultationType.id,
        dto: {
          isActive: true,
          scope: "doctor",
          createdByDoctorId: doctorId,
        },
      });
      showSuccess("Tipo propio reactivado");
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
            <div className="h-10 w-1/3 rounded bg-gray-200" />
            <div className="h-32 rounded bg-gray-200" />
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
              <Stethoscope className="h-5 w-5" />
              Mis Tipos de Turno
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Estos tipos aparecen solo en tu agenda y también los puede usar secretaría al darte turnos.
            </p>
          </div>

          {!readOnly && (
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo tipo propio
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {sortedTypes.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
              <Stethoscope className="mx-auto mb-3 h-10 w-10 opacity-50" />
              <p>No tenés tipos propios creados.</p>
              {!readOnly && (
                <Button variant="link" onClick={handleCreate}>
                  Crear mi primer tipo
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {sortedTypes.map((consultationType) => (
                <div
                  key={consultationType.id}
                  className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {consultationType.color && (
                        <span
                          className="h-3 w-3 rounded-full border"
                          style={{ backgroundColor: consultationType.color }}
                        />
                      )}
                      <p className="font-medium">{consultationType.name}</p>
                      <Badge variant={consultationType.isActive ? "default" : "secondary"}>
                        {consultationType.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {consultationType.defaultDurationMinutes} min
                      {consultationType.description
                        ? ` • ${consultationType.description}`
                        : ""}
                    </p>
                  </div>

                  {!readOnly && (
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
                          <DropdownMenuItem
                            onClick={() => {
                              setTypeToDeactivate(consultationType);
                              setDeactivateDialogOpen(true);
                            }}
                          >
                            <Power className="mr-2 h-4 w-4" />
                            Desactivar
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleReactivate(consultationType)}
                            disabled={isReactivating}
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reactivar
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ConsultationTypeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        consultationType={selectedType}
        mode="doctor"
        doctorId={doctorId}
      />

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desactivar tipo propio</AlertDialogTitle>
            <AlertDialogDescription>
              {typeToDeactivate ? (
                <>
                  <strong>{typeToDeactivate.name}</strong> dejará de aparecer al crear turnos nuevos para tu agenda.
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
