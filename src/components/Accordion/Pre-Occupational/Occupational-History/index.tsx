"use client";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/store/store";
import { addOccupationalHistory, setFormData } from "@/store/Pre-Occupational/preOccupationalSlice";
import { Input } from "@/components/ui/input";

interface Props {
  isEditing: boolean;
}

export default function OccupationalHistoryAccordion({ isEditing }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const occupationalHistory = useSelector(
    (state: RootState) => state.preOccupational.formData.occupationalHistory
  );

  // Agrega un nuevo antecedente con descripción vacía
  const handleAddNew = () => {
    const newItem = {
      id: Date.now().toString(),
      description: "",
    };
    dispatch(addOccupationalHistory(newItem));
  };

  // Actualiza la descripción de un antecedente existente
  const handleUpdateDescription = (id: string, value: string) => {
    const updatedHistory = occupationalHistory.map((item) =>
      item.id === id ? { ...item, description: value } : item
    );
    dispatch(setFormData({ occupationalHistory: updatedHistory }));
  };

  return (
    <AccordionItem value="occupational-history" className="border rounded-lg">
      <AccordionTrigger className="px-4 font-bold text-greenPrimary text-lg">
        Antecedentes Ocupacionales
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              disabled={!isEditing}
              onClick={handleAddNew}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Nuevo antecedente
            </Button>
          </div>
          {/* Lista de antecedentes */}
          {occupationalHistory.length > 0 && (
            <div className="space-y-2">
              {occupationalHistory.map((item) => (
                <div key={item.id} className="p-2 border rounded">
                  {isEditing ? (
                    <Input
                      value={item.description}
                      placeholder="Ingrese descripción del antecedente..."
                      onChange={(e) =>
                        handleUpdateDescription(item.id, e.target.value)
                      }
                    />
                  ) : (
                    <span>{item.description || "Sin descripción"}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
