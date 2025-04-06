import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  setFormData,
  OccupationalHistoryItem,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Input } from "@/components/ui/input";
import { DataValue } from "@/types/Data-Value/Data-Value";
import { useEffect, useState } from "react";

interface Props {
  isEditing: boolean;
  dataValues?: DataValue[];
}

export default function OccupationalHistoryAccordion({
  isEditing,
  dataValues,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const [historyItems, setHistoryItems] = useState<OccupationalHistoryItem[]>(
    []
  );

  useEffect(() => {
    if (dataValues && dataValues.length > 0) {
      const antecedentes = dataValues.filter(
        (item) =>
          item.dataType.name === "Antecedentes ocupacionales" &&
          item.dataType.category === "ANTECEDENTES"
      );

      const mappedItems = antecedentes.map((item) => ({
        id: item.id.toString(),
        description: item.value || "",
      }));

      setHistoryItems(mappedItems);
      dispatch(setFormData({ occupationalHistory: mappedItems }));
    } else {
      setHistoryItems([]);
      dispatch(setFormData({ occupationalHistory: [] }));
    }
  }, [dataValues, dispatch]);

  const generateTempId = (): string => {
    return `temp-${Date.now()}`;
  };

  const handleAddNew = () => {
    const newItem: OccupationalHistoryItem = {
      id: generateTempId(),
      description: "",
    };

    const updatedItems = [...historyItems, newItem];
    setHistoryItems(updatedItems);
    dispatch(setFormData({ occupationalHistory: updatedItems }));
  };

  const handleUpdateDescription = (id: string, value: string) => {
    const updatedItems = historyItems.map((item) =>
      item.id === id ? { ...item, description: value } : item
    );
    setHistoryItems(updatedItems);
    dispatch(setFormData({ occupationalHistory: updatedItems }));
  };

  const handleRemoveItem = (id: string) => {
    const filteredItems = historyItems.filter((item) => item.id !== id);
    setHistoryItems(filteredItems);
    dispatch(setFormData({ occupationalHistory: filteredItems }));
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

          {historyItems.length > 0 ? (
            <div className="space-y-2">
              {historyItems.map((item) => (
                <div key={item.id} className="p-2 border rounded flex gap-2">
                  <div className="flex-grow">
                    {isEditing ? (
                      <Input
                        value={item.description}
                        placeholder="Ingrese descripción del antecedente..."
                        onChange={(e) => {
                          const newValue = e.currentTarget.value;
                          handleUpdateDescription(item.id, newValue);
                        }}
                      />
                    ) : (
                      <span>{item.description || "Sin descripción"}</span>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">
              No hay antecedentes ocupacionales registrados.
            </p>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
