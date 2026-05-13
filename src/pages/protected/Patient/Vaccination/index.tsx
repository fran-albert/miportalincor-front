import { Helmet } from "react-helmet-async";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2, Syringe } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { VaccinationCardView } from "@/components/Vaccination/VaccinationCardView";
import { usePatient } from "@/hooks/Patient/usePatient";
import { usePatientVaccinationCard } from "@/hooks/Vaccination/useVaccinationCard";

const PatientVaccinationPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const {
    patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = usePatient({
    auth: true,
    id,
  });

  const {
    vaccinationCard,
    isLoading: isLoadingCard,
    error: cardError,
  } = usePatientVaccinationCard({
    patientUserId: patient?.id || "",
    enabled: Boolean(patient?.id),
  });

  const isFirstLoadingPatient = isLoadingPatient && !patient;
  const patientName = patient
    ? `${patient.firstName} ${patient.lastName}`
    : "Paciente";

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patientName,
      href: `/pacientes/${slug}`,
    },
    { label: "Vacunacion" },
  ];

  if (isFirstLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="gap-6 md:grid md:grid-cols-[320px_1fr]">
          <PatientCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${patientName} - Carnet de vacunacion`}</title>
        <meta
          name="description"
          content={`Carnet de vacunacion del paciente ${patient?.firstName}.`}
        />
      </Helmet>

      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={`Vacunacion - ${patientName}`}
          description="Consulta pendientes y registra vacunas aplicadas"
          icon={<Syringe className="h-6 w-6" />}
          actions={
            <Link to={`/pacientes/${slug}`}>
              <Button variant="outline" className="shadow-sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
            </Link>
          }
        />

        {patientError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600">
                Hubo un error al cargar los datos del paciente.
              </p>
            </CardContent>
          </Card>
        )}

        {cardError && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600">
                Hubo un error al cargar el carnet de vacunacion.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoadingCard ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-green-600" />
              <p className="text-gray-500">Cargando carnet...</p>
            </CardContent>
          </Card>
        ) : vaccinationCard ? (
          <VaccinationCardView vaccinationCard={vaccinationCard} isDoctor />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No hay carnet de vacunacion disponible para este paciente.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default PatientVaccinationPage;
