import BreadcrumbComponent from "@/components/Breadcrumb";
import NutritionCard from "../Card";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

interface Props {
  nutritionData: NutritionData[];
  slugParts: {
    id: number;
    formattedName: string;
  };
  slug: string;
}

const NutritionComponent = ({ nutritionData, slug, slugParts }: Props) => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: slugParts ? slugParts.formattedName : "Paciente",
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
