import { useState } from "react";
import LabsChart from "./LabsChart";
import { Lab } from "@/types/Lab/Lab";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LabChartsGridProps {
  labsData: Lab[];
  labKeys: (keyof Lab)[]; 
}

export default function LabChartsGrid({
  labsData,
  labKeys,
}: LabChartsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; 

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const currentCharts = labKeys.slice(startIndex, endIndex);

  const totalPages = Math.ceil(labKeys.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCharts.map((key) => (
          <LabsChart key={key as string} labKey={key} labData={labsData} />
        ))}
      </div>

      {/* Controles de paginación */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-greenPrimary text-white"
          }`}
        >
          <ChevronLeft />
        </button>
        <span className="px-4 py-2">
          Página {currentPage} de {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-greenPrimary text-white"
          }`}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
