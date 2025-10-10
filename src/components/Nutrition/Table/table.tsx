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
import { Pencil, Trash, Save, ChevronDown, ChevronUp, X } from "lucide-react";
import type {
  NutritionData,
  CreateNutritionDataDto,
} from "@/types/Nutrition-Data/NutritionData";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import CustomDatePicker from "@/components/Date-Picker";
import { cn } from "@/lib/utils";

interface Props {
  nutritionData: NutritionData[];
  onAddEntry: (newEntry: CreateNutritionDataDto) => void;
  onUpdateEntry: (updatedEntry: NutritionData) => void;
  onDeleteEntry: (ids: number[]) => void;
  userId: number;
  isAddingNewEntry: boolean;
  setIsAddingNewEntry: React.Dispatch<React.SetStateAction<boolean>>;
  setNutritionData: React.Dispatch<React.SetStateAction<NutritionData[]>>;
  onCancelNewEntry: () => void;
}

const formatDateForBackend = (dateString: string): string => {
  return dateString;
};

export const NutritionTable: React.FC<Props> = ({
  nutritionData,
  onAddEntry,
  onDeleteEntry,
  userId,
  onUpdateEntry,
  isAddingNewEntry,
  setIsAddingNewEntry,
  onCancelNewEntry,
  setNutritionData,
}) => {
  const [newEntry, setNewEntry] = useState<CreateNutritionDataDto | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [expandedObservations, setExpandedObservations] = useState<{
    [key: number]: boolean;
  }>({});
  const [editDates, setEditDates] = useState<{
    [key: number]: Date | undefined;
  }>({});
  const [newEntryDate, setNewEntryDate] = useState<Date | undefined>(undefined);
  const handleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const handleSelectAll = () => {
    if (selectedIds.length === nutritionData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(nutritionData.map((e) => e.id));
    }
  };

  const handleCancelNewEntry = () => {
    setNewEntry(null);
    setNewEntryDate(undefined);
    onCancelNewEntry();
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    onDeleteEntry(selectedIds);
    setSelectedIds([]);
  };
  useEffect(() => {
    if (isAddingNewEntry) {
      const today = new Date();
      setNewEntryDate(today);
      setNewEntry({
        userId: userId,
        date: format(today, "yyyy-MM-dd"),
        weight: 0,
        difference: 0,
        fatPercentage: 0,
        musclePercentage: 0,
        visceralFat: 0,
        imc: 0,
        targetWeight: 0,
        height: 0,
        observations: "",
      });
      setIsAddingNewEntry(false);
    }
  }, [isAddingNewEntry, userId, setIsAddingNewEntry]);

  // Se modifica para que, en el caso de la fecha, se almacene el string directamente,
  // evitando crear un objeto Date y así los desfases por zona horaria.
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    id?: number
  ) => {
    const { name, value } = e.target;

    // Campos que deben ser number
    const numericFields = new Set([
      "weight",
      "height",
      "difference",
      "fatPercentage",
      "musclePercentage",
      "visceralFat",
      "imc",
      "targetWeight",
    ]);

    // Función auxiliar para parsear el campo según su tipo
    const parseValue = (): number | string => {
      if (name === "date") return value;
      if (numericFields.has(name)) return Number(value);
      return value; // para observaciones y cualquier otro texto
    };

    if (id !== undefined) {
      // Edición de un entry existente
      setNutritionData((prev) =>
        prev.map((entry, idx, arr) => {
          if (entry.id !== id) return entry;

          const updatedEntry: NutritionData = {
            ...entry,
            [name]: parseValue(),
          };

          // Recalcular IMC si cambian peso o altura
          if (name === "weight" || name === "height") {
            const weight = name === "weight" ? Number(value) : entry.weight;
            const height = name === "height" ? Number(value) : entry.height;
            const heightM = height / 100;
            updatedEntry.imc = heightM > 0 ? weight / (heightM * heightM) : 0;
          }

          // Recalcular diferencia si cambia peso
          if (name === "weight") {
            if (idx > 0) {
              const prevWeight = arr[idx - 1].weight;
              updatedEntry.difference = updatedEntry.weight - prevWeight;
            } else {
              updatedEntry.difference = 0;
            }
          }

          return updatedEntry;
        })
      );
    } else {
      // Entrada nueva
      setNewEntry((prev) => {
        if (!prev) return null;

        const updated: CreateNutritionDataDto = {
          ...prev,
          [name]: parseValue(),
        };

        if (name === "weight" || name === "height") {
          const weight = name === "weight" ? Number(value) : prev.weight;
          const height = name === "height" ? Number(value) : prev.height;
          const heightM = height / 100;
          updated.imc = heightM > 0 ? weight / (heightM * heightM) : 0;
        }

        if (name === "weight") {
          if (nutritionData.length > 0) {
            const last = nutritionData[nutritionData.length - 1];
            updated.difference = updated.weight - last.weight;
          } else {
            updated.difference = 0;
          }
        }

        return updated;
      });
    }
  };

  const handleSaveNewEntry = () => {
    if (newEntry) {
      const entryForBackend: CreateNutritionDataDto = {
        ...newEntry,
        date: formatDateForBackend(newEntry.date),
      };
      onAddEntry(entryForBackend);
      setNewEntry(null);
      setIsAddingNewEntry(false);
    }
  };

  const handleEdit = (id: number) => {
    setEditingId(id);
  };

  const handleSaveEdit = (id: number) => {
    const entryToUpdate = nutritionData.find((entry) => entry.id === id);
    if (entryToUpdate) {
      onUpdateEntry(entryToUpdate);
    }
    setEditingId(null);
  };

  const handleDelete = (id: number) => {
    onDeleteEntry([id]);
  };

  const handleDateChange = (date: Date | undefined, entryId: number) => {
    if (!date) return;
    setEditDates((prev) => ({ ...prev, [entryId]: date }));

    const dateString = format(date, "yyyy-MM-dd");
    setNutritionData((prev) =>
      prev.map((entry) =>
        entry.id === entryId ? { ...entry, date: dateString } : entry
      )
    );
  };

  // Helper para manejar cambios de fecha en nueva entrada
  const handleNewEntryDateChange = (date: Date | undefined) => {
    if (!date) return;
    setNewEntryDate(date);

    const dateString = format(date, "yyyy-MM-dd");
    setNewEntry((prev) => (prev ? { ...prev, date: dateString } : null));
  };

  const columnWidths = {
    index: "w-12 md:w-16",
    date: "w-24 md:w-32",
    weight: "w-20 md:w-24",
    difference: "w-20 md:w-24",
    fatPercentage: "w-20 md:w-24",
    musclePercentage: "w-20 md:w-24",
    visceralFat: "w-24 md:w-32",
    height: "w-20 md:w-24",
    imc: "w-20 md:w-24",
    targetWeight: "w-24 md:w-32",
    observations: "w-[200px] md:w-[250px]",
    actions: "w-32 md:w-36",
  };

  return (
    <div className="w-full">
      <div className="max-h-[500px] overflow-y-auto rounded-lg border border-gray-200">
        <Table className="w-full table-auto">
          <TableHeader className="bg-gradient-to-r from-teal-50 to-teal-100 shadow-sm sticky top-0 z-10">
            <TableRow className="border-b-2 border-teal-200">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === nutritionData.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-teal-900">
                Fecha
              </TableHead>
              <TableHead className="font-semibold text-teal-900">
                Peso
              </TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-teal-900">
                Dif.
              </TableHead>

              <TableHead className="hidden lg:table-cell font-semibold text-teal-900">
                % Grasa
              </TableHead>
              <TableHead className="hidden lg:table-cell font-semibold text-teal-900">
                % Músculo
              </TableHead>
              <TableHead className="hidden xl:table-cell font-semibold text-teal-900">
                G. Visceral
              </TableHead>
              <TableHead className="hidden md:table-cell font-semibold text-teal-900">
                IMC
              </TableHead>
              <TableHead className="hidden lg:table-cell font-semibold text-teal-900">
                Talla
              </TableHead>
              <TableHead className="hidden lg:table-cell font-semibold text-teal-900">
                Peso Obj.
              </TableHead>

              <TableHead className="hidden lg:table-cell font-semibold text-teal-900 max-w-[180px]">
                Observaciones
              </TableHead>
              <TableHead className="font-semibold text-teal-900">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
        </Table>
        <TableBody>
          {nutritionData.map((entry) => (
            <TableRow
              key={entry.id}
              className={cn(
                "hover:bg-gray-50 transition-colors duration-150",
                editingId === entry.id && "h-32"
              )}
            >
              <TableCell className="w-12">
                <Checkbox
                  checked={selectedIds.includes(entry.id)}
                  onCheckedChange={() => handleSelect(entry.id)}
                />
              </TableCell>
              <TableCell className={columnWidths.date}>
                {editingId === entry.id ? (
                  <div className="w-full">
                    <CustomDatePicker
                      setStartDate={(date) => handleDateChange(date, entry.id)}
                      setValue={() => {}}
                      fieldName="date"
                      initialDate={
                        editDates[entry.id] ||
                        (typeof entry.date === "string"
                          ? new Date(entry.date)
                          : new Date(entry.date))
                      }
                      compact={true}
                    />
                  </div>
                ) : (
                  <span className="block truncate">
                    {formatDate(entry.date)}
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
                    className="w-full text-sm p-1"
                  />
                ) : (
                  entry.weight.toFixed(1)
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="difference"
                    value={entry.difference.toFixed(1)}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed text-sm p-1"
                  />
                ) : (
                  entry.difference.toFixed(1)
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="fatPercentage"
                    value={String(entry.fatPercentage)}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    className="w-full text-sm p-1"
                  />
                ) : (
                  entry.fatPercentage.toFixed(1)
                )}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="musclePercentage"
                    value={String(entry.musclePercentage)}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    className="w-full text-sm p-1"
                  />
                ) : (
                  entry.musclePercentage.toFixed(1)
                )}
              </TableCell>

              <TableCell className="hidden md:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="imc"
                    value={entry.imc.toFixed(2)}
                    readOnly
                    className="w-full bg-gray-50 cursor-not-allowed text-sm p-1"
                  />
                ) : (
                  entry.imc.toFixed(2)
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="height"
                    step={0.1}
                    min={0}
                    value={entry.height ?? 0}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    onKeyDown={(e) => {
                      // Evita punto y coma decimal
                      if (e.key === "." || e.key === ",") {
                        e.preventDefault();
                      }
                    }}
                    className="w-full text-sm p-1"
                  />
                ) : (
                  (entry.height ?? 0).toFixed(1)
                )}
              </TableCell>
              <TableCell className={columnWidths.targetWeight}>
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="targetWeight"
                    value={String(entry.targetWeight)}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    className="w-full text-sm p-1"
                  />
                ) : (
                  entry.targetWeight.toFixed(1)
                )}
              </TableCell>

              <TableCell className="hidden xl:table-cell">
                {editingId === entry.id ? (
                  <Input
                    type="number"
                    name="visceralFat"
                    value={String(entry.visceralFat)}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    className="w-full text-sm p-1"
                  />
                ) : (
                  entry.visceralFat.toFixed(1)
                )}
              </TableCell>

              <TableCell className="hidden lg:table-cell max-w-[180px]">
                {editingId === entry.id ? (
                  <Textarea
                    name="observations"
                    value={entry.observations || ""}
                    onChange={(e) => handleInputChange(e, entry.id)}
                    className="w-full min-h-[100px] max-w-[180px] resize-none"
                    rows={4}
                  />
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const isExpanded =
                        expandedObservations[entry.id] || false;
                      const MAX_LENGTH = 50;
                      const observations = entry.observations || "-";
                      const shouldTruncate = observations.length > MAX_LENGTH;

                      return (
                        <>
                          <p className="text-sm text-gray-700 break-words whitespace-normal overflow-hidden">
                            {isExpanded || !shouldTruncate
                              ? observations
                              : `${observations.substring(0, MAX_LENGTH)}...`}
                          </p>
                          {shouldTruncate && (
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() =>
                                setExpandedObservations((prev) => ({
                                  ...prev,
                                  [entry.id]: !prev[entry.id],
                                }))
                              }
                              className="h-auto p-0 text-blue-600 hover:text-blue-800 text-xs"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="h-3 w-3 mr-1" />
                                  Ver menos
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="h-3 w-3 mr-1" />
                                  Leer más
                                </>
                              )}
                            </Button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                )}
              </TableCell>

              <TableCell className={columnWidths.actions}>
                <div className="flex gap-2 items-center justify-center">
                  {editingId === entry.id ? (
                    <Button
                      onClick={() => handleSaveEdit(entry.id)}
                      className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-all duration-200 border border-green-500/20"
                      size="sm"
                    >
                      <Save size={16} className="text-green-600" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleEdit(entry.id)}
                      className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 transition-all duration-200 border border-blue-500/20"
                      size="sm"
                    >
                      <Pencil size={16} className="text-blue-600" />
                    </Button>
                  )}
                  <Button
                    onClick={() => handleDelete(entry.id)}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 border border-red-500/20"
                    size="sm"
                  >
                    <Trash size={16} className="text-red-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {newEntry && (
            <TableRow>
              <TableCell className="w-12"></TableCell>
              <TableCell className={columnWidths.date}>
                <div className="w-full">
                  <CustomDatePicker
                    setStartDate={handleNewEntryDateChange}
                    setValue={() => {}}
                    fieldName="date"
                    initialDate={newEntryDate}
                    compact={true}
                  />
                </div>
              </TableCell>

              <TableCell className={columnWidths.weight}>
                <Input
                  type="number"
                  name="weight"
                  value={(newEntry?.weight ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.difference}>
                <Input
                  type="number"
                  name="difference"
                  value={(newEntry?.difference ?? 0).toFixed(1)}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed text-sm p-1"
                />
              </TableCell>

              <TableCell className={columnWidths.fatPercentage}>
                <Input
                  type="number"
                  name="fatPercentage"
                  value={(newEntry?.fatPercentage ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.musclePercentage}>
                <Input
                  type="number"
                  name="musclePercentage"
                  value={(newEntry?.musclePercentage ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.visceralFat}>
                <Input
                  type="number"
                  name="visceralFat"
                  value={(newEntry?.visceralFat ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.imc}>
                <Input
                  type="number"
                  name="imc"
                  value={(newEntry?.imc ?? 0).toFixed(2)}
                  readOnly
                  className="w-full bg-gray-50 cursor-not-allowed text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.height}>
                <Input
                  type="number"
                  name="height"
                  min={0}
                  value={(newEntry.height ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className={columnWidths.targetWeight}>
                <Input
                  type="number"
                  name="targetWeight"
                  value={(newEntry?.targetWeight ?? 0).toString()}
                  onChange={handleInputChange}
                  className="w-full text-sm p-1"
                />
              </TableCell>
              <TableCell className="hidden lg:table-cell max-w-[180px]">
                <Textarea
                  name="observations"
                  value={newEntry.observations || ""}
                  onChange={handleInputChange}
                  className="w-full min-h-[100px] text-sm max-w-[180px] resize-none"
                  rows={4}
                />
              </TableCell>

              <TableCell>
                <div className="flex gap-2 items-center justify-center">
                  <Button
                    onClick={handleSaveNewEntry}
                    className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-all duration-200 border border-green-500/20"
                    size="sm"
                  >
                    <Save size={16} className="text-green-600" />
                  </Button>
                  <Button
                    onClick={handleCancelNewEntry}
                    className="p-2 rounded-lg bg-gray-500/10 hover:bg-gray-500/20 transition-all duration-200 border border-gray-500/20"
                    size="sm"
                  >
                    <X size={16} className="text-gray-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
        {selectedIds.length > 0 && (
          <tfoot>
            <tr>
              <td colSpan={12} className="p-2">
                <Button
                  onClick={handleDeleteSelected}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/20 shadow-sm"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Eliminar seleccionados
                </Button>
              </td>
            </tr>
          </tfoot>
        )}
      </div>
    </div>
  );
};
