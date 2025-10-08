import { getColumns } from "./columns";
import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { Speciality } from "@/types/Speciality/Speciality";
import EditSpecialityDialog from "../Edit";
import { PageHeader } from "@/components/PageHeader";
import AddSpecialityDialog from "../Add/button";
import { Heart } from "lucide-react";

export const SpecialityTable = ({
  specialities,
}: {
  specialities: Speciality[];
}) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSpeciality, setEditingSpeciality] = useState<Speciality | null>(
    null
  );
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const [isAddSpecialityDialogOpen, setIsAddSpecialityDialogOpen] =
    useState(false);
  const openAddSpecialityDialog = () => setIsAddSpecialityDialogOpen(true);

  const handleEditSpeciality = (speciality: Speciality) => {
    setEditingSpeciality(speciality);
    setIsEditDialogOpen(true);
  };

  const specialityColumns = getColumns(isDoctor, handleEditSpeciality);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Especialidades" },
  ];

  const customFilterFunction = (speciality: Speciality, query: string) =>
    speciality.name.toLowerCase().includes(query.toLowerCase());

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Lista de Especialidades"
        description="Configura y gestiona las especialidades médicas del centro"
        icon={<Heart className="h-6 w-6" />}
        badge={specialities.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={specialityColumns}
          data={specialities}
          searchPlaceholder="Buscar especialidad..."
          showSearch={true}
          onAddClick={openAddSpecialityDialog}
          customFilter={customFilterFunction}
          addLinkPath=""
          addLinkText="Agregar Especialidad"
          canAddUser={isSecretary || isAdmin}
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
