import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Calendar,
  User,
  Stethoscope,
  Plus,
  Search,
  FileDown,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { CreateAntecedenteDialog } from "@/components/Antecedentes/Create";
import { ViewAntecedenteDialog } from "@/components/Antecedentes/View";
import BreadcrumbComponent from "@/components/Breadcrumb";
import useUserRole from "@/hooks/useRoles";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useAntecedentes } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";
import { formatDate } from "@/common/helpers/helpers";
import { Patient } from "@/types/Patient/Patient";
import { useAntecedentesPDF } from "@/hooks/Antecedentes/useAntecedentesPDF";

interface AntecedenteProps {
  onBack: () => void;
  idUser?: string;
  idDoctor?: string;
  patient?: Patient;
}

export default function AntecedentesComponent({
  onBack,
  idUser,
  idDoctor,
  patient,
}: AntecedenteProps) {
  const { session } = useUserRole();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);

  // Estados para el modal de vista
  const [selectedAntecedenteToView, setSelectedAntecedenteToView] =
    useState<Antecedente | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Use session IDs if not provided as props
  const userId = idUser || String(session?.id);
  const doctorId = idDoctor || String(session?.id);

  // Hook para generar PDF
  const { generatePDF, isGenerating } = useAntecedentesPDF();

  // Obtener antecedentes reales
  const {
    antecedentes: antecedentesResponse,
    isLoading: isLoadingAntecedentesData,
  } = useAntecedentes({
    auth: true,
    userId: parseInt(userId),
  });

  // Pre-load data needed for the modal AND for categories
  const { data: antecedentesTypeData, isLoading: isLoadingAntecedentes } =
    useDataTypes({
      auth: true,
      fetch: true, // Always fetch to have categories available
      categories: ["ANTECEDENTES"],
      apiType: "incor",
    });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!doctorId,
    id: doctorId || "0",
  });

  // Check if all data is loaded for modal
  const isModalDataReady =
    !isLoadingAntecedentes &&
    !isLoadingDoctor &&
    antecedentesTypeData &&
    doctor;

  // Effect to open modal when data is ready
  useEffect(() => {
    if (wantsToOpenModal && isModalDataReady) {
      setIsAddModalOpen(true);
      setWantsToOpenModal(false);
    }
  }, [wantsToOpenModal, isModalDataReady]);

  const handleOpenModal = () => {
    setWantsToOpenModal(true);
  };

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setWantsToOpenModal(false);
  };

  const handleAntecedenteClick = (antecedente: Antecedente) => {
    setSelectedAntecedenteToView(antecedente);
    setIsViewModalOpen(true);
  };

  // Obtener lista de antecedentes, si no hay datos mostrar array vacío
  const antecedentes = antecedentesResponse?.antecedentes || [];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");

  const truncateText = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Generar categorías desde todos los tipos disponibles del sistema
  const categoriasFromSystem =
    antecedentesTypeData?.map((type) => type.name).sort() || [];
  const categorias = ["Todas", ...categoriasFromSystem];

  const filteredAntecedentes = antecedentes.filter((ant) => {
    const matchesSearch =
      ant.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ant.dataType.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${ant.doctor.firstName} ${ant.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesCategory =
      selectedCategory === "Todas" || ant.dataType.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryColor = (categoria: string) => {
    // Generar colores dinámicamente basados en hash del nombre
    const colors = [
      "bg-red-100 text-red-800 border-red-200",
      "bg-pink-100 text-pink-800 border-pink-200",
      "bg-teal-100 text-teal-800 border-teal-200",
      "bg-orange-100 text-orange-800 border-orange-200",
      "bg-purple-100 text-purple-800 border-purple-200",
      "bg-green-100 text-green-800 border-green-200",
      "bg-blue-100 text-blue-800 border-blue-200",
      "bg-indigo-100 text-indigo-800 border-indigo-200",
      "bg-yellow-100 text-yellow-800 border-yellow-200",
      "bg-cyan-100 text-cyan-800 border-cyan-200",
    ];

    // Crear hash simple del nombre de categoría
    let hash = 0;
    for (let i = 0; i < categoria.length; i++) {
      hash = categoria.charCodeAt(i) + ((hash << 5) - hash);
    }

    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Breadcrumb items
  const breadcrumbItems = patient
    ? [
        { label: "Home", href: "/home" },
        { label: "Pacientes", href: "/pacientes" },
        {
          label: `${patient.firstName} ${patient.lastName}`,
          href: `/pacientes/${patient.slug}`,
        },
        {
          label: "Historia Clínica",
          href: `/pacientes/${patient.slug}/historia-clinica`,
        },
        {
          label: "Antecedentes",
          icon: <Stethoscope className="h-4 w-4" />,
        },
      ]
    : [];

  return (
    <div className="space-y-6 p-6">
        {/* Breadcrumb */}
        {patient && <BreadcrumbComponent items={breadcrumbItems} />}

        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="hover:bg-white/20 text-white"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Stethoscope className="h-6 w-6" />
                  Antecedentes Médicos Completos
                </CardTitle>
              </div>
              <div className="flex gap-2">
                {patient && (
                  <Button
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20"
                    onClick={() => generatePDF({ patient, antecedentes })}
                    disabled={isGenerating || antecedentes.length === 0}
                  >
                    {isGenerating ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileDown className="h-4 w-4 mr-2" />
                    )}
                    Exportar PDF
                  </Button>
                )}
                <Button
                  className="bg-white text-greenPrimary hover:bg-white/90"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Agregar Antecedente
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filtros */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar en antecedentes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <Select
                  value={selectedCategory}
                  onValueChange={setSelectedCategory}
                  disabled={isLoadingAntecedentes}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingAntecedentes
                          ? "Cargando categorías..."
                          : "Filtrar por categoría"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Antecedentes */}
        <div className="grid gap-4">
          {isLoadingAntecedentesData ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-greenPrimary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Cargando antecedentes...</p>
              </CardContent>
            </Card>
          ) : filteredAntecedentes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <Stethoscope className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No se encontraron antecedentes
                </h3>
                <p className="text-sm text-gray-500">
                  {searchTerm || selectedCategory !== "Todas"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Haz clic en 'Agregar Antecedente' para comenzar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAntecedentes.map((ant) => (
                <Card
                  key={ant.id}
                  className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-greenPrimary"
                  onClick={() => handleAntecedenteClick(ant)}
                >
                  <CardContent className="pt-4 pb-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              className={`${getCategoryColor(
                                ant.dataType.name
                              )} border text-xs font-semibold`}
                            >
                              {ant.dataType.name}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5 text-greenPrimary" />
                              <span className="font-medium">
                                {formatDate(ant.createdAt)}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3.5 w-3.5 text-gray-400" />
                              <span className="font-semibold text-gray-900">
                                Dr. {ant.doctor.firstName} {ant.doctor.lastName}
                              </span>
                            </div>
                          </div>
                          {ant.observaciones && (
                            <p className="text-sm font-medium text-gray-800">
                              {ant.observaciones}
                            </p>
                          )}
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {truncateText(ant.value)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
          )}
        </div>

        {/* Modal para Agregar Antecedentes */}
        <CreateAntecedenteDialog
          isOpen={isAddModalOpen}
          onClose={handleCloseModal}
          idUser={userId}
          idDoctor={doctorId}
          onSuccess={() => {
            console.log("Antecedente created successfully");
            handleCloseModal();
            // Here you could refresh the antecedentes list if needed
          }}
        />

        {/* Modal para Ver Antecedente Completo */}
        <ViewAntecedenteDialog
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          antecedente={selectedAntecedenteToView}
          canDelete={
            selectedAntecedenteToView
              ? selectedAntecedenteToView.doctor?.userId === parseInt(doctorId)
              : false
          }
          canEdit={
            selectedAntecedenteToView
              ? selectedAntecedenteToView.doctor?.userId === parseInt(doctorId)
              : false
          }
        />
    </div>
  );
}
