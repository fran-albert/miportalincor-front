import { getColumns } from "./columns";
import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import AddBlodTestDialog from "../Add/button";
import EditBlodTestDialog from "../Edit";
import useUserRole from "@/hooks/useRoles";
import { TestTube } from "lucide-react";

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
    { label: "Análisis Bioquímicos" },
  ];

  const customFilterFunction = (blodTest: BloodTest, query: string) =>
    blodTest.originalName.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Análisis Bioquímicos"
        description="Configura y gestiona los análisis bioquímicos del laboratorio"
        icon={<TestTube className="h-6 w-6" />}
        badge={blodTests.length}
      />
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
