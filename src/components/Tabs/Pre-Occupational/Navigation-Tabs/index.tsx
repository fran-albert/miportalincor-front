import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import GeneralTab from "@/components/Tabs/Pre-Occupational/General";
import MedicalHistoryTab from "@/components/Tabs/Pre-Occupational/Medical-History";
import VariousTab from "../Various";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { GetUrlsResponseDto } from "@/api/Study/Collaborator/get-all-urls.collaborators.action";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useDispatch } from "react-redux";
import {
  resetForm,
  setFormData,
} from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  urls: GetUrlsResponseDto[] | undefined;
  dataValues: DataValue[] | undefined;
  collaborator: Collaborator;
  medicalEvaluationId: number;
}

export default function NavigationTabs({
  isEditing,
  setIsEditing,
  urls,
  collaborator,
  dataValues,
  medicalEvaluationId,
}: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const { data: fields } = useDataTypes({
    auth: true,
    fetch: true,
    categories: ["GENERAL", "ESTUDIOS"],
  });
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(resetForm());
  }, [medicalEvaluationId, dispatch]);
  useEffect(() => {
    if (!dataValues) return;

    const initialConclusion =
      dataValues.find((dv) => dv.dataType.name === "Conclusion")?.value ?? "";
    const initialRecomendaciones =
      dataValues.find((dv) => dv.dataType.name === "Recomendaciones")?.value ??
      "";

    dispatch(
      setFormData({
        conclusion: initialConclusion,
        recomendaciones: initialRecomendaciones,
      })
    );
  }, [dataValues, dispatch]);
  const generalCategory = fields.filter((item) => item.category === "GENERAL");
  const studiesCategory = fields.filter((item) => item.category === "ESTUDIOS");
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
                    dataValues={dataValues}
                    setIsEditing={setIsEditing}
                    medicalEvaluationId={medicalEvaluationId}
                    generalCategory={generalCategory}
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
