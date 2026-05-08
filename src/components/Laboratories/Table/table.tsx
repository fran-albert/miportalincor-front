import { RefObject, UIEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Search } from "@/components/ui/search";
import { normalizeDate } from "@/common/helpers/helpers";
import LabDialog from "../Dialog";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  BloodTestData,
  BloodTestDataRequest,
  BloodTestDataUpdateRequestItem,
} from "@/types/Blod-Test-Data/Blod-Test-Data";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestDataMutations } from "@/hooks/Blod-Test-Data/useBlodTestDataMutation";
import { BloodTestDataResponse } from "@/types/Blod-Test-Data/Blod-Test-Data";

type LabDateColumn = {
  key: string;
  label: string;
  normalizedDate: string;
  sortValue: number;
  studyId?: string;
};

const MISSING_DATE_LABEL = "Sin fecha";

const transformData = (originalData: BloodTestData[]): BloodTestDataResponse[] => {
  // Agrupar los datos por estudio
  const groupedByStudy = originalData.reduce((acc, item) => {
    const studyId = item.study.id;
    if (!acc[studyId]) {
      acc[studyId] = {
        study: item.study,
        bloodTestData: [],
      };
    }
    acc[studyId].bloodTestData.push({
      id: Number(item.id) || 0,
      value: item.value,
      bloodTest: item.bloodTest,
    });
    return acc;
  }, {} as Record<string | number, BloodTestDataResponse>);

  return Object.values(groupedByStudy).sort(
    (a, b) => getDateTime(a.study.date ?? "") - getDateTime(b.study.date ?? "")
  );
};

const getDateTime = (date: string): number => {
  const normalizedDate = normalizeLabDate(date);

  if (normalizedDate) {
    const parsedDate = new Date(`${normalizedDate}T12:00:00`);
    return Number.isNaN(parsedDate.getTime())
      ? Number.MAX_SAFE_INTEGER
      : parsedDate.getTime();
  }

  return Number.MAX_SAFE_INTEGER;
};

const normalizeLabDate = (date: string): string => {
  const trimmedDate = String(date ?? "").trim();

  if (!trimmedDate || trimmedDate === MISSING_DATE_LABEL) {
    return "";
  }

  return normalizeDate(trimmedDate);
};

const formatLabDateLabel = (date: string): string => {
  const normalizedDate = normalizeLabDate(date);

  if (!normalizedDate) {
    return MISSING_DATE_LABEL;
  }

  const [year, month, day] = normalizedDate.split("-");
  return `${day}-${month}-${year}`;
};

const buildStudyColumn = (study: BloodTestDataResponse["study"]): LabDateColumn => {
  const normalizedDate = normalizeLabDate(study.date ?? "");

  return {
    key: `study:${study.id}`,
    label: formatLabDateLabel(study.date ?? ""),
    normalizedDate,
    sortValue: getDateTime(study.date ?? ""),
    studyId: String(study.id),
  };
};

const buildNewColumn = (newDate: string): LabDateColumn | null => {
  const normalizedDate = normalizeLabDate(newDate);

  if (!normalizedDate) {
    return null;
  }

  return {
    key: `new:${normalizedDate}`,
    label: formatLabDateLabel(normalizedDate),
    normalizedDate,
    sortValue: getDateTime(normalizedDate),
  };
};

const compareColumns = (a: LabDateColumn, b: LabDateColumn) => {
  if (a.sortValue !== b.sortValue) {
    return a.sortValue - b.sortValue;
  }

  return a.key.localeCompare(b.key);
};

export const LabPatientTable = ({
  bloodTestsData = [],
  bloodTests = [],
  idUser,
}: {
  bloodTests: BloodTest[];
  bloodTestsData: BloodTestData[];
  idUser: number;
}) => {
  const { addBlodTestDataMutation, updateBlodTestMutation } =
    useBlodTestDataMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<LabDateColumn[]>([]);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: { [bloodTestId: string]: string };
  }>({});
  const [note, setNote] = useState<string>("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [transformedBloodTestsData, setTransformedBloodTestsData] = useState<
    BloodTestDataResponse[]
  >([]);
  const { promiseToast } = useToastContext();

  const tableMinWidth = useMemo(() => 540 + dates.length * 132, [dates.length]);

  useEffect(() => {
    const transformedData = transformData(bloodTestsData);
    setTransformedBloodTestsData(transformedData);

    const columnsByKey = transformedData.reduce((acc, group) => {
      const column = buildStudyColumn(group.study);
      acc.set(column.key, column);
      return acc;
    }, new Map<string, LabDateColumn>());

    const sortedDates = Array.from(columnsByKey.values()).sort(compareColumns);

    setDates(sortedDates);
  }, [bloodTestsData]);

  const filteredBloodTests = bloodTests.filter((test) =>
    test.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    dateKey: string,
    bloodTestId: string,
    value: string
  ) => {
    setEditedValues((prev) => {
      const updated = {
        ...prev,
        [dateKey]: {
          ...(prev[dateKey] || {}),
          [bloodTestId]: value,
        },
      };
      setHasPendingChanges(true);
      return updated;
    });
  };
  const handleAddNewColumn = (newDate: string) => {
    const newColumn = buildNewColumn(newDate);

    if (!newColumn) {
      return;
    }

    setDates((prevDates) => {
      if (prevDates.some((date) => date.normalizedDate === newColumn.normalizedDate)) {
        return prevDates;
      }
      const updatedDates = [...prevDates, newColumn].sort(compareColumns);
      return updatedDates;
    });
  };

  const syncHorizontalScroll = (
    event: UIEvent<HTMLDivElement>,
    targetRef: RefObject<HTMLDivElement | null>
  ) => {
    const target = targetRef.current;

    if (!target || target.scrollLeft === event.currentTarget.scrollLeft) {
      return;
    }

    target.scrollLeft = event.currentTarget.scrollLeft;
  };

  const handleConfirmChanges = async () => {
    try {
      const updates: {
        idStudy: string;
        blodTest: BloodTestDataUpdateRequestItem[];
      }[] = [];
      const newEntries: BloodTestDataRequest[] = [];

      Object.entries(editedValues).forEach(([dateKey, tests]) => {
        const column = dates.find((date) => date.key === dateKey);

        if (!column) {
          return;
        }

        const existingStudyForDate = column.studyId
          ? bloodTestsData.find((data) => String(data.study.id) === column.studyId)
              ?.study
          : bloodTestsData.find(
              (data) => normalizeLabDate(data.study.date) === column.normalizedDate
            )?.study;

        // Si existe un estudio para esta fecha, será una actualización
        if (existingStudyForDate) {
          const updateGroup = {
            idStudy: String(existingStudyForDate.id),
            blodTest: [] as BloodTestDataUpdateRequestItem[],
          };

          Object.entries(tests).forEach(([bloodTestId, value]) => {
            const bloodTestIdAsNumber = parseInt(bloodTestId, 10);
            const existingData = bloodTestsData.find(
              (data) =>
                String(data.study.id) === String(existingStudyForDate.id) &&
                data.bloodTest.id === bloodTestIdAsNumber
            );

            if (existingData?.id) {
              // Actualizar valor existente
              if (String(existingData.value).trim() !== String(value).trim()) {
                updateGroup.blodTest.push({
                  id: Number(existingData.id),
                  value,
                  idBloodtest: bloodTestIdAsNumber,
                });
              }
            } else {
              // Agregar nuevo valor a estudio existente
              updateGroup.blodTest.push({
                id: 0,
                value,
                idBloodtest: bloodTestIdAsNumber,
              });
            }
          });

          if (updateGroup.blodTest.length > 0) {
            updates.push(updateGroup);
          }
        } else {
          if (!column.normalizedDate) {
            return;
          }

          // Crear nuevo estudio con sus valores
          const newEntry: BloodTestDataRequest = {
            userId: idUser,
            note,
            date: column.normalizedDate,
            bloodTestDatas: Object.entries(tests).map(
              ([bloodTestId, value]) => ({
                id: 0,
                idBloodTest: parseInt(bloodTestId, 10),
                value,
              })
            ),
          };
          newEntries.push(newEntry);
        }
      });

      // Procesar actualizaciones
      if (updates.length > 0) {
        await Promise.all(
          updates.map((update) =>
            promiseToast(
              updateBlodTestMutation.mutateAsync({
                idStudy: update.idStudy,
                bloodTestDataRequests: update.blodTest,
              }),
              {
                loading: {
                  title: "Actualizando laboratorio",
                  description: "Por favor espera mientras procesamos tu solicitud",
                },
                success: {
                  title: "Laboratorio actualizado",
                  description: "El laboratorio se actualizó exitosamente",
                },
                error: (error: unknown) => ({
                  title: "Error al actualizar el laboratorio",
                  description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
                }),
              }
            )
          )
        );
      }

      // Procesar nuevas entradas
      if (newEntries.length > 0) {
        await Promise.all(
          newEntries.map((entry) =>
            promiseToast(addBlodTestDataMutation.mutateAsync(entry), {
              loading: {
                title: "Creando laboratorio",
                description: "Por favor espera mientras procesamos tu solicitud",
              },
              success: {
                title: "Laboratorio creado",
                description: "El laboratorio se creó exitosamente",
              },
              error: (error: unknown) => ({
                title: "Error al crear el laboratorio",
                description: (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
              }),
            })
          )
        );
      }

      setEditedValues({});
      setHasPendingChanges(false);
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Search
            placeholder="Buscar análisis..."
            className="w-full px-4 py-2 border rounded-md sm:max-w-md"
            value={searchTerm}
            color="#187B80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex shrink-0 gap-2">
            <LabDialog
              onSetNote={setNote}
              onAddNewColumn={handleAddNewColumn}
            />
          </div>
        </div>

        <div
          ref={topScrollRef}
          className="overflow-x-auto overflow-y-hidden rounded-md border border-gray-200 bg-white"
          onScroll={(event) => syncHorizontalScroll(event, tableScrollRef)}
        >
          <div style={{ width: tableMinWidth, height: 1 }} />
        </div>

        <div
          ref={tableScrollRef}
          className="isolate max-h-[28rem] overflow-auto rounded-md border border-gray-200"
          onScroll={(event) => syncHorizontalScroll(event, topScrollRef)}
        >
          <Table
            className="w-max min-w-full border-separate border-spacing-0 text-sm"
            style={{ minWidth: tableMinWidth }}
          >
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 top-0 z-50 min-w-[190px] max-w-[230px] border-b border-r bg-slate-50 px-3 py-3 shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45),0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Análisis
                </TableHead>
                <TableHead className="sticky top-0 z-40 min-w-[220px] border-b bg-slate-50 px-3 py-3 shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Valor de Referencia
                </TableHead>
                <TableHead className="sticky top-0 z-40 min-w-[130px] border-b bg-slate-50 px-3 py-3 shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Unidad
                </TableHead>
                {dates.map((date) => (
                  <TableHead
                    key={date.key}
                    className="sticky top-0 z-40 min-w-[132px] border-b bg-slate-50 px-3 py-3 text-center shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)]"
                  >
                    {date.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBloodTests.map((bloodTest) => {
                return (
                  <TableRow key={bloodTest.id} className="group hover:bg-gray-50/70">
                    <TableCell className="sticky left-0 z-30 min-w-[190px] max-w-[230px] border-r bg-white px-3 py-2 font-medium leading-snug shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)] group-hover:bg-gray-50">
                      {bloodTest.originalName}
                    </TableCell>
                    <TableCell className="min-w-[220px] max-w-[260px] whitespace-pre-wrap px-3 py-2 text-gray-700">
                      {bloodTest.referenceValue || "N/A"}
                    </TableCell>
                    <TableCell className="min-w-[130px] px-3 py-2 text-gray-700">
                      {bloodTest.unit?.shortName || bloodTest.unit?.name || "N/A"}
                    </TableCell>

                    {dates.map((date) => {
                      // Encontramos el estudio correspondiente a la fecha
                      const relatedStudy = transformedBloodTestsData.find(
                        (studyGroup) =>
                          date.studyId
                            ? String(studyGroup.study.id) === date.studyId
                            : normalizeLabDate(studyGroup.study.date) ===
                              date.normalizedDate
                      );

                      // Si hay un estudio en esta fecha, buscar el análisis de sangre dentro de él
                      const relatedData = relatedStudy?.bloodTestData.find(
                        (test) => test.bloodTest.id === bloodTest.id
                      );

                      // Verificar si se encontró el valor y asignarlo
                      const inputValue =
                        editedValues[date.key]?.[bloodTest.id as number] ??
                        (relatedData ? relatedData.value : "");

                      return (
                        <TableCell key={date.key} className="min-w-[132px] px-3 py-2 text-center">
                          <input
                            type="text"
                            value={inputValue}
                            className="h-9 w-full rounded-md border px-2 text-center text-sm focus:border-greenPrimary focus:outline-none focus:ring-1 focus:ring-greenPrimary"
                            onChange={(e) =>
                              handleInputChange(
                                date.key,
                                String(bloodTest.id),
                                e.target.value
                              )
                            }
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        {hasPendingChanges && (
          <div className="flex justify-end mt-4">
            <Button
              className="bg-greenPrimary text-white"
              onClick={handleConfirmChanges}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
