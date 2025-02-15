import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import { Pencil } from "lucide-react";
import WorkerInformationAccordion from "@/components/Accordion/Pre-Occupational/Worker-Information";
import InstitutionInformation from "./Institution-Information";
import OccupationalHistoryAccordion from "@/components/Accordion/Pre-Occupational/Occupational-History";
import MedicalEvaluationAccordion from "@/components/Accordion/Pre-Occupational/Medical-Evaluation";
import { Button } from "@/components/ui/button";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function MedicalHistoryTab({ isEditing, setIsEditing }: Props) {
  return (
    <TabsContent value="medical-history" className="mt-4 space-y-4">
      {!isEditing && (
        <p
          className="font-medium text-greenPrimary cursor-pointer hover:underline flex items-center gap-2"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="w-4 h-4" /> Habilitar Edición
        </p>
      )}
      <Accordion type="multiple" className="w-full space-y-4">
        <InstitutionInformation isEditing={isEditing} />
        <WorkerInformationAccordion isEditing={isEditing} />
        <OccupationalHistoryAccordion isEditing={isEditing} />
        <MedicalEvaluationAccordion isEditing={isEditing} />
      </Accordion>
      {isEditing && (
        <div className="flex justify-end gap-4 mt-6">
          <Button
            variant="destructive"
            onClick={() => {
              // Handle cancel logic here
            }}
          >
            Cancelar
          </Button>
          <Button
            className="bg-teal-600 hover:bg-teal-700"
            onClick={() => {
              // Handle save logic here
            }}
          >
            Guardar
          </Button>
        </div>
      )}
    </TabsContent>
  );
}
