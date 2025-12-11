import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { ArrowLeft, Calendar, Plus, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { DoctorSelect } from "@/components/Appointments/Select/DoctorSelect";
import { AvailabilityForm, AvailabilityList } from "@/components/DoctorAvailability";
import { useDoctorAvailabilityMutations } from "@/hooks/DoctorAvailability";
import { CreateDoctorAvailabilityDto } from "@/types/DoctorAvailability";
import { useToast } from "@/hooks/use-toast";

const DoctorSchedulePage = () => {
  const { toast } = useToast();
  const [selectedDoctorId, setSelectedDoctorId] = useState<number | undefined>();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const {
    createAvailability,
    deleteAvailability,
    isCreating,
    isDeleting
  } = useDoctorAvailabilityMutations();

  const handleCreate = async (data: CreateDoctorAvailabilityDto) => {
    try {
      await createAvailability.mutateAsync(data);
      toast({
        title: "Disponibilidad creada",
        description: "La disponibilidad se guardó correctamente",
      });
      setIsFormOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo guardar la disponibilidad";
      toast({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !selectedDoctorId) return;

    try {
      await deleteAvailability.mutateAsync({ id: deleteId, doctorId: selectedDoctorId });
      toast({
        title: "Disponibilidad eliminada",
        description: "La disponibilidad se eliminó correctamente",
      });
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar la disponibilidad";
      toast({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 p-6 min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-greenPrimary flex items-center gap-3">
            <Clock className="h-8 w-8" />
            Horarios de Médicos
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure los horarios de atención de cada médico
          </p>
        </div>
        <Link to="/turnos">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Turnos
          </Button>
        </Link>
      </div>

      {/* Doctor Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Seleccionar Médico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <DoctorSelect
              value={selectedDoctorId}
              onValueChange={setSelectedDoctorId}
              placeholder="Seleccione un médico para ver/editar sus horarios"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability Management */}
      {selectedDoctorId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Horarios de Atención</CardTitle>
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Horario
            </Button>
          </CardHeader>
          <CardContent>
            <AvailabilityList
              doctorId={selectedDoctorId}
              onDelete={(id) => setDeleteId(id)}
              isDeleting={isDeleting}
            />
          </CardContent>
        </Card>
      )}

      {/* Create Dialog - only render when doctor is selected */}
      {selectedDoctorId !== undefined && (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Agregar Disponibilidad</DialogTitle>
              <DialogDescription>
                Configure un nuevo horario de atención para el médico
              </DialogDescription>
            </DialogHeader>
            <AvailabilityForm
              key={`form-${selectedDoctorId}-${isFormOpen}`}
              doctorId={selectedDoctorId}
              onSubmit={handleCreate}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isCreating}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar disponibilidad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Los turnos ya asignados no se verán afectados.
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
    </div>
  );
};

export default DoctorSchedulePage;
