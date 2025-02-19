import BreadcrumbComponent from "@/components/Breadcrumb";
import { Patient } from "@/types/Patient/Patient";
import NutritionCard from "../Card";
import { NutritionData } from "@/types/Nutrition-Data/NutritionData";

interface Props {
  nutritionData: NutritionData[];
  patient: Patient;
}

const NutritionComponent = ({ nutritionData, patient }: Props) => {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Pacientes", href: "/pacientes" },
    {
      label: patient ? `${patient.firstName} ${patient.lastName}` : "Paciente",
      href: `/pacientes/${patient?.slug}`,
    },
    {
      label: "Control Nutricional",
      href: `/pacientes/${patient?.slug}/control-nutricional`,
    },
  ];

  return (
    <div className="container space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <NutritionCard
        nutritionData={nutritionData}
        userId={Number(patient.userId)}
      />
    </div>
  );
};

export default NutritionComponent;
