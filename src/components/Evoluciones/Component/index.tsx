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
} from "lucide-react";
import { useState } from "react";
import CreateEvolucionDialog from "../Create";
import { EvolucionesResponse } from "@/types/Antecedentes/Antecedentes";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import useUserRole from "@/hooks/useRoles";
import DeleteConsultaDialog from "../Delete/DeleteConsultaDialog";

type UserData = Patient | Doctor;

interface Props {
  onBack: () => void;
  evoluciones: EvolucionesResponse | undefined;
  userData: UserData | undefined;
  userType: "patient" | "doctor";
  patientId?: number;
}

export default function EvolucionesComponent({
  onBack,
  evoluciones,
  userData,
  patientId,
}: Props) {
  const { session } = useUserRole();
  const idDoctor = session?.id ? parseInt(session.id, 10) : undefined;
  const idUser = patientId || userData?.id;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("Todas");
  const [selectedConsultaToView, setSelectedConsultaToView] = useState<{
    fechaConsulta: string;
    fechaCreacion: string;
    doctor: any;
    especialidad: string | null;
    motivoConsulta: string | null;
    enfermedadActual: string | null;
    diagnosticosPresuntivos: string | null;
    evolucionPrincipal: any;
    mediciones: any[];
    evoluciones: any[];
  } | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

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

  // Función para obtener la fecha de consulta de una evolución
  const getFechaConsulta = (
    evoluciones: any[],
    doctorId: number,
    createdAt: string
  ) => {
    const baseTime = new Date(createdAt).getTime();
    const timeWindow = 60000; // 1 minuto en milisegundos

    const fechaEvolucion = evoluciones.find((e: any) => {
      if (e.doctor.userId !== doctorId) return false;
      if (e.dataType.name.toLowerCase() !== "fecha de consulta") return false;

      const evolucionTime = new Date(e.createdAt).getTime();
      const timeDiff = Math.abs(evolucionTime - baseTime);

      return timeDiff <= timeWindow;
    });

    return fechaEvolucion
      ? fechaEvolucion.value
      : new Date(createdAt).toISOString().split("T")[0];
  };

  // Función para agrupar evoluciones por fecha de consulta
  const groupEvolucionesByConsulta = (evoluciones: any[]) => {
    const grouped: {
      [key: string]: {
        fechaConsulta: string;
        fechaCreacion: string;
        doctor: any;
        especialidad: string | null;
        motivoConsulta: string | null;
        enfermedadActual: string | null;
        diagnosticosPresuntivos: string | null;
        evolucionPrincipal: any;
        mediciones: any[];
        evoluciones: any[];
      };
    } = {};

    // Primero, crear todas las agrupaciones únicas basadas en fecha de consulta
    evoluciones.forEach((evolucion: any) => {
      const fechaConsulta = getFechaConsulta(
        evoluciones,
        evolucion.doctor.userId,
        evolucion.createdAt
      );
      const key = fechaConsulta;

      if (!grouped[key]) {
        grouped[key] = {
          fechaConsulta: fechaConsulta,
          fechaCreacion: evolucion.createdAt,
          doctor: evolucion.doctor,
          especialidad: null,
          motivoConsulta: null,
          enfermedadActual: null,
          diagnosticosPresuntivos: null,
          evolucionPrincipal: null,
          mediciones: [],
          evoluciones: [],
        };
      }
    });

    // Luego, clasificar cada evolución
    evoluciones.forEach((evolucion: any) => {
      const fechaConsulta = getFechaConsulta(
        evoluciones,
        evolucion.doctor.userId,
        evolucion.createdAt
      );
      const key = fechaConsulta;

      if (evolucion.dataType.category === "MEDICION") {
        grouped[key].mediciones.push(evolucion);
      } else {
        const dataTypeName = evolucion.dataType.name.toLowerCase();

        if (dataTypeName.includes("especialidad")) {
          grouped[key].especialidad = evolucion.value;
        } else if (dataTypeName.includes("motivo")) {
          grouped[key].motivoConsulta = evolucion.value;
        } else if (dataTypeName.includes("enfermedad actual")) {
          grouped[key].enfermedadActual = evolucion.value;
        } else if (
          dataTypeName.includes("diagnóstico presuntivo") ||
          dataTypeName.includes("diagnostico presuntivo")
        ) {
          grouped[key].diagnosticosPresuntivos = evolucion.value;
        }

        if (
          !grouped[key].evolucionPrincipal &&
          dataTypeName !== "fecha de consulta"
        ) {
          grouped[key].evolucionPrincipal = evolucion;
        }
      }

      grouped[key].evoluciones.push(evolucion);
    });

    return Object.values(grouped).filter((consulta) => {
      const hasContent =
        consulta.motivoConsulta ||
        consulta.enfermedadActual ||
        consulta.diagnosticosPresuntivos ||
        consulta.especialidad ||
        consulta.mediciones.length > 0;
      return hasContent;
    });
  };

  const consultasAgrupadas = evoluciones
    ? groupEvolucionesByConsulta(evoluciones.evoluciones)
    : [];

  const filteredConsultas = consultasAgrupadas.filter((consulta: any) => {
    const matchesSearch =
      consulta.motivoConsulta
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consulta.enfermedadActual
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      consulta.diagnosticosPresuntivos
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      `${consulta.doctor.firstName} ${consulta.doctor.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesEspecialidad =
      selectedEspecialidad === "Todas" ||
      consulta.especialidad === selectedEspecialidad;

    return matchesSearch && matchesEspecialidad;
  });

  const getEspecialidadColor = (especialidad: string) => {
    const colors: { [key: string]: string } = {
      "Medicina General": "bg-blue-100 text-blue-800 border-blue-200",
      Cardiología: "bg-red-100 text-red-800 border-red-200",
      Endocrinología: "bg-green-100 text-green-800 border-green-200",
      Neurología: "bg-purple-100 text-purple-800 border-purple-200",
      Gastroenterología: "bg-orange-100 text-orange-800 border-orange-200",
      Neumología: "bg-cyan-100 text-cyan-800 border-cyan-200",
      Dermatología: "bg-pink-100 text-pink-800 border-pink-200",
      Traumatología: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[especialidad] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  const truncateText = (text: string, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
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
                  <Activity className="h-6 w-6 text-teal-600" />
                  Evoluciones Médicas Completas
                </CardTitle>
              </div>
              <Button
                className="bg-teal-600 hover:bg-teal-700 text-white"
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

        {/* Lista de Evoluciones */}
        <div className="grid gap-4">
          {filteredConsultas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron evoluciones</p>
                <p className="text-gray-400 text-sm mt-1">
                  {searchTerm || selectedEspecialidad !== "Todas"
                    ? "Intenta cambiar los filtros de búsqueda"
                    : "Haz clic en 'Agregar Evolución' para comenzar"}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredConsultas.map((consulta: any, index: number) => {
              const [year, month, day] = consulta.fechaConsulta.split("-");
              const formattedDate = new Date(
                parseInt(year),
                parseInt(month) - 1,
                parseInt(day)
              ).toLocaleDateString("es-AR", {
                year: "numeric",
                month: "short",
                day: "numeric",
              });

              return (
                <Card
                  key={`consulta-${index}`}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleConsultaClick(consulta)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          {consulta.especialidad && (
                            <Badge
                              className={`${getEspecialidadColor(
                                consulta.especialidad
                              )} border`}
                            >
                              {consulta.especialidad}
                            </Badge>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>
                                {consulta.doctor.firstName}{" "}
                                {consulta.doctor.lastName}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {consulta.motivoConsulta && (
                            <div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Motivo de Consulta:
                              </span>
                              <p className="text-sm text-gray-800 mt-1 leading-relaxed">
                                {truncateText(consulta.motivoConsulta, 100)}
                              </p>
                            </div>
                          )}

                          {consulta.enfermedadActual && (
                            <div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Enfermedad Actual:
                              </span>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                {truncateText(consulta.enfermedadActual, 150)}
                              </p>
                            </div>
                          )}

                          {consulta.diagnosticosPresuntivos && (
                            <div>
                              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                Diagnósticos Presuntivos:
                              </span>
                              <p className="text-sm text-gray-700 mt-1 leading-relaxed">
                                {truncateText(
                                  consulta.diagnosticosPresuntivos,
                                  120
                                )}
                              </p>
                            </div>
                          )}

                          {consulta.mediciones &&
                            consulta.mediciones.length > 0 && (
                              <div>
                                <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                  Mediciones ({consulta.mediciones.length}):
                                </span>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {consulta.mediciones
                                    .slice(0, 4)
                                    .map(
                                      (
                                        medicion: any,
                                        medicionIndex: number
                                      ) => (
                                        <Badge
                                          key={medicionIndex}
                                          variant="outline"
                                          className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                        >
                                          {medicion.dataType.name}:{" "}
                                          {medicion.value}
                                        </Badge>
                                      )
                                    )}
                                  {consulta.mediciones.length > 4 && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-gray-50 text-gray-600"
                                    >
                                      +{consulta.mediciones.length - 4} más
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="ml-4 flex items-center">
                        {consulta.evoluciones.length > 0 && (
                          <DeleteConsultaDialog
                            evoluciones={consulta.evoluciones}
                            consultaDescription={truncateText(
                              consulta.motivoConsulta ||
                                consulta.enfermedadActual ||
                                consulta.diagnosticosPresuntivos ||
                                `Consulta del ${formattedDate}`,
                              80
                            )}
                          />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Modal para Agregar Evolución */}
        {typeof idUser === "number" && typeof idDoctor === "number" && (
          <CreateEvolucionDialog
            idUser={idUser}
            idDoctor={idDoctor}
            isOpen={isAddEvolucionModalOpen}
            onClose={() => setIsAddEvolucionModalOpen(false)}
          />
        )}
        {/* Modal para Ver Evolución Completa */}
        <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4">
              <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-600" />
                Detalle de la Evolución
              </DialogTitle>
            </DialogHeader>
            {selectedConsultaToView && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Fecha de Consulta
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {(() => {
                          const [year, month, day] =
                            selectedConsultaToView.fechaConsulta.split("-");
                          return new Date(
                            parseInt(year),
                            parseInt(month) - 1,
                            parseInt(day)
                          ).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          });
                        })()}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Doctor
                    </Label>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded border">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">
                        {selectedConsultaToView.doctor.firstName}{" "}
                        {selectedConsultaToView.doctor.lastName}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedConsultaToView.especialidad && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Especialidad
                    </Label>
                    <div className="p-2 bg-gray-50 rounded border">
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
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Motivo de Consulta
                    </Label>
                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {selectedConsultaToView.motivoConsulta}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.enfermedadActual && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Enfermedad Actual
                    </Label>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                        {selectedConsultaToView.enfermedadActual}
                      </p>
                    </div>
                  </div>
                )}

                {selectedConsultaToView.diagnosticosPresuntivos && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-gray-700">
                      Diagnósticos Presuntivos
                    </Label>
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
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
                          (medicion: any, index: number) => (
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
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={() => setIsViewModalOpen(false)}>Cerrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
