import { TabsContent } from "@/components/ui/tabs";
import ExamsResultsAccordion from "@/components/Accordion/Pre-Occupational/Exam-Results";
import ConclusionAccordion from "@/components/Accordion/Pre-Occupational/Conclusion";
import { ClipboardCheck } from "lucide-react";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import StageActionBar from "@/components/Pre-Occupational/StageActionBar";
import { getLatestDataValueByPossibleNames } from "@/common/helpers/maps";
import { getAllDataTypeByCategoriesLaboral } from "@/api/Data-Type/get-all-data-type-by-category.action";

interface GeneralTabProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  formData: {
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  };
  savedFormData: {
    examResults: Record<string, string>;
    conclusion: string;
    recomendaciones: string;
  };
  setFormData: React.Dispatch<
    React.SetStateAction<{
      examResults: Record<string, string>;
      conclusion: string;
      recomendaciones: string;
    }>
  >;
  setSavedFormData: React.Dispatch<
    React.SetStateAction<{
      examResults: Record<string, string>;
      conclusion: string;
      recomendaciones: string;
    }>
  >;
  fields: DataType[];
  medicalEvaluationId: number;
  dataValues?: DataValue[];
  standalone?: boolean;
  showEditToggle?: boolean;
}

export default function GeneralTab({
  isEditing,
  setIsEditing,
  formData,
  savedFormData,
  setFormData,
  setSavedFormData,
  fields,
  medicalEvaluationId,
  dataValues,
  standalone = false,
  showEditToggle = true,
}: GeneralTabProps) {
  const { createDataValuesMutation } = useDataValuesMutations();
  const { promiseToast, showError } = useToastContext();
  const hasExamResultsChanges =
    JSON.stringify(formData.examResults) !==
    JSON.stringify(savedFormData.examResults);
  const hasConclusionChanges =
    formData.conclusion !== savedFormData.conclusion ||
    formData.recomendaciones !== savedFormData.recomendaciones;
  const hasPendingChanges = hasExamResultsChanges || hasConclusionChanges;

  const examFilter = [
    { id: "clinico", name: "Clínico" },
    { id: "electrocardiograma-result", name: "Electrocardiograma" },
    { id: "laboratorio", name: "Laboratorio básico ley" },
    { id: "rx-torax", name: "RX Torax Frente" },
    { id: "electroencefalograma", name: "Electroencefalograma" },
    { id: "psicotecnico", name: "Psicotécnico" },
    { id: "audiometria", name: "Audiometria" },
  ];

  const normalize = (str: string) =>
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const findFieldByPossibleNames = (names: string[], sourceFields = fields) =>
    sourceFields.find((field) =>
      names.some((name) => normalize(field.name) === normalize(name))
    );

  const findFieldByTerm = (term: string, sourceFields = fields) =>
    sourceFields.find((field) => normalize(field.name).includes(normalize(term)));

  const buildMappedExams = (sourceFields: DataType[]) =>
    sourceFields
    .filter(
      (field) =>
        field.dataType === "STRING" &&
        field.category === "GENERAL" &&
        examFilter.some((exam) => normalize(exam.name) === normalize(field.name))
    )
    .reduce((acc: DataType[], currentField) => {
      if (!acc.find((field) => field.name === currentField.name)) {
        acc.push(currentField);
      }
      return acc;
    }, [])
    .map((field) => ({
      id:
        examFilter.find((exam) => normalize(exam.name) === normalize(field.name))
          ?.id || field.id.toString(),
      label: field.name,
      dataTypeId: Number(field.id),
    }));

  const mappedExams = buildMappedExams(fields);

  const handleCancel = () => {
    setFormData(savedFormData);
  };

  const handleSave = async () => {
    let resolvedFields = fields;
    let resolvedMappedExams = mappedExams;

    const ensureAllFields = async () => {
      if (resolvedFields.length > 0) return resolvedFields;
      const allFields = await getAllDataTypeByCategoriesLaboral([]);
      resolvedFields = allFields;
      resolvedMappedExams = buildMappedExams(allFields);
      return allFields;
    };

    const getExistingId = (name: string) =>
      getLatestDataValueByPossibleNames(dataValues ?? [], [name])?.id;

    const existingConclusionDataValue = getLatestDataValueByPossibleNames(
      dataValues ?? [],
      ["Conclusion", "Conclusión", "Conclusiones", "Aptitud", "Aptitudes"]
    );
    const existingRecomendacionesDataValue = getLatestDataValueByPossibleNames(
      dataValues ?? [],
      ["Recomendaciones", "Recomendación"]
    );

    const payloadItems = [
      ...resolvedMappedExams
        .map((exam) => ({
          id: getExistingId(exam.label),
          dataTypeId: exam.dataTypeId,
          value: formData.examResults[exam.id] || "",
        }))
        .filter((item) => item.value.trim() !== ""),
    ];

    let conclusionField =
      findFieldByPossibleNames(
        ["Conclusion", "Conclusión", "Conclusiones", "Aptitud", "Aptitudes"],
        resolvedFields
      ) ??
      findFieldByTerm("conclu", resolvedFields) ??
      findFieldByTerm("aptitud", resolvedFields) ??
      existingConclusionDataValue?.dataType;

    if (!conclusionField && formData.conclusion.trim() !== "") {
      const allFields = await ensureAllFields();
      conclusionField =
        findFieldByPossibleNames(
          ["Conclusion", "Conclusión", "Conclusiones", "Aptitud", "Aptitudes"],
          allFields
        ) ??
        findFieldByTerm("conclu", allFields) ??
        findFieldByTerm("aptitud", allFields) ??
        existingConclusionDataValue?.dataType;
    }

    if (formData.conclusion.trim() !== "") {
      if (conclusionField) {
        payloadItems.push({
          id: existingConclusionDataValue?.id,
          dataTypeId: Number(conclusionField.id),
          value: formData.conclusion,
        });
      } else {
        console.warn("[GeneralTab] conclusion field not resolved", {
          availableFields: fields.map((field) => ({
            id: field.id,
            name: field.name,
            category: field.category,
          })),
        });
      }
    }

    let recomendacionesField =
      findFieldByPossibleNames(
        ["Recomendaciones", "Recomendación"],
        resolvedFields
      ) ??
      findFieldByTerm("recomend", resolvedFields) ??
      existingRecomendacionesDataValue?.dataType;

    if (!recomendacionesField && formData.recomendaciones.trim() !== "") {
      const allFields = await ensureAllFields();
      recomendacionesField =
        findFieldByPossibleNames(
          ["Recomendaciones", "Recomendación"],
          allFields
        ) ??
        findFieldByTerm("recomend", allFields) ??
        existingRecomendacionesDataValue?.dataType;
    }

    if (formData.recomendaciones.trim() !== "") {
      if (recomendacionesField) {
        payloadItems.push({
          id: existingRecomendacionesDataValue?.id,
          dataTypeId: Number(recomendacionesField.id),
          value: formData.recomendaciones,
        });
      } else {
        console.warn("[GeneralTab] recomendaciones field not resolved", {
          availableFields: fields.map((field) => ({
            id: field.id,
            name: field.name,
            category: field.category,
          })),
        });
      }
    }

    console.log("[GeneralTab] save payload", {
      medicalEvaluationId,
      payloadItems,
      conclusionField,
      recomendacionesField,
    });

    if (payloadItems.length === 0) {
      showError(
        "No se pudo guardar",
        "No encontramos campos configurados para guardar los cambios de esta etapa."
      );
      return;
    }

    await promiseToast(
      createDataValuesMutation.mutateAsync({
        medicalEvaluationId,
        dataValues: payloadItems,
      }),
      {
        loading: {
          title: "Guardando datos",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Datos guardados",
          description: "Los datos se guardaron exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al guardar los datos",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data
              ?.message || "Ha ocurrido un error inesperado",
        }),
      }
    );

    setSavedFormData(formData);
  };

  const content = (
    <div className="space-y-4">
      {(!standalone || showEditToggle) && (
        <div className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-white p-3 md:flex-row md:items-center md:justify-between">
          <div className="inline-flex items-center gap-2 text-sm font-semibold text-greenPrimary">
            <ClipboardCheck className="h-4 w-4" />
            Resultados y conclusión
          </div>
          {!isEditing && showEditToggle && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-greenPrimary/15 bg-white px-4 py-2 text-sm font-medium text-greenSecondary shadow-sm transition hover:border-greenPrimary/30 hover:bg-greenPrimary/5"
              onClick={() => setIsEditing(true)}
            >
              Habilitar edición
            </button>
          )}
        </div>
      )}

      <div className="space-y-5">
        <ExamsResultsAccordion
          standalone
          isEditing={isEditing}
          fields={fields}
          examResults={formData.examResults}
          setExamResults={(er) =>
            setFormData((prev) => ({ ...prev, examResults: er }))
          }
        />

        <ConclusionAccordion
          standalone
          isEditing={isEditing}
          conclusion={formData.conclusion}
          recomendaciones={formData.recomendaciones}
          setConclusion={(c) =>
            setFormData((prev) => ({ ...prev, conclusion: c }))
          }
          setRecomendaciones={(r) =>
            setFormData((prev) => ({ ...prev, recomendaciones: r }))
          }
        />
      </div>

      {isEditing && hasPendingChanges && (
        <StageActionBar
          onCancel={handleCancel}
          onSave={handleSave}
          isSaving={createDataValuesMutation.isPending}
        />
      )}
    </div>
  );

  if (standalone) {
    return content;
  }

  return (
    <TabsContent value="general" className="mt-4 space-y-4">
      {content}
    </TabsContent>
  );
}
