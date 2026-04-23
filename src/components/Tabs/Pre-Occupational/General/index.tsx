import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import ExamsResultsAccordion from "@/components/Accordion/Pre-Occupational/Exam-Results";
import ConclusionAccordion from "@/components/Accordion/Pre-Occupational/Conclusion";
import { Pencil } from "lucide-react";
import { DataType } from "@/types/Data-Type/Data-Type";

interface GeneralTabProps {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  formData: {
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
  fields: DataType[];
  medicalEvaluationId: number;
}

export default function GeneralTab({
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  fields,
  medicalEvaluationId,
}: GeneralTabProps) {
  return (
    <TabsContent value="general" className="mt-4 space-y-4">
      {!isEditing && (
        <p
          className="font-medium text-greenPrimary cursor-pointer hover:underline flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" /> Habilitar Edición
        </p>
      )}

      <Accordion type="multiple" className="w-full space-y-4">
        <ExamsResultsAccordion
          isEditing={isEditing}
          fields={fields}
          examResults={formData.examResults}
          setExamResults={(er) =>
            setFormData((prev) => ({ ...prev, examResults: er }))
          }
          medicalEvaluationId={medicalEvaluationId}
        />

        <ConclusionAccordion
          isEditing={isEditing}
          conclusion={formData.conclusion}
          recomendaciones={formData.recomendaciones}
          setConclusion={(c) =>
            setFormData((prev) => ({ ...prev, conclusion: c }))
          }
          setRecomendaciones={(r) =>
            setFormData((prev) => ({ ...prev, recomendaciones: r }))
          }
          medicalEvaluationId={medicalEvaluationId}
          fields={fields}
        />
      </Accordion>
    </TabsContent>
  );
}
