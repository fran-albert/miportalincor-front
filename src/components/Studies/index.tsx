"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  FileImageIcon,
  Activity,
  TestTubeIcon,
  Zap,
  StethoscopeIcon,
  FileText,
  Folder,
} from "lucide-react";
import React, { useState } from "react";
import { StudiesWithURL } from "@/types/Study/Study";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { Patient } from "@/types/Patient/Patient";
import { DataTable } from "@/components/Table/table";
import { createStudiesColumns } from "./Table/columns";
import StudyDialog from "./Upload/dialog";
import { StudyCard } from "./Card/StudyCard";
import { useIsMobile } from "@/hooks/use-mobile/use-mobile";
import { MobilePagination } from "./Pagination/MobilePagination";

interface PatientData {
  name: string;
  age: number;
  gender: string;
  id: string;
  phone: string;
  address: string;
  birthDate: string;
  bloodType: string;
}

interface Study {
  id: number;
  tipo: string;
  categoria: string;
  descripcion: string;
  fecha: string;
  medico: string;
  archivo: {
    nombre: string;
    tipo: "PDF" | "JPG" | "PNG" | "DICOM";
    tamaño: string;
    url: string;
  };
  signedUrl?: string;
  estado: "Completado" | "Pendiente" | "En proceso";
}

interface Laboratory {
  id: number;
  tipo: string;
  fecha: string;
  laboratorio: string;
  medico: string;
  parametros: {
    nombre: string;
    valor: string;
    unidad: string;
    referencia: string;
    estado: string;
  }[];
  archivo: { nombre: string; tipo: string; tamaño: string; url: string };
  signedUrl?: string;
  estado: string;
}

interface PatientStudiesProps {
  onBack: () => void;
  patientData: PatientData;
  initialStudies?: Study[];
  initialLaboratories?: Laboratory[];
  userRole?: string[];
  canDelete?: boolean;
  labTableComponent?: React.ReactNode;
  studiesWithURL?: StudiesWithURL[];
  patient?: Patient;
}

export default function PatientStudies({
  patientData,
  initialStudies = [],
  initialLaboratories = [],
  userRole = [],
  canDelete = false,
  labTableComponent,
  patient,
}: PatientStudiesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const isMobile = useIsMobile();

  // Estado de paginación
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = isMobile ? 6 : 10;

  // Combinar todos los estudios (incluyendo laboratorios) para los tabs de categorías
  const studies = React.useMemo(() => {
    const labStudies: Study[] = initialLaboratories.map((lab) => ({
      id: lab.id,
      tipo: lab.tipo,
      categoria: "Laboratorio",
      descripcion: "",
      fecha: lab.fecha,
      medico: lab.medico,
      archivo: {
        nombre: lab.archivo.nombre,
        tipo: lab.archivo.tipo as "PDF" | "JPG" | "PNG" | "DICOM",
        tamaño: lab.archivo.tamaño,
        url: lab.archivo.url,
      },
      signedUrl: lab.signedUrl,
      estado: lab.estado as "Completado" | "Pendiente" | "En proceso",
    }));

    return [...initialStudies, ...labStudies];
  }, [initialStudies, initialLaboratories]);

  // Definir categorías con metadata
  const categoriesConfig = [
    { key: "Todos", label: "Estudios Médicos", icon: Folder, color: "teal" },
    {
      key: "Imagenología",
      label: "Imagenología",
      icon: FileImageIcon,
      color: "blue",
    },
    {
      key: "Laboratorio",
      label: "Laboratorios",
      icon: TestTubeIcon,
      color: "green",
    },
    { key: "Cardiología", label: "Cardiología", icon: Activity, color: "red" },
    { key: "Neurología", label: "Neurología", icon: Zap, color: "purple" },
    {
      key: "Endocrinología",
      label: "Endocrinología",
      icon: StethoscopeIcon,
      color: "orange",
    },
    { key: "Otros", label: "Otros", icon: FileText, color: "gray" },
  ];

  // Agrupar estudios por categoría
  const studiesByCategory = React.useMemo(() => {
    const grouped: Record<string, Study[]> = {
      Todos: studies, // Todos muestra todos los estudios
    };

    categoriesConfig.forEach((cat) => {
      if (cat.key !== "Todos") {
        grouped[cat.key] = studies.filter(
          (study) => study.categoria === cat.key
        );
      }
    });

    return grouped;
  }, [studies]);

  // Tab inicial siempre será "Todos" (Estudios Médicos)
  const [activeTab, setActiveTab] = useState<string>("Todos");

  // Filtrar estudios de la categoría activa por búsqueda
  const filteredStudies = React.useMemo(() => {
    const categoryStudies =
      activeTab === "tabla-laboratorios"
        ? []
        : studiesByCategory[activeTab] || [];

    if (!searchTerm) return categoryStudies;

    return categoryStudies.filter(
      (study) =>
        study.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
        study.medico.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activeTab, studiesByCategory, searchTerm]);

  // Calcular datos paginados (solo para vista mobile)
  const paginatedStudies = React.useMemo(() => {
    if (!isMobile) return filteredStudies; // En desktop, DataTable maneja su propia paginación

    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredStudies.slice(startIndex, endIndex);
  }, [filteredStudies, currentPage, pageSize, isMobile]);

  // Calcular total de páginas
  const totalPages = Math.ceil(filteredStudies.length / pageSize);

  // Reset a página 1 cuando cambia el filtro, búsqueda o tab
  React.useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchTerm]);

  // Manejar cambio de página
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // Scroll al inicio de la lista
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Check if user can delete studies
  const canDeleteStudies =
    canDelete &&
    userRole.some((role) => role === "Administrador" || role === "Secretaria");

  // Check if user can add studies
  const canAddStudies = userRole.some(
    (role) => role === "Administrador" || role === "Secretaria"
  );

  return (
    <div className="space-y-6">
      {patient && <PatientInformation patient={patient} />}

      {/* Tabs */}
      <Card>
          <CardContent className="pt-4 sm:pt-6">
            <div className="flex flex-col gap-4">
              {/* Tabs Container - Optimizado para mobile */}
              <div className="relative -mx-4 sm:mx-0">
                {/* Scroll Container */}
                <div
                  className="flex gap-2 overflow-x-auto px-4 sm:px-0 pb-2 snap-x snap-mandatory scrollbar-hide"
                  style={{
                    scrollbarWidth: "none",
                    msOverflowStyle: "none",
                    WebkitOverflowScrolling: "touch",
                  }}
                >
                  {categoriesConfig.map((category) => {
                    const count = studiesByCategory[category.key]?.length || 0;
                    const Icon = category.icon;

                    // Ocultar categorías con 0 estudios, excepto "Todos"
                    if (count === 0 && category.key !== "Todos") return null;

                    return (
                      <Button
                        key={category.key}
                        variant={
                          activeTab === category.key ? "default" : "outline"
                        }
                        onClick={() => setActiveTab(category.key)}
                        className={`whitespace-nowrap snap-start flex-shrink-0 ${
                          activeTab === category.key ? "text-white" : ""
                        } ${isMobile ? "min-w-[140px] justify-start" : ""}`}
                        size={isMobile ? "sm" : "default"}
                        style={
                          activeTab === category.key
                            ? { backgroundColor: "#187B80" }
                            : {}
                        }
                      >
                        <Icon className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} mr-2 flex-shrink-0`} />
                        <span className="truncate">
                          {isMobile
                            ? category.label.length > 12
                              ? category.label.substring(0, 10) + "..."
                              : category.label
                            : category.label}{" "}
                          ({count})
                        </span>
                      </Button>
                    );
                  })}
                  {/* Tabla de Laboratorios para Médicos */}
                  {labTableComponent && userRole.includes("Medico") && (
                    <Button
                      variant={
                        activeTab === "tabla-laboratorios"
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setActiveTab("tabla-laboratorios")}
                      className={`whitespace-nowrap snap-start flex-shrink-0 ${
                        activeTab === "tabla-laboratorios" ? "text-white" : ""
                      } ${isMobile ? "min-w-[140px] justify-start" : ""}`}
                      size={isMobile ? "sm" : "default"}
                      style={
                        activeTab === "tabla-laboratorios"
                          ? { backgroundColor: "#187B80" }
                          : {}
                      }
                    >
                      <Activity className={`${isMobile ? "h-3.5 w-3.5" : "h-4 w-4"} mr-2 flex-shrink-0`} />
                      <span className="truncate">
                        {isMobile ? "Labs" : "Tabla de Laboratorios"}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de búsqueda y botón de agregar estudio */}
            <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center mt-4">
              {/* Barra de búsqueda - Solo mostrar si no es la tabla de laboratorios */}
              {activeTab !== "tabla-laboratorios" && (
                <div className="flex-1">
                  <div className="relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 ${isMobile ? "h-5 w-5" : "h-4 w-4"}`} />
                    <Input
                      placeholder={isMobile ? "Buscar..." : "Buscar estudios..."}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`${isMobile ? "pl-11 h-11 text-base" : "pl-10"}`}
                    />
                  </div>
                </div>
              )}

              {/* Add Study Button - Only for Administrators and Secretaries */}
              {canAddStudies && patient && (
                <div className={activeTab === "tabla-laboratorios" ? "ml-auto" : ""}>
                  <StudyDialog idUser={patient.userId} />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

      {/* Tabla de Estudios / Cards para Mobile */}
      <Card>
          <CardHeader>
            <CardTitle className={`${isMobile ? "text-lg" : "text-xl"} font-bold text-gray-800`}>
              {activeTab === "tabla-laboratorios"
                ? `Tabla de Laboratorios Completa`
                : `${
                    categoriesConfig.find((c) => c.key === activeTab)?.label ||
                    "Estudios"
                  } (${filteredStudies.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeTab === "tabla-laboratorios" ? (
              // Tabla de Laboratorios completa para médicos
              <div className="mt-4">{labTableComponent}</div>
            ) : isMobile ? (
              // Vista de Cards para Mobile con Paginación
              <>
                <div className="space-y-4">
                  {paginatedStudies.length > 0 ? (
                    paginatedStudies.map((study) => (
                      <StudyCard
                        key={study.id}
                        id={study.id}
                        tipo={study.tipo}
                        categoria={study.categoria}
                        descripcion={study.descripcion}
                        fecha={study.fecha}
                        medico={study.medico}
                        archivo={study.archivo}
                        signedUrl={study.signedUrl}
                        estado={study.estado}
                        canDelete={canDeleteStudies}
                        patientId={patientData.id}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-16 w-16 text-gray-300 mb-4" />
                      <p className="text-gray-500 text-base font-medium">
                        No hay estudios disponibles
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        {searchTerm
                          ? "Intenta con otros términos de búsqueda"
                          : "Los estudios aparecerán aquí cuando estén disponibles"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Paginación Mobile */}
                {filteredStudies.length > 0 && (
                  <MobilePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredStudies.length}
                    pageSize={pageSize}
                    onPageChange={handlePageChange}
                    isMobile={isMobile}
                  />
                )}
              </>
            ) : (
              // Vista de Tabla para Desktop
              <div className="overflow-x-auto">
                <DataTable
                  columns={createStudiesColumns(
                    canDeleteStudies,
                    patientData.id
                  )}
                  data={filteredStudies}
                  showSearch={false}
                  canAddUser={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
    </div>
  );
}
