import { RefObject, UIEvent, useEffect, useMemo, useRef, useState } from "react";
import moment from "moment-timezone";
import { Pencil, Trash2 } from "lucide-react";
import {
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
import useRoles from "@/hooks/useRoles";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type LabDateColumn = {
  key: string;
  label: string;
  normalizedDate: string;
  sortValue: number;
  studyId?: string;
  signedDoctorId?: string;
  isManualLaboratory?: boolean;
};

const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires";
const MISSING_DATE_LABEL = "Sin fecha";
const STICKY_ANALYSIS_WIDTH = 220;
const STICKY_REFERENCE_WIDTH = 240;
const STICKY_UNIT_WIDTH = 120;
const DATE_COLUMN_WIDTH = 148;
const STICKY_BASE_WIDTH =
  STICKY_ANALYSIS_WIDTH + STICKY_REFERENCE_WIDTH + STICKY_UNIT_WIDTH;

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

  if (trimmedDate.includes("T")) {
    const parsedDate = moment.tz(trimmedDate, ARGENTINA_TIMEZONE);
    return parsedDate.isValid() ? parsedDate.format("YYYY-MM-DD") : "";
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
    signedDoctorId: study.signedDoctorId
      ? String(study.signedDoctorId)
      : undefined,
    isManualLaboratory: Boolean(study.isManualLaboratory),
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
  fitContainer = false,
}: {
  bloodTests: BloodTest[];
  bloodTestsData: BloodTestData[];
  idUser: number;
  fitContainer?: boolean;
}) => {
  const {
    addBlodTestDataMutation,
    updateBlodTestMutation,
    updateManualBloodTestStudyDateMutation,
  } =
    useBlodTestDataMutations();
  const { deleteStudyMutation } = useStudyMutations();
  const { isDoctor, session } = useRoles();
  const currentDoctorId = isDoctor && session?.id ? String(session.id) : "";
  const [searchTerm, setSearchTerm] = useState("");
  const topScrollRef = useRef<HTMLDivElement>(null);
  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [dates, setDates] = useState<LabDateColumn[]>([]);
  const [dateColumnToEdit, setDateColumnToEdit] =
    useState<LabDateColumn | null>(null);
  const [dateDraft, setDateDraft] = useState("");
  const [dateColumnToDelete, setDateColumnToDelete] =
    useState<LabDateColumn | null>(null);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: { [bloodTestId: string]: string };
  }>({});
  const [note, setNote] = useState<string>("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [transformedBloodTestsData, setTransformedBloodTestsData] = useState<
    BloodTestDataResponse[]
  >([]);
  const { promiseToast } = useToastContext();

  const tableMinWidth = useMemo(
    () => STICKY_BASE_WIDTH + dates.length * DATE_COLUMN_WIDTH,
    [dates.length]
  );

  const canManageManualLabColumn = (column: LabDateColumn) =>
    Boolean(
      column.studyId &&
        column.isManualLaboratory &&
        column.signedDoctorId &&
        currentDoctorId &&
        String(column.signedDoctorId) === currentDoctorId
    );

  const canEditColumnValues = (column: LabDateColumn) =>
    !column.studyId ||
    !column.isManualLaboratory ||
    canManageManualLabColumn(column);

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

        if (!canEditColumnValues(column)) {
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

  const openDateEditor = (column: LabDateColumn) => {
    setDateColumnToEdit(column);
    setDateDraft(column.normalizedDate);
  };

  const closeDateEditor = () => {
    setDateColumnToEdit(null);
    setDateDraft("");
  };

  const handleUpdateStudyDate = async () => {
    if (!dateColumnToEdit?.studyId || !dateDraft) {
      return;
    }

    try {
      const normalizedDraft = normalizeLabDate(dateDraft);

      await promiseToast(
        updateManualBloodTestStudyDateMutation.mutateAsync({
          idStudy: dateColumnToEdit.studyId,
          date: normalizedDraft,
        }),
        {
          loading: {
            title: "Actualizando fecha",
            description: "Guardando la fecha del laboratorio manual",
          },
          success: {
            title: "Fecha actualizada",
            description: "El laboratorio se reordenó con la nueva fecha",
          },
          error: (error: unknown) => ({
            title: "Error al actualizar la fecha",
            description:
              (error as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Ha ocurrido un error inesperado",
          }),
        }
      );

      setDates((prevDates) =>
        prevDates
          .map((column) =>
            column.key === dateColumnToEdit.key
              ? {
                  ...column,
                  label: formatLabDateLabel(normalizedDraft),
                  normalizedDate: normalizedDraft,
                  sortValue: getDateTime(normalizedDraft),
                }
              : column
          )
          .sort(compareColumns)
      );
      closeDateEditor();
    } catch (error) {
      console.error("Error al actualizar la fecha del laboratorio:", error);
    }
  };

  const handleDeleteManualLaboratory = async () => {
    if (!dateColumnToDelete?.studyId) {
      return;
    }

    try {
      await promiseToast(
        deleteStudyMutation.mutateAsync({
          studyId: dateColumnToDelete.studyId,
          userId: idUser,
        }),
        {
          loading: {
            title: "Eliminando laboratorio",
            description: "Quitando la carga manual del paciente",
          },
          success: {
            title: "Laboratorio eliminado",
            description: "La columna se quitó de la tabla",
          },
          error: (error: unknown) => ({
            title: "Error al eliminar el laboratorio",
            description:
              (error as { response?: { data?: { message?: string } } })
                .response?.data?.message || "Ha ocurrido un error inesperado",
          }),
        }
      );

      const deletedColumn = dateColumnToDelete;
      setDates((prevDates) =>
        prevDates.filter((column) => column.key !== deletedColumn.key)
      );
      setTransformedBloodTestsData((prevData) =>
        prevData.filter(
          (group) => String(group.study.id) !== deletedColumn.studyId
        )
      );
      setEditedValues((prevValues) => {
        const nextValues = { ...prevValues };
        delete nextValues[deletedColumn.key];
        setHasPendingChanges(Object.keys(nextValues).length > 0);
        return nextValues;
      });
      setDateColumnToDelete(null);
    } catch (error) {
      console.error("Error al eliminar el laboratorio manual:", error);
    }
  };

  return (
    <div
      className={`flex min-h-0 w-full flex-col ${
        fitContainer ? "flex-1" : ""
      }`}
    >
      <div
        className={`flex min-h-0 flex-col space-y-4 ${
          fitContainer ? "flex-1" : ""
        }`}
      >
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
          className="shrink-0 overflow-x-auto overflow-y-hidden rounded-md border border-gray-200 bg-white"
          onScroll={(event) => syncHorizontalScroll(event, tableScrollRef)}
        >
          <div style={{ width: tableMinWidth, height: 1 }} />
        </div>

        <div
          ref={tableScrollRef}
          data-testid="lab-table-scroll"
          className={`isolate overflow-auto rounded-md border border-gray-200 ${
            fitContainer ? "min-h-0 flex-1" : "max-h-[28rem]"
          }`}
          onScroll={(event) => syncHorizontalScroll(event, topScrollRef)}
        >
          <table
            className="w-max min-w-full border-separate border-spacing-0 text-sm"
            style={{ minWidth: tableMinWidth }}
          >
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 top-0 z-50 w-[220px] min-w-[220px] max-w-[220px] border-b border-r bg-slate-50 px-3 py-3 shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45),0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Análisis
                </TableHead>
                <TableHead className="sticky top-0 z-40 w-[240px] min-w-[240px] max-w-[240px] border-b bg-slate-50 px-3 py-3 shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)] md:left-[220px] md:z-50 md:border-r md:shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45),0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Valor de Referencia
                </TableHead>
                <TableHead className="sticky top-0 z-40 w-[120px] min-w-[120px] max-w-[120px] border-b bg-slate-50 px-3 py-3 shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)] md:left-[460px] md:z-50 md:border-r md:shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45),0_8px_12px_-12px_rgba(15,23,42,0.45)]">
                  Unidad
                </TableHead>
                {dates.map((date) => {
                  const canManageManualLab = canManageManualLabColumn(date);

                  return (
                    <TableHead
                      key={date.key}
                      className="sticky top-0 z-40 min-w-[148px] border-b bg-slate-50 px-2 py-2 text-center shadow-[0_8px_12px_-12px_rgba(15,23,42,0.45)]"
                    >
                      <div className="flex items-center justify-center gap-1">
                        <span className="whitespace-nowrap font-medium">
                          {date.label}
                        </span>
                        {canManageManualLab && (
                          <div className="flex items-center gap-0.5">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-600 hover:bg-teal-50 hover:text-greenPrimary"
                              aria-label={`Editar fecha ${date.label}`}
                              title="Editar fecha"
                              onClick={() => openDateEditor(date)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-slate-600 hover:bg-red-50 hover:text-red-600"
                              aria-label={`Eliminar laboratorio ${date.label}`}
                              title="Eliminar laboratorio"
                              onClick={() => setDateColumnToDelete(date)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBloodTests.map((bloodTest) => {
                return (
                  <TableRow key={bloodTest.id} className="group hover:bg-gray-50/70">
                    <TableCell className="sticky left-0 z-30 w-[220px] min-w-[220px] max-w-[220px] border-r bg-white px-3 py-2 font-medium leading-snug shadow-[6px_0_10px_-10px_rgba(15,23,42,0.45)] group-hover:bg-gray-50">
                      {bloodTest.originalName}
                    </TableCell>
                    <TableCell className="w-[240px] min-w-[240px] max-w-[240px] whitespace-pre-wrap bg-white px-3 py-2 text-gray-700 group-hover:bg-gray-50 md:sticky md:left-[220px] md:z-20 md:border-r md:shadow-[6px_0_10px_-10px_rgba(15,23,42,0.35)]">
                      {bloodTest.referenceValue || "N/A"}
                    </TableCell>
                    <TableCell className="w-[120px] min-w-[120px] max-w-[120px] bg-white px-3 py-2 text-gray-700 group-hover:bg-gray-50 md:sticky md:left-[460px] md:z-20 md:border-r md:shadow-[6px_0_10px_-10px_rgba(15,23,42,0.35)]">
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
                      const canEditValue = canEditColumnValues(date);

                      return (
                        <TableCell key={date.key} className="min-w-[148px] px-3 py-2 text-center">
                          <input
                            type="text"
                            value={inputValue}
                            disabled={!canEditValue}
                            title={
                              canEditValue
                                ? undefined
                                : "Solo el medico que creo este laboratorio manual puede modificarlo"
                            }
                            className="h-9 w-full rounded-md border px-2 text-center text-sm focus:border-greenPrimary focus:outline-none focus:ring-1 focus:ring-greenPrimary disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-100 disabled:text-gray-500"
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
          </table>
        </div>
        {hasPendingChanges && (
          <div className="sticky bottom-0 z-50 flex shrink-0 justify-end border-t border-gray-200 bg-white/95 py-3 backdrop-blur">
            <Button
              className="bg-greenPrimary text-white"
              onClick={handleConfirmChanges}
            >
              Guardar Cambios
            </Button>
          </div>
        )}
      </div>
      <Dialog
        open={Boolean(dateColumnToEdit)}
        onOpenChange={(open) => {
          if (!open) {
            closeDateEditor();
          }
        }}
      >
        <DialogContent className="sm:max-w-[380px]">
          <DialogHeader>
            <DialogTitle>Editar fecha del laboratorio</DialogTitle>
            <DialogDescription>
              Seleccioná la fecha correcta del laboratorio manual.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="manual-lab-date">
              Fecha
            </label>
            <input
              id="manual-lab-date"
              type="date"
              value={dateDraft}
              className="h-10 w-full rounded-md border px-3 text-sm focus:border-greenPrimary focus:outline-none focus:ring-1 focus:ring-greenPrimary"
              onChange={(event) => setDateDraft(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDateEditor}>
              Cancelar
            </Button>
            <Button
              className="bg-greenPrimary text-white"
              onClick={handleUpdateStudyDate}
              disabled={
                !dateDraft || updateManualBloodTestStudyDateMutation.isPending
              }
            >
              Guardar fecha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog
        open={Boolean(dateColumnToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setDateColumnToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar laboratorio manual</AlertDialogTitle>
            <AlertDialogDescription>
              Se eliminará la carga manual del {dateColumnToDelete?.label}. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={(event) => {
                event.preventDefault();
                void handleDeleteManualLaboratory();
              }}
              disabled={deleteStudyMutation.isPending}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
