import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Plus, Activity } from "lucide-react";
import { useState } from "react";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import CreateEvolucionDialog from "@/components/Evoluciones/Create";
import { useNavigate } from "react-router-dom";
import { EvolucionesResponse, Evolucion as EvolucionType, EvolucionData } from "@/types/Antecedentes/Antecedentes";
import useUserRole from "@/hooks/useRoles";


type UserData = Patient | Doctor;

interface Props {
  userData: UserData;
  userType?: 'patient' | 'doctor';
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
  userType = 'patient',
  evoluciones, 
  isLoadingEvoluciones = false,
  readOnly = false, 
  showEditActions = true, 
  allowNewEvolutions = true,
  patientId,
  patient // Para compatibilidad hacia atrás
}) => {
  // Usar userData si está disponible, si no usar patient para compatibilidad
  const currentUser = userData || patient;
  if (!currentUser) return null;

  // Obtener ID del usuario de la sesión usando useUserRole
  const { session } = useUserRole();
  const idDoctor = session?.id ? parseInt(session.id, 10) : undefined;
  
  // Usar patientId prop o fallback a currentUser.id
  const idUser = patientId || currentUser.id;
  const [isAddEvolucionModalOpen, setIsAddEvolucionModalOpen] = useState(false);
  const [selectedConsultaToView, setSelectedConsultaToView] = useState<{
    fechaConsulta: string;
    fechaCreacion: string;
    doctor: EvolucionType['doctor'];
    especialidad: string | null;
    motivoConsulta: string | null;
    enfermedadActual: string | null;
    diagnosticosPresuntivos: string | null;
    evolucionPrincipal: EvolucionType | null;
    mediciones: EvolucionData[];
    evoluciones: EvolucionType[];
  } | null>(null);
  const [isViewEvolucionModalOpen, setIsViewEvolucionModalOpen] =
    useState(false);
  const navigate = useNavigate();
  const handleConsultaClick = (evolucion: typeof evolucionesLista[0]) => {
    const consultaData = {
      fechaConsulta: evolucion.fechaConsulta,
      fechaCreacion: evolucion.fechaCreacion,
      doctor: evolucion.doctor,
      especialidad: evolucion.especialidad,
      motivoConsulta: evolucion.motivoConsulta,
      enfermedadActual: evolucion.enfermedadActual,
      diagnosticosPresuntivos: evolucion.diagnosticosPresuntivos,
      evolucionPrincipal: evolucion.evolucionCompleta,
      mediciones: evolucion.mediciones,
      evoluciones: [evolucion.evolucionCompleta]
    };
    setSelectedConsultaToView(consultaData);
    setIsViewEvolucionModalOpen(true);
  };

  // Función para obtener la fecha de consulta de una evolución
  const getFechaConsulta = (evolucion: EvolucionType) => {
    // Buscar el campo de fecha de consulta en el array data
    const fechaData = evolucion.data.find(d => 
      d.dataType && d.dataType.name.toLowerCase() === 'fecha de consulta'
    );
    
    return fechaData ? fechaData.value : new Date(evolucion.createdAt).toISOString().split('T')[0];
  };

  // Función para procesar evoluciones en una lista simple
  const processEvolucionesForList = (evoluciones: EvolucionType[]) => {
    const processed = evoluciones.map(evolucion => {
      const fechaConsulta = getFechaConsulta(evolucion);

      // Extraer datos específicos
      let especialidad: string | null = null;
      let motivoConsulta: string | null = null;
      let enfermedadActual: string | null = null;
      let diagnosticosPresuntivos: string | null = null;
      const mediciones: EvolucionData[] = [];

      evolucion.data.forEach(dataItem => {
        if (!dataItem.dataType) return;

        const dataTypeName = dataItem.dataType.name.toLowerCase();

        if (dataItem.dataType.category === 'MEDICION') {
          mediciones.push(dataItem);
        } else {
          if (dataTypeName.includes('especialidad')) {
            especialidad = dataItem.value;
          } else if (dataTypeName.includes('motivo de consulta')) {
            motivoConsulta = dataItem.value;
          } else if (dataTypeName.includes('enfermedad actual')) {
            enfermedadActual = dataItem.value;
          } else if (dataTypeName.includes('diagnóstico presuntivo') || dataTypeName.includes('diagnostico presuntivo')) {
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
        diagnosticosPresuntivos,
        mediciones,
        evolucionCompleta: evolucion
      };
    });

    // Filtrar solo evoluciones con contenido y ordenar por fecha más reciente
    return processed
      .filter(consulta =>
        consulta.motivoConsulta ||
        consulta.enfermedadActual ||
        consulta.diagnosticosPresuntivos ||
        consulta.especialidad ||
        consulta.mediciones.length > 0
      )
      .sort((a, b) => new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime());
  };

  const evolucionesLista = evoluciones ? processEvolucionesForList(evoluciones.evoluciones) : [];

  const handleNavigateToEvoluciones = () => {
    const basePath = userType === 'doctor' ? 'medicos' : 'pacientes';
    navigate(`/${basePath}/${currentUser.slug}/historia-clinica/evoluciones`);
  };

  const truncateText = (text: string, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <>
      <Card className="lg:col-span-2">
        <CardHeader className="pb-4 bg-gradient-to-r from-teal-50 to-emerald-50 border-b border-teal-100">
          <div className="flex items-center justify-between">
            <CardTitle
              onClick={handleNavigateToEvoluciones}
              className="text-xl font-bold text-gray-800 flex items-center gap-2 cursor-pointer hover:text-teal-600 transition-colors"
            >
              <Activity className="h-5 w-5 text-teal-600" />
              EVOLUCIONES
            </CardTitle>
            {showEditActions && !readOnly && allowNewEvolutions && (
              <Button
                size="sm"
                className="bg-teal-600 hover:bg-teal-700 text-white w-8 h-8 rounded-full p-0 shadow-sm"
                onClick={() => setIsAddEvolucionModalOpen(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            )}
            {readOnly && (
              <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">
                Solo lectura
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {isLoadingEvoluciones ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-3"></div>
                <p className="text-gray-500 text-sm">
                  Cargando evoluciones...
                </p>
              </div>
            ) : !evoluciones || evoluciones.evoluciones.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">
                  No hay evoluciones registradas
                </p>
                <p className="text-gray-400 text-xs mt-1">
                  Haz clic en "+" para agregar la primera evolución
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {evolucionesLista.map((evolucion) => {
                  // Formatear fecha simple
                  const [year, month, day] = evolucion.fechaConsulta.split('-');
                  const formattedDate = `${day}/${month}/${year}`;

                  return (
                    <div
                      key={evolucion.id}
                      className="border border-gray-200 rounded p-3 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleConsultaClick(evolucion)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formattedDate}
                          </span>
                          <span className="text-sm text-gray-600">
                            Dr. {evolucion.doctor.firstName} {evolucion.doctor.lastName}
                          </span>
                        </div>
                      </div>

                      {evolucion.motivoConsulta && (
                        <p className="text-sm text-gray-700 mt-2">
                          {truncateText(evolucion.motivoConsulta, 80)}
                        </p>
                      )}
                    </div>
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
                        const [year, month, day] = selectedConsultaToView.fechaConsulta.split('-');
                        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
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
                      {selectedConsultaToView.doctor.firstName} {selectedConsultaToView.doctor.lastName}
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
                      {selectedConsultaToView.mediciones.map((medicion, index) => (
                        <div
                          key={index}
                          className="bg-white p-2 rounded border text-center"
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
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end pt-4 border-t">
            <Button onClick={() => setIsViewEvolucionModalOpen(false)}>
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EvolutionSection;
