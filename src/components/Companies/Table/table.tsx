import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Company } from "@/types/Company/Company";
import CreateCompanyDialog from "../Create";
import { useState } from "react";
import { Building2 } from "lucide-react";

interface Props {
  companies: Company[];
  isFetching?: boolean;
  prefetchCompanies: (id: number) => void;
}

export const CompaniesTable: React.FC<Props> = ({ companies, isFetching, prefetchCompanies }) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const openDialog = () => setIsDialogOpen(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const columns = getColumns(
    prefetchCompanies,
    {
      isSecretary,
      isDoctor,
      isAdmin,
    }
  );

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
    { label: "Empresas" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Empresas"
        description="Gestiona empresas y clientes corporativos del centro médico"
        icon={<Building2 className="h-6 w-6" />}
        badge={companies.length}
      />
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
