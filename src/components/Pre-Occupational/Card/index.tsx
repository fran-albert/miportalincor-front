import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, ExternalLink } from "lucide-react";
import CollaboratorInformationCard from "../Collaborator-Information";
import NavigationTabs from "@/components/Tabs/Pre-Occupational/Navigation-Tabs";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { MedicalEvaluation } from "@/types/Medical-Evaluation/MedicalEvaluation";
import { useGetAllUrlsByCollaboratorAndMedicalEvaluation } from "@/hooks/Study/useGetAllUrlsByCollaboratorAndMedicalEvaluation";
import { useDataValuesByMedicalEvaluationId } from "@/hooks/Data-Values/useDataValues";

interface Props {
  slug: string;
  collaborator: Collaborator;
  medicalEvaluation: MedicalEvaluation;
}

export default function PreOccupationalCards({
  slug,
  collaborator,
  medicalEvaluation,
}: Props) {
  const { data: urls } = useGetAllUrlsByCollaboratorAndMedicalEvaluation({
    auth: true,
    collaboratorId: collaborator.id,
    medicalEvaluationId: medicalEvaluation.id,
  });

  const { data: dataValues } = useDataValuesByMedicalEvaluationId({
    id: medicalEvaluation.id,
    auth: true,
  });

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Fecha</div>
                <div className="font-semibold">
                  {new Date().toLocaleDateString("es-AR")}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-gray-500">Descripción</div>
                <div className="font-semibold">
                  {medicalEvaluation.evaluationType.name}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  navigate(
                    `/incor-laboral/colaboradores/${slug}/examen/${medicalEvaluation.id}/previsualizar-informe`
                  )
                }
              >
                <Eye className="mr-2 h-4 w-4" />
                Previsualizar informe
              </Button>
              <Button variant="outline" size="sm">
                <ExternalLink className="mr-2 h-4 w-4" />
                Abrir en otra pestaña
              </Button>
            </div>
          </CardContent>
        </Card>
        <CollaboratorInformationCard collaborator={collaborator} />
        <NavigationTabs
          isEditing={isEditing}
          dataValues={dataValues}
          urls={urls}
          medicalEvaluationId={medicalEvaluation.id}
          setIsEditing={setIsEditing}
          collaborator={collaborator}
        />
      </div>
    </div>
  );
}
