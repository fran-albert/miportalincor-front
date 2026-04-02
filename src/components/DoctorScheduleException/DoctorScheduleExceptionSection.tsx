import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CalendarRange, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDoctorScheduleExceptionMutations } from "@/hooks/DoctorScheduleException";
import {
  CreateDoctorScheduleExceptionDto,
  DoctorScheduleExceptionResponseDto,
  UpdateDoctorScheduleExceptionDto,
} from "@/types/DoctorScheduleException";
import { DoctorScheduleExceptionForm } from "./DoctorScheduleExceptionForm";
import { DoctorScheduleExceptionList } from "./DoctorScheduleExceptionList";

interface DoctorScheduleExceptionSectionProps {
  doctorId: number;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data &&
    typeof error.response.data.message === "string"
  ) {
    return error.response.data.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

const notifyOutsideAppointments = (
  count?: number,
) => {
  if (!count) {
    return;
  }

  const message =
    count === 1
      ? "Hay 1 turno ya asignado fuera de la nueva franja. Se conservará."
      : `Hay ${count} turnos ya asignados fuera de la nueva franja. Se conservarán.`;

  toast.warning(message);
};

export const DoctorScheduleExceptionSection = ({
  doctorId,
}: DoctorScheduleExceptionSectionProps) => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingException, setEditingException] =
    useState<DoctorScheduleExceptionResponseDto | null>(null);
  const [deleteTarget, setDeleteTarget] =
    useState<DoctorScheduleExceptionResponseDto | null>(null);
  const [toggleTarget, setToggleTarget] =
    useState<DoctorScheduleExceptionResponseDto | null>(null);

  const {
    createException,
    updateException,
    deleteException,
    isCreating,
    isUpdating,
    isDeleting,
  } = useDoctorScheduleExceptionMutations();

  const handleCreate = async (
    data: CreateDoctorScheduleExceptionDto | UpdateDoctorScheduleExceptionDto,
  ) => {
    try {
      const response = await createException.mutateAsync(
        data as CreateDoctorScheduleExceptionDto,
      );
      toast.success("Excepción por fecha creada correctamente");
      notifyOutsideAppointments(response.outsideExistingAppointmentsCount);
      setIsCreateOpen(false);
    } catch (error: unknown) {
      toast.error(
        `No se pudo crear la excepción: ${getErrorMessage(
          error,
          "Error al crear la excepción",
        )}`,
      );
    }
  };

  const handleUpdate = async (data: UpdateDoctorScheduleExceptionDto) => {
    if (!editingException) {
      return;
    }

    try {
      const response = await updateException.mutateAsync({
        id: editingException.id,
        dto: data,
        doctorId,
      });
      toast.success("Excepción por fecha actualizada correctamente");
      notifyOutsideAppointments(response.outsideExistingAppointmentsCount);
      setEditingException(null);
    } catch (error: unknown) {
      toast.error(
        `No se pudo actualizar la excepción: ${getErrorMessage(
          error,
          "Error al actualizar la excepción",
        )}`,
      );
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    try {
      await deleteException.mutateAsync({
        id: deleteTarget.id,
        doctorId,
      });
      toast.success("Excepción por fecha eliminada correctamente");
      setDeleteTarget(null);
    } catch (error: unknown) {
      toast.error(
        `No se pudo eliminar la excepción: ${getErrorMessage(
          error,
          "Error al eliminar la excepción",
        )}`,
      );
    }
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) {
      return;
    }

    try {
      const response = await updateException.mutateAsync({
        id: toggleTarget.id,
        dto: {
          isActive: !toggleTarget.isActive,
        },
        doctorId,
      });

      toast.success(
        response.isActive
          ? "Excepción reactivada correctamente"
          : "Excepción desactivada correctamente",
      );
      notifyOutsideAppointments(response.outsideExistingAppointmentsCount);
      setToggleTarget(null);
    } catch (error: unknown) {
      toast.error(
        `No se pudo actualizar el estado: ${getErrorMessage(
          error,
          "Error al actualizar el estado",
        )}`,
      );
    }
  };

  const isMutating = isCreating || isUpdating || isDeleting;

  return (
    <>
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarRange className="h-5 w-5" />
              Excepciones por fecha
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Para un día puntual, este horario reemplaza la agenda habitual y
              también se publica para reserva online.
            </p>
          </div>

          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar excepción
          </Button>
        </CardHeader>

        <CardContent>
          <DoctorScheduleExceptionList
            doctorId={doctorId}
            onEdit={(exception) => setEditingException(exception)}
            onDelete={(exception) => setDeleteTarget(exception)}
            onToggleActive={(exception) => setToggleTarget(exception)}
            isMutating={isMutating}
          />
        </CardContent>
      </Card>

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Agregar excepción por fecha</DialogTitle>
            <DialogDescription>
              Configure un horario puntual que reemplaza la agenda habitual de
              ese día.
            </DialogDescription>
          </DialogHeader>
          <DoctorScheduleExceptionForm
            key={`create-exception-${doctorId}-${isCreateOpen}`}
            doctorId={doctorId}
            onSubmit={handleCreate}
            onCancel={() => setIsCreateOpen(false)}
            isLoading={isCreating}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={editingException !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditingException(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar excepción por fecha</DialogTitle>
            <DialogDescription>
              Ajuste la franja horaria que reemplaza la agenda habitual en esa
              fecha.
            </DialogDescription>
          </DialogHeader>
          {editingException && (
            <DoctorScheduleExceptionForm
              key={`edit-exception-${editingException.id}`}
              doctorId={doctorId}
              initialData={editingException}
              onSubmit={handleUpdate}
              onCancel={() => setEditingException(null)}
              isLoading={isUpdating}
              submitLabel="Guardar cambios"
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar excepción por fecha?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los turnos ya asignados no se
              eliminarán, pero la fecha volverá a usar el horario habitual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={toggleTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setToggleTarget(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {toggleTarget?.isActive
                ? "¿Desactivar excepción por fecha?"
                : "¿Reactivar excepción por fecha?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {toggleTarget?.isActive
                ? "La fecha volverá a usar el horario habitual para nuevos turnos. Los ya asignados se conservarán."
                : "La fecha volverá a usar esta excepción puntual para calcular nuevos turnos disponibles."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleToggleActive}>
              {toggleTarget?.isActive ? "Desactivar" : "Reactivar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DoctorScheduleExceptionSection;
