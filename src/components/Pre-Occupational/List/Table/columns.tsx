import { ColumnDef } from "@tanstack/react-table";
import { formatDateWithTime } from "@/common/helpers/helpers";
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
      accessorKey: "",
      header: "Creado",
      cell: ({ row }) => (
        <div className="flex flex-col ml-2">
          <p className="text-sm font-medium">
            {formatDateWithTime(row.original.medicalEvaluation.createdAt || "")}
          </p>
        </div>
      ),
    },
    // {
    //   accessorKey: "",
    //   header: "Último envío",
    //   cell: ({ row }) => (
    //     <div className="flex flex-col ml-2">
    //       <p className="text-sm font-medium">
    //         {formatDateWithTime(row.original.updatedAt || "")}
    //       </p>
    //     </div>
    //   ),
    // },
    {
      accessorKey: "",
      header: "Enviado y Completado",
      cell: ({ row }) => (
        <div className="flex flex-col ml-2">
          <p className="text-sm font-medium">
            {row.original.medicalEvaluation.completed ? "Sí" : "No"}
          </p>
        </div>
      ),
    },

    {
      header: " ",
      cell: ({ row }) => {
        const medicalEvaluation = row.original.medicalEvaluation;
        const isCompleted = medicalEvaluation.completed;
        const medicalEvaluationId = medicalEvaluation.id;
        const collaboratorId = collaborator.id;

        // 1. Hook para obtener nombre de archivo
        const { data: fileData, isLoading: loadingFileName } =
          useGetStudyFileNameByEvaluationType({
            auth: true,
            medicalEvaluationId,
          });
        const fileName = fileData?.fileName || "";

        // 2. Hook para obtener URL firmada
        const { data: signedUrl, isLoading: loadingSignedUrl } =
          useGetSignedUrlByCollaboratorIdAndFileName({
            auth: !!fileName,
            collaboratorId,
            fileName,
          });

        // 3. Si alguna de las dos está en loading, mostramos un placeholder
        if (loadingFileName || loadingSignedUrl) {
          return <div className="w-6 h-6 bg-gray-200 animate-pulse rounded" />;
        }

        // 4. Finalmente, renderizamos la versión “completa”
        return (
          <div className="flex items-center justify-end gap-2">
            {isCompleted && signedUrl ? (
              <>
                <a
                  href={signedUrl.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="ghost" size="icon">
                    <ActionIcon
                      tooltip="Ver PDF"
                      icon={<FaFilePdf className="w-4 h-4 text-red-600" />}
                    />
                  </Button>
                </a>
                <SendEmailDialog
                  collaborator={collaborator}
                  url={signedUrl.url}
                  evaluationType={medicalEvaluation.evaluationType.name}
                />
              </>
            ) : (
              <>
                <ViewButton
                  slug={`${slug}/examen/${row.original.id}`}
                  text="Ver Exámen"
                  path="incor-laboral/colaboradores"
                />
                <DeleteMedicalEvaluation id={medicalEvaluation.id} />
              </>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
