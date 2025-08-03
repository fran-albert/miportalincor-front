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
} from "lucide-react";
import { useState, useEffect } from "react";
import { CreateAntecedenteDialog } from "@/components/Antecedentes/Create";
import { ViewAntecedenteDialog } from "@/components/Antecedentes/View";
import DeleteDataValueDialog from "@/components/Historia-Clinica/Delete/DeleteDataValueDialog";
import useUserRole from "@/hooks/useRoles";
import { useDataTypes } from "@/hooks/Data-Type/useDataTypes";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useAntecedentes } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { Antecedente } from "@/types/Antecedentes/Antecedentes";
import { formatDate } from "@/common/helpers/helpers";

interface AntecedenteProps {
  onBack: () => void;
  idUser?: string;
  idDoctor?: string;
}

export default function AntecedentesComponent({
  onBack,
  idUser,
  idDoctor,
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

  // Obtener antecedentes reales
  const {
    antecedentes: antecedentesResponse,
    isLoading: isLoadingAntecedentesData,
  } = useAntecedentes({
    auth: true,
    userId: parseInt(userId),
  });

  console.log("Antecedentes Response:", antecedentesResponse);

  // Pre-load data needed for the modal AND for categories
  const { data: antecedentesTypeData, isLoading: isLoadingAntecedentes } =
    useDataTypes({
      auth: true,
      fetch: true, // Always fetch to have categories available
      categories: ["ANTECEDENTES"],
      apiType: "incor",
    });

  console.log(
    "Antecedentes Type Data:",
    antecedentesTypeData,
    "Loading:",
    isLoadingAntecedentes
  );

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!doctorId,
    id: parseInt(doctorId || "0"),
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-teal-50 to-indigo-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onBack}
                  className="hover:bg-white/50"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
                <CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                  <Stethoscope className="h-6 w-6 text-teal-600" />
                  Antecedentes Médicos Completos
                </CardTitle>
              </div>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
                onClick={handleOpenModal}
                disabled={wantsToOpenModal}
              >
                {wantsToOpenModal ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Agregar Antecedente
              </Button>
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
                <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Cargando antecedentes...</p>
              </CardContent>
            </Card>
          ) : filteredAntecedentes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Stethoscope className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron antecedentes</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || selectedCategory !== "Todas"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Haz clic en 'Agregar Antecedente' para comenzar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredAntecedentes.map((ant) => (
              <Card key={ant.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleAntecedenteClick(ant)}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Badge
                          className={`${getCategoryColor(
                            ant.dataType.name
                          )} border`}
                        >
                          {ant.dataType.name}
                        </Badge>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(ant.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              Dr. {ant.doctor.firstName} {ant.doctor.lastName}
                            </span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-800 leading-relaxed">
                        {ant.observaciones}
                      </p>
                      <p className="text-gray-800 leading-relaxed">
                        {truncateText(ant.value)}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center">
                      <DeleteDataValueDialog
                        idDataValue={String(ant.id)}
                        itemType="antecedente"
                        itemDescription={truncateText(ant.value, 50)}
                      />
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
        />
      </div>
    </div>
  );
}
