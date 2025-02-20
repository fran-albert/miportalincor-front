import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NutritionComponent from "@/components/Nutrition/Component";
import { useNutritionData } from "@/hooks/Nutrition-Data/useNutritionData";
import { parseSlug } from "@/common/helpers/helpers";

const NutritionPage = () => {
  const params = useParams();
  const slug = String(params.slug);
  const slugParts = parseSlug(slug);
  const userId = slugParts.id;
  const { data, isLoading } = useNutritionData({
    auth: true,
    userId,
  });

  return (
    <>
      <Helmet>
        <title>
          {isLoading
            ? "Cargando..."
            : `${slugParts?.firstName} ${slugParts?.lastName} - Nutrición`}
        </title>
      </Helmet>
      {slug ? (
        <NutritionComponent
          nutritionData={data || []}
          slug={slug}
          slugParts={slugParts}
        />
      ) : (
        <div>Cargando paciente...</div>
      )}
    </>
  );
};

export default NutritionPage;
