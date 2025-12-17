import { getColumns } from "./columns";
import { Secretary } from "@/types/Secretary/Secretary";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { UserCog } from "lucide-react";

interface SecretariesTableProps {
  secretaries: Secretary[];
  isLoading?: boolean;
}

export const SecretariesTable: React.FC<SecretariesTableProps> = ({
  secretaries,
  isLoading,
}) => {
  const secretaryColumns = getColumns();

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Secretarias" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Secretarias"
        description="Administra las secretarias del sistema"
        icon={<UserCog className="h-6 w-6" />}
        badge={secretaries.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={secretaryColumns}
          data={secretaries}
          searchPlaceholder="Buscar secretarias..."
          showSearch={true}
          addLinkPath="/secretarias/agregar"
          isLoading={isLoading}
          addLinkText="Agregar Secretaria"
          canAddUser={true}
        />
      </div>
    </div>
  );
};
