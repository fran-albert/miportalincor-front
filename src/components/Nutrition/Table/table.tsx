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
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Props {
  nutritionData: NutritionData[];
  onAddEntry: (newEntry: CreateNutritionDataDto) => void;
  onUpdateEntry: (updatedEntry: NutritionData) => void;
  onDeleteEntry: (ids: number[]) => void;
  userId: number;
  isAddingNewEntry: boolean;
  setIsAddingNewEntry: React.Dispatch<React.SetStateAction<boolean>>;
  setNutritionData: React.Dispatch<React.SetStateAction<NutritionData[]>>;
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
  setNutritionData,
}) => {
  const [newEntry, setNewEntry] = useState<CreateNutritionDataDto | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    onDeleteEntry(selectedIds);
    setSelectedIds([]);
  };
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
    <div className="w-full h-[400px] ">
      <ScrollArea className="w-full h-full">
        <div className="min-w-[1200px]">
          <Table className="w-full table-fixed">
          <TableHeader className="bg-white shadow-sm sticky top-0 z-10">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedIds.length === nutritionData.length}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className={columnWidths.index}>#</TableHead>
              <TableHead className={columnWidths.date}>Fecha</TableHead>
              <TableHead className={columnWidths.weight}>Peso (kg)</TableHead>
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
              <TableHead className={columnWidths.height}>Talla (cm)</TableHead>
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
          <ScrollArea className="h-[350px]">
            <Table className="w-full table-fixed">
              <TableBody>
              {nutritionData.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell className="w-12">
                    <Checkbox
                      checked={selectedIds.includes(entry.id)}
                      onCheckedChange={() => handleSelect(entry.id)}
                    />
                  </TableCell>
                  <TableCell className={columnWidths.index}>
                    {index + 1}
                  </TableCell>
                  <TableCell className={columnWidths.date}>
                    {editingId === entry.id ? (
                      <input
                        type="date"
                        name="date"
                        value={
                          typeof entry.date === "string"
                            ? entry.date
                            : format(new Date(entry.date), "yyyy-MM-dd")
                        }
                        onChange={(e) => handleInputChange(e, entry.id)}
                        className="w-full"
                      />
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
                        value={entry.difference.toFixed(1)}
                        readOnly
                        className="w-full bg-gray-50 cursor-not-allowed"
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
                        value={entry.imc.toFixed(2)}
                        readOnly
                        className="w-full bg-gray-50 cursor-not-allowed"
                      />
                    ) : (
                      entry.imc.toFixed(2)
                    )}
                  </TableCell>
                  <TableCell className={columnWidths.height}>
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
                        className="w-full"
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
                        className="w-full"
                      />
                    ) : (
                      entry.targetWeight.toFixed(1)
                    )}
                  </TableCell>
                  <TableCell className={columnWidths.observations}>
                    {editingId === entry.id ? (
                      <Textarea
                        name="observations"
                        value={entry.observations || ""}
                        onChange={(e) => handleInputChange(e, entry.id)}
                        className="w-full min-h-[80px]"
                        rows={3}
                      />
                    ) : (
                      <TableCell className={columnWidths.observations}>
                        <div className="relative group">
                          {/* Texto truncado por defecto */}
                          <span className="block truncate max-w-[200px]">
                            {entry.observations}
                          </span>

                          {/* Overlay que aparece en hover */}
                          <div
                            className={`
        hidden group-hover:block transition-all duration-200 ease-out
        absolute
        top-0 left-0
        w-auto
        max-w-md      /* ancho máximo al expandirse */
        bg-white
        p-2
        rounded
        shadow-lg
        z-50
      `}
                          >
                            {entry.observations}
                          </div>
                        </div>
                      </TableCell>
                    )}
                  </TableCell>

                  <TableCell className={columnWidths.actions}>
                    <div className="flex gap-1 items-center justify-center">
                      {editingId === entry.id ? (
                        <Button
                          onClick={() => handleSaveEdit(entry.id)}
                          className="p-1.5 rounded bg-green-100 hover:bg-green-200 transition-colors duration-200"
                          size="sm"
                        >
                          <Save size={16} className="text-green-600" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleEdit(entry.id)}
                          className="p-1.5 rounded bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
                          size="sm"
                        >
                          <Pencil size={16} className="text-blue-600" />
                        </Button>
                      )}
                      <Button
                        onClick={() => handleDelete(entry.id)}
                        className="p-1.5 rounded bg-red-100 hover:bg-red-200 transition-colors duration-200"
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
                  <TableCell className={columnWidths.index}>
                    {nutritionData.length + 1}
                  </TableCell>
                  <TableCell className={columnWidths.date}>
                    <input
                      type="date"
                      name="date"
                      value={newEntry.date}
                      onChange={(e) => handleInputChange(e)}
                      className="w-full"
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
                      value={(newEntry?.difference ?? 0).toFixed(1)}
                      readOnly
                      className="w-full bg-gray-50 cursor-not-allowed"
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
                      value={(newEntry?.imc ?? 0).toFixed(2)}
                      readOnly
                      className="w-full bg-gray-50 cursor-not-allowed"
                    />
                  </TableCell>
                  <TableCell className={columnWidths.height}>
                    <Input
                      type="number"
                      name="height"
                      min={0}
                      value={(newEntry.height ?? 0).toString()}
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
                    <Textarea
                      name="observations"
                      value={newEntry.observations || ""}
                      onChange={handleInputChange}
                      className="w-full min-h-[80px]"
                      rows={3}
                    />
                  </TableCell>

                  <TableCell className={columnWidths.actions}>
                    <Button
                      onClick={handleSaveNewEntry}
                      className="p-1.5 rounded bg-green-100 hover:bg-green-200 transition-colors duration-200"
                      size="sm"
                    >
                      <Save size={16} className="text-green-600" />
                    </Button>
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
                      className="bg-red-100 hover:bg-red-200 text-red-600"
                    >
                      Eliminar seleccionados
                    </Button>
                  </td>
                </tr>
              </tfoot>
            )}
            </Table>
          </ScrollArea>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
