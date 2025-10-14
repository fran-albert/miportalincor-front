import { getColumns } from "./columns";
import { useState } from "react";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import EditHealthInsuranceDialog from "../Edit";
import { PageHeader } from "@/components/PageHeader";
import AddHealthInsuranceDialog from "../Add/button";
import { Shield } from "lucide-react";

export const HealthInsuranceTable = ({
  healthInsurances,
}: {
  healthInsurances: HealthInsurance[];
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHealthInsurance, setEditingHealthInsurance] =
    useState<HealthInsurance | null>(null);
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const [isAddHealthInsuranceDialogOpen, setIsAddHealthInsuranceDialogOpen] =
    useState(false);
  const openAddHealthInsuranceDialog = () =>
    setIsAddHealthInsuranceDialogOpen(true);

  const handleEditHealthInsurance = (HealthInsurance: HealthInsurance) => {
    setEditingHealthInsurance(HealthInsurance);
    setIsEditDialogOpen(true);
  };
  const customFilterFunction = (
    healthInsurance: HealthInsurance,
    query: string
  ) => healthInsurance.name.toLowerCase().includes(query.toLowerCase());

  const healthInsuranceColumns = getColumns(
    isDoctor,
    handleEditHealthInsurance
  );

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Obras Sociales" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Obras Sociales"
        description="Administra las obras sociales y planes de salud"
        icon={<Shield className="h-6 w-6" />}
        badge={healthInsurances.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={healthInsuranceColumns}
          data={healthInsurances}
          searchPlaceholder="Buscar obra social..."
          showSearch={true}
          onAddClick={openAddHealthInsuranceDialog}
          searchColumn="name"
          addLinkPath=""
          addLinkText="Agregar Obra Social"
          customFilter={customFilterFunction}
          canAddUser={isSecretary || isAdmin}
        />
        <AddHealthInsuranceDialog
          isOpen={isAddHealthInsuranceDialogOpen}
          setIsOpen={setIsAddHealthInsuranceDialogOpen}
        />
        {isEditDialogOpen && editingHealthInsurance && (
          <EditHealthInsuranceDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            healthInsurance={editingHealthInsurance}
          />
        )}
      </div>
    </div>
  );
};
