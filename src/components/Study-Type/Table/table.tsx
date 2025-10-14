import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { useState } from "react";
import AddStudyTypeDialog from "../Create/button";
import EditStudyTypeDialog from "../Edit";
import { FileText } from "lucide-react";
interface Props {
  studyTypes: StudyType[];
}

export const StudyTypeTable: React.FC<Props> = ({ studyTypes }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudyType, setEditingStudyType] = useState<StudyType | null>(
    null
  );
  const { isAdmin } = useRoles();
  const [isAddStudyTypeDialogOpen, setIsAddStudyTypeDialogOpen] =
    useState(false);
  const openAddStudyTypeDialog = () => setIsAddStudyTypeDialogOpen(true);

  const handleEditStudyType = (studyType: StudyType) => {
    setEditingStudyType(studyType);
    setIsEditDialogOpen(true);
  };

  const studyTypeColumns = getColumns(isAdmin, handleEditStudyType);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Tipos de Estudios" },
  ];

  const customFilterFunction = (studyType: StudyType, query: string) =>
    studyType.name.toLowerCase().includes(query.toLowerCase());
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Tipos de Estudios"
        description="Administra las categorías de estudios médicos disponibles"
        icon={<FileText className="h-6 w-6" />}
        badge={studyTypes.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={studyTypeColumns}
          data={studyTypes}
          searchPlaceholder="Buscar tipos de estudios..."
          showSearch={true}
          addLinkPath="/tipos-de-estudios/agregar"
          customFilter={customFilterFunction}
          addLinkText="Agregar Tipo de Estudio"
          canAddUser={isAdmin}
          onAddClick={openAddStudyTypeDialog}
        />
        <AddStudyTypeDialog
          isOpen={isAddStudyTypeDialogOpen}
          setIsOpen={setIsAddStudyTypeDialogOpen}
        />
        {isEditDialogOpen && editingStudyType && (
          <EditStudyTypeDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            studyType={editingStudyType}
          />
        )}
      </div>
    </div>
  );
};
