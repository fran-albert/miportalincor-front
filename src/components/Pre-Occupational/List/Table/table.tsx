import { getColumns } from "./columns";
import useRoles from "@/hooks/useRoles";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { useState } from "react";
import CreateExamDialog from "../Dialog";
import { DataTable } from "@/components/Table/Table-List-Examns/table";
import CollaboratorInformationCard from "../../Collaborator-Information";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { EvaluationType } from "@/types/Evaluation-Type/Evaluation-Type";

interface Props {
  data: CollaboratorMedicalEvaluation[];
  isFetching?: boolean;
  slug: string;
  collaborator: Collaborator;
  evaluationTypes: EvaluationType[];
}

export const ListPreoccupationalExamsTable: React.FC<Props> = ({
  data,
  isFetching,
  collaborator,
  slug,
  evaluationTypes,
}) => {
  const { isSecretary, isAdmin } = useRoles();
  const canEdit = isSecretary || isAdmin;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const columns = getColumns(slug, collaborator);

  return (
    <>
      <CollaboratorInformationCard
        collaborator={collaborator}
        canEdit={canEdit}
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
