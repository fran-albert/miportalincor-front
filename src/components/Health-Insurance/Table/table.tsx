import { getColumns } from "./columns";
import { useState } from "react";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import EditHealthInsuranceDialog from "../Edit";
import BreadcrumbComponent from "@/components/Breadcrumb";
import AddHealthInsuranceDialog from "../Add/button";

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
    { label: "Obras Sociales", href: "/obras-sociales" },
  ];

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Obras Sociales
      </h2>
      <div className="overflow-hidden sm:rounded-lg p-4 ">
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
