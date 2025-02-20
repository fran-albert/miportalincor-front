import { Button } from "@/components/ui/button";
import { Printer, Save, Send } from "lucide-react";
import CollaboratorInformationCard from "@/components/Pre-Occupational/Collaborator-Information";
import BreadcrumbComponent from "@/components/Breadcrumb";
import { Patient } from "@/types/Patient/Patient";
import GeneralInfoPreview from "./General-Information";
import TestsPreview from "./Tests";
import ExamsResultsPreview from "./Exams-Results";
import ConclusionPreview from "./Conclusion";
import InstitutionInformationPreview from "./Institution-Information";
import WorkerInformationPreview from "./Worker-Information";
import OccupationalHistoryPreview from "./Occupational-History";
import MedicalEvaluationPreview from "./Medical-Evaluation";

interface Props {
  collaborator: Patient;
}

export default function PreOccupationalPreviewComponent({
  collaborator,
}: Props) {
  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Incor Laboral", href: "/incor-laboral" },
    {
      label: collaborator
        ? `${collaborator.firstName} ${collaborator.lastName}`
        : "Incor Laboral",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}`,
    },
    {
      label: "Previsualizar Informe",
      href: `/incor-laboral/colaboradores/${collaborator?.slug}/previsualizar-informe`,
    },
  ];

  return (
    <div className="space-y-2 mt-2">
      <BreadcrumbComponent items={breadcrumbItems} />
      <div className="min-h-screen mx-auto bg-white p-6 space-y-6">
        {/* Información del colaborador */}
        <CollaboratorInformationCard />
        <GeneralInfoPreview />
        <TestsPreview />
        <ExamsResultsPreview />
        <ConclusionPreview />
        <InstitutionInformationPreview />
        <WorkerInformationPreview />
        <OccupationalHistoryPreview />
        <MedicalEvaluationPreview />
        {/* Botones de acciones */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline" size="sm">
            <Send className="mr-2 h-4 w-4" />
            Enviar
          </Button>
          <Button variant="default" size="sm">
            <Save className="mr-2 h-4 w-4" />
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
}
