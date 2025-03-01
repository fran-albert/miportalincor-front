import { ColumnDef } from "@tanstack/react-table";
import { formatDateWithTime } from "@/common/helpers/helpers";
import { Link } from "react-router-dom";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { FaFilePdf } from "react-icons/fa";
import { BiMailSend } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import ActionIcon from "@/components/Icons/action";
import { ViewButton } from "@/components/Button/View/button";
import SendEmailDialog from "@/components/Email/Dialog";

export const getColumns = (
  slug: string,
  roles: {
    isSecretary: boolean;
    isDoctor: boolean;
    isAdmin: boolean;
  }
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
    {
      accessorKey: "",
      header: "Último envío",
      cell: ({ row }) => (
        <div className="flex flex-col ml-2">
          <p className="text-sm font-medium">
            {formatDateWithTime(row.original.updatedAt || "")}
          </p>
        </div>
      ),
    },
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
        const isCompleted = row.original.medicalEvaluation.completed;
        const url = `${slug}/examen/${row.original.id}`;

        return (
          <div className="flex items-center justify-end">
            {(roles.isSecretary || roles.isDoctor || roles.isAdmin) && (
              <div className="gap-2 flex items-center">
                {isCompleted ? (
                  <>
                    {/* Ícono para ver PDF */}
                    <Link to={`/incor-laboral`}>
                      <Button variant="ghost" size={"icon"}>
                        <ActionIcon
                          tooltip={"Ver PDF"}
                          icon={
                            <FaFilePdf
                              className="w-4 h-4 "
                              color="red"
                              size={30}
                            />
                          }
                        />
                      </Button>
                    </Link>
                    <SendEmailDialog collaborator={row.original.collaborator} />
                  </>
                ) : (
                  <ViewButton
                    slug={url}
                    text="Ver Exámen"
                    path="incor-laboral/colaboradores"
                  />
                )}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  return columns;
};
