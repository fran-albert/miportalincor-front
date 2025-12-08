import BreadcrumbComponent from "@/components/Breadcrumb";
import NutritionCard from "../Card";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";
import { motion } from "framer-motion";

interface Props {
  nutritionData: NutritionData[];
  slugParts: {
    id: string;
    formattedName: string;
  };
  slug: string;
  role: "patient" | "doctor";
}

const NutritionComponent = ({
  nutritionData,
  slug,
  slugParts,
  role,
}: Props) => {
  const baseRoute = role === "patient" ? "pacientes" : "medicos";

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    {
      label: role === "patient" ? "Pacientes" : "Medicos",
      href: `/${baseRoute}`,
    },
    {
      label: slugParts
        ? slugParts.formattedName
        : role === "patient"
        ? "Paciente"
        : "Doctor",
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 p-6"
    >
      <BreadcrumbComponent items={breadcrumbItems} />
      <NutritionCard
        nutritionData={nutritionData}
        userName={firstName}
        userLastname={lastName}
        userId={slugParts.id}
      />
    </motion.div>
  );
};

export default NutritionComponent;
