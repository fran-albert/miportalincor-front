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
  role: "patient" | "doctor";
}

const NutritionComponent = ({ nutritionData, slug, slugParts, role }: Props) => {
  const baseRoute = role === "patient" ? "pacientes" : "medicos";
  
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: role === "patient" ? "Pacientes" : "Medicos", href: `/${baseRoute}` },
    {
      label: slugParts ? slugParts.formattedName : (role === "patient" ? "Paciente" : "Doctor"),
      href: `/${baseRoute}/${slug}`,
    },
    {
      label: "Control Nutricional",
      href: `/${baseRoute}/${slug}/control-nutricional`,
    },
  ];

  const [firstName, ...last] = slugParts.formattedName.split(" ");
  const lastName = last.join(" ");

  return (
    <div className="space-y-4 p-6">
      <BreadcrumbComponent items={breadcrumbItems} />
      <NutritionCard
        nutritionData={nutritionData}
        userName={firstName}
        userLastname={lastName}
        userId={Number(slugParts.id)}
      />
    </div>
  );
};

export default NutritionComponent;
