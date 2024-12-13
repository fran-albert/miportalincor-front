import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { useState } from "react";
import AddStudyTypeDialog from "../Create/button";
import EditStudyTypeDialog from "../Edit";
interface Props {
  studyTypes: StudyType[];
}

export const StudyTypeTable: React.FC<Props> = ({ studyTypes }) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingStudyType, setEditingStudyType] = useState<StudyType | null>(
    null
  );
  const { isSecretary, isDoctor } = useRoles();
  const [isAddStudyTypeDialogOpen, setIsAddStudyTypeDialogOpen] =
    useState(false);
  const openAddStudyTypeDialog = () => setIsAddStudyTypeDialogOpen(true);

  const handleEditStudyType = (studyType: StudyType) => {
    setEditingStudyType(studyType);
    setIsEditDialogOpen(true);
  };

  const studyTypeColumns = getColumns(isDoctor, handleEditStudyType);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Tipos de Estudios", href: "/tipos-de-estudios" },
  ];

  const customFilterFunction = (studyType: StudyType, query: string) =>
    studyType.name.toLowerCase().includes(query.toLowerCase());
  return (
    <div className=" space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <h2 className="text-2xl font-bold text-greenPrimary mb-6">
        Lista de Tipos de Estudios
      </h2>
      <div className="overflow-hidden sm:rounded-lg ">
        <DataTable
          columns={studyTypeColumns}
          data={studyTypes}
          searchPlaceholder="Buscar tipos de estudios..."
          showSearch={true}
          addLinkPath="/tipos-de-estudios/agregar"
          customFilter={customFilterFunction}
          addLinkText="Agregar Tipo de Estudio"
          canAddUser={isSecretary}
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
