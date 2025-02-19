import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NutritionComponent from "@/components/Nutrition/Component";
import { usePatient } from "@/hooks/Patient/usePatient";
import { useNutritionData } from "@/hooks/Nutrition-Data/useNutritionData";

const NutritionPage = () => {
  const params = useParams();
  const slug = String(params.slug);
  const slugParts = slug.split("-");
  const id = parseInt(slugParts[slugParts.length - 1], 10);

  const { patient, isLoading } = usePatient({
    auth: true,
    id: id,
  });

  const userId = patient?.userId;

  const { data } = useNutritionData({
    auth: true,
    userId,
  });

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Cargando..."
            : `${patient?.firstName} ${patient?.lastName} - Nutrición`}
        </title>
      </Helmet>
      {patient ? (
        <NutritionComponent nutritionData={data || []} patient={patient} />
      ) : (
        <div>Cargando paciente...</div>
      )}
    </>
  );
};

export default NutritionPage;
