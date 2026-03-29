/* eslint-disable react-refresh/only-export-components */
import { ColumnDef } from "@tanstack/react-table";
import { CollaboratorMedicalEvaluation } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { FaFilePdf } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import ActionIcon from "@/components/Icons/action";
import SendEmailDialog from "@/components/Email/Dialog";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { CollaboratorMedicalEvaluation as CollaboratorMedicalEvaluationType } from "@/types/Collaborator-Medical-Evaluation/Collaborator-Medical-Evaluation";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useCurrentMedicalEvaluationReport } from "@/hooks/Medical-Evaluation-Report-Version/useCurrentMedicalEvaluationReport";
import {
  ReportStatusBadge,
  formatReportDate,
} from "@/components/Pre-Occupational/Report-Versioning/report-status";
import { Link } from "react-router-dom";

const formatExamCreatedAt = (createdAt?: string): string => {
  if (!createdAt) return "-";

  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "-";

  return format(date, "dd/MM/yyyy", { locale: es });
};

interface MedicalEvaluationActionsCellProps {
  collaborator: Collaborator;
  medicalEvaluationRow: CollaboratorMedicalEvaluationType;
}

const MedicalEvaluationActionsCell = ({
  collaborator,
  medicalEvaluationRow,
}: MedicalEvaluationActionsCellProps) => {
  const medicalEvaluation = medicalEvaluationRow.medicalEvaluation;
  const medicalEvaluationId = medicalEvaluation.id;
  const { currentUrl, hasReport, isLoading } = useCurrentMedicalEvaluationReport(
    {
      auth: true,
      collaboratorId: collaborator.id,
      medicalEvaluationId,
    }
  );

  if (isLoading) {
    return <div className="w-6 h-6 bg-gray-200 animate-pulse rounded" />;
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {hasReport && currentUrl ? (
        <>
          <a href={currentUrl} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon">
              <ActionIcon
                tooltip="Ver PDF actual"
                icon={<FaFilePdf className="w-4 h-4 text-red-600" />}
              />
            </Button>
          </a>
          <SendEmailDialog
            collaborator={collaborator}
            url={String(currentUrl)}
            evaluationType={medicalEvaluation.evaluationType.name}
          />
        </>
      ) : (
        <Button variant="ghost" size="icon" disabled>
          <ActionIcon
            tooltip="Todavía no hay informe"
            icon={<FaFilePdf className="w-4 h-4 text-gray-300" />}
          />
        </Button>
      )}
    </div>
  );
};

const MedicalEvaluationStatusCell = ({
  collaborator,
  medicalEvaluationRow,
}: Omit<MedicalEvaluationActionsCellProps, "slug">) => {
  const medicalEvaluationId = medicalEvaluationRow.medicalEvaluation.id;
  const { currentVersion, finalVersion, hasLegacyCurrentReport, isLoading } =
    useCurrentMedicalEvaluationReport({
      auth: true,
      collaboratorId: collaborator.id,
      medicalEvaluationId,
    });

  if (isLoading) {
    return <div className="h-6 w-36 rounded bg-gray-100 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-1">
      <ReportStatusBadge
        version={currentVersion}
        hasLegacyReport={hasLegacyCurrentReport}
        className="w-fit"
      />
      {currentVersion?.outdatedByExamChanges && (
        <p className="text-xs text-muted-foreground">
          Editado. Regeneralo desde el examen.
        </p>
      )}
      {finalVersion && finalVersion.id !== currentVersion?.id && (
        <p className="text-xs text-muted-foreground">
          Final: {formatReportDate(finalVersion.generatedAt)}
        </p>
      )}
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
        <Link
          to={`/incor-laboral/colaboradores/${slug}/examen/${row.original.medicalEvaluation.id}`}
          className="ml-2 flex flex-col rounded-md px-2 py-1 transition-colors hover:bg-slate-50"
        >
          <p className="text-sm font-medium text-slate-900 hover:text-greenPrimary">
            {row.original.medicalEvaluation.evaluationType.name}
          </p>
          <span className="text-xs text-muted-foreground">
            Abrir examen
          </span>
        </Link>
      ),
    },
    {
      accessorKey: "medicalEvaluation.createdAt",
      header: "Fecha de creación del examen",
      cell: ({ row }) => (
        <div className="text-sm">
          {formatExamCreatedAt(row.original.medicalEvaluation.createdAt)}
        </div>
      ),
    },
    {
      header: "Estado del informe",
      cell: ({ row }) => (
        <MedicalEvaluationStatusCell
          collaborator={collaborator}
          medicalEvaluationRow={row.original}
        />
      ),
    },
    {
      header: "Informe",
      cell: ({ row }) => (
        <MedicalEvaluationActionsCell
          collaborator={collaborator}
          medicalEvaluationRow={row.original}
        />
      ),
    },
  ];

  return columns;
};
