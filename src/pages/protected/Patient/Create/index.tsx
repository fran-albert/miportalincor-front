import BreadcrumbComponent from "@/components/Breadcrumb";
import { CreatePatientComponent } from "@/components/Patients/Create";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Pacientes", href: "/pacientes" },
  { label: "Agregar Paciente", href: "/pacientes/agregar" },
];

const CreatePatientPage = () => {
  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="">
        <CreatePatientComponent />
      </div>
    </div>
  );
};

export default CreatePatientPage;
