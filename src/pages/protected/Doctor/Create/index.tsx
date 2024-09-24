import BreadcrumbComponent from "@/components/Breadcrumb";
import CreateDoctorComponent from "@/components/Doctors/Create/CreateDoctorForm";

const breadcrumbItems = [
  { label: "Inicio", href: "/inicio" },
  { label: "Médicos", href: "/medicos" },
  { label: "Agregar Médico", href: "/medicos/agregar" },
];

const CreateDoctorPage = () => {
  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="">
        <CreateDoctorComponent />
      </div>
    </div>
  );
};

export default CreateDoctorPage;
