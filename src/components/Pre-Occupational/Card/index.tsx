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
import LoadingAnimation from "@/components/Loading/loading";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";

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
  const {
    data: urls,
    isLoading: isLoadingUrls,
    isError: isErrorUrls,
  } = useGetAllUrlsByCollaboratorAndMedicalEvaluation({
    auth: true,
    collaboratorId: collaborator.id,
    medicalEvaluationId: medicalEvaluation.id,
  });
 
  const { data: fields, isLoading: isLoadingFields } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["GENERAL", "ESTUDIOS"],
  });

  const {
    data: dataValues,
    isLoading: isLoadingValues,
    isError: isErrorValues,
  } = useDataValuesByMedicalEvaluationId({
    auth: true,
    id: medicalEvaluation.id,
  });

  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  if (isLoadingUrls || isLoadingValues || isLoadingFields) {
    return <LoadingAnimation />;
  }
  if (isErrorUrls || isErrorValues) {
    return <div>Error cargando datos</div>;
  }

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
          fields={fields}   
          medicalEvaluationId={medicalEvaluation.id}
          setIsEditing={setIsEditing}
          collaborator={collaborator}
        />
      </div>
    </div>
  );
}
