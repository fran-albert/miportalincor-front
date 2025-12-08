import { useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NutritionComponent from "@/components/Nutrition/Component";
import { useNutritionData } from "@/hooks/Nutrition-Data/useNutritionData";
import { usePatient } from "@/hooks/Patient/usePatient";

const NutritionPage = () => {
  const params = useParams();
  const location = useLocation();
  const slug = String(params.slug);

  // Extraer el ID del slug (último segmento)
  const slugParts = slug.split("-");
  const patientId = slugParts[slugParts.length - 1];
  const formattedName = slugParts.slice(0, -1).map(
    word => word.charAt(0).toUpperCase() + word.slice(1)
  ).join(" ");

  // Obtener el paciente para conseguir su userId
  const { patient, isLoading: isLoadingPatient } = usePatient({
    auth: true,
    id: patientId,
  });

  // Obtener datos de nutrición usando el id (UUID) del paciente
  const { data, isLoading: isLoadingNutrition } = useNutritionData({
    auth: true,
    userId: patient?.id,
  });

  const role = location.pathname.includes("/medicos/") ? "doctor" : "patient";
  const isLoading = isLoadingPatient || isLoadingNutrition;

  return (
    <>
      <Helmet>
        <title>
          {isLoading ? "Cargando..." : `${patient?.firstName || formattedName} - Nutrición`}
        </title>
      </Helmet>
      {slug && patient ? (
        <NutritionComponent
          nutritionData={data || []}
          slug={slug}
          slugParts={{
            id: patient.id,
            formattedName: `${patient.firstName} ${patient.lastName}`
          }}
          role={role}
        />
      ) : (
        <div>Cargando paciente...</div>
      )}
    </>
  );
};

export default NutritionPage;
