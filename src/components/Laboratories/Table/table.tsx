import { useEffect, useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "@/components/ui/search";
import { formatDate, normalizeDate } from "@/common/helpers/helpers";
import LabDialog from "../Dialog";
import { Button } from "@/components/ui/button";
import { useToastContext } from "@/hooks/Toast/toast-context";
import {
  BloodTestData,
  BloodTestDataRequest,
  BloodTestDataUpdateRequest,
} from "@/types/Blod-Test-Data/Blod-Test-Data";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestDataMutations } from "@/hooks/Blod-Test-Data/useBlodTestDataMutation";
import { BloodTestDataResponse } from "@/types/Blod-Test-Data/Blod-Test-Data";

const transformData = (originalData: any[]): BloodTestDataResponse[] => {
  return originalData.map((item) => ({
    study: { ...item.study },
    bloodTestData: item.bloodTestData.map((testData: any) => ({
      id: testData.id,
      value: testData.value,
      bloodTest: { ...testData.bloodTest },
    })),
  }));
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
        transformedData.map((group) => formatDate(group.study.date ?? ""))
      )
    );
    setDates(uniqueDates);
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
      const updatedDates = !prevDates.includes(newDate)
        ? [...prevDates, newDate]
        : prevDates;
      return updatedDates;
    });
  };

  const handleConfirmChanges = async () => {
    try {
      const updates: {
        idStudy: number;
        blodTest: BloodTestDataUpdateRequest[];
      }[] = [];
      const newEntries: BloodTestDataRequest[] = [];

      Object.entries(editedValues).forEach(([date, tests]) => {
        const cleanDate = date.trim();
        const existingStudyForDate = bloodTestsData.find(
          (data) =>
            normalizeDate(String(data.study.date)) === normalizeDate(cleanDate)
        )?.study;

        // Si existe un estudio para esta fecha, será una actualización
        if (existingStudyForDate) {
          const updateGroup = {
            idStudy: existingStudyForDate.id,
            blodTest: [] as BloodTestDataUpdateRequest[],
          };

          Object.entries(tests).forEach(([bloodTestId, value]) => {
            const bloodTestIdAsNumber = parseInt(bloodTestId, 10);
            const existingData = bloodTestsData.find(
              (data) =>
                normalizeDate(String(data.study.date)) ===
                normalizeDate(cleanDate) &&
                data.bloodTest.id === bloodTestIdAsNumber
            );

            if (existingData?.id) {
              // Actualizar valor existente
              if (String(existingData.value).trim() !== String(value).trim()) {
                updateGroup.blodTest.push({
                  id: existingData.id,
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
          const newEntry: BloodTestDataRequest = {
            userId: idUser,
            note,
            date: cleanDate,
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
                error: (error: any) => ({
                  title: "Error al actualizar el laboratorio",
                  description: error.response?.data?.message || "Ha ocurrido un error inesperado",
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
              error: (error: any) => ({
                title: "Error al crear el laboratorio",
                description: error.response?.data?.message || "Ha ocurrido un error inesperado",
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
    <div className="w-full ">
      <div className="relative overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <Search
            placeholder="Buscar análisis..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            color="#187B80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="flex gap-4">
            <LabDialog
              setDates={setDates}
              dates={dates}
              onSetNote={setNote}
              onAddNewColumn={handleAddNewColumn}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table className="table-fixed w-full min-w-[800px]">
            <TableHeader className="sticky top-0 bg-white z-10">
              <TableRow>
                <TableHead className="w-2/12 px-2 sm:px-4">Análisis</TableHead>
                <TableHead className="w-3/12 px-2 sm:px-4">Valor de Referencia</TableHead>
                <TableHead className="w-2/12 px-2 sm:px-4">Unidad</TableHead>
                {dates.map((date) => (
                  <TableHead key={date} className="w-[100px] text-center px-2 sm:px-4">
                    {date}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
          </Table>
        </div>

        <ScrollArea className="h-96">
          <div className="overflow-x-auto">
            <Table className="table-fixed w-full min-w-[800px]">
              <TableBody>
                {filteredBloodTests.map((bloodTest) => {
                  return (
                    <TableRow key={bloodTest.id}>
                      <TableCell className="font-medium w-2/12 px-2 sm:px-4">
                        {bloodTest.originalName}
                      </TableCell>
                      <TableCell className="whitespace-pre-wrap text-ellipsis w-3/12 px-2 sm:px-4">
                        {bloodTest.referenceValue || "N/A"}
                      </TableCell>
                      <TableCell className="w-2/12 px-2 sm:px-4">
                        {bloodTest.unit?.shortName || "N/A"}
                      </TableCell>

                      {dates.map((date) => {
                        // Encontramos el estudio correspondiente a la fecha
                        const relatedStudy = transformedBloodTestsData.find(
                          (studyGroup) =>
                            formatDate(studyGroup.study.date ?? "") === date
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
                          <TableCell key={date} className="w-[100px] text-center">
                            <input
                              type="text"
                              value={inputValue}
                              className="w-1/2 border rounded px-2 text-center"
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
        </ScrollArea>
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
