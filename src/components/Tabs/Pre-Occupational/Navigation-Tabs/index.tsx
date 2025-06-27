import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "@/components/Tabs/Pre-Occupational/General";
import MedicalHistoryTab from "@/components/Tabs/Pre-Occupational/Medical-History";
import VariousTab from "../Various";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { DataType } from "@/types/Data-Type/Data-Type";
import { mapExamResults } from "@/common/helpers/examsResults.maps";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  urls: GetUrlsResponseDto[] | undefined;
  dataValues: DataValue[] | undefined;
  collaborator: Collaborator;
  fields: DataType[];
  medicalEvaluationId: number;
}

export default function NavigationTabs({
  isEditing,
  setIsEditing,
  urls,
  fields,
  collaborator,
  dataValues,
  medicalEvaluationId,
}: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const [formData, setFormData] = useState<{
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  }>({
    examResults: {},
    conclusion: "",
    recomendaciones: "",
  });

  // 2) cuando cambien dataValues, inicializamos formData
  useEffect(() => {
    // filtrar sólo STRING & GENERAL
    const generalStrings = dataValues?.filter(
      (dv) =>
        dv.dataType.dataType === "STRING" && dv.dataType.category === "GENERAL"
    );

    // mapExamResults es tu helper para pasar array a { id: valor }
    const initialExamResults = mapExamResults(generalStrings!);

    const initialConclusion =
      dataValues?.find((dv) => dv.dataType.name === "Conclusion")?.value ?? "";
    const initialRecomendaciones =
      dataValues?.find((dv) => dv.dataType.name === "Recomendaciones")?.value ??
      "";

    setFormData({
      examResults: initialExamResults,
      conclusion: initialConclusion,
      recomendaciones: initialRecomendaciones,
    });
  }, [dataValues]);

  // 3) categoriza tus campos
  const generalCategory = fields.filter((f) => f.category === "GENERAL");
  const studiesCategory = fields.filter((f) => f.category === "ESTUDIOS");
  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto space-y-4">
        <Card>
          <CardContent className="p-4">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full text-greenPrimary"
            >
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-8 text-greenPrimary">
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="medical-history">
                  Historia Médica
                </TabsTrigger>
                <TabsTrigger value="various">Varios</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                {activeTab === "general" && (
                  <GeneralTab
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    formData={formData}
                    setFormData={setFormData}
                    medicalEvaluationId={medicalEvaluationId}
                    fields={generalCategory}
                  />
                )}
                {activeTab === "medical-history" && (
                  <MedicalHistoryTab
                    isEditing={isEditing}
                    dataValues={dataValues}
                    medicalEvaluationId={medicalEvaluationId}
                    setIsEditing={setIsEditing}
                  />
                )}
                {activeTab === "various" && urls && (
                  <VariousTab
                    key={`${collaborator.id}-${medicalEvaluationId}`}
                    isEditing={isEditing}
                    setIsEditing={setIsEditing}
                    studiesCategory={studiesCategory}
                    medicalEvaluationId={medicalEvaluationId}
                    collaborator={collaborator}
                    urls={urls}
                  />
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
