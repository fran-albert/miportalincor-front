import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FaRegFilePdf, FaRegImage } from "react-icons/fa";
import { formatDate } from "@/common/helpers/helpers";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Study } from "@/types/Study/Study";
import { Search } from "@/components/ui/search";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";

const MyStudiesCardComponent = ({
  studiesByUserId,
  urls,
}: {
  studiesByUserId: Study[];
  urls: any;
}) => {
  const [expandedStudies, setExpandedStudies] = useState<Set<number>>(
    new Set()
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const studiesPerPage = 6;

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

  const filteredStudies = studiesByUserId.filter(
    (study) =>
      study.studyType?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLastStudy = currentPage * studiesPerPage;
  const indexOfFirstStudy = indexOfLastStudy - studiesPerPage;
  const currentStudies = filteredStudies.slice(
    indexOfFirstStudy,
    indexOfLastStudy
  );

  const totalPages = Math.ceil(filteredStudies.length / studiesPerPage);

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold text-center mb-6 text-greenPrimary">
        Mis Estudios Médicos
      </h2>
      <div className="mb-6 flex items-center">
        <Search
          placeholder={"Buscar estudios..."}
          className="w-full px-4 py-2 border rounded-md"
          value={searchTerm}
          color="#187B80"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {currentStudies.length > 0 ? (
            currentStudies.map((study) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="w-full h-full flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-lg font-semibold text-greenPrimary">
                        {study.studyType?.name}
                      </span>
                      <FaRegFilePdf className="text-greenPrimary" size={24} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-sm text-muted-foreground mb-2">
                      Fecha: {formatDate(String(study.date))}
                    </p>
                    <p className="text-sm mb-4">{study.note}</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={() =>
                          window.open(urls[study.id]?.pdfUrl || "#", "_blank")
                        }
                        variant="outline"
                        size="sm"
                      >
                        Ver PDF
                      </Button>
                      {study.studyType?.id === 2 &&
                        urls?.[study.id]?.imageUrls?.length > 0 && (
                          <Button
                            onClick={() => toggleExpand(study.id)}
                            variant="outline"
                            size="sm"
                          >
                            {expandedStudies.has(study.id)
                              ? "Ocultar imágenes"
                              : "Ver imágenes"}
                          </Button>
                        )}
                    </div>
                  </CardContent>
                  <AnimatePresence>
                    {expandedStudies.has(study.id) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CardFooter className="flex flex-col items-start gap-2 pt-4 border-t">
                          {urls[study.id]?.imageUrls?.map(
                            (image: string, idx: number) => (
                              <div
                                key={`${study.id}-${idx}`}
                                className="flex items-center gap-2 w-full"
                              >
                                <FaRegImage
                                  className="text-blue-500 flex-shrink-0"
                                  size={20}
                                />
                                <span className="text-sm flex-grow">
                                  Imagen de Ecografía {idx + 1}
                                </span>
                                <Button
                                  onClick={() => window.open(image, "_blank")}
                                  variant="outline"
                                  size="sm"
                                >
                                  Ver
                                </Button>
                              </div>
                            )
                          )}
                        </CardFooter>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center py-6 text-muted-foreground"
            >
              No se encontraron estudios que coincidan con la búsqueda.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <Pagination className="mt-6 text-greenPrimary hover:text-green-900 cursor-pointer ">
          <PaginationContent>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            />
            {Array.from({ length: totalPages }).map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  isActive={currentPage === index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
            />
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
};

export default MyStudiesCardComponent;
