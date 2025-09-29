import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Pill,
  Plus,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";
import CreateCurrentMedicationModal from "@/components/Current-Medication/Create";
import ViewMedicacionActualModal from "@/components/Current-Medication/View-Simple";
import { useMedicacionActual } from "@/hooks/User-Historia-Clinica/useUserHistoriaClinica";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import useUserRole from "@/hooks/useRoles";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { MedicacionActual } from "@/types/Antecedentes/Antecedentes";

type UserData = Patient | Doctor;

interface MedicacionActualComponentProps {
  onBack: () => void;
  userData: UserData;
  userType: "patient" | "doctor";
  currentUserType: "patient" | "doctor";
}

export default function MedicacionActualComponent({
  onBack,
  userData,
  userType,
  currentUserType,
}: MedicacionActualComponentProps) {
  const { session } = useUserRole();
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'SUSPENDED'>('ALL');
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [wantsToOpenModal, setWantsToOpenModal] = useState(false);
  const [selectedMedicationToView, setSelectedMedicationToView] = useState<MedicacionActual | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Get current medications
  const queryParams = {
    status: statusFilter,
    includeDoctor: true,
    orderBy: 'startDate' as const,
    orderDirection: 'DESC' as const
  };


  const {
    medicacionActual,
    isLoading: isLoadingMedications,
    error: medicationsError,
  } = useMedicacionActual({
    auth: true,
    userId: userData.userId,
    queryParams,
  });

  const { doctor, isLoading: isLoadingDoctor } = useDoctor({
    auth: wantsToOpenModal && !!session?.id,
    id: parseInt(session?.id || "0"),
  });

  // Check if all data is loaded for modal
  const isModalDataReady = !isLoadingDoctor && doctor;

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

  const handleMedicationClick = (medication: MedicacionActual) => {
    setSelectedMedicationToView(medication);
    setIsViewModalOpen(true);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedMedicationToView(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    if (status === 'ACTIVE') {
      return <Badge className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">Suspendido</Badge>;
    }
  };

  const truncateText = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Get medications array
  const medications = medicacionActual || [];

  // Filter medications based on search term
  const filteredMedications = medications.filter((medication: MedicacionActual) => {
    const matchesSearch =
      medication.observations?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.medicationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.dosage?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.frequency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medication.doctor && `${medication.doctor.firstName} ${medication.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50">
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
                  <Pill className="h-6 w-6 text-purple-600" />
                  Medicación Actual Completa
                </CardTitle>
              </div>
              {currentUserType === 'doctor' && (
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={handleOpenModal}
                  disabled={wantsToOpenModal}
                >
                  {wantsToOpenModal ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  ) : (
                    <Plus className="h-4 w-4 mr-2" />
                  )}
                  Agregar Medicación
                </Button>
              )}
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
                    placeholder="Buscar en medicaciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <div className="flex items-center gap-2">
                  <Label htmlFor="status-filter" className="text-sm font-medium text-gray-700">
                    Estado:
                  </Label>
                  <Select
                    value={statusFilter}
                    onValueChange={(value: 'ALL' | 'ACTIVE' | 'SUSPENDED') => setStatusFilter(value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">Todas</SelectItem>
                      <SelectItem value="ACTIVE">Activas</SelectItem>
                      <SelectItem value="SUSPENDED">Suspendidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Medicaciones */}
        <div className="grid gap-4">
          {isLoadingMedications ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-500">Cargando medicaciones...</p>
              </CardContent>
            </Card>
          ) : medicationsError ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-red-500">Error al cargar las medicaciones</p>
              </CardContent>
            </Card>
          ) : filteredMedications.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Pill className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron medicaciones</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || statusFilter !== "ALL"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : currentUserType === 'doctor'
                    ? "Haz clic en 'Agregar Medicación' para comenzar"
                    : "No se encontraron medicaciones registradas"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredMedications.map((medication) => (
              <Card key={medication.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div
                    className="cursor-pointer"
                    onClick={() => handleMedicationClick(medication)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(medication.status)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDateTime(medication.createdAt)}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Medication Info */}
                      <div className="space-y-2">
                        {medication.observations && (
                          <div>
                            <Label className="text-xs text-gray-500">Medicamento</Label>
                            <p className="text-sm font-semibold text-gray-800">
                              {truncateText(medication.observations, 50)}
                            </p>
                          </div>
                        )}

                        {medication.dosage && (
                          <div>
                            <Label className="text-xs text-gray-500">Dosis</Label>
                            <p className="text-xs text-gray-600">{medication.dosage}</p>
                          </div>
                        )}

                        {medication.frequency && (
                          <div>
                            <Label className="text-xs text-gray-500">Frecuencia</Label>
                            <p className="text-xs text-gray-600">{medication.frequency}</p>
                          </div>
                        )}
                      </div>

                      {/* Dates */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Inicio: {formatDate(medication.startDate)}</span>
                        </div>

                        {medication.status === 'SUSPENDED' && medication.suspensionDate && (
                          <div className="flex items-center gap-1 text-xs text-red-500">
                            <Calendar className="h-3 w-3" />
                            <span>Suspensión: {formatDate(medication.suspensionDate)}</span>
                          </div>
                        )}
                      </div>

                      {/* Doctor Info */}
                      {medication.doctor && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <User className="h-3 w-3" />
                            <span>Dr. {medication.doctor.firstName} {medication.doctor.lastName}</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Suspension Reason */}
                    {medication.status === 'SUSPENDED' && medication.suspensionReason && (
                      <div className="mt-3 pt-3 border-t">
                        <Label className="text-xs text-gray-500">Motivo de suspensión</Label>
                        <p className="text-xs text-red-600 mt-1">{medication.suspensionReason}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Modal para Crear Medicación */}
        {currentUserType === 'doctor' && (
          <CreateCurrentMedicationModal
            isOpen={isAddModalOpen}
            onClose={handleCloseModal}
            userData={userData}
            userType={userType}
            doctor={doctor}
          />
        )}

        {/* Modal para Ver Medicación */}
        <ViewMedicacionActualModal
          isOpen={isViewModalOpen}
          onClose={handleCloseViewModal}
          medication={selectedMedicationToView}
          userType={currentUserType}
          showActions={currentUserType === 'doctor'}
        />
      </div>
    </div>
  );
}