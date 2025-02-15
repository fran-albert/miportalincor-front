"use client";

import { Label } from "@/components/ui/label";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";

interface Props {
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
}

export default function ConclusionAccordion({ isEditing, setIsEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { conclusion, recomendaciones, conclusionOptions } = useSelector(
    (state: RootState) => state.preOccupational.formData
  );
  
  const [isFinalized, setIsFinalized] = useState(false);

  const options = [
    { value: "apto-001", label: "Apto para desempeñar el cargo sin patología aparente" },
    { value: "apto-002", label: "Apto para desempeñar el cargo con patología que no limite lo laboral" },
    { value: "apto-003", label: "Apto con restricciones" },
    { value: "no-apto", label: "No apto" },
    { value: "aplazado", label: "Aplazado" },
  ];

  // Actualiza el campo de conclusión
  const handleConclusionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setFormData({ conclusion: e.target.value }));
  };

  // Actualiza el campo de recomendaciones
  const handleRecomendacionesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    dispatch(setFormData({ recomendaciones: e.target.value }));
  };

  // Alterna el valor de una opción de conclusión
  const handleToggleOption = (optionValue: string) => {
    dispatch(
      setFormData({
        conclusionOptions: {
          ...conclusionOptions,
          [optionValue]: !conclusionOptions[optionValue as keyof typeof conclusionOptions],
        },
      })
    );
  };

  return (
    <AccordionItem value="conclusion" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Conclusión
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          {/* Campo: Conclusión */}
          <div className="space-y-2">
            <Textarea
              id="conclusion"
              className="min-h-[100px] mt-2"
              placeholder="Ingrese su conclusión..."
              disabled={!isEditing}
              value={conclusion}
              onChange={handleConclusionChange}
            />
          </div>

          {/* Opciones de Conclusión */}
          {options.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={option.value}
                disabled={!isEditing}
                checked={Boolean(
                  conclusionOptions &&
                  conclusionOptions[option.value as keyof typeof conclusionOptions]
                )}
                onCheckedChange={() => isEditing && handleToggleOption(option.value)}
                className="rounded-md transition-all text-greenPrimary disabled:opacity-50"
              />
              <Label htmlFor={option.value} className="text-sm font-medium">
                {option.label}
              </Label>
            </div>
          ))}

          {/* Campo: Recomendaciones / Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="recomendaciones">Recomendaciones / Observaciones</Label>
            <Textarea
              id="recomendaciones"
              className="min-h-[100px]"
              disabled={!isEditing}
              value={recomendaciones}
              onChange={handleRecomendacionesChange}
            />
          </div>

          {/* Finalizado */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="finalizado"
              checked={isFinalized}
              onCheckedChange={(checked) => {
                setIsFinalized(checked as boolean);
                if (checked) setIsEditing(false);
              }}
              disabled={!isEditing}
              className="disabled:opacity-50"
            />
            <Label htmlFor="finalizado">Marcar como finalizado</Label>
          </div>

          <div className="flex justify-end gap-4">
            <Button variant="destructive" disabled={!isEditing}>
              Cancelar
            </Button>
            <Button disabled={!isEditing} className="bg-greenPrimary hover:bg-teal-800">
              Guardar
            </Button>
          </div>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
