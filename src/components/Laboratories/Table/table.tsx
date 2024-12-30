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
import { formatDate } from "@/common/helpers/helpers";
import LabDialog from "../Dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import {
  BloodTestData,
  BloodTestDataRequest,
} from "@/types/Blod-Test-Data/Blod-Test-Data";
import { BloodTest } from "@/types/Blod-Test/Blod-Test";
import { useBlodTestDataMutations } from "@/hooks/Blod-Test-Data/useBlodTestDataMutation";

export const LabPatientTable = ({
  bloodTestsData = [],
  bloodTests = [],
  idUser,
}: {
  bloodTests: BloodTest[];
  bloodTestsData: BloodTestData[];
  idUser: number;
}) => {
  const [isLabAdded, setIsLabAdded] = useState(false);
  const { addBlodTestDataMutation } = useBlodTestDataMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const [dates, setDates] = useState<string[]>([]);
  const [editedValues, setEditedValues] = useState<{
    [key: string]: { [bloodTestId: string]: string };
  }>({});
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [hasPendingChanges, setHasPendingChanges] = useState(false);

  useEffect(() => {
    const uniqueDates = Array.from(
      new Set(
        bloodTestsData.map((data) => formatDate(String(data.study.date ?? "")))
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

    setIsLabAdded(false);
  };
  const handleConfirmChanges = async () => {
    try {
      const bloodTestDatas = Object.entries(editedValues).flatMap(([tests]) =>
        Object.entries(tests).map(([bloodTestId, value]) => ({
          id: 0,
          value,
          idBloodTest: parseInt(bloodTestId, 10),
        }))
      );
      const payload: BloodTestDataRequest = {
        userId: idUser,
        note,
        date,
        bloodTestDatas,
      };

      console.log(payload);
      toast.promise(
        addBlodTestDataMutation.mutateAsync(payload as BloodTestDataRequest),
        {
          loading: <LoadingToast message="Creando laboratorio..." />,
          success: () => {
            isLabAdded && setIsLabAdded(true);
            return <SuccessToast message="Laboratorio creado con éxito" />;
          },
          error: () => {
            return <ErrorToast message="Error al crear el Laboratorio" />;
          },
        }
      );
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
              onSetDate={setDate}
              onAddNewColumn={handleAddNewColumn}
            />
          </div>
        </div>

        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-2/12">Análisis</TableHead>
              <TableHead className="w-3/12">Valor de Referencia</TableHead>
              <TableHead className="w-2/12">Unidad</TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="w-[100px] text-center">
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>

        <ScrollArea className="h-96">
          <Table className="table-fixed w-full">
            <TableBody>
              {filteredBloodTests.map((bloodTest) => {
                return (
                  <TableRow key={bloodTest.id}>
                    <TableCell className="font-medium w-2/12">
                      {bloodTest.originalName}
                    </TableCell>
                    <TableCell className="whitespace-pre-wrap text-ellipsis w-3/12">
                      {bloodTest.referenceValue || "N/A"}
                    </TableCell>
                    <TableCell className="w-2/12">
                      {bloodTest.unit?.shortName || "N/A"}
                    </TableCell>
                    {dates.map((date) => {
                      const relatedData = bloodTestsData.find(
                        (data) =>
                          data.bloodTest.id === bloodTest.id &&
                          formatDate(String(data.study.date ?? "")) === date
                      );
                      const inputValue =
                        date && bloodTest.id
                          ? editedValues[date]?.[bloodTest.id] ??
                            relatedData?.value ??
                            ""
                          : "";

                      return (
                        <TableCell key={date} className="w-[100px] text-center">
                          <input
                            type="text"
                            value={inputValue}
                            className="w-1/2 border rounded px-2 text-center"
                            onChange={(e) =>
                              date &&
                              bloodTest.id &&
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
        </ScrollArea>

        <div className="flex justify-end mt-4">
          {/* {newColumnAdded && !isLabAdded && (
            <Button
              className="bg-greenPrimary text-white"
              onClick={handleConfirm}
              disabled={addLabMutation.isPending}
            >
              Confirmar
            </Button>
          )} */}
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
