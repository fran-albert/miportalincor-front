import React, { useState } from "react";
import { formatDate } from "@/common/helpers/helpers";
import useRoles from "@/hooks/useRoles";
import { ViewButton } from "@/components/Button/View/button";
import { Study } from "@/types/Study/Study";
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
import { FaRegFilePdf, FaRegImage } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import StudyUploadModal from "../Upload/upload.study.dialog";

interface StudiesTableProps {
  studiesByUserId: Study[];
  idUser: number;
  urls: { [key: number]: { pdfUrl: string; imageUrls: string[] } };
  isLoadingUrls?: boolean;
}

const StudiesTable: React.FC<StudiesTableProps> = ({
  studiesByUserId,
  idUser,
  urls,
  isLoadingUrls = false,
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
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
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

  const filteredStudies = studiesByUserId.filter((study) => {
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

  return (
    <div>
      {isLoadingUrls && (
        <div className="w-full bg-teal-50 text-greenPrimary px-4 py-2 rounded mb-4 flex items-center">
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-greenPrimary"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Cargando enlaces de estudios...
        </div>
      )}

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
                  {study.isUpdating ? (
                    <TableCell
                      colSpan={6}
                      className="text-center align-middle italic text-gray-500"
                    >
                      Actualizando estudios del paciente...
                    </TableCell>
                  ) : (
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
                        <div className="flex items-center justify-center gap-2">
                          {study.locationS3 ? (
                            <ViewButton
                              url={urls[study.id]?.pdfUrl || "#"}
                              text="Ver PDF"
                            />
                          ) : (
                            // Botón de eliminación cuando no hay PDF
                            isDoctor &&
                            !study.isOptimistic && (
                              <DeleteStudyDialog
                                studies={studiesByUserId}
                                idStudy={study.id}
                              />
                            )
                          )}
                          {study &&
                            study.studyType?.id === 2 &&
                            urls?.[study.id]?.imageUrls?.length > 0 && (
                              <Button
                                onClick={() => toggleExpand(study.id)}
                                variant={"ghost"}
                                className="text-gray-600"
                                style={{ minWidth: "24px" }}
                              >
                                {expandedStudies.has(study.id) ? "-" : "+"}
                              </Button>
                            )}

                          {(isSecretary || isAdmin) && !study.isOptimistic && (
                            <DeleteStudyDialog
                              studies={studiesByUserId}
                              idStudy={study.id}
                            />
                          )}
                        </div>
                      </TableCell>
                    </>
                  )}
                </TableRow>

                {/* Expansión para mostrar imágenes de ultrasonido si hay */}
                {expandedStudies.has(study.id) &&
                  urls[study.id]?.imageUrls?.map((image, idx) => (
                    <TableRow
                      key={`${study.id}-${idx}`}
                      className="hover:bg-gray-50"
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
                        <ViewButton url={image} text="Ver Imagen" />
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
          {/* <StudyDialog idUser={idUser} /> */}
          <Button onClick={() => setIsModalOpen(true)}>Agregar Estudio</Button>
          <StudyUploadModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            patientId={idUser}
          />
        </div>
      )}
    </div>
  );
};

export default StudiesTable;
