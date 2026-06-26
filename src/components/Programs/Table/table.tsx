import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { Program } from "@/types/Program/Program";
import { getColumns } from "./columns";
import { PageHeader } from "@/components/PageHeader";
import CreateProgramDialog from "../Create";
import EditProgramDialog from "../Edit";
import { GraduationCap } from "lucide-react";

interface ProgramsTableProps {
  programs: Program[];
  isFetching?: boolean;
}

export const ProgramsTable = ({ programs, isFetching }: ProgramsTableProps) => {
  const { isAdmin } = useRoles();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleEdit = (program: Program) => {
    setEditingProgram(program);
    setIsEditOpen(true);
  };

  const columns = getColumns(isAdmin, handleEdit);

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Programas" },
  ];

  const customFilterFunction = (program: Program, query: string) =>
    program.name.toLowerCase().includes(query.toLowerCase()) ||
    (program.description?.toLowerCase().includes(query.toLowerCase()) ??
      false);

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Programas"
        description="Gestiona los programas de salud del centro médico"
        icon={<GraduationCap className="h-6 w-6" />}
        badge={programs.length}
      />
      <div className="overflow-hidden sm:rounded-lg">
        <DataTable
          columns={columns}
          data={programs}
          searchPlaceholder="Buscar programa..."
          showSearch={true}
          onAddClick={() => setIsCreateOpen(true)}
          customFilter={customFilterFunction}
          addLinkPath=""
          addLinkText="Crear Programa"
          canAddUser={isAdmin}
          isFetching={isFetching}
        />
        <CreateProgramDialog
          isOpen={isCreateOpen}
          setIsOpen={setIsCreateOpen}
        />
        {isEditOpen && editingProgram && (
          <EditProgramDialog
            isOpen={isEditOpen}
            setIsOpen={setIsEditOpen}
            program={editingProgram}
          />
        )}
      </div>
    </div>
  );
};
