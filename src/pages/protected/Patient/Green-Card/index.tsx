import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { GreenCardView } from "@/components/Green-Card/GreenCardView";
import { useMyCardForPatient } from "@/hooks/Green-Card/useGreenCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Pill } from "lucide-react";
import useUserRole from "@/hooks/useRoles";
import { PageHeader } from "@/components/PageHeader";

const PatientGreenCardPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const { isDoctor } = useUserRole();

  const {
    patient,
    isLoading: isLoadingPatient,
    error: patientError,
  } = usePatient({
    auth: true,
    id,
  });

  const {
    greenCard,
    isLoading: isLoadingCard,
    error: cardError,
  } = useMyCardForPatient({
    patientUserId: patient?.id || "",
    enabled: !!patient?.id,
  });

  const isFirstLoadingPatient = isLoadingPatient && !patient;

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${slug}`,
    },
    { label: "Cartón Verde" },
  ];

  if (isFirstLoadingPatient) {
    return (
      <div className="space-y-4 p-6">
        <div className="md:grid md:grid-cols-[320px_1fr] gap-6">
          <PatientCardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {isLoadingPatient
            ? "Paciente"
            : `${patient?.firstName} ${patient?.lastName} - Cartón Verde`}
        </title>
        <meta
          name="description"
          content={`Cartoncito verde del paciente ${patient?.firstName}.`}
        />
        <meta
          name="keywords"
          content={`paciente, ${patient?.firstName}, medicación, cartón verde`}
        />
      </Helmet>

      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title={`Cartón Verde - ${patient?.firstName} ${patient?.lastName}`}
          description="Gestiona la medicación habitual del paciente"
          icon={<Pill className="h-6 w-6" />}
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
                Hubo un error al cargar el cartón verde.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoadingCard ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-500">Cargando cartón verde...</p>
            </CardContent>
          </Card>
        ) : greenCard ? (
          <GreenCardView
            greenCard={greenCard}
            isDoctor={isDoctor}
            isPatient={false}
          />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No hay cartón verde disponible para este paciente
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default PatientGreenCardPage;
