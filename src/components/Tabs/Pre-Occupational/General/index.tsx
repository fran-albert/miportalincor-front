import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import ExamsResultsAccordion from "@/components/Accordion/Pre-Occupational/Exam-Results";
import ConclusionAccordion from "@/components/Accordion/Pre-Occupational/Conclusion";
import { Pencil } from "lucide-react";
import { DataType } from "@/types/Data-Type/Data-Type";
import { DataValue } from "@/types/Data-Value/Data-Value";

interface Props {
  isEditing: boolean;
  medicalEvaluationId: number;
  setIsEditing: (value: boolean) => void;
  dataValues: DataValue[] | undefined;
  generalCategory: DataType[];
}

export default function GeneralTab({
  isEditing,
  setIsEditing,
  generalCategory,
  dataValues,
  medicalEvaluationId,
}: Props) {
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
          fields={generalCategory}
          dataValues={dataValues}
          medicalEvaluationId={medicalEvaluationId}
        />
        <ConclusionAccordion
          isEditing={isEditing}
          setIsEditing={setIsEditing}
          dataValues={dataValues}
          fields={generalCategory}
          medicalEvaluationId={medicalEvaluationId}
        />
      </Accordion>
    </TabsContent>
  );
}
