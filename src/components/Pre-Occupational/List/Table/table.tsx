import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { useState } from "react";
import CreateExamDialog from "../Dialog";
import { DataTable } from "@/components/Table/Table-List-Examns/table";
import { useEvaluationType } from "@/hooks/Evaluation-Type/useEvaluationTypes";
import CollaboratorInformationCard from "../../Collaborator-Information";
import { Collaborator } from "@/types/Collaborator/Collaborator";

interface Props {
  data: CollaboratorMedicalEvaluation[];
  isFetching?: boolean;
  slug: string;
  collaborator: Collaborator;
}

export const ListPreoccupationalExamsTable: React.FC<Props> = ({
  data,
  isFetching,
  collaborator,
  slug,
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { evaluationTypes } = useEvaluationType({ auth: true });
  const openDialog = () => setIsDialogOpen(true);
  const columns = getColumns(slug, {
    isSecretary,
    isDoctor,
    isAdmin,
  });

  return (
    <>
      <CollaboratorInformationCard
        collaborator={collaborator}
        canEdit={true}
        onEditClick={() => console.log("Editar colaborador")}
      />
      <DataTable
        columns={columns}
        data={data}
        evaluationTypes={evaluationTypes}
        isFetching={isFetching}
        onAddClick={openDialog}
      />
      <CreateExamDialog
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        slug={slug}
      />
    </>
  );
};
