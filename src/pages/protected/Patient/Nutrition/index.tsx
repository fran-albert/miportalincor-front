import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NutritionComponent from "@/components/Nutrition/Component";
import { useNutritionData } from "@/hooks/Nutrition-Data/useNutritionData";
import { parseSlug } from "@/common/helpers/helpers";

const NutritionPage = () => {
  const params = useParams();
  const slug = String(params.slug);
  const { id: userId, formattedName } = parseSlug(slug);
  const { data, isLoading } = useNutritionData({
    auth: true,
    userId,
  });

  return (
    <>
      <Helmet>
        <title>
          {isLoading ? "Cargando..." : `${formattedName} - Nutrición`}
        </title>
      </Helmet>
      {slug ? (
        <NutritionComponent
          nutritionData={data || []}
          slug={slug}
          slugParts={{ id: userId, formattedName }}
        />
      ) : (
        <div>Cargando paciente...</div>
      )}
    </>
  );
};

export default NutritionPage;
