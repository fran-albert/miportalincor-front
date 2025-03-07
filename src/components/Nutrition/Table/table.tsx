import { TableHeader } from "@/components/ui/table";
import type React from "react";
import { useState, useEffect } from "react";
import { formatDate } from "@/common/helpers/helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Pencil, Trash, Save } from "lucide-react";
import type {
  NutritionData,
  CreateNutritionDataDto,
} from "@/types/Nutrition-Data/NutritionData";
import { DatePicker } from "@/components/ui/date-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface Props {
  nutritionData: NutritionData[];
  onAddEntry: (newEntry: CreateNutritionDataDto) => void;
  onUpdateEntry: (updatedEntry: NutritionData) => void;
  onDeleteEntry: (id: number) => void;
  userId: number;
  isAddingNewEntry: boolean;
  setIsAddingNewEntry: React.Dispatch<React.SetStateAction<boolean>>;
  setNutritionData: React.Dispatch<React.SetStateAction<NutritionData[]>>;
}

const formatDateForBackend = (date: Date): string => {
  const offset = date.getTimezoneOffset();
  const correctedDate = new Date(date.getTime() + offset * 60 * 1000);
  return format(correctedDate, "yyyy-MM-dd");
};

export const NutritionTable: React.FC<Props> = ({
  nutritionData,
  onAddEntry,
  onDeleteEntry,
  userId,
  onUpdateEntry,
  isAddingNewEntry,
  setIsAddingNewEntry,
  setNutritionData,
}) => {
  const [newEntry, setNewEntry] = useState<CreateNutritionDataDto | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    if (isAddingNewEntry) {
      setNewEntry({
        userId: userId,
        date: format(new Date(), "yyyy-MM-dd"),
        weight: 0,
        difference: 0,
        fatPercentage: 0,
        musclePercentage: 0,
        visceralFat: 0,
        imc: 0,
        targetWeight: 0,
        observations: "",
      });
      setIsAddingNewEntry(false);
    }
  }, [isAddingNewEntry, userId, setIsAddingNewEntry]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    id?: number
  ) => {
    const { name, value } = e.target;
    if (id !== undefined) {
      setNutritionData((prevData) =>
        prevData.map((entry) =>
          entry.id === id
            ? {
                ...entry,
                [name]:
                  name === "date"
                    ? new Date(value)
                    : name === "observations"
                    ? value
                    : Number(value),
              }
            : entry
        )
      );
    } else {
      setNewEntry((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          [name]:
            name === "date"
              ? new Date(value)
              : name === "observations"
              ? value
              : Number(value),
        };
      });
    }
  };

  const handleSaveNewEntry = () => {
    if (newEntry) {
      const entryForBackend: CreateNutritionDataDto = {
        ...newEntry,
        date: formatDateForBackend(new Date(newEntry.date)),
      };
      onAddEntry(entryForBackend);
      setNewEntry(null);
      setIsAddingNewEntry(false);
    }
  };

  const handleEdit = (id: number) => {
    const entry = nutritionData.find((e) => e.id === id);
    if (entry) {
      setEditingId(id);
    }
  };

  const handleSaveEdit = (id: number) => {
    const entryToUpdate = nutritionData.find((entry) => entry.id === id);
    if (entryToUpdate) {
      onUpdateEntry(entryToUpdate);
    }
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    onDeleteEntry(id);
  };

  const columnWidths = {
    index: "w-16",
    date: "w-32",
    weight: "w-24",
    difference: "w-24",
    fatPercentage: "w-24",
    musclePercentage: "w-24",
    visceralFat: "w-32",
    imc: "w-24",
    targetWeight: "w-32",
    observations: "w-auto",
    actions: "w-24",
  };

  return (
    <div className="w-full h-[400px] flex flex-col">
      {/* Header fijo fuera del ScrollArea */}
      <Table className="w-full table-fixed">
        <TableHeader className="bg-white shadow-sm">
          <TableRow>
            <TableHead className={columnWidths.index}>#</TableHead>
            <TableHead className={columnWidths.date}>Fecha</TableHead>
            <TableHead className={columnWidths.weight}>Peso</TableHead>
            <TableHead className={columnWidths.difference}>
              Diferencia
            </TableHead>
            <TableHead className={columnWidths.fatPercentage}>
              % Grasa
            </TableHead>
            <TableHead className={columnWidths.musclePercentage}>
              % Músculo
            </TableHead>
            <TableHead className={columnWidths.visceralFat}>
              Grasa Visceral
            </TableHead>
            <TableHead className={columnWidths.imc}>IMC</TableHead>
            <TableHead className={columnWidths.targetWeight}>
              Peso Objetivo
            </TableHead>
            <TableHead className={columnWidths.observations}>
              Observaciones
            </TableHead>
            <TableHead className={columnWidths.actions}>Acciones</TableHead>
          </TableRow>
        </TableHeader>
      </Table>

      {/* Cuerpo desplazable dentro del ScrollArea */}
      <ScrollArea className="flex-1 w-full">
        <Table className="w-full table-fixed">
          <TableBody>
            {nutritionData.map((entry, index) => (
              <TableRow key={entry.id}>
                <TableCell className={columnWidths.index}>
                  {index + 1}
                </TableCell>
                <TableCell className={columnWidths.date}>
                  {editingId === entry.id ? (
                    <DatePicker
                      value={entry.date ? new Date(entry.date) : new Date()}
                      onChange={(selectedDate) => {
                        setNutritionData((prevData) =>
                          prevData.map((e) =>
                            e.id === entry.id
                              ? {
                                  ...e,
                                  date: selectedDate
                                    ? format(selectedDate, "yyyy-MM-dd")
                                    : e.date,
                                }
                              : e
                          )
                        );
                      }}
                    />
                  ) : (
                    <span className="block truncate">
                      {formatDate(entry.date.toString())}
                    </span>
                  )}
                </TableCell>
                <TableCell className={columnWidths.weight}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="weight"
                      value={String(entry.weight)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.weight.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.difference}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="difference"
                      value={String(entry.difference)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.difference.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.fatPercentage}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="fatPercentage"
                      value={String(entry.fatPercentage)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.fatPercentage.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.musclePercentage}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="musclePercentage"
                      value={String(entry.musclePercentage)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.musclePercentage.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.visceralFat}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="visceralFat"
                      value={String(entry.visceralFat)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.visceralFat.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.imc}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="imc"
                      value={String(entry.imc)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.imc.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.targetWeight}>
                  {editingId === entry.id ? (
                    <Input
                      type="number"
                      name="targetWeight"
                      value={String(entry.targetWeight)}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    entry.targetWeight.toFixed(1)
                  )}
                </TableCell>
                <TableCell className={columnWidths.observations}>
                  {editingId === entry.id ? (
                    <Input
                      type="text"
                      name="observations"
                      value={entry.observations || ""}
                      onChange={(e) => handleInputChange(e, entry.id)}
                      className="w-full"
                    />
                  ) : (
                    <span className="block truncate">{entry.observations}</span>
                  )}
                </TableCell>
                <TableCell className={columnWidths.actions}>
                  <div className="flex gap-2 items-center">
                    {editingId === entry.id ? (
                      <Button
                        onClick={() => handleSaveEdit(entry.id)}
                        className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors duration-200"
                      >
                        <Save size={20} className="text-green-600" />
                      </Button>
                    ) : (
                      <Button
                        onClick={() => handleEdit(entry.id)}
                        className="p-2 rounded bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                      >
                        <Pencil size={20} className="text-blue-600" />
                      </Button>
                    )}
                    <Button
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 rounded bg-red-100 hover:bg-red-200 transition-colors duration-200"
                    >
                      <Trash size={20} className="text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {newEntry && (
              <TableRow>
                <TableCell className={columnWidths.index}>
                  {nutritionData.length + 1}
                </TableCell>
                <TableCell className={columnWidths.date}>
                  <DatePicker
                    value={newEntry.date ? new Date(newEntry.date) : new Date()}
                    onChange={(selectedDate) => {
                      setNewEntry((prev) => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          date: selectedDate
                            ? format(selectedDate, "yyyy-MM-dd")
                            : prev.date,
                        };
                      });
                    }}
                  />
                </TableCell>
                <TableCell className={columnWidths.weight}>
                  <Input
                    type="number"
                    name="weight"
                    value={(newEntry?.weight ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.difference}>
                  <Input
                    type="number"
                    name="difference"
                    value={newEntry.difference?.toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.fatPercentage}>
                  <Input
                    type="number"
                    name="fatPercentage"
                    value={(newEntry?.fatPercentage ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.musclePercentage}>
                  <Input
                    type="number"
                    name="musclePercentage"
                    value={(newEntry?.musclePercentage ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.visceralFat}>
                  <Input
                    type="number"
                    name="visceralFat"
                    value={(newEntry?.visceralFat ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.imc}>
                  <Input
                    type="number"
                    name="imc"
                    value={(newEntry?.imc ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.targetWeight}>
                  <Input
                    type="number"
                    name="targetWeight"
                    value={(newEntry?.targetWeight ?? 0).toString()}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.observations}>
                  <Input
                    type="text"
                    name="observations"
                    value={newEntry.observations || ""}
                    onChange={handleInputChange}
                    className="w-full"
                  />
                </TableCell>
                <TableCell className={columnWidths.actions}>
                  <Button
                    onClick={handleSaveNewEntry}
                    className="p-2 rounded bg-green-100 hover:bg-green-200 transition-colors duration-200"
                  >
                    <Save size={20} className="text-green-600" />
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
};
