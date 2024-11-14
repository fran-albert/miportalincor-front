import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  columNames,
  Lab,
  LabRequest,
  referenceValues,
  units,
} from "@/types/Lab/Lab";
import { Search } from "@/components/ui/search";
import { formatDate } from "@/common/helpers/helpers";
import LabDialog from "../Dialog";
import { Button } from "@/components/ui/button";
import { useLabMutations } from "@/hooks/Labs/useLabMutation";
import { Study } from "@/types/Study/Study";
import { toast } from "sonner";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface LabData {
  testName: string;
  [date: string]: string | undefined;
}

const analysisNames = Object.keys(referenceValues);

const transformLabData = (
  labsDetails: Lab[],
  studiesByUser: Study[]
): LabData[] => {
  const groupedData: { [testName: string]: LabData } = {};

  labsDetails.forEach((lab) => {
    const study = studiesByUser.find((study) => study.id === lab.idStudy);

    if (study && study.date) {
      const formattedDate = formatDate(String(study.date));

      Object.entries(lab).forEach(([testName, value]) => {
        if (!groupedData[testName]) {
          groupedData[testName] = { testName };
        }
        groupedData[testName][formattedDate] = value?.toString();
      });
    }
  });

  return Object.values(groupedData);
};

export const LabPatientTable = ({
  labsDetails,
  studiesByUser,
  idUser,
}: {
  labsDetails: Lab[];
  studiesByUser: Study[];
  idUser: number;
}) => {
  const [isLabAdded, setIsLabAdded] = useState(false);
  const { addLabMutation } = useLabMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const [transformedLabs, setTransformedLabs] = useState<LabData[]>([]);
  const [dates, setDates] = useState<string[]>([]);
  const [editedValues, setEditedValues] = useState<{ [key: string]: string }>(
    {}
  );
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [newColumnAdded, setNewColumnAdded] = useState(false);
  const handleInputChange = (testName: string, date: string, value: string) => {
    setEditedValues((prevValues) => ({
      ...prevValues,
      [`${testName}-${date}`]: value,
    }));
  };
  useEffect(() => {
    if (
      labsDetails &&
      labsDetails.length > 0 &&
      studiesByUser &&
      studiesByUser.length > 0
    ) {
      const transformed = transformLabData(labsDetails, studiesByUser);
      setTransformedLabs(transformed);

      const datesFromStudies = studiesByUser
        .map((study) => formatDate(String(study.date)))
        .filter((date, index, self) => self.indexOf(date) === index);

      setDates(datesFromStudies);
    }
  }, [labsDetails, studiesByUser]);

  const filteredAnalysisNames = analysisNames.filter((name) => {
    const columnName = columNames[name as keyof Lab];
    return typeof columnName === "string"
      ? columnName.toLowerCase().includes(searchTerm.toLowerCase())
      : false;
  });

  // if (!labsDetails || labsDetails.length === 0) {
  //   return (
  //     <div className="text-gray-900 text-sm">
  //       Los laboratorios del paciente no se pudieron insertar en la tabla.
  //     </div>
  //   );
  // }

  const handleAddNewColumn = () => {
    setNewColumnAdded(true);
  };
  const handleConfirm = async () => {
    // Aquí estructuramos el objeto que mencionaste:
    const laboratoryDetail: { [key: string]: string } = {};

    // Rellenamos el objeto con los valores editados
    filteredAnalysisNames.forEach((name) => {
      dates.forEach((date) => {
        const value = editedValues[`${name}-${date}`];
        if (value) {
          laboratoryDetail[name] = value;
        }
      });
    });

    const payload: LabRequest = {
      userId: idUser,
      note: note,
      date: date,
      laboratoryDetail: laboratoryDetail,
    };

    try {
      toast.promise(addLabMutation.mutateAsync(payload), {
        loading: <LoadingToast message="Creando laboratorio..." />,
        success: () => {
          setIsLabAdded(true);
          return <SuccessToast message="Laboratorio creado con éxito" />;
        },
        error: () => {
          return <ErrorToast message="Error al crear el Laboratorio" />;
        },
      });
    } catch (error) {
      console.error("Error al guardar los datos:", error);
    }
  };

  return (
    <div className="w-full">
      <div className="relative overflow-x-auto">
        <div className="flex justify-end items-center mb-4">
          <Search
            placeholder="Buscar análisis..."
            className="w-full px-4 py-2 border rounded-md"
            value={searchTerm}
            color="#187B80"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <LabDialog
            setDates={setDates}
            dates={dates}
            onSetNote={setNote}
            onSetDate={setDate}
            onAddNewColumn={handleAddNewColumn}
          />
        </div>

        <Table className="table-fixed w-full">
          <TableHeader className="sticky top-0 bg-white z-10">
            <TableRow>
              <TableHead className="w-2/12">Análisis</TableHead>
              <TableHead className="w-3/12">Valor de Referencia</TableHead>
              <TableHead className="w-2/12">Unidad</TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="w-[100px]">
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
        </Table>
        <ScrollArea className=" h-96">
          <Table className="table-fixed w-full">
            <TableBody>
              {filteredAnalysisNames.map((name) => (
                <TableRow key={name}>
                  <TableCell className="font-medium w-2/12">
                    {columNames[name as keyof Lab]}
                  </TableCell>
                  <TableCell className="whitespace-pre-wrap text-ellipsis w-3/12">
                    {referenceValues[name as keyof typeof referenceValues]}
                  </TableCell>
                  <TableCell className="w-2/12">
                    {units[name as keyof typeof units]}
                  </TableCell>
                  {dates.map((date) => (
                    <TableCell key={date} className="w-[100px]">
                      <Input
                        type="text"
                        value={editedValues[`${name}-${date}`]}
                        defaultValue={
                          transformedLabs.find(
                            (lab) => lab.testName === name
                          )?.[date] || ""
                        }
                        onChange={(e) =>
                          handleInputChange(name, date, e.target.value)
                        }
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="flex justify-end mt-4">
          {newColumnAdded && !isLabAdded && (
            <Button
              className="bg-greenPrimary text-white"
              onClick={handleConfirm}
              disabled={addLabMutation.isPending}
            >
              Confirmar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
