import { useState } from "react";
import { Helmet } from "react-helmet-async";
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
import { PageHeader } from "@/components/PageHeader";

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

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Turnos", href: "/turnos" },
    { label: "Horarios de Médicos" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Horarios de Médicos</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Horarios de Médicos"
        description="Configure los horarios de atención de cada médico"
        icon={<Clock className="h-6 w-6" />}
        actions={
          <Link to="/turnos">
            <Button variant="outline" className="shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Turnos
            </Button>
          </Link>
        }
      />

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
