import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bell } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { Skeleton } from "@/components/ui/skeleton";
import { DoctorNotificationSettingsCard } from "@/components/Doctor/NotificationSettings/DoctorNotificationSettingsCard";

const DoctorNotificacionesPage = () => {
  const params = useParams();
  const slug = params.slug as string;
  const slugParts = slug.split("-");
  const id = slugParts[slugParts.length - 1];

  const { isLoading, doctor, error } = useDoctor({ auth: true, id });
  const doctorId = doctor?.userId ? Number(doctor.userId) : undefined;

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: `/medicos/${slug}`
    },
    { label: "Notificaciones" },
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
          {doctor ? `Notificaciones - ${doctor.firstName} ${doctor.lastName}` : "Notificaciones"}
        </title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title={doctor ? `Notificaciones de ${doctor.firstName} ${doctor.lastName}` : "Notificaciones"}
        description="Configure las notificaciones de WhatsApp para los turnos del médico"
        icon={<Bell className="h-6 w-6" />}
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
          <Skeleton className="h-64 w-full" />
        </div>
      ) : doctorId ? (
        <DoctorNotificationSettingsCard doctorId={doctorId} />
      ) : null}
    </div>
  );
};

export default DoctorNotificacionesPage;
