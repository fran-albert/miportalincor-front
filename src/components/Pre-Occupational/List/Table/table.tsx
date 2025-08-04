import { getColumns } from "./columns";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { useState } from "react";
import CreateExamDialog from "../Dialog";
import { DataTable } from "@/components/Table/Table-List-Examns/table";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const openDialog = () => setIsDialogOpen(true);
  const columns = getColumns(slug, collaborator);

  const allowedEvaluationTypes = [
    "Preocupacional",
    "Periódico",
    "Salida (Retiro)",
    "Cambio de Puesto",
    "Libreta Sanitaria",
    "Otro",
  ];

  const filteredData = data.filter(evaluation => {
    const evaluationTypeName = evaluation.medicalEvaluation?.evaluationType?.name;
    return evaluationTypeName && allowedEvaluationTypes.includes(evaluationTypeName);
  });

  const filteredEvaluationTypes = evaluationTypes.filter(type => 
    allowedEvaluationTypes.includes(type.name)
  );

  
  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        evaluationTypes={filteredEvaluationTypes}
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
