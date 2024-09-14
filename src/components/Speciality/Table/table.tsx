import { getColumns } from "./columns";
import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { Speciality } from "@/types/Speciality/Speciality";
import AddSpecialityDialog from "@/components/Button/Add/Speciality/button";
import EditSpecialityDialog from "../Edit";

export const SpecialityTable = ({
  specialities,
}: {
  specialities: Speciality[];
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(
    null
  );
  const { isSecretary, isDoctor } = useRoles();
  const [isAddSpecialityDialogOpen, setIsAddSpecialityDialogOpen] =
    useState(false);
  const openAddSpecialityDialog = () => setIsAddSpecialityDialogOpen(true);

  const handleEditSpeciality = (speciality: Speciality) => {
    setEditingSpeciality(speciality);
    setIsEditDialogOpen(true);
  };

  const specialityColumns = getColumns(isDoctor, handleEditSpeciality);

  const customFilterFunction = (speciality: Speciality, query: string) =>
    speciality.name.toLowerCase().includes(query.toLowerCase());

  return (
    <div>
      <h2 className="text-2xl font-semibold text-center mt-6 text-greenPrimary">
        Lista de Especialidades
      </h2>
      <div className="overflow-hidden sm:rounded-lg p-4 ">
        <DataTable
          columns={specialityColumns}
          data={specialities}
          searchPlaceholder="Buscar especialidad..."
          showSearch={true}
          onAddClick={openAddSpecialityDialog}
          customFilter={customFilterFunction}
          addLinkPath=""
          addLinkText="Agregar Especialidad"
          canAddUser={isSecretary}
        />
        <AddSpecialityDialog
          isOpen={isAddSpecialityDialogOpen}
          setIsOpen={setIsAddSpecialityDialogOpen}
        />
        {isEditDialogOpen && editingSpeciality && (
          <EditSpecialityDialog
            isOpen={isEditDialogOpen}
            setIsOpen={setIsEditDialogOpen}
            speciality={editingSpeciality}
          />
        )}
      </div>
    </div>
  );
};
