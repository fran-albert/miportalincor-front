// src/components/Accordion/Pre-Occupational/Conclusion.tsx

import {
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useDataValuesMutations } from "@/hooks/Data-Values/useDataValuesMutations";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { DataType } from "@/types/Data-Type/Data-Type";

interface ConclusionAccordionProps {
  isEditing: boolean;
  conclusion: string;
  recomendaciones: string;
  setConclusion: (c: string) => void;
  setRecomendaciones: (r: string) => void;
  fields: DataType[];              
  dataValues?: DataValue[];        
  medicalEvaluationId: number;
}

export default function ConclusionAccordion({
  isEditing,
  conclusion,
  recomendaciones,
  setConclusion,
  setRecomendaciones,
  fields,
  dataValues,
  medicalEvaluationId,
}: ConclusionAccordionProps) {
  const { createDataValuesMutation } = useDataValuesMutations();

  const handleSave = () => {
    const payloadItems: { id?: number; dataTypeId: number; value: string }[] = [];

    // Arma el objeto para "Conclusion"
    const conclField = fields.find((f) => f.name === "Conclusion");
    if (conclField && conclusion.trim() !== "") {
      const existing = dataValues?.find((dv) => dv.dataType.id === conclField.id);
      payloadItems.push({
        id: existing?.id,
        dataTypeId: conclField.id,
        value: conclusion,
      });
    }

    // Arma el objeto para "Recomendaciones"
    const recField = fields.find((f) => f.name === "Recomendaciones");
    if (recField && recomendaciones.trim() !== "") {
      const existing = dataValues?.find((dv) => dv.dataType.id === recField.id);
      payloadItems.push({
        id: existing?.id,
        dataTypeId: recField.id,
        value: recomendaciones,
      });
    }

    // Lanza la mutación
    toast.promise(
      createDataValuesMutation.mutateAsync({
        medicalEvaluationId,
        dataValues: payloadItems,
      }),
      {
        loading: <LoadingToast message="Guardando datos..." />,
        success: <SuccessToast message="Datos guardados exitosamente!" />,
        error: <ErrorToast message="Error al guardar los datos" />,
      }
    );
  };

  return (
    <AccordionItem value="conclusion" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Conclusión
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 space-y-4">
        {/* Campo Conclusión */}
        <div className="space-y-2">
          <Label htmlFor="conclusion">Conclusión</Label>
          <Textarea
            id="conclusion"
            placeholder="Ingrese su conclusión..."
            disabled={!isEditing}
            value={conclusion}
            onChange={(e) => setConclusion(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Campo Recomendaciones */}
        <div className="space-y-2">
          <Label htmlFor="recomendaciones">Recomendaciones</Label>
          <Textarea
            id="recomendaciones"
            placeholder="Ingrese sus recomendaciones..."
            disabled={!isEditing}
            value={recomendaciones}
            onChange={(e) => setRecomendaciones(e.target.value)}
            className="min-h-[100px]"
          />
        </div>

        {/* Botones */}
        <div className="flex justify-end gap-4">
          <Button
            className="bg-greenPrimary hover:bg-teal-800"
            disabled={!isEditing || createDataValuesMutation.isPending}
            onClick={handleSave}
          >
            {createDataValuesMutation.isPending ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
