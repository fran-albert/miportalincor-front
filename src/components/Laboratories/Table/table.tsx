import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Search } from "@/components/ui/search";
import { formatDate, normalizeDate } from "@/common/helpers/helpers";
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
  const normalizedDate = normalizeDate(String(date).trim());

  if (normalizedDate) {
    const parsedDate = new Date(`${normalizedDate}T12:00:00`);
    return Number.isNaN(parsedDate.getTime())
      ? Number.MAX_SAFE_INTEGER
      : parsedDate.getTime();
  }

  return Number.MAX_SAFE_INTEGER;
};

const compareDisplayDates = (a: string, b: string) =>
  getDateTime(a) - getDateTime(b);

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
  const [dates, setDates] = useState<string[]>([]);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: { [bloodTestId: string]: string };
  }>({});
  const [note, setNote] = useState<string>("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [transformedBloodTestsData, setTransformedBloodTestsData] = useState<
    BloodTestDataResponse[]
  >([]);
  const { promiseToast } = useToastContext();

  useEffect(() => {
    const transformedData = transformData(bloodTestsData);
    setTransformedBloodTestsData(transformedData);

    const uniqueDates = Array.from(
      new Set(
        transformedData.map((group) => formatDate(group.study.date ?? "").trim())
      )
    );

    const sortedDates = uniqueDates.sort(compareDisplayDates);

    setDates(sortedDates);
  }, [bloodTestsData]);

  const filteredBloodTests = bloodTests.filter((test) =>
    test.originalName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (
    date: string,
    bloodTestId: string,
    value: string
  ) => {
    setEditedValues((prev) => {
      const updated = {
        ...prev,
        [date]: {
          ...(prev[date] || {}),
          [bloodTestId]: value,
        },
      };
      setHasPendingChanges(true);
      return updated;
    });
  };
  const handleAddNewColumn = (newDate: string) => {
    setDates((prevDates) => {
      // Convert YYYY-MM-DD (from input) to DD-MM-YYYY for display consistency
      const formattedNewDate = newDate.includes("-") && newDate.split("-")[0].length === 4
        ? newDate.split("-").reverse().join("-")  // YYYY-MM-DD -> DD-MM-YYYY
        : newDate;

      if (prevDates.includes(formattedNewDate)) {
        return prevDates;
      }
      const updatedDates = [...prevDates, formattedNewDate].sort(compareDisplayDates);
      return updatedDates;
    });
  };

  const handleConfirmChanges = async () => {
    try {
      const updates: {
        idStudy: number;
        blodTest: BloodTestDataUpdateRequestItem[];
      }[] = [];
      const newEntries: BloodTestDataRequest[] = [];

      Object.entries(editedValues).forEach(([date, tests]) => {
        const cleanDate = date.trim();
        const existingStudyForDate = bloodTestsData.find(
          (data) =>
            normalizeDate(String(data.study.date).trim()) === normalizeDate(cleanDate)
        )?.study;

        // Si existe un estudio para esta fecha, será una actualización
        if (existingStudyForDate) {
          const updateGroup = {
            idStudy: Number(existingStudyForDate.id),
            blodTest: [] as BloodTestDataUpdateRequestItem[],
          };

          Object.entries(tests).forEach(([bloodTestId, value]) => {
            const bloodTestIdAsNumber = parseInt(bloodTestId, 10);
            const existingData = bloodTestsData.find(
              (data) =>
                normalizeDate(String(data.study.date).trim()) ===
                normalizeDate(cleanDate) &&
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
          // Crear nuevo estudio con sus valores
          // Normalize date to YYYY-MM-DD format for backend
          const newEntry: BloodTestDataRequest = {
            userId: idUser,
            note,
            date: normalizeDate(cleanDate),
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

        <div className="max-h-[28rem] overflow-auto rounded-md border border-gray-200">
          <Table className="w-max min-w-full border-separate border-spacing-0 text-sm">
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 top-0 z-30 min-w-[190px] max-w-[230px] border-b border-r bg-white px-3 py-3 shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">
                  Análisis
                </TableHead>
                <TableHead className="sticky top-0 z-20 min-w-[220px] border-b bg-white px-3 py-3">
                  Valor de Referencia
                </TableHead>
                <TableHead className="sticky top-0 z-20 min-w-[130px] border-b bg-white px-3 py-3">
                  Unidad
                </TableHead>
                {dates.map((date) => (
                  <TableHead
                    key={date}
                    className="sticky top-0 z-20 min-w-[132px] border-b bg-white px-3 py-3 text-center"
                  >
                    {date}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBloodTests.map((bloodTest) => {
                return (
                  <TableRow key={bloodTest.id} className="hover:bg-gray-50/70">
                    <TableCell className="sticky left-0 z-10 min-w-[190px] max-w-[230px] border-r bg-white px-3 py-2 font-medium leading-snug shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)]">
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
                          formatDate(studyGroup.study.date ?? "").trim() === date
                      );

                      // Si hay un estudio en esta fecha, buscar el análisis de sangre dentro de él
                      const relatedData = relatedStudy?.bloodTestData.find(
                        (test) => test.bloodTest.id === bloodTest.id
                      );

                      // Verificar si se encontró el valor y asignarlo
                      const inputValue =
                        editedValues[date]?.[bloodTest.id as number] ??
                        (relatedData ? relatedData.value : "");

                      return (
                        <TableCell key={date} className="min-w-[132px] px-3 py-2 text-center">
                          <input
                            type="text"
                            value={inputValue}
                            className="h-9 w-full rounded-md border px-2 text-center text-sm focus:border-greenPrimary focus:outline-none focus:ring-1 focus:ring-greenPrimary"
                            onChange={(e) =>
                              handleInputChange(
                                date,
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
