import { useParams, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import NutritionComponent from "@/components/Nutrition/Component";
import { useNutritionData } from "@/hooks/Nutrition-Data/useNutritionData";
import { parseSlug } from "@/common/helpers/helpers";

const NutritionPage = () => {
  const params = useParams();
  const location = useLocation();
  const slug = String(params.slug);
  const { id: userId, formattedName } = parseSlug(slug);
  const { data, isLoading } = useNutritionData({
    auth: true,
    userId,
  });

  const role = location.pathname.includes("/medicos/") ? "doctor" : "patient";

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
          role={role} // se pasa la propiedad role
        />
      ) : (
        <div>Cargando paciente...</div>
      )}
    </>
  );
};

export default NutritionPage;
