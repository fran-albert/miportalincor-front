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
  Download,
  Eye,
  Plus,
  Search,
  Calendar,
  FileImageIcon,
  Activity,
  TestTubeIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import moment from "moment-timezone";
import { StudyTypeSelect } from "@/components/Select/Study/select";
import { useStudyMutations } from "@/hooks/Study/useStudyMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { DoctorSelect } from "@/components/Select/Doctor/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { StudiesWithURL } from "@/types/Study/Study";
import DeleteStudyDialog from "./Delete/dialog";
import PatientInformation from "@/components/Patients/Dashboard/Patient-Information";
import { Patient } from "@/types/Patient/Patient";

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
  initialStudies: studies = [],
  initialLaboratories = [],
  userRole = [],
  canDelete = false,
  labTableComponent,
  studiesWithURL = [],
  patient,
}: PatientStudiesProps) {
  const [activeTab, setActiveTab] = useState<
    "estudios" | "laboratorios" | "tabla-laboratorios"
  >("estudios");

  const [laboratories] = useState<Laboratory[]>(initialLaboratories);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [selectedStudy, setSelectedStudy] = useState<StudyType | null>(null);
  const { register, handleSubmit, reset, setValue, control } = useForm();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { uploadStudyMutation } = useStudyMutations();
  const { promiseToast } = useToastContext();

  const categorias = [
    "Todas",
    "Imagenología",
    "Laboratorio",
    "Cardiología",
    "Neurología",
    "Endocrinología",
    "Otros",
  ];

  const getCategoryIcon = (categoria: string) => {
    switch (categoria) {
      case "Imagenología":
        return <FileImageIcon className="h-5 w-5 text-blue-500" />;
      case "Laboratorio":
        return <TestTubeIcon className="h-5 w-5 text-green-500" />;
      case "Cardiología":
        return <Activity className="h-5 w-5 text-red-500" />;
      default:
        return <FileImageIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const filteredStudies = studies.filter((study) => {
    const matchesSearch =
      study.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.medico.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || study.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Check if user can delete studies
  const canDeleteStudies =
    canDelete &&
    userRole.some((role) => role === "Administrador" || role === "Secretaria");

  // Check if user can add studies
  const canAddStudies = userRole.some((role) => role === "Administrador" || role === "Secretaria");

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {patient && <PatientInformation patient={patient} />}

        {/* Tabs */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-4">
                <Button
                  variant={activeTab === "estudios" ? "default" : "outline"}
                  onClick={() => setActiveTab("estudios")}
                  className={activeTab === "estudios" ? "text-white" : ""}
                  style={
                    activeTab === "estudios"
                      ? { backgroundColor: "#187B80" }
                      : {}
                  }
                >
                  <FileImageIcon className="h-4 w-4 mr-2" />
                  Estudios Médicos ({filteredStudies.length})
                </Button>
                <Button
                  variant={activeTab === "laboratorios" ? "default" : "outline"}
                  onClick={() => setActiveTab("laboratorios")}
                  className={activeTab === "laboratorios" ? "text-white" : ""}
                  style={
                    activeTab === "laboratorios"
                      ? { backgroundColor: "#187B80" }
                      : {}
                  }
                >
                  <TestTubeIcon className="h-4 w-4 mr-2" />
                  Laboratorios ({laboratories.length})
                </Button>
                {labTableComponent && userRole.includes("Médico") && (
                  <Button
                    variant={
                      activeTab === "tabla-laboratorios" ? "default" : "outline"
                    }
                    onClick={() => setActiveTab("tabla-laboratorios")}
                    className={
                      activeTab === "tabla-laboratorios" ? "text-white" : ""
                    }
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
                  className="text-white"
                  style={{ backgroundColor: "#187B80" }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Estudio
                </Button>
              )}
            </div>

            {/* Filtros solo para estudios */}
            {activeTab === "estudios" && (
              <div className="flex flex-col md:flex-row gap-4">
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
                <div className="md:w-64">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Filtro simple para laboratorios */}
            {activeTab === "laboratorios" && (
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar laboratorios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabla de Estudios o Laboratorios */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              {activeTab === "estudios"
                ? `Lista de Estudios (${filteredStudies.length})`
                : activeTab === "laboratorios"
                ? `Análisis de Laboratorio (${laboratories.length})`
                : `Tabla de Laboratorios Completa`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              {activeTab === "estudios" ? (
                // Tabla de estudios existente
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Tipo de Estudio
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudies.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="text-center py-12">
                          <FileImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500">
                            No se encontraron estudios
                          </p>
                          <p className="text-gray-400 text-sm mt-1">
                            {searchTerm || selectedCategory !== "Todas"
                              ? "Intenta cambiar los filtros de búsqueda"
                              : "Haz clic en 'Agregar Estudio' para comenzar"}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredStudies.map((study) => (
                        <tr
                          key={study.id}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              {getCategoryIcon(study.categoria)}
                              <div>
                                <p className="font-medium text-gray-800">
                                  {study.tipo}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {study.descripcion}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>{study.fecha}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  window.open(
                                    study.signedUrl || study.archivo.url,
                                    "_blank"
                                  )
                                }
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() =>
                                  window.open(
                                    study.signedUrl || study.archivo.url,
                                    "_blank"
                                  )
                                }
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {canDeleteStudies && (
                                <DeleteStudyDialog
                                  idStudy={study.id}
                                  userId={parseInt(patientData.id)}
                                  studies={studiesWithURL}
                                />
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              ) : activeTab === "laboratorios" ? (
                // Nueva tabla de laboratorios simplificada
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Tipo de Análisis
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Fecha
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {laboratories.map((lab) => (
                      <tr
                        key={lab.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <TestTubeIcon className="h-5 w-5 text-green-500" />
                            <div>
                              <p className="font-medium text-gray-800">
                                {lab.tipo}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>{lab.fecha}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(
                                  lab.signedUrl || lab.archivo.url,
                                  "_blank"
                                )
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                window.open(
                                  lab.signedUrl || lab.archivo.url,
                                  "_blank"
                                )
                              }
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : activeTab === "tabla-laboratorios" ? (
                // Tabla de Laboratorios completa
                <div className="mt-4">{labTableComponent}</div>
              ) : null}
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
