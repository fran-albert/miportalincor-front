import { useState } from "react";
import LabsChart from "./LabsChart";
import { BloodTestData } from "@/types/Blod-Test-Data/Blod-Test-Data";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";

interface LabChartsGridProps {
  bloodTestsData: BloodTestData[];
}

export default function LabChartsGrid({ bloodTestsData }: LabChartsGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  // Agrupar los datos por prueba
  const groupedTests = bloodTestsData.reduce((acc, test) => {
    const testName = test.bloodTest.originalName || "Sin Nombre";
    if (!acc[testName]) acc[testName] = [];
    acc[testName].push(test);
    return acc;
  }, {} as Record<string, BloodTestData[]>);

  // Extraer los nombres de las pruebas
  const testNames = Object.keys(groupedTests);

  // Paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTests = testNames.slice(startIndex, endIndex);

  const totalPages = Math.ceil(testNames.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Grid de gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTests.map((testName) => (
          <LabsChart
            key={testName}
            testName={testName}
            testData={groupedTests[testName]}
          />
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
