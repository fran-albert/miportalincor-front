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
import { columNames, Lab, referenceValues, units } from "@/types/Lab/Lab";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Search } from "@/components/ui/search";
import { formatDate } from "@/common/helpers/helpers";

interface LabData {
  testName: string;
  [date: string]: string | undefined;
}

const analysisNames = Object.keys(referenceValues);

const transformLabData = (
  labsDetails: Lab[],
  studiesByUser: any[]
): LabData[] => {
  const groupedData: { [testName: string]: LabData } = {};

  labsDetails.forEach((lab) => {
    const study = studiesByUser.find((study) => study.id === lab.idStudy);

    if (study && study.date) {
      const formattedDate = formatDate(study.date);

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
}: {
  labsDetails: Lab[];
  studiesByUser: any[];
}) => {
  // @ts-ignore
  const [rowsPerPage, setRowsPerPage] = useState(8);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [transformedLabs, setTransformedLabs] = useState<LabData[]>([]);
  const [dates, setDates] = useState<string[]>([]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);
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
        .map((study) => formatDate(study.date))
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

  const totalPages = Math.ceil(filteredAnalysisNames.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredAnalysisNames.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  if (!labsDetails || labsDetails.length === 0) {
    return (
      <div className="text-gray-900 text-sm">
        Los laboratorios del paciente no se pudieron insertar en la tabla.
      </div>
    );
  }

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
        </div>

        <Table>
          <TableHeader className="sticky top-0 bg-white z-10 border-b">
            <TableRow>
              <TableHead className="whitespace-nowrap w-1">#</TableHead>
              <TableHead className="whitespace-nowrap w-32">Análisis</TableHead>
              <TableHead className="whitespace-nowrap w-40">
                Valor de Referencia
              </TableHead>
              <TableHead className="whitespace-nowrap w-10">Unidad</TableHead>
              {dates.map((date) => (
                <TableHead key={date} className="whitespace-nowrap w-10">
                  {date}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((name, index) => (
              <TableRow key={name}>
                <TableCell className="font-medium w-1">
                  {index + 1 + (currentPage - 1) * rowsPerPage}
                </TableCell>
                <TableCell className="font-medium w-32">
                  {columNames[name as keyof Lab]}
                </TableCell>
                <TableCell className="w-40 min-h-[50px] whitespace-pre-wrap overflow-hidden text-ellipsis">
                  {referenceValues[name as keyof typeof referenceValues]}
                </TableCell>
                <TableCell className="w-10">
                  {units[name as keyof typeof units]}
                </TableCell>
                {dates.map((date) => (
                  <TableCell key={date} className="w-[150px]">
                    <Input
                      type="text"
                      defaultValue={
                        transformedLabs.find((lab) => lab.testName === name)?.[
                          date
                        ] || ""
                      }
                    />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-gray-500 mt-4 text-xs">
          Mostrando {currentRows.length} de {filteredAnalysisNames.length}{" "}
          resultados encontrados
        </div>
        <Pagination className="mt-4">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className=" cursor-pointer text-greenPrimary hover:text-greenPrimary"
            />
            {[...Array(totalPages)].map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink
                  isActive={currentPage === i + 1}
                  className=" cursor-pointer text-greenPrimary hover:text-greenPrimary"
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className=" cursor-pointer text-greenPrimary hover:text-greenPrimary"
            />
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
};
