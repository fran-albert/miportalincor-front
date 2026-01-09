import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  User,
  Calendar,
  Plus,
  Clock,
  FileText,
  AlertTriangle,
  Clipboard,
  CheckCircle,
  Stethoscope,
  Activity,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import CreateEvolucionDialog from "@/components/Evoluciones/Create";
import { useNavigate } from "react-router-dom";
import {
  EvolucionesResponse,
  Evolucion as EvolucionType,
  EvolucionData,
} from "@/types/Antecedentes/Antecedentes";
import useUserRole from "@/hooks/useRoles";
import { formatDoctorName } from "@/common/helpers/helpers";

type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType?: "patient" | "doctor";
  evoluciones: EvolucionesResponse | undefined;
  isLoadingEvoluciones?: boolean;
  readOnly?: boolean;
  showEditActions?: boolean;
  allowNewEvolutions?: boolean;
  patientId?: number; // ID del paciente desde el slug de la página
  // Mantener compatibilidad con el prop anterior
  patient?: Patient;
}

const EvolutionSection: React.FC<Props> = ({
  userData,
  userType = "patient",
  evoluciones,
  isLoadingEvoluciones = false,
  readOnly = false,
  showEditActions = true,
  allowNewEvolutions = true,
  patientId,
  patient, // Para compatibilidad hacia atrás
}) => {
  // ⚠️ TODOS LOS HOOKS DEBEN ESTAR ANTES DE CUALQUIER RETURN
  // Obtener ID del usuario de la sesión usando useUserRole
  const { session } = useUserRole();
  const [isAddEvolucionModalOpen, setIsAddEvolucionModalOpen] = useState(false);
  const [selectedConsultaToView, setSelectedConsultaToView] = useState<{
    fechaConsulta: string;
    fechaCreacion: string;
    doctor: EvolucionType["doctor"];
    especialidad: string | null;
    motivoConsulta: string | null;
    enfermedadActual: string | null;
    examenFisico: string | null;
    diagnosticosPresuntivos: string | null;
    evolucionPrincipal: EvolucionType | null;
    mediciones: EvolucionData[];
    evoluciones: EvolucionType[];
  } | null>(null);
  const [isViewEvolucionModalOpen, setIsViewEvolucionModalOpen] =
    useState(false);
  const navigate = useNavigate();

  // Usar userData si está disponible, si no usar patient para compatibilidad
  const currentUser = userData || patient;
  if (!currentUser) return null;

  const idDoctor = session?.id ? parseInt(session.id, 10) : undefined;

  // Usar patientId prop o fallback a currentUser.userId (numérico de Healthcare.Api)
  const idUser = patientId || (currentUser.userId ? Number(currentUser.userId) : 0);
  const handleConsultaClick = (evolucion: (typeof evolucionesLista)[0]) => {
    const consultaData = {
      fechaConsulta: evolucion.fechaConsulta,
      fechaCreacion: evolucion.fechaCreacion,
      doctor: evolucion.doctor,
      especialidad: evolucion.especialidad,
      motivoConsulta: evolucion.motivoConsulta,
      enfermedadActual: evolucion.enfermedadActual,
      examenFisico: evolucion.examenFisico,
      diagnosticosPresuntivos: evolucion.diagnosticosPresuntivos,
      evolucionPrincipal: evolucion.evolucionCompleta,
      mediciones: evolucion.mediciones,
      evoluciones: [evolucion.evolucionCompleta],
    };
    setSelectedConsultaToView(consultaData);
    setIsViewEvolucionModalOpen(true);
  };

  // Función para obtener la fecha de consulta de una evolución
  const getFechaConsulta = (evolucion: EvolucionType) => {
    // Buscar el campo de fecha de consulta en el array data
    const fechaData = evolucion.data.find(
      (d) => d.dataType && d.dataType.name.toLowerCase() === "fecha de consulta"
    );

    return fechaData
      ? fechaData.value
      : new Date(evolucion.createdAt).toISOString();
  };

  // Función para procesar evoluciones en una lista simple
  const processEvolucionesForList = (evoluciones: EvolucionType[]) => {
    const processed = evoluciones.map((evolucion) => {
      const fechaConsulta = getFechaConsulta(evolucion);

      // Extraer datos específicos
      let especialidad: string | null = null;
      let motivoConsulta: string | null = null;
      let enfermedadActual: string | null = null;
      let examenFisico: string | null = null;
      let diagnosticosPresuntivos: string | null = null;
      const mediciones: EvolucionData[] = [];

      evolucion.data.forEach((dataItem) => {
        if (!dataItem.dataType) return;

        const dataTypeName = dataItem.dataType.name.toLowerCase();

        if (dataItem.dataType.category === "MEDICION") {
          mediciones.push(dataItem);
        } else {
          if (dataTypeName.includes("especialidad")) {
            especialidad = dataItem.value;
          } else if (dataTypeName.includes("motivo de consulta")) {
            motivoConsulta = dataItem.value;
          } else if (dataTypeName.includes("enfermedad actual")) {
            enfermedadActual = dataItem.value;
          } else if (
            dataTypeName.includes("examen fisico") ||
            dataTypeName.includes("examen físico")
          ) {
            examenFisico = dataItem.value;
          } else if (
            dataTypeName.includes("diagnóstico presuntivo") ||
            dataTypeName.includes("diagnostico presuntivo")
          ) {
            diagnosticosPresuntivos = dataItem.value;
          }
        }
      });

      return {
        id: evolucion.id,
        fechaConsulta,
        fechaCreacion: evolucion.createdAt,
        doctor: evolucion.doctor,
        especialidad,
        motivoConsulta,
        enfermedadActual,
        examenFisico,
        diagnosticosPresuntivos,
        mediciones,
        evolucionCompleta: evolucion,
      };
    });

    // Filtrar solo evoluciones con contenido y ordenar por fecha más reciente
    return processed
      .filter(
        (consulta) =>
          consulta.motivoConsulta ||
          consulta.enfermedadActual ||
          consulta.examenFisico ||
          consulta.diagnosticosPresuntivos ||
          consulta.especialidad ||
          consulta.mediciones.length > 0
      )
      .sort(
        (a, b) =>
          new Date(b.fechaConsulta).getTime() -
          new Date(a.fechaConsulta).getTime()
      );
  };

  const evolucionesLista = evoluciones
    ? processEvolucionesForList(evoluciones.evoluciones)
    : [];

  const handleNavigateToEvoluciones = () => {
    const basePath = userType === "doctor" ? "medicos" : "pacientes";
    navigate(`/${basePath}/${currentUser.slug}/historia-clinica/evoluciones`);
  };

  return (
    <>
      <Card className="lg:col-span-2 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              <CardTitle
                className="cursor-pointer hover:opacity-80 transition-opacity underline decoration-white/40 decoration-2 underline-offset-4"
                onClick={handleNavigateToEvoluciones}
              >
                Evoluciones Médicas
              </CardTitle>
            </div>
            <div className="flex items-center gap-2">
              {evolucionesLista.length > 0 && (
                <span className="text-sm font-medium bg-white/20 px-3 py-1 rounded-full">
                  {evolucionesLista.length} registro
                  {evolucionesLista.length !== 1 ? "s" : ""}
                </span>
              )}
              {showEditActions && !readOnly && allowNewEvolutions && (
                <Button
                  size="sm"
                  className="bg-white text-greenPrimary hover:bg-white/90 w-8 h-8 rounded-full p-0 shadow-md"
                  onClick={() => setIsAddEvolucionModalOpen(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
              {readOnly && (
                <span className="text-xs bg-white/20 px-2 py-1 rounded text-white">
                  Solo lectura
                </span>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {isLoadingEvoluciones ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-greenPrimary mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">Cargando evoluciones...</p>
              </div>
            ) : !evoluciones || evoluciones.evoluciones.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Sin evoluciones registradas
                </h3>
                <p className="text-sm text-gray-500">
                  {showEditActions && !readOnly && allowNewEvolutions
                    ? 'Haz clic en el botón "+" para agregar la primera evolución'
                    : "No hay evoluciones médicas para este paciente"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {evolucionesLista.map((evolucion, index) => {
                  // Formatear fecha con hora
                  const fechaConsulta = new Date(evolucion.fechaConsulta);
                  const formattedDate = fechaConsulta.toLocaleDateString(
                    "es-AR",
                    {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  );
                  const formattedTime = fechaConsulta.toLocaleTimeString(
                    "es-AR",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                    }
                  );

                  // Obtener iniciales del doctor
                  const doctorInitials = `${
                    evolucion.doctor.firstName?.[0] || ""
                  }${evolucion.doctor.lastName?.[0] || ""}`.toUpperCase();

                  // Obtener especialidad primaria
                  const primarySpeciality =
                    evolucion.doctor.specialities?.[0]?.name;

                  return (
                    <motion.div
                      key={evolucion.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div
                        className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:shadow-md hover:border-greenPrimary/50 transition-all duration-200 bg-white border-l-4 border-l-greenPrimary"
                        onClick={() => handleConsultaClick(evolucion)}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar del Doctor */}
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                            <span className="text-sm font-bold text-white">
                              {doctorInitials}
                            </span>
                          </div>

                          {/* Información de la Evolución */}
                          <div className="flex-1 min-w-0">
                            {/* Header: Fecha y Especialidad */}
                            <div className="flex items-center justify-between gap-2 mb-1">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5 text-xs text-gray-600">
                                  <Calendar className="h-3.5 w-3.5 text-greenPrimary" />
                                  <span className="font-medium">
                                    {formattedDate}
                                  </span>
                                  <Clock className="h-3.5 w-3.5 text-gray-400 ml-0.5" />
                                  <span>{formattedTime}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="h-4 w-4 text-gray-400" />
                                <span className="text-xs font-semibold text-gray-900">
                                  {formatDoctorName(evolucion.doctor)}
                                </span>
                              </div>
                              {primarySpeciality && (
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-greenPrimary/10 text-greenPrimary border-greenPrimary/20 flex-shrink-0"
                                >
                                  <Stethoscope className="h-3 w-3 mr-1" />
                                  {primarySpeciality}
                                </Badge>
                              )}
                            </div>

                            {/* Motivo de Consulta */}
                            {evolucion.motivoConsulta && (
                              <p className="text-xs text-gray-600 leading-relaxed mt-1.5 line-clamp-2">
                                {evolucion.motivoConsulta}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Evolution Dialog - Solo si se permite edición */}
      {showEditActions && !readOnly && allowNewEvolutions && idDoctor && (
        <CreateEvolucionDialog
          idUser={idUser}
          idDoctor={idDoctor}
          isOpen={isAddEvolucionModalOpen}
          onClose={() => setIsAddEvolucionModalOpen(false)}
        />
      )}

      {/* Modal para Ver Evolución Completa */}
      <Dialog
        open={isViewEvolucionModalOpen}
        onOpenChange={setIsViewEvolucionModalOpen}
      >
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto p-0">
          {selectedConsultaToView && (
            <>
              {/* Header con Gradiente */}
              <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
                <div className="flex items-start gap-4">
                  {/* Avatar del Doctor */}
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-2 border-white/30 shadow-lg">
                    <span className="text-lg font-bold text-white">
                      {`${selectedConsultaToView.doctor.firstName?.[0] || ""}${
                        selectedConsultaToView.doctor.lastName?.[0] || ""
                      }`.toUpperCase()}
                    </span>
                  </div>

                  {/* Información del Doctor y Fecha */}
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {formatDoctorName(selectedConsultaToView.doctor)}
                    </h2>
                    <div className="flex items-center gap-4 flex-wrap">
                      {/* Fecha */}
                      <div className="flex items-center gap-2 text-white/90">
                        <Calendar className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(
                            selectedConsultaToView.fechaConsulta
                          ).toLocaleDateString("es-AR", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      {/* Hora */}
                      <div className="flex items-center gap-2 text-white/90">
                        <Clock className="h-4 w-4" />
                        <span className="text-sm">
                          {new Date(
                            selectedConsultaToView.fechaConsulta
                          ).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {/* Especialidad */}
                      {selectedConsultaToView.doctor.specialities &&
                        selectedConsultaToView.doctor.specialities.length >
                          0 && (
                          <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                            <Stethoscope className="h-3 w-3 mr-1" />
                            {selectedConsultaToView.doctor.specialities[0].name}
                          </Badge>
                        )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="p-6 space-y-4">
                {/* Motivo de Consulta */}
                {selectedConsultaToView.motivoConsulta && (
                  <div className="border-l-4 border-l-blue-500 bg-blue-50/50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Motivo de Consulta
                      </h3>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {selectedConsultaToView.motivoConsulta}
                    </p>
                  </div>
                )}

                {/* Enfermedad Actual */}
                {selectedConsultaToView.enfermedadActual && (
                  <div className="border-l-4 border-l-orange-500 bg-orange-50/50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Enfermedad Actual
                      </h3>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {selectedConsultaToView.enfermedadActual}
                    </p>
                  </div>
                )}

                {/* Examen Físico */}
                {selectedConsultaToView.examenFisico && (
                  <div className="border-l-4 border-l-teal-500 bg-teal-50/50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clipboard className="h-5 w-5 text-teal-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Examen Físico
                      </h3>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {selectedConsultaToView.examenFisico}
                    </p>
                  </div>
                )}

                {/* Diagnósticos Presuntivos */}
                {selectedConsultaToView.diagnosticosPresuntivos && (
                  <div className="border-l-4 border-l-green-500 bg-green-50/50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Diagnósticos Presuntivos
                      </h3>
                    </div>
                    <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-line">
                      {selectedConsultaToView.diagnosticosPresuntivos}
                    </p>
                  </div>
                )}

                {/* Mediciones y Parámetros Vitales */}
                {selectedConsultaToView.mediciones.length > 0 && (
                  <div className="border-l-4 border-l-purple-500 bg-purple-50/50 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-5 w-5 text-purple-600" />
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                        Mediciones y Parámetros Vitales
                      </h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedConsultaToView.mediciones.map(
                        (medicion, index) => (
                          <div
                            key={index}
                            className="bg-white p-3 rounded-lg border border-purple-200 text-center shadow-sm hover:shadow-md transition-shadow"
                          >
                            <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
                              {medicion.dataType.name}
                            </p>
                            <p className="text-2xl font-bold text-gray-900">
                              {medicion.value}
                            </p>
                            {medicion.observaciones && (
                              <p className="text-xs text-gray-600 mt-2 italic">
                                {medicion.observaciones}
                              </p>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer con Botón Cerrar */}
              <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
                <div className="flex justify-end">
                  <Button
                    onClick={() => setIsViewEvolucionModalOpen(false)}
                    className="bg-greenPrimary hover:bg-teal-600 text-white shadow-sm"
                  >
                    Cerrar
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
export default EvolutionSection;
