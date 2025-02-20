import BreadcrumbComponent from "@/components/Breadcrumb";
import NutritionCard from "../Card";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { ParsedSlug } from "@/common/helpers/helpers";

interface Props {
  nutritionData: NutritionData[];
  slugParts: ParsedSlug;
  slug: string;
}

const NutritionComponent = ({ nutritionData, slug, slugParts }: Props) => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: slugParts
        ? `${slugParts.firstName} ${slugParts.lastName}`
        : "Paciente",
      href: `/pacientes/${slug}`,
    },
    {
      label: "Control Nutricional",
      href: `/pacientes/${slug}/control-nutricional`,
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <NutritionCard
        nutritionData={nutritionData}
        userId={Number(slugParts.id)}
      />
    </div>
  );
};

export default NutritionComponent;
