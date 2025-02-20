"use client";

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

  return (
    <ScrollArea className="w-full h-[400px]">
      <Table className="w-full table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">#</TableHead>
            <TableHead className="w-32">Fecha</TableHead>
            <TableHead className="w-24">Peso</TableHead>
            <TableHead className="w-24">Diferencia</TableHead>
            <TableHead className="w-24">% Grasa</TableHead>
            <TableHead className="w-24">% Músculo</TableHead>
            <TableHead className="w-32">Grasa Visceral</TableHead>
            <TableHead className="w-24">IMC</TableHead>
            <TableHead className="w-32">Peso Objetivo</TableHead>
            <TableHead>Observaciones</TableHead>
            <TableHead className="w-24">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {nutritionData.map((entry, index) => (
            <TableRow key={entry.id}>
              <TableCell>{index + 1}</TableCell>
              <TableCell>
                {newEntry && nutritionData.length + 1 === index + 1 ? (
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
                ) : (
                  <span className="px-2 py-1">
                    {formatDate(entry.date.toString())}
                  </span>
                )}
              </TableCell>

              {[
                "weight",
                "difference",
                "fatPercentage",
                "musclePercentage",
                "visceralFat",
                "imc",
                "targetWeight",
              ].map((field) => (
                <TableCell key={field}>
                  {editingId === entry.id ? (
                    <div className="min-w-[100px]">
                      <Input
                        type="number"
                        name={field}
                        value={String(entry[field as keyof NutritionData])}
                        onChange={(e) => handleInputChange(e, entry.id)}
                      />
                    </div>
                  ) : (
                    (entry[field as keyof NutritionData] as number).toFixed(1)
                  )}
                </TableCell>
              ))}
              <TableCell>
                {editingId === entry.id ? (
                  <Input
                    type="text"
                    name="observations"
                    value={entry.observations || ""}
                    onChange={(e) => handleInputChange(e, entry.id)}
                  />
                ) : (
                  entry.observations
                )}
              </TableCell>
              <TableCell className="w-24">
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
              <TableCell>{nutritionData.length + 1}</TableCell>
              <TableCell>
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
              {[
                "weight",
                "difference",
                "fatPercentage",
                "musclePercentage",
                "visceralFat",
                "imc",
                "targetWeight",
              ].map((field) => (
                <TableCell key={field}>
                  <div className="min-w-[100px]">
                    <Input
                      type="number"
                      name={field}
                      value={
                        newEntry[
                          field as keyof CreateNutritionDataDto
                        ]?.toString() || ""
                      }
                      onChange={handleInputChange}
                    />
                  </div>
                </TableCell>
              ))}
              <TableCell>
                <Input
                  type="text"
                  name="observations"
                  value={newEntry.observations || ""}
                  onChange={handleInputChange}
                />
              </TableCell>
              <TableCell>
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
  );
};
