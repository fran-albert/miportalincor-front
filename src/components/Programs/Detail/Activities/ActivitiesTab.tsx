import { useState } from "react";
import useRoles from "@/hooks/useRoles";
import { DataTable } from "@/components/Table/table";
import { useProgramActivities } from "@/hooks/Program/useProgramActivities";
import { useActivityMutations } from "@/hooks/Program/useActivityMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { getActivityColumns } from "./columns";
import CreateActivityDialog from "./CreateActivityDialog";

interface ActivitiesTabProps {
  programId: string;
}

export default function ActivitiesTab({ programId }: ActivitiesTabProps) {
  const { isAdmin } = useRoles();
  const { activities, isFetching } = useProgramActivities(programId);
  const { deleteActivityMutation } = useActivityMutations(programId);
  const { promiseToast } = useToastContext();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const handleDelete = async (activityId: string) => {
    try {
      const promise = deleteActivityMutation.mutateAsync(activityId);
      await promiseToast(promise, {
        loading: { title: "Eliminando...", description: "Procesando" },
        success: {
          title: "Actividad eliminada",
          description: "La actividad fue eliminada.",
        },
        error: () => ({
          title: "Error",
          description: "No se pudo eliminar la actividad.",
        }),
      });
    } catch (error) {
      console.error("Error deleting activity:", error);
    }
  };

  const columns = getActivityColumns(programId, isAdmin, handleDelete);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={activities}
        showSearch
        canAddUser={isAdmin}
        onAddClick={() => setIsCreateOpen(true)}
        addLinkPath=""
        addLinkText="Crear Actividad"
        isFetching={isFetching}
      />
      <CreateActivityDialog
        programId={programId}
        isOpen={isCreateOpen}
        setIsOpen={setIsCreateOpen}
      />
    </div>
  );
}
