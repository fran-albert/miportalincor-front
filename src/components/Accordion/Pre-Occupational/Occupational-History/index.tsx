import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Plus, Trash } from "lucide-react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch } from "@/store/store";
import {
  setFormData,
  OccupationalHistoryItem,
} from "@/store/Pre-Occupational/preOccupationalSlice";
import { Textarea } from "@/components/ui/textarea";
import { RootState } from "@/store/store";

interface Props {
  isEditing: boolean;
  standalone?: boolean;
}

export default function OccupationalHistoryAccordion({
  isEditing,
  standalone = false,
}: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const historyItems = useSelector(
    (state: RootState) => state.preOccupational.formData.occupationalHistory
  );

  const generateTempId = (): string => {
    return `temp-${Date.now()}`;
  };

  const handleAddNew = () => {
    const newItem: OccupationalHistoryItem = {
      id: generateTempId(),
      description: "",
    };

    const updatedItems = [...historyItems, newItem];
    dispatch(setFormData({ occupationalHistory: updatedItems }));
  };

  const handleUpdateDescription = (id: string, value: string) => {
    const updatedItems = historyItems.map((item) =>
      item.id === id ? { ...item, description: value } : item
    );
    dispatch(setFormData({ occupationalHistory: updatedItems }));
  };

  const handleRemoveItem = (id: string) => {
    const filteredItems = historyItems.filter((item) => item.id !== id);
    dispatch(setFormData({ occupationalHistory: filteredItems }));
  };

  const content = (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          disabled={!isEditing}
          onClick={handleAddNew}
          className="flex items-center gap-2 border-greenPrimary/20 bg-white/80 text-greenSecondary hover:border-greenPrimary/35 hover:bg-greenPrimary/5"
        >
          <Plus className="h-4 w-4" />
          Nuevo antecedente
        </Button>
      </div>

      {historyItems.length > 0 ? (
        <div className="space-y-5">
          {historyItems.map((item, index) => (
            <section
              key={item.id}
              className="space-y-3 border-t border-slate-200 pt-5 first:border-t-0 first:pt-0"
            >
              <div className="flex items-center justify-between gap-3">
                <h4 className="text-sm font-semibold text-slate-800">
                  Antecedente {index + 1}
                </h4>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item.id)}
                    className="h-8 w-8 text-red-500 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isEditing ? (
                <Textarea
                  rows={4}
                  value={item.description}
                  aria-label={`Antecedente ${index + 1}`}
                  placeholder="Describí tareas previas, exposición o dato ocupacional relevante..."
                  onChange={(e) => {
                    const newValue = e.currentTarget.value;
                    handleUpdateDescription(item.id, newValue);
                  }}
                  className="resize-none bg-white text-slate-900"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                  {item.description || "Sin descripción"}
                </p>
              )}
            </section>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-sm text-slate-500">
          No hay antecedentes ocupacionales registrados.
        </div>
      )}
    </div>
  );

  if (standalone) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4">
        {content}
      </div>
    );
  }

  return (
    <AccordionItem
      value="occupational-history"
      className="border-slate-200 bg-white last:border-b-0"
    >
      <AccordionTrigger className="px-4 text-base font-semibold text-greenPrimary">
        Antecedentes
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">{content}</AccordionContent>
    </AccordionItem>
  );
}
