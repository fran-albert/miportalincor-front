import { Helmet } from "react-helmet-async";
import { Loader2, Syringe } from "lucide-react";

import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { VaccinationCardView } from "@/components/Vaccination/VaccinationCardView";
import { useMyVaccinationCard } from "@/hooks/Vaccination/useVaccinationCard";

const MyVaccinationPage = () => {
  const { vaccinationCard, isLoading, error } = useMyVaccinationCard();

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mi carnet de vacunación", preserveCase: true },
  ];

  return (
    <>
      <Helmet>
        <title>Mi carnet de vacunación</title>
        <meta
          name="description"
          content="Consulta tu carnet de vacunación."
        />
      </Helmet>

      <div className="space-y-6 p-6">
        <PageHeader
          breadcrumbItems={breadcrumbItems}
          title="Mi carnet de vacunación"
          description="Tus vacunas aplicadas, de la más reciente a la más antigua"
          icon={<Syringe className="h-6 w-6" />}
        />

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-600">
                Hubo un error al cargar tu carnet de vacunación.
              </p>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-green-600" />
              <p className="text-gray-500">Cargando carnet...</p>
            </CardContent>
          </Card>
        ) : vaccinationCard ? (
          <VaccinationCardView vaccinationCard={vaccinationCard} />
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">
                No hay carnet de vacunación disponible.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
};

export default MyVaccinationPage;
