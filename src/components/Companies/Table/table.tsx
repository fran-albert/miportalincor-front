import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Company } from "@/types/Company/Company";
import CreateCompanyDialog from "../Create";
import { useState } from "react";

interface Props {
  companies: Company[];
  isFetching?: boolean;
}

export const CompaniesTable: React.FC<Props> = ({ companies, isFetching }) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const openDialog = () => setIsDialogOpen(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns = getColumns({
    isSecretary,
    isDoctor,
    isAdmin,
  });

  const customFilterFunction = (company: Company, query: string) => {
    const fullName = `${company.name.toLowerCase()}`;
    return (
      fullName.includes(query.toLowerCase()) ||
      company.taxId.toLowerCase().includes(query.toLowerCase())
    );
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    { label: "Empresas", href: "/incor-laboral/empresas" },
  ];

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Empresas
      </h2>
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={companies}
          searchPlaceholder="Buscar empresa..."
          showSearch={true}
          customFilter={customFilterFunction}
          onAddClick={openDialog}
          addLinkText="Agregar Empresa"
          isFetching={isFetching}
          canAddUser={isSecretary || isAdmin}
        />
        <CreateCompanyDialog
          isOpen={isDialogOpen}
          setIsOpen={setIsDialogOpen}
        />
      </div>
    </div>
  );
};
