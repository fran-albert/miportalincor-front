import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ArrowLeft,
  Calendar,
  User,
  Activity,
  Plus,
  Search,
  FileText,
  ClipboardList,
  Stethoscope,
  FileCheck,
} from "lucide-react";
import { useState } from "react";
import CreateEvolucionDialog from "../Create";
import { EvolucionesResponse, Evolucion as EvolucionType, EvolucionData } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import useUserRole from "@/hooks/useRoles";
import BreadcrumbComponent from "@/components/Breadcrumb";
import EvolutionTable from "../Table/table";
import { EvolutionTableRow } from "../Table/columns";
import { formatEvolutionDateTime } from "@/common/helpers/evolutionHelpers";
import { useEvolutionPDF } from "@/hooks/Evolution/useEvolutionPDF";
import { useToast } from "@/hooks/Toast/useToast";
import { useEvolutionMutation } from "@/hooks/Evolution/useEvolutionMutation";
import DeleteEvolutionDialog from "../Delete/DeleteEvolutionDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type UserData = Patient | Doctor;

interface Props {
  onBack: () => void;
  evoluciones: EvolucionesResponse | undefined;
  userData: UserData | undefined;
  userType: "patient" | "doctor";
  patientId?: number;
  patient?: Patient;
}

export default function EvolucionesComponent({
  onBack,
  evoluciones,
  userData,
  patientId,
  patient,
}: Props) {
  const { session } = useUserRole();
  const idDoctor = session?.id ? parseInt(session.id, 10) : undefined;
  const idUser = patientId || userData?.id;
  const { showSuccess, showError, showLoading, removeToast } = useToast();
  const { generatePDF } = useEvolutionPDF();
  const { deleteEvolutionMutation } = useEvolutionMutation();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("Todas");
  const [selectedConsultaToView, setSelectedConsultaToView] = useState<{
    fechaConsulta: string;
    fechaCreacion: string;
    doctor: EvolucionType['doctor'];
    especialidad: string | null;
    motivoConsulta: string | null;
    enfermedadActual: string | null;
    examenFisico: string | null;
    diagnosticosPresuntivos: string | null;
    evolucionPrincipal: EvolucionType | null;
    mediciones: EvolucionData[];
    evoluciones: EvolucionType[];
  } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [evolutionToDelete, setEvolutionToDelete] = useState<EvolutionTableRow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const especialidades = [
    "Todas",
    "Medicina General",
    "Cardiología",
    "Endocrinología",
    "Neurología",
    "Gastroenterología",
    "Neumología",
    "Dermatología",
    "Traumatología",
    "Ginecología",
    "Urología",
    "Oftalmología",
    "Otorrinolaringología",
  ];

  const [isAddEvolucionModalOpen, setIsAddEvolucionModalOpen] = useState(false);

  const handleConsultaClick = (consulta: typeof selectedConsultaToView) => {
    setSelectedConsultaToView(consulta);
    setIsViewModalOpen(true);
  };

  const handleViewEvolution = (row: EvolutionTableRow) => {
    const consulta = {
      fechaConsulta: row.fechaConsulta,
      fechaCreacion: row.fechaCreacion,
      doctor: row.doctor,
      especialidad: row.evolucionCompleta.especialidad,
      motivoConsulta: row.motivoConsulta,
      enfermedadActual: row.enfermedadActual,
      examenFisico: row.examenFisico,
      diagnosticosPresuntivos: row.diagnosticosPresuntivos,
      evolucionPrincipal: row.evolucionCompleta.evolucionPrincipal,
      mediciones: row.evolucionCompleta.mediciones,
      evoluciones: row.evolucionCompleta.evoluciones
    };
    handleConsultaClick(consulta);
  };

  const handleDeleteEvolution = (row: EvolutionTableRow) => {
    setEvolutionToDelete(row);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async (evolution: EvolutionTableRow) => {
    try {
      // Necesitamos obtener el ID de la evolución desde evolucionCompleta
      // Ya que la tabla agrupa por consulta, necesitamos eliminar todas las evoluciones de la consulta
      const evolutionIds = evolution.evolucionCompleta.evoluciones.map((ev: EvolucionType) => ev.id);

      if (evolutionIds.length === 0) {
        showError("No se encontraron evoluciones para eliminar");
        return;
      }

      // Por ahora, intentamos eliminar solo la primera evolución
      // (esto podría necesitar ajuste según la lógica de negocio)
      const firstEvolutionId = evolutionIds[0];

      await deleteEvolutionMutation.mutateAsync(String(firstEvolutionId));

      showSuccess("Evolución Eliminada", "La evolución ha sido eliminada exitosamente");
    } catch (error: any) {
      console.error("Error deleting evolution:", error);

      const errorMessage = error.response?.data?.message || error.message || "Error desconocido";
      showError("Error", `No se pudo eliminar la evolución: ${errorMessage}`);
    }
  };

  const handlePrintEvolution = async (row: EvolutionTableRow) => {
    if (!userData) {
      showError("No se encontró información del paciente");
      return;
    }

    try {
      const loadingToastId = showLoading("Generando PDF", "Preparando documento...");

      const result = await generatePDF({
        evolution: row,
        patientName: userData.firstName || "",
        patientSurname: userData.lastName || "",
        // logoSrc: "/path/to/logo.png" // Agregar logo si está disponible
      });

      removeToast(loadingToastId);

      if (result.success) {
        showSuccess("PDF Generado", `Archivo descargado: ${result.fileName}`);
      } else {
        showError("No se pudo generar el PDF");
      }
    } catch (error) {
      console.error("Error generating PDF:", error);
      showError("Ocurrió un error al generar el PDF");
    }
  };

  // Función para obtener la fecha de consulta de una evolución
  const getFechaConsulta = (evolucion: EvolucionType) => {
    // Buscar el campo de fecha de consulta en el array data
    const fechaData = evolucion.data.find(d => 
      d.dataType && d.dataType.name.toLowerCase() === 'fecha de consulta'
    );
    
    return fechaData ? fechaData.value : new Date(evolucion.createdAt).toISOString().split('T')[0];
  };

  // Función para transformar evoluciones a formato de tabla
  const transformEvolucionesToTableRows = (evoluciones: EvolucionType[]): EvolutionTableRow[] => {
    const grouped: {
      [key: string]: {
        fechaConsulta: string;
        fechaCreacion: string;
        doctor: EvolucionType['doctor'];
        especialidad: string | null;
        motivoConsulta: string | null;
        enfermedadActual: string | null;
        examenFisico: string | null;
        diagnosticosPresuntivos: string | null;
        evolucionPrincipal: EvolucionType | null;
        mediciones: EvolucionData[];
        evoluciones: EvolucionType[];
      };
    } = {};

    // Procesar cada evolución
    evoluciones.forEach((evolucion: EvolucionType) => {
      const fechaConsulta = getFechaConsulta(evolucion);
      const key = `${fechaConsulta}_${evolucion.doctor.userId}`; // Agrupar por fecha y doctor

      if (!grouped[key]) {
        grouped[key] = {
          fechaConsulta: fechaConsulta,
          fechaCreacion: evolucion.createdAt,
          doctor: evolucion.doctor,
          especialidad: null,
          motivoConsulta: null,
          enfermedadActual: null,
          examenFisico: null,
          diagnosticosPresuntivos: null,
          evolucionPrincipal: evolucion,
          mediciones: [],
          evoluciones: [],
        };
      }

      // Procesar cada item de data dentro de la evolución
      evolucion.data.forEach((dataItem: EvolucionData) => {
        if (!dataItem.dataType) return;

        const dataTypeName = dataItem.dataType.name.toLowerCase();

        if (dataItem.dataType.category === "MEDICION") {
          // Agregar a mediciones
          grouped[key].mediciones.push(dataItem);
        } else {
          // Clasificar evoluciones no-medición
          if (dataTypeName === "fecha de consulta") {
            // Ya procesado arriba
          } else if (dataTypeName.includes("especialidad")) {
            grouped[key].especialidad = dataItem.value;
          } else if (dataTypeName.includes("motivo de consulta")) {
            grouped[key].motivoConsulta = dataItem.value;
          } else if (dataTypeName.includes("enfermedad actual")) {
            grouped[key].enfermedadActual = dataItem.value;
          } else if (
            dataTypeName.includes("examen fisico") ||
            dataTypeName.includes("examen físico")
          ) {
            grouped[key].examenFisico = dataItem.value;
          } else if (
            dataTypeName.includes("diagnóstico presuntivo") ||
            dataTypeName.includes("diagnostico presuntivo")
          ) {
            grouped[key].diagnosticosPresuntivos = dataItem.value;
          }
        }
      });

      // Agregar la evolución completa al grupo
      grouped[key].evoluciones.push(evolucion);
    });

    const consultasAgrupadas = Object.values(grouped).filter((consulta) => {
      const hasContent =
        consulta.motivoConsulta ||
        consulta.enfermedadActual ||
        consulta.examenFisico ||
        consulta.diagnosticosPresuntivos ||
        consulta.especialidad ||
        consulta.mediciones.length > 0;
      return hasContent;
    });

    // Transformar a formato de tabla
    return consultasAgrupadas.map((consulta) => ({
      id: `${consulta.fechaConsulta}_${consulta.doctor.userId}`,
      fechaConsulta: consulta.fechaConsulta,
      fechaCreacion: consulta.fechaCreacion,
      doctor: {
        userId: consulta.doctor.userId,
        firstName: consulta.doctor.firstName,
        lastName: consulta.doctor.lastName,
        specialities: consulta.doctor.specialities || []
      },
      motivoConsulta: consulta.motivoConsulta,
      enfermedadActual: consulta.enfermedadActual,
      examenFisico: consulta.examenFisico,
      diagnosticosPresuntivos: consulta.diagnosticosPresuntivos,
      evolucionCompleta: {
        ...consulta,
        mediciones: consulta.mediciones,
        evoluciones: consulta.evoluciones
      }
    }));
  };

  const tableRows = evoluciones
    ? transformEvolucionesToTableRows(evoluciones.evoluciones)
    : [];

  const filteredRows = tableRows.filter((row) => {
    const matchesSearch =
      row.motivoConsulta
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.enfermedadActual
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.examenFisico
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      row.diagnosticosPresuntivos
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${row.doctor.firstName} ${row.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesEspecialidad =
      selectedEspecialidad === "Todas" ||
      row.evolucionCompleta.especialidad === selectedEspecialidad;

    return matchesSearch && matchesEspecialidad;
  });

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
          label: "Evoluciones Médicas",
          icon: <Activity className="h-4 w-4" />,
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
                  <Activity className="h-6 w-6" />
                  Evoluciones Médicas Completas
                </CardTitle>
              </div>
              <Button
                className="bg-white text-greenPrimary hover:bg-white/90"
                onClick={() => setIsAddEvolucionModalOpen(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Evolución
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
                    placeholder="Buscar en evoluciones..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="md:w-64">
                <select
                  value={selectedEspecialidad}
                  onChange={(e) => setSelectedEspecialidad(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  {especialidades.map((esp) => (
                    <option key={esp} value={esp}>
                      {esp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Evoluciones */}
        <Card>
          <CardContent className="p-0">
            <EvolutionTable
              data={filteredRows}
              onView={handleViewEvolution}
              onDelete={handleDeleteEvolution}
              onPrint={handlePrintEvolution}
              isLoading={false}
            />
          </CardContent>
        </Card>

        {/* Modal para Agregar Evolución */}
        {typeof idUser === "number" && typeof idDoctor === "number" && (
          <CreateEvolucionDialog
            idUser={idUser}
            idDoctor={idDoctor}
            isOpen={isAddEvolucionModalOpen}
            onClose={() => setIsAddEvolucionModalOpen(false)}
          />
        )}

        {/* Diálogo de Eliminación */}
        <DeleteEvolutionDialog
          evolution={evolutionToDelete}
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setEvolutionToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          isDeleting={deleteEvolutionMutation.isPending}
        />
        {/* Modal para Ver Evolución Completa */}
        <TooltipProvider>
          <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader className="pb-4 bg-gradient-to-r from-greenPrimary/5 to-teal-50 -m-6 mb-0 p-6 rounded-t-lg border-b border-greenPrimary/10">
                <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-greenPrimary/20">
                    <Activity className="h-5 w-5 text-greenPrimary" />
                  </div>
                  Detalle de la Evolución
                </DialogTitle>
              </DialogHeader>
            {selectedConsultaToView && (
              <div className="space-y-6 p-6 -mx-6">
                {/* Timeline de información */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-gray-700">
                    Información del Registro
                  </Label>
                  <div className="border-l-2 border-greenPrimary/30 pl-6 space-y-4 ml-2">
                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[29px] p-1.5 bg-greenPrimary rounded-full shadow-sm">
                        <Calendar className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-xs text-gray-500 font-medium">Fecha de Consulta</Label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          {(() => {
                            const dateTime = formatEvolutionDateTime(selectedConsultaToView.fechaConsulta);
                            return `${dateTime.date} - ${dateTime.time}`;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="relative flex items-start gap-4">
                      <div className="absolute -left-[29px] p-1.5 bg-greenPrimary rounded-full shadow-sm">
                        <User className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
                        <Label className="text-xs text-gray-500 font-medium">Registrado por</Label>
                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          Dr. {selectedConsultaToView.doctor.firstName} {selectedConsultaToView.doctor.lastName}
                        </p>
                        {selectedConsultaToView.doctor.specialities &&
                         selectedConsultaToView.doctor.specialities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {selectedConsultaToView.doctor.specialities.map((specialty, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                              >
                                {specialty.name}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {selectedConsultaToView.especialidad && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileText className="h-4 w-4 text-greenPrimary" />
                      Especialidad
                    </Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        {selectedConsultaToView.especialidad}
                      </Badge>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.motivoConsulta && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <ClipboardList className="h-4 w-4 text-greenPrimary" />
                      Motivo de Consulta
                    </Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedConsultaToView.motivoConsulta}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.enfermedadActual && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Activity className="h-4 w-4 text-greenPrimary" />
                      Enfermedad Actual
                    </Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedConsultaToView.enfermedadActual}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.examenFisico && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <Stethoscope className="h-4 w-4 text-greenPrimary" />
                      Examen Físico
                    </Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedConsultaToView.examenFisico}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.diagnosticosPresuntivos && (
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                      <FileCheck className="h-4 w-4 text-greenPrimary" />
                      Diagnósticos Presuntivos
                    </Label>
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                        {selectedConsultaToView.diagnosticosPresuntivos}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.mediciones.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Mediciones y Parámetros Vitales
                    </Label>
                    <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedConsultaToView.mediciones.map(
                          (medicion, index) => (
                            <div
                              key={index}
                              className="bg-white p-2 rounded border text-center relative group"
                            >
                              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                {medicion.dataType.name}
                              </p>
                              <p className="text-lg font-bold text-gray-800 mt-1">
                                {medicion.value}
                              </p>
                              {medicion.observaciones && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {medicion.observaciones}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div className="flex justify-end pt-4 border-t -mx-6 px-6">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                    className="min-w-[100px]"
                  >
                    Cerrar
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">Cerrar ventana de detalle</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </DialogContent>
        </Dialog>
        </TooltipProvider>
    </div>
  );
}
