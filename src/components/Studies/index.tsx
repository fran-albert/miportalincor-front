"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Search,
  FileImageIcon,
  Activity,
  TestTubeIcon,
  Zap,
  StethoscopeIcon,
  FileText,
  Folder,
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import moment from "moment-timezone";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { DoctorSelect } from "@/components/Select/Doctor/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudiesWithURL } from "@/types/Study/Study";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { Patient } from "@/types/Patient/Patient";
import { DataTable } from "@/components/Table/table";
import { createStudiesColumns } from "./Table/columns";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadStudyMutation } = useStudyMutations();
  const { promiseToast } = useToastContext();

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

  // Check if user can delete studies
  const canDeleteStudies =
    canDelete &&
    userRole.some((role) => role === "Administrador" || role === "Secretaria");

  // Check if user can add studies
  const canAddStudies = userRole.some(
    (role) => role === "Administrador" || role === "Secretaria"
  );

  const handleAddStudy: SubmitHandler<any> = async (data) => {
    const formData = new FormData();

    if (selectedStudy) {
      formData.append("studyTypeId", String(selectedStudy.id));
      formData.append("studyTypeName", selectedStudy.name);
    } else {
      formData.append("studyTypeId", data.StudyTypeId);
      formData.append("studyTypeName", data.StudyTypeName);
    }

    // Add patient ID from props
    if (patientData.id) {
      formData.append("userId", String(patientData.id));
    }

    if (selectedFiles.length > 0) {
      selectedFiles.forEach((file) => {
        formData.append("file", file);
      });
    }

    const date = data.date;
    const formattedDateISO = moment(date).toISOString();
    formData.append("date", formattedDateISO);
    formData.append("note", data.Note);

    if (data.DoctorId) {
      formData.append("doctorId", data.DoctorId);
    }

    try {
      const promise = uploadStudyMutation.mutateAsync(formData);

      await promiseToast(promise, {
        loading: {
          title: "Subiendo estudio...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Estudio subido!",
          description: "El estudio se ha subido exitosamente",
        },
        error: (error: any) => ({
          title: "Error al subir estudio",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      // Reset form and close modal on success
      reset();
      setSelectedFiles([]);
      setSelectedStudy(null);
      setIsAddModalOpen(false);
    } catch (error) {
      console.error("Error al agregar el estudio", error);
    }
  };

  const handleStudyChange = (studyType: StudyType) => {
    setSelectedStudy(studyType);
    setValue("StudyTypeId", studyType.id);
    setValue("StudyTypeName", studyType.name);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  useEffect(() => {
    if (!isAddModalOpen) {
      setValue("DoctorId", "");
      setValue("StudyTypeId", "");
      setValue("StudyTypeName", "");
      setSelectedStudy(null);
      reset();
    }
  }, [isAddModalOpen, setValue, reset]);

  return (
    <div className="min-h-screen ">
      <div className="max-w-7xl mx-auto space-y-6">
        {patient && <PatientInformation patient={patient} />}

        {/* Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
              <div
                className="flex gap-2 overflow-x-auto pb-2 w-full sm:w-auto"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#cbd5e0 transparent",
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
                      className={`whitespace-nowrap ${
                        activeTab === category.key ? "text-white" : ""
                      }`}
                      style={
                        activeTab === category.key
                          ? { backgroundColor: "#187B80" }
                          : {}
                      }
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label} ({count})
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
                    className={`whitespace-nowrap ${
                      activeTab === "tabla-laboratorios" ? "text-white" : ""
                    }`}
                    style={
                      activeTab === "tabla-laboratorios"
                        ? { backgroundColor: "#187B80" }
                        : {}
                    }
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Tabla de Laboratorios
                  </Button>
                )}
              </div>

              {/* Add Study Button - Only for Administrators and Secretaries */}
              {canAddStudies && (
                <Button
                  className="text-white whitespace-nowrap w-full sm:w-auto"
                  style={{ backgroundColor: "#187B80" }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Estudio
                </Button>
              )}
            </div>

            {/* Barra de búsqueda - Solo mostrar si no es la tabla de laboratorios */}
            {activeTab !== "tabla-laboratorios" && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar estudios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Estudios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              {activeTab === "tabla-laboratorios"
                ? `Tabla de Laboratorios Completa`
                : `${
                    categoriesConfig.find((c) => c.key === activeTab)?.label ||
                    "Estudios"
                  } (${filteredStudies.length})`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {activeTab === "tabla-laboratorios" ? (
                // Tabla de Laboratorios completa para médicos
                <div className="mt-4">{labTableComponent}</div>
              ) : (
                // Tabla de estudios con paginación para cualquier categoría
                <DataTable
                  columns={createStudiesColumns(
                    canDeleteStudies,
                    patientData.id
                  )}
                  data={filteredStudies}
                  showSearch={false}
                  canAddUser={false}
                />
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal para Agregar Estudio */}
        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileImageIcon
                  className="h-5 w-5"
                  style={{ color: "#187B80" }}
                />
                Agregar Nuevo Estudio
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleAddStudy)}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="studyType"
                    className="block text-black font-medium mb-2"
                  >
                    Tipo de Estudio
                  </Label>
                  <StudyTypeSelect
                    selected={selectedStudy || undefined}
                    onStudyChange={handleStudyChange}
                  />
                  <input type="hidden" {...register("StudyTypeId")} />
                  <input type="hidden" {...register("StudyTypeName")} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Archivos</Label>
                  <Input
                    type="file"
                    className="text-black"
                    multiple
                    onChange={handleFileChange}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2">
                      <ScrollArea className="h-32 rounded-md border">
                        <ul className="list-disc pl-5 space-y-1 pr-2">
                          {selectedFiles.map((file, index) => (
                            <li
                              key={index}
                              className="flex justify-between items-center text-sm text-gray-700"
                            >
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="comment"
                    className="block text-black font-medium mb-2"
                  >
                    Comentario
                  </Label>
                  <Input
                    {...register("Note", { required: true })}
                    placeholder="Ingresar un comentario..."
                    className="text-black"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2" htmlFor="date">
                    Fecha
                  </Label>
                  <Input
                    id="date"
                    type="date"
                    {...register("date", { required: true })}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="mb-2" htmlFor="date">
                    Firma Médico (Opcional)
                  </Label>
                  <DoctorSelect control={control} />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={uploadStudyMutation.isPending}
                  className="px-6 text-white"
                  style={{ backgroundColor: "#187B80" }}
                >
                  Agregar Estudio
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
