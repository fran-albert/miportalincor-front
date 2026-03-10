/* eslint-disable react-refresh/only-export-components */
import { ColumnDef } from "@tanstack/react-table";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { FaFilePdf } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import ActionIcon from "@/components/Icons/action";
import { ViewButton } from "@/components/Button/View/button";
import SendEmailDialog from "@/components/Email/Dialog";
import { useGetStudyFileNameByEvaluationType } from "@/hooks/Study/useStudyFileNameByEvaluationType";
import { useGetSignedUrlByCollaboratorIdAndFileName } from "@/hooks/Study/useSignedUrlByCollaboratorAndFileName";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import DeleteMedicalEvaluation from "../Delete";
import { CollaboratorMedicalEvaluation as CollaboratorMedicalEvaluationType } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";

interface MedicalEvaluationActionsCellProps {
  collaborator: Collaborator;
  medicalEvaluationRow: CollaboratorMedicalEvaluationType;
  slug: string;
}

const MedicalEvaluationActionsCell = ({
  collaborator,
  medicalEvaluationRow,
  slug,
}: MedicalEvaluationActionsCellProps) => {
  const medicalEvaluation = medicalEvaluationRow.medicalEvaluation;
  const medicalEvaluationId = medicalEvaluation.id;
  const collaboratorId = collaborator.id;

  const { data: fileData, isLoading: loadingFileName } =
    useGetStudyFileNameByEvaluationType({
      auth: true,
      medicalEvaluationId,
    });
  const fileName = fileData?.fileName || "";

  const { data: signedUrl, isLoading: loadingSignedUrl } =
    useGetSignedUrlByCollaboratorIdAndFileName({
      auth: !!fileName,
      collaboratorId,
      fileName,
    });

  if (loadingFileName || loadingSignedUrl) {
    return <div className="w-6 h-6 bg-gray-200 animate-pulse rounded" />;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <a href={signedUrl?.url} target="_blank" rel="noopener noreferrer">
        <Button variant="ghost" size="icon">
          <ActionIcon
            tooltip="Ver PDF"
            icon={<FaFilePdf className="w-4 h-4 text-red-600" />}
          />
        </Button>
      </a>
      <SendEmailDialog
        collaborator={collaborator}
        url={String(signedUrl?.url)}
        evaluationType={medicalEvaluation.evaluationType.name}
      />
      <ViewButton
        slug={`${slug}/examen/${medicalEvaluationRow.medicalEvaluation.id}`}
        text="Ver Exámen"
        path="incor-laboral/colaboradores"
      />
      <DeleteMedicalEvaluation id={medicalEvaluationRow.id} />
    </div>
  );
};

export const getColumns = (
  slug: string,
  collaborator: Collaborator
): ColumnDef<CollaboratorMedicalEvaluation>[] => {
  const columns: ColumnDef<CollaboratorMedicalEvaluation>[] = [
    {
      accessorKey: "#",
      header: "#",
      cell: ({ row }) => {
        const index = row.index;
        return <div className="text-sm">{index + 1}</div>;
      },
    },
    {
      accessorKey: "",
      header: "Tipo de Evaluación",
      cell: ({ row }) => (
        <div className="flex flex-col ml-2">
          <p className="text-sm font-medium">
            {row.original.medicalEvaluation.evaluationType.name}
          </p>
        </div>
      ),
    },
    {
      header: " ",
      cell: ({ row }) => (
        <MedicalEvaluationActionsCell
          collaborator={collaborator}
          medicalEvaluationRow={row.original}
          slug={slug}
        />
      ),
    },
  ];

  return columns;
};
