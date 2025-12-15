import { Helmet } from "react-helmet-async";
import { FileText } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import PatientPrescriptionRequests from "@/components/Prescription-Request/Patient";
import { useAvailableDoctorsForPrescriptions } from "@/hooks/Doctor-Settings/useDoctorSettings";

const MyPrescriptionRequestsPage = () => {
  // Get doctors that accept prescription requests
  const {
    data: availableDoctors = [],
    isLoading: isLoadingDoctors,
  } = useAvailableDoctorsForPrescriptions();

  // Transform to the format expected by the component
  const doctorOptions = availableDoctors.map((doctor) => ({
    id: doctor.id,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    gender: doctor.gender,
    specialities: doctor.specialities?.map((s) => s.name) || [],
    notes: doctor.notes,
  }));

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mis Solicitudes de Recetas" },
  ];

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Mis Solicitudes de Recetas</title>
      </Helmet>

      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mis Solicitudes de Recetas"
        description="Solicite recetas a sus medicos y consulte el estado de sus solicitudes"
        icon={<FileText className="h-6 w-6" />}
      />

      <PatientPrescriptionRequests
        doctors={doctorOptions}
        isLoadingDoctors={isLoadingDoctors}
      />
    </div>
  );
};

export default MyPrescriptionRequestsPage;
