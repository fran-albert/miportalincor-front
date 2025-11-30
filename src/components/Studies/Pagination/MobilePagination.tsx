import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  isMobile = false,
}) => {
  // Si solo hay una página, no mostrar paginación
  if (totalPages <= 1) return null;

  // Calcular rango de items mostrados
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const renderPageNumbers = () => {
    if (isMobile || totalPages <= 5) {
      // Vista mobile simple o pocas páginas
      return (
        <div className="text-sm font-medium text-gray-700">
          Página {currentPage} de {totalPages}
        </div>
      );
    }

    // Vista desktop con números de página
    const pages = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      // Mostrar todas las páginas si son pocas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            className={`min-w-[40px] h-9 ${
              currentPage === i ? "bg-greenPrimary hover:bg-greenPrimary/90" : ""
            }`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }
    } else {
      // Lógica con ellipsis para muchas páginas
      // Siempre mostrar primera página
      pages.push(
        <Button
          key={1}
          variant={currentPage === 1 ? "default" : "outline"}
          size="sm"
          className={`min-w-[40px] h-9 ${
            currentPage === 1 ? "bg-greenPrimary hover:bg-greenPrimary/90" : ""
          }`}
          onClick={() => onPageChange(1)}
        >
          1
        </Button>
      );

      // Ellipsis inicial si es necesario
      if (currentPage > 3) {
        pages.push(
          <span key="ellipsis-start" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      // Páginas alrededor de la actual
      const startPage = Math.max(2, currentPage - 1);
      const endPage = Math.min(totalPages - 1, currentPage + 1);

      for (let i = startPage; i <= endPage; i++) {
        pages.push(
          <Button
            key={i}
            variant={currentPage === i ? "default" : "outline"}
            size="sm"
            className={`min-w-[40px] h-9 ${
              currentPage === i ? "bg-greenPrimary hover:bg-greenPrimary/90" : ""
            }`}
            onClick={() => onPageChange(i)}
          >
            {i}
          </Button>
        );
      }

      // Ellipsis final si es necesario
      if (currentPage < totalPages - 2) {
        pages.push(
          <span key="ellipsis-end" className="px-2 text-gray-500">
            ...
          </span>
        );
      }

      // Siempre mostrar última página
      pages.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="sm"
          className={`min-w-[40px] h-9 ${
            currentPage === totalPages
              ? "bg-greenPrimary hover:bg-greenPrimary/90"
              : ""
          }`}
          onClick={() => onPageChange(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return <div className="flex items-center gap-1">{pages}</div>;
  };

  return (
    <div className="mt-6 space-y-3">
      {/* Navegación principal */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`${
            isMobile ? "flex-1 h-11" : "min-w-[110px]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Anterior
        </Button>

        {/* Indicador de página */}
        {renderPageNumbers()}

        <Button
          variant="outline"
          size={isMobile ? "default" : "sm"}
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`${
            isMobile ? "flex-1 h-11" : "min-w-[110px]"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          Siguiente
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* Información de registros */}
      <div className="text-center text-sm text-gray-600">
        Mostrando{" "}
        <span className="font-semibold text-gray-900">
          {startItem}-{endItem}
        </span>{" "}
        de{" "}
        <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
        estudio{totalItems !== 1 ? "s" : ""}
      </div>
    </div>
  );
};

export default MobilePagination;
