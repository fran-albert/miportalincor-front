import { useState } from "react";
import { DataTable } from "@/components/Table/table";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { useMemberMutations } from "@/hooks/Program/useMemberMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { getMemberColumns } from "./columns";
import AddMemberDialog from "./AddMemberDialog";

interface MembersTabProps {
  programId: string;
}

export default function MembersTab({ programId }: MembersTabProps) {
  const { members, isFetching, isCoordinator } = useProgramMembership(programId);
  const { removeMemberMutation } = useMemberMutations(programId);
  const { promiseToast } = useToastContext();
  const [isAddOpen, setIsAddOpen] = useState(false);

  const handleRemove = async (memberId: string) => {
    try {
      const promise = removeMemberMutation.mutateAsync(memberId);
      await promiseToast(promise, {
        loading: { title: "Removiendo...", description: "Procesando" },
        success: {
          title: "Miembro removido",
          description: "El miembro fue removido del programa.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo remover el miembro.",
        }),
      });
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const columns = getMemberColumns(isCoordinator, handleRemove);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={members}
        showSearch
        canAddUser={isCoordinator}
        onAddClick={() => setIsAddOpen(true)}
        addLinkPath=""
        addLinkText="Agregar Miembro"
        isFetching={isFetching}
      />
      <AddMemberDialog
        programId={programId}
        isOpen={isAddOpen}
        setIsOpen={setIsAddOpen}
      />
    </div>
  );
}
