"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import StudyDialog from "./Upload/dialog";
import ExternalStudyDialog from "./Upload/external-study-dialog";
import StudiesTimeline, { TimelineStudy } from "./Timeline";
import { compareByDateDesc, parseStudyDate } from "./studyGrouping";

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
  isExternal?: boolean;
  externalInstitution?: string;
  signedDoctorId?: string;
  studyInstanceUID?: string | null;
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
  currentDoctorId?: string;
}

const STUDY_CATEGORIES = [
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
] as const;

/** Valor centinela del filtro por tipo: Radix no admite `SelectItem` con value vacío. */
const ALL_TYPES = "__todos__";

const compareNewestFirst = (a: Study, b: Study) =>
  compareByDateDesc(parseStudyDate(a.fecha), parseStudyDate(b.fecha));

const toTimelineStudy = (study: Study): TimelineStudy => ({
  id: study.id,
  title: study.tipo,
  subtitle:
    study.descripcion && study.descripcion !== "Sin descripción"
      ? study.descripcion
      : undefined,
  category: study.categoria,
  date: study.fecha,
  dateLabel: study.fecha || "Sin fecha",
  fileUrl: study.signedUrl || study.archivo?.url || undefined,
  isExternal: study.isExternal,
  externalInstitution: study.externalInstitution,
  signedDoctorId: study.signedDoctorId,
  studyInstanceUID: study.studyInstanceUID,
});

export default function PatientStudies({
  patientData,
  initialStudies = [],
  initialLaboratories = [],
  userRole = [],
  canDelete = false,
  labTableComponent,
  patient,
  currentDoctorId,
}: PatientStudiesProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>(ALL_TYPES);

  // Check if user is a doctor (can see external studies)
  const isDoctor = userRole.some((role) => role === "Medico");

  // Combinar todos los estudios (incluyendo laboratorios) para los tabs de categorías
  // Filtrar estudios externos para que solo los médicos puedan verlos
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

    const allStudies = [...initialStudies, ...labStudies].sort(
      compareNewestFirst
    );

    // Si no es médico, filtrar los estudios externos y los manuales (sin archivo)
    if (!isDoctor) {
      return allStudies.filter((study) => {
        // Ocultar estudios externos
        if (study.isExternal) return false;
        // Ocultar estudios manuales (sin archivo PDF)
        const hasFile = !!(study.signedUrl || study.archivo?.url);
        if (!hasFile) return false;
        return true;
      });
    }

    return allStudies;
  }, [initialStudies, initialLaboratories, isDoctor]);

  // Definir categorías con metadata
  // Agrupar estudios por categoría
  const studiesByCategory = React.useMemo(() => {
    const grouped: Record<string, Study[]> = {
      Todos: studies, // Todos muestra todos los estudios
    };

    STUDY_CATEGORIES.forEach((cat) => {
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

  const categoryStudies = React.useMemo(
    () =>
      activeTab === "tabla-laboratorios"
        ? []
        : studiesByCategory[activeTab] || [],
    [activeTab, studiesByCategory]
  );

  // Tipos disponibles dentro de la categoría activa, para el filtro por tipo
  const availableTypes = React.useMemo(
    () =>
      Array.from(new Set(categoryStudies.map((study) => study.tipo)))
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b, "es")),
    [categoryStudies]
  );

  // Filtrar por búsqueda y por tipo (se combinan)
  const filteredStudies = React.useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return categoryStudies.filter((study) => {
      if (typeFilter !== ALL_TYPES && study.tipo !== typeFilter) {
        return false;
      }

      if (!normalizedSearch) return true;

      return (
        study.tipo.toLowerCase().includes(normalizedSearch) ||
        study.descripcion.toLowerCase().includes(normalizedSearch) ||
        study.medico.toLowerCase().includes(normalizedSearch)
      );
    });
  }, [categoryStudies, searchTerm, typeFilter]);

  const timelineStudies = React.useMemo(
    () => filteredStudies.map(toTimelineStudy),
    [filteredStudies]
  );

  // Si el tipo elegido ya no existe en la categoría activa, volver a "Todos los tipos"
  React.useEffect(() => {
    if (typeFilter !== ALL_TYPES && !availableTypes.includes(typeFilter)) {
      setTypeFilter(ALL_TYPES);
    }
  }, [availableTypes, typeFilter]);

  // Check if user can delete studies
  const canDeleteStudies =
    canDelete &&
    userRole.some((role) => role === "Administrador" || role === "Secretaria");

  // Check if user can add studies
  const canAddStudies = userRole.some(
    (role) => role === "Administrador" || role === "Secretaria"
  );

  return (
    <div className="w-full space-y-6">
      {patient && <PatientInformation patient={patient} />}

      {/* Filtros */}
      <Card>
        <CardContent className="pt-4 sm:pt-6">
          {/* Chips de categoría con contador: envuelven, no scrollean de costado */}
          <div className="flex flex-wrap gap-2">
            {STUDY_CATEGORIES.map((category) => {
              const count = studiesByCategory[category.key]?.length || 0;
              const Icon = category.icon;

              // Ocultar categorías con 0 estudios, excepto "Todos"
              if (count === 0 && category.key !== "Todos") return null;

              return (
                <Button
                  key={category.key}
                  variant={activeTab === category.key ? "default" : "outline"}
                  onClick={() => setActiveTab(category.key)}
                  size="sm"
                  className={`max-w-full ${
                    activeTab === category.key ? "text-white" : ""
                  }`}
                  style={
                    activeTab === category.key
                      ? { backgroundColor: "#187B80" }
                      : {}
                  }
                >
                  <Icon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{category.label}</span>
                  <span className="ml-2 flex-shrink-0 text-xs opacity-80">
                    {count}
                  </span>
                </Button>
              );
            })}

            {/* Tabla de Laboratorios para Médicos */}
            {labTableComponent && userRole.includes("Medico") && (
              <Button
                variant={
                  activeTab === "tabla-laboratorios" ? "default" : "outline"
                }
                onClick={() => setActiveTab("tabla-laboratorios")}
                size="sm"
                className={`max-w-full ${
                  activeTab === "tabla-laboratorios" ? "text-white" : ""
                }`}
                style={
                  activeTab === "tabla-laboratorios"
                    ? { backgroundColor: "#187B80" }
                    : {}
                }
              >
                <Activity className="mr-2 h-4 w-4 flex-shrink-0" />
                <span className="truncate">Tabla de Laboratorios</span>
              </Button>
            )}
          </div>

          {/* Buscador, filtro por tipo y botones de carga */}
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            {activeTab !== "tabla-laboratorios" && (
              <>
                <div className="relative min-w-0 flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                  <Input
                    placeholder="Buscar estudio…"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>

                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger
                    className="w-full lg:w-64"
                    aria-label="Filtrar por tipo de estudio"
                  >
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL_TYPES}>Todos los tipos</SelectItem>
                    {availableTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}

            {(canAddStudies || isDoctor) && patient && (
              <div
                className={`flex flex-wrap gap-2 ${
                  activeTab === "tabla-laboratorios" ? "lg:ml-auto" : ""
                }`}
              >
                {/* Regular study dialog - Solo Admin y Secretaria */}
                {canAddStudies && <StudyDialog idUser={patient.userId} />}
                {/* External study dialog - Solo para Médicos */}
                {isDoctor && <ExternalStudyDialog idUser={patient.userId} />}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Listado de estudios */}
      <Card>
        <CardHeader>
          <CardTitle className="break-words text-lg font-bold text-gray-800 sm:text-xl">
            {activeTab === "tabla-laboratorios"
              ? "Tabla de Laboratorios Completa"
              : `${
                  STUDY_CATEGORIES.find((c) => c.key === activeTab)?.label ||
                  "Estudios"
                } (${filteredStudies.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {activeTab === "tabla-laboratorios" ? (
            <div className="mt-4">{labTableComponent}</div>
          ) : (
            <StudiesTimeline
              studies={timelineStudies}
              canDelete={canDeleteStudies}
              patientId={patientData.id}
              currentDoctorId={currentDoctorId}
              emptyDescription={
                searchTerm || typeFilter !== ALL_TYPES
                  ? "Probá con otros términos de búsqueda o cambiá el filtro"
                  : "Los estudios aparecerán acá cuando estén disponibles"
              }
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
