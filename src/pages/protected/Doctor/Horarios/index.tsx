import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import { ArrowLeft, Plus, Clock, Settings } from "lucide-react";
import { AvailabilityForm, AvailabilityList } from "@/components/DoctorAvailability";
import { BookingSettingsToggle } from "@/components/DoctorBookingSettings";
import { useDoctorAvailabilityMutations } from "@/hooks/DoctorAvailability";
import { CreateDoctorAvailabilityDto } from "@/types/DoctorAvailability";
import { toast } from "sonner";
import { PageHeader } from "@/components/PageHeader";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { Skeleton } from "@/components/ui/skeleton";

const DoctorHorariosPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const slugParts = slug.split("-");
  const id = slugParts[slugParts.length - 1];

  const { isLoading, doctor, error } = useDoctor({ auth: true, id });
  const doctorId = doctor?.userId ? Number(doctor.userId) : undefined;

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
      toast.success("Disponibilidad creada correctamente");
      setIsFormOpen(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo guardar la disponibilidad";
      toast.error(`No se pudo crear la disponibilidad: ${errorMessage}`);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !doctorId) return;

    try {
      await deleteAvailability.mutateAsync({ id: deleteId, doctorId });
      toast.success("Disponibilidad eliminada correctamente");
      setDeleteId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar la disponibilidad";
      toast.error(`No se pudo eliminar la disponibilidad: ${errorMessage}`);
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${slug}`
    },
    { label: "Horarios" },
  ];

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center text-red-500">
          Error al cargar los datos del médico: {error.message}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>
          {doctor ? `Horarios - ${doctor.firstName} ${doctor.lastName}` : "Horarios"}
        </title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={doctor ? `Horarios de ${doctor.firstName} ${doctor.lastName}` : "Horarios"}
        description="Configure los horarios de atención del médico"
        icon={<Clock className="h-6 w-6" />}
        actions={
          <Link to={`/medicos/${slug}`}>
            <Button variant="outline" className="shadow-sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </Link>
        }
      />

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : doctorId ? (
        <>
          {/* Booking Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración de Reservas Online
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BookingSettingsToggle doctorId={doctorId} />
            </CardContent>
          </Card>

          {/* Availability Management */}
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
                doctorId={doctorId}
                onDelete={(id) => setDeleteId(id)}
                isDeleting={isDeleting}
              />
            </CardContent>
          </Card>

          {/* Create Dialog */}
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Agregar Disponibilidad</DialogTitle>
                <DialogDescription>
                  Configure un nuevo horario de atención para el médico
                </DialogDescription>
              </DialogHeader>
              <AvailabilityForm
                key={`form-${doctorId}-${isFormOpen}`}
                doctorId={doctorId}
                onSubmit={handleCreate}
                onCancel={() => setIsFormOpen(false)}
                isLoading={isCreating}
              />
            </DialogContent>
          </Dialog>

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
        </>
      ) : null}
    </div>
  );
};

export default DoctorHorariosPage;
