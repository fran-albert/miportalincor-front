import { getColumns } from "./columns";
import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import AddBlodTestDialog from "../Add/button";
import EditBlodTestDialog from "../Edit";
import useUserRole from "@/hooks/useRoles";

export const BlodTestTable = ({ blodTests }: { blodTests: BloodTest[] }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBlodTest, setEditingBlodTest] = useState<BloodTest | null>(
    null
  );
  const { isAdmin } = useUserRole();
  const [isAddBlodTestDialogOpen, setIsAddBlodTestDialogOpen] = useState(false);
  const openAddBlodTestDialog = () => setIsAddBlodTestDialogOpen(true);

  const handleEditBlodTest = (blodTest: BloodTest) => {
    setEditingBlodTest(blodTest);
    setIsEditDialogOpen(true);
  };

  const blodTestColumns = getColumns(handleEditBlodTest, {
    isAdmin,
  });

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Análisis Bioquímicos", href: "/analisis-bioquimicos" },
  ];

  const customFilterFunction = (blodTest: BloodTest, query: string) =>
    blodTest.originalName.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Análisis Bioquímicos
      </h2>
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={blodTestColumns}
          data={blodTests}
          searchPlaceholder="Buscar análisis bioquímico..."
          showSearch={true}
          onAddClick={openAddBlodTestDialog}
          customFilter={customFilterFunction}
          addLinkPath=""
          addLinkText="Agregar Análisis Bioquímico"
          canAddUser={isAdmin}
        />
        <AddBlodTestDialog
          isOpen={isAddBlodTestDialogOpen}
          setIsOpen={setIsAddBlodTestDialogOpen}
        />
        {isEditDialogOpen && editingBlodTest && (
          <EditBlodTestDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            blodTest={editingBlodTest}
          />
        )}
      </div>
    </div>
  );
};
