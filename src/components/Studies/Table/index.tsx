import React, { useState } from "react";
import { formatDate } from "@/common/helpers/helpers";
import useRoles from "@/hooks/useRoles";
import { ViewButton } from "@/components/Button/View/button";
import { StudiesWithURL } from "@/types/Study/Study";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import DeleteStudyDialog from "../Delete/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import StudyDialog from "../Upload/dialog";
import {
  FaRegFilePdf,
  FaRegImage,
  FaChevronDown,
  FaChevronUp,
} from "react-icons/fa";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const StudiesTable = ({
  studies,
  idUser,
}: {
  studies: StudiesWithURL[];
  idUser: number;
}) => {
  const { isSecretary, isDoctor, isAdmin } = useRoles();

  // @ts-ignore
  const [selectedStudyType, setSelectedStudyType] = useState<string | null>(
    "Seleccionar tipo de estudio..."
  );
  // @ts-ignore
  const [selectedYear, setSelectedYear] = useState<string | null>(
    "Seleccionar año..."
  );
  // @ts-ignore
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedStudies, setExpandedStudies] = useState<Set<number>>(
    new Set()
  );

  const toggleExpand = (studyId: number) => {
    setExpandedStudies((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(studyId)) {
        newSet.delete(studyId);
      } else {
        newSet.add(studyId);
      }
      return newSet;
    });
  };

  const filteredStudies = studies.filter((study) => {
    const matchesType =
      selectedStudyType === "Seleccionar tipo de estudio..." ||
      study.studyType?.name === selectedStudyType;

    const matchesYear =
      selectedYear === "Seleccionar año..." ||
      (study.date &&
        new Date(study.date).getFullYear().toString() === selectedYear);

    return matchesType && matchesYear;
  });

  const totalPages = Math.ceil(filteredStudies.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredStudies.slice(indexOfFirstRow, indexOfLastRow);

  const hasUltrasoundImages = (study: StudiesWithURL) => {
    return (
      study.studyType?.id === 2 &&
      study.ultrasoundImages &&
      study.ultrasoundImages.length > 0
    );
  };

  return (
    <div>
      <Table>
        <TableHeader className="sticky top-0 bg-white border-b">
          <TableRow>
            <TableHead className="whitespace-nowrap w-[5%] text-center align-middle">
              #
            </TableHead>
            <TableHead className="whitespace-nowrap w-[5%] text-center align-middle"></TableHead>
            <TableHead className="whitespace-nowrap w-[20%] text-left align-middle">
              Tipo
            </TableHead>
            <TableHead className="whitespace-nowrap w-[35%] text-left align-middle">
              Nota
            </TableHead>
            <TableHead className="whitespace-nowrap w-[20%] text-left align-middle">
              Fecha
            </TableHead>
            <TableHead className="whitespace-nowrap w-[15%] text-left align-middle">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentRows.length > 0 ? (
            currentRows.map((study, index) => (
              <React.Fragment key={study.id}>
                {/* Fila principal para el estudio, PDF o imagen principal */}
                <TableRow className={`hover:bg-gray-50`}>
                  <>
                    <TableCell className="font-medium text-center align-middle">
                      {indexOfFirstRow + index + 1}
                    </TableCell>

                    <TableCell className="text-center align-middle">
                      <FaRegFilePdf className="text-greenPrimary" size={20} />
                    </TableCell>
                    <TableCell className="text-base">
                      <span>{study.studyType?.name}</span>
                    </TableCell>
                    <TableCell className="items-center align-middle text-base">
                      <span>{study.note}</span>
                    </TableCell>
                    <TableCell className="align-middle text-base">
                      <span>{formatDate(String(study.date))}</span>
                    </TableCell>
                    <TableCell className="align-middle text-base">
                      <div className="flex items-center gap-2">
                        {study.locationS3 && (
                          <ViewButton url={study.signedUrl} text="Ver PDF" />
                        )}

                        {hasUltrasoundImages(study) && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className="text-blue-500 hover:text-blue-700 cursor-pointer active:opacity-50"
                                  onClick={() => toggleExpand(study.id)}
                                >
                                  {expandedStudies.has(study.id) ? (
                                    <FaChevronUp size={16} />
                                  ) : (
                                    <FaChevronDown size={16} />
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                Ver imágenes de ecografía
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}

                        {(isDoctor || isSecretary || isAdmin) && (
                          <DeleteStudyDialog
                            studies={studies}
                            idStudy={study.id}
                          />
                        )}
                      </div>
                    </TableCell>
                  </>
                </TableRow>

                {expandedStudies.has(study.id) &&
                  study.ultrasoundImages &&
                  study.ultrasoundImages.map((image, idx) => (
                    <TableRow
                      key={`${study.id}-image-${idx}`}
                      className="hover:bg-gray-50 bg-blue-50/30"
                    >
                      <TableCell className="font-medium text-center align-middle">
                        -
                      </TableCell>
                      <TableCell className="text-center align-middle">
                        <FaRegImage className="text-blue-500" size={20} />
                      </TableCell>
                      <TableCell className="text-base" colSpan={3}>
                        <span>Imagen de Ecografía {idx + 1}</span>
                      </TableCell>
                      <TableCell className="align-middle text-base">
                        <ViewButton url={image.signedUrl} text="Ver Imagen" />
                      </TableCell>
                    </TableRow>
                  ))}
              </React.Fragment>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-4 text-gray-500 align-middle"
              >
                No hay estudios cargados.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      {filteredStudies.length > 0 && (
        <>
          <div className="text-gray-500 mt-4 text-xs">
            Mostrando {Math.min(indexOfLastRow, filteredStudies.length)} de{" "}
            {filteredStudies.length} resultados encontrados
          </div>

          <Pagination className="mt-4 justify-end">
            <PaginationContent>
              <PaginationPrevious
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="cursor-pointer text-greenPrimary hover:text-greenPrimary"
              />
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    isActive={currentPage === i + 1}
                    className="cursor-pointer text-greenPrimary hover:text-greenPrimary"
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
                className="cursor-pointer text-greenPrimary hover:text-greenPrimary"
              />
            </PaginationContent>
          </Pagination>
        </>
      )}
      {(isSecretary || isAdmin) && (
        <div className="text-center mt-4">
          <StudyDialog idUser={idUser} />
        </div>
      )}
    </div>
  );
};

export default StudiesTable;
