import { Doctor } from "@/types/Doctor/Doctor";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { DoctorDashboardSkeleton } from "@/components/Skeleton/Doctor";
import DoctorDashboard from "@/pages/protected/Doctor/Dashboard";

interface DoctorComponentProps {
  doctor: Doctor | undefined;
  isLoadingDoctor: boolean;
}

export function DoctorDashboardComponent({
  doctor,
  isLoadingDoctor,
}: DoctorComponentProps) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Médicos", href: "/medicos" },
    {
      label: doctor ? `${doctor.firstName} ${doctor.lastName}` : "Médico",
      href: doctor ? `/medicos/${doctor.slug}` : "/medicos",
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="gap-6">
        {isLoadingDoctor ? (
          <DoctorDashboardSkeleton />
        ) : doctor ? (
          <DoctorDashboard doctor={doctor} />
        ) : (
          <div className="p-4 text-red-500">
            Médico no encontrado
          </div>
        )}
      </div>
    </div>
  );
}