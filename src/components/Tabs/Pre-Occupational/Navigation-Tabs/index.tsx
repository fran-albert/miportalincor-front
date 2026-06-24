import { useEffect, useRef, useState } from "react";
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
import { getPreferredDataValueByPossibleNames } from "@/common/helpers/maps";
import { ClipboardCheck, Files, HeartPulse } from "lucide-react";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  setHasGeneralUnsavedChanges: (value: boolean) => void;
  urls: GetUrlsResponseDto[] | undefined;
  dataValues: DataValue[] | undefined;
  collaborator: Collaborator;
  fields: DataType[];
  medicalEvaluationId: number;
  includeStudiesTab?: boolean;
  compact?: boolean;
}

export default function NavigationTabs({
  isEditing,
  setIsEditing,
  setHasGeneralUnsavedChanges,
  urls,
  fields,
  collaborator,
  dataValues,
  medicalEvaluationId,
  includeStudiesTab = true,
  compact = false,
}: Props) {
  const [activeTab, setActiveTab] = useState("general");
  const generalSectionRef = useRef<HTMLDivElement | null>(null);
  const medicalHistorySectionRef = useRef<HTMLDivElement | null>(null);
  const [formData, setFormData] = useState<{
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  }>({
    examResults: {},
    conclusion: "",
    recomendaciones: "",
  });
  const [savedGeneralFormData, setSavedGeneralFormData] = useState<{
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

    const conclusionValue = getPreferredDataValueByPossibleNames(
      dataValues ?? [],
      ["Conclusion", "Conclusión", "Aptitud", "Aptitudes"]
    )?.value;
    const initialConclusion = conclusionValue != null ? String(conclusionValue) : "";

    const recomendacionesValue = getPreferredDataValueByPossibleNames(
      dataValues ?? [],
      ["Recomendaciones", "Recomendación"]
    )?.value;
    const initialRecomendaciones = recomendacionesValue != null ? String(recomendacionesValue) : "";

    setFormData({
      examResults: initialExamResults,
      conclusion: initialConclusion,
      recomendaciones: initialRecomendaciones,
    });
    setSavedGeneralFormData({
      examResults: initialExamResults,
      conclusion: initialConclusion,
      recomendaciones: initialRecomendaciones,
    });
  }, [dataValues]);

  useEffect(() => {
    const current = JSON.stringify(formData);
    const saved = JSON.stringify(savedGeneralFormData);
    setHasGeneralUnsavedChanges(current !== saved);
  }, [formData, savedGeneralFormData, setHasGeneralUnsavedChanges]);

  // 3) categoriza tus campos
  const studiesCategory = fields.filter((f) => f.category === "ESTUDIOS");
  const tabsMeta = [
    {
      value: "general",
      label: "Resultados y conclusión",
      description: "Resultados descriptivos, conclusión y recomendaciones",
      icon: ClipboardCheck,
    },
    {
      value: "medical-history",
      label: "Historia médica y examen físico",
      description: "Antecedentes ocupacionales, examen físico y observaciones",
      icon: HeartPulse,
    },
    {
      value: "various",
      label: "Varios",
      description: "Estudios y archivos complementarios",
      icon: Files,
    },
  ].filter((tab) => includeStudiesTab || tab.value !== "various");

  const focusClinicalSection = (section: string) => {
    setActiveTab(section);

    if (section === "general") {
      generalSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    if (section === "medical-history") {
      medicalHistorySectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="space-y-4 p-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-greenPrimary">
                Evaluación clínica
              </h3>
              <p className="text-sm leading-6 text-slate-700">
                Organizamos la carga clínica en dos bloques estables: primero
                resultados y cierre médico, después antecedentes y examen
                físico. Cada bloque se guarda por separado.
              </p>
            </div>
            <div className="grid gap-3 lg:grid-cols-2">
              {tabsMeta
                .filter((tab) => tab.value !== "various")
                .map((tab) => {
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.value}
                      type="button"
                      onClick={() => focusClinicalSection(tab.value)}
                      className={`rounded-xl border p-4 text-left transition-colors ${
                        activeTab === tab.value
                          ? "border-greenPrimary bg-greenPrimary/5 shadow-sm"
                          : "border-slate-200 bg-white hover:border-greenPrimary/30 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 rounded-lg bg-slate-100 p-2 text-greenPrimary">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-greenPrimary">
                            {tab.label}
                          </div>
                          <p className="text-xs leading-5 text-slate-500">
                            {tab.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </CardContent>
        </Card>

        <div ref={generalSectionRef}>
          <GeneralTab
            standalone
            showEditToggle={false}
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={formData}
            savedFormData={savedGeneralFormData}
            setFormData={setFormData}
            setSavedFormData={setSavedGeneralFormData}
            medicalEvaluationId={medicalEvaluationId}
            fields={fields}
          />
        </div>

        <div ref={medicalHistorySectionRef}>
          <MedicalHistoryTab
            standalone
            showEditToggle={false}
            isEditing={isEditing}
            dataValues={dataValues}
            medicalEvaluationId={medicalEvaluationId}
            setIsEditing={setIsEditing}
          />
        </div>
      </div>
    );
  }

  const tabsBlock = (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="w-full text-greenPrimary"
    >
      <TabsList
        className={`grid h-auto w-full grid-cols-1 gap-2 rounded-xl bg-slate-100 p-1.5 ${
          tabsMeta.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        }`}
      >
        {tabsMeta.map((tab) => {
          const Icon = tab.icon;

          return (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="h-auto min-h-[82px] flex-col items-start gap-2 rounded-lg px-4 py-4 text-left text-slate-600 transition-all data-[state=active]:bg-white data-[state=active]:text-greenPrimary data-[state=active]:shadow-md"
            >
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Icon className="h-4 w-4 text-greenPrimary" />
                {tab.label}
              </div>
              <p className="text-xs leading-5 text-slate-500">
                {tab.description}
              </p>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <TabsContent value={activeTab} className="mt-5">
        {activeTab === "general" && (
          <GeneralTab
            isEditing={isEditing}
            setIsEditing={setIsEditing}
            formData={formData}
            savedFormData={savedGeneralFormData}
              setFormData={setFormData}
              setSavedFormData={setSavedGeneralFormData}
              medicalEvaluationId={medicalEvaluationId}
              fields={fields}
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
        {activeTab === "various" && urls && includeStudiesTab && (
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
  );

  return (
    <div className="space-y-4">
      <div className="mx-auto space-y-4">
        <Card className="overflow-hidden border border-slate-200 shadow-sm">
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-col gap-2 border-b border-greenPrimary/10 pb-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <div>
                  <h3 className="text-lg font-semibold text-greenPrimary">
                    Edición clínica
                  </h3>
                  <p className="text-sm leading-6 text-slate-700">
                    Organizamos la carga en bloques para que secretaría y
                    médicos ubiquen rápido dónde editar cada parte del examen.
                  </p>
                </div>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                Editá primero acá. La previsualización sigue siendo el paso
                final para generar el informe.
              </div>
            </div>
            {tabsBlock}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
