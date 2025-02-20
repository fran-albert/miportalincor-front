"use client";
import { TabsContent } from "@/components/ui/tabs";
import { Accordion } from "@/components/ui/accordion";
import EvaluationType from "./EvaluationType";
import GeneralInfoAccordion from "@/components/Accordion/Pre-Occupational/General-Info";
import TestsAccordion from "@/components/Accordion/Pre-Occupational/Tests";
import ExamsResultsAccordion from "@/components/Accordion/Pre-Occupational/Exam-Results";
import ConclusionAccordion from "@/components/Accordion/Pre-Occupational/Conclusion";
import { Pencil } from "lucide-react";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function GeneralTab({ isEditing, setIsEditing }: Props) {
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

      <div className="rounded-lg border p-4">
        <h3 className="mb-4 font-bold text-greenPrimary text-lg">
          Tipo de Evaluación
        </h3>
        <EvaluationType isEditing={isEditing} />
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        <GeneralInfoAccordion isEditing={isEditing} />
        <TestsAccordion isEditing={isEditing} />
        <ExamsResultsAccordion isEditing={isEditing} />
        <ConclusionAccordion isEditing={isEditing} setIsEditing={setIsEditing} />
      </Accordion>
    </TabsContent>
  );
}
