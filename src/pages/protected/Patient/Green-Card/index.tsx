import { usePatient } from "@/hooks/Patient/usePatient";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { PatientCardSkeleton } from "@/components/Skeleton/Patient";
import { GreenCardView } from "@/components/Green-Card/GreenCardView";
import { useMyCardForPatient } from "@/hooks/Green-Card/useGreenCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Loader2 } from "lucide-react";
import useUserRole from "@/hooks/useRoles";

const PatientGreenCardPage = () => {
  const params = useParams();
  const slug = params.slug;
  const slugString = slug as string;
  const slugParts = slugString.split("-");
  const id = slugParts[slugParts.length - 1];

  const { isDoctor } = useUserRole();
  const navigate = useNavigate();

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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cartón Verde - {patient?.firstName} {patient?.lastName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Gestiona la medicación habitual del paciente
            </p>
          </div>
        </div>

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
