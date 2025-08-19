import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, Calendar, Plus, Activity, ChevronDown, ChevronRight } from "lucide-react";
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
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const handleConsultaClick = (consulta: typeof selectedConsultaToView) => {
    setSelectedConsultaToView(consulta);
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

  // Función para agrupar evoluciones por fecha de consulta
  const groupEvolucionesByConsulta = (evoluciones: EvolucionType[]) => {
    
    const grouped: { [key: string]: {
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
    }} = {};
    
    // Procesar cada evolución
    evoluciones.forEach(evolucion => {
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
          diagnosticosPresuntivos: null,
          evolucionPrincipal: evolucion,
          mediciones: [],
          evoluciones: []
        };
      }
      
      // Procesar cada item de data dentro de la evolución
      evolucion.data.forEach(dataItem => {
        if (!dataItem.dataType) return;
        
        const dataTypeName = dataItem.dataType.name.toLowerCase();
        
        if (dataItem.dataType.category === 'MEDICION') {
          // Agregar a mediciones
          grouped[key].mediciones.push(dataItem);
        } else {
          // Clasificar evoluciones no-medición
          if (dataTypeName === 'fecha de consulta') {
            // Ya procesado arriba
          } else if (dataTypeName.includes('especialidad')) {
            grouped[key].especialidad = dataItem.value;
          } else if (dataTypeName.includes('motivo de consulta')) {
            grouped[key].motivoConsulta = dataItem.value;
          } else if (dataTypeName.includes('enfermedad actual')) {
            grouped[key].enfermedadActual = dataItem.value;
          } else if (dataTypeName.includes('diagnóstico presuntivo') || dataTypeName.includes('diagnostico presuntivo')) {
            grouped[key].diagnosticosPresuntivos = dataItem.value;
          }
        }
      });
      
      // Agregar la evolución completa al grupo
      grouped[key].evoluciones.push(evolucion);
    });
    
    const result = Object.values(grouped).filter(consulta => {
      // Filtrar consultas que tengan contenido real (no solo fecha)
      const hasContent = consulta.motivoConsulta || 
                        consulta.enfermedadActual || 
                        consulta.diagnosticosPresuntivos || 
                        consulta.especialidad || 
                        consulta.mediciones.length > 0;
      
      return hasContent;
    });
    
    return result;
  };

  const consultasAgrupadas = evoluciones ? groupEvolucionesByConsulta(evoluciones.evoluciones) : [];

  // Función para agrupar las consultas por mes/año
  const groupConsultasByMonthYear = (consultas: typeof consultasAgrupadas) => {
    const grouped: { [key: string]: typeof consultasAgrupadas } = {};
    
    consultas.forEach(consulta => {
      const [year, month] = consulta.fechaConsulta.split('-');
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthName = monthNames[parseInt(month) - 1];
      const groupKey = `${monthName} ${year}`;
      
      if (!grouped[groupKey]) {
        grouped[groupKey] = [];
      }
      grouped[groupKey].push(consulta);
    });

    // Ordenar por fecha (más reciente primero)
    const sortedGroups = Object.keys(grouped).sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      const monthNames = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      const monthIndexA = monthNames.indexOf(monthA);
      const monthIndexB = monthNames.indexOf(monthB);
      
      if (yearA !== yearB) {
        return parseInt(yearB) - parseInt(yearA);
      }
      return monthIndexB - monthIndexA;
    });

    return sortedGroups.map(key => ({
      groupKey: key,
      consultas: grouped[key].sort((a, b) => 
        new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime()
      )
    }));
  };

  const consultasGroupedByMonth = groupConsultasByMonthYear(consultasAgrupadas);

  // Función para toggle de expansión de grupos
  const toggleGroupExpansion = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey);
    } else {
      newExpanded.add(groupKey);
    }
    setExpandedGroups(newExpanded);
  };

  // Expandir automáticamente el primer grupo si no hay ninguno expandido
  React.useEffect(() => {
    if (consultasGroupedByMonth.length > 0 && expandedGroups.size === 0) {
      setExpandedGroups(new Set([consultasGroupedByMonth[0].groupKey]));
    }
  }, [consultasGroupedByMonth.length]);

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
              consultasGroupedByMonth.map((group) => (
                <div key={group.groupKey} className="space-y-2">
                  {/* Header del grupo con contador */}
                  <div
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleGroupExpansion(group.groupKey)}
                  >
                    <div className="flex items-center gap-2">
                      {expandedGroups.has(group.groupKey) ? (
                        <ChevronDown className="h-4 w-4 text-gray-600" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-600" />
                      )}
                      <span className="font-medium text-gray-800 text-sm">
                        {group.groupKey}
                      </span>
                      <Badge variant="outline" className="text-xs bg-teal-50 text-teal-700 border-teal-200">
                        {group.consultas.length} {group.consultas.length === 1 ? 'consulta' : 'consultas'}
                      </Badge>
                    </div>
                  </div>

                  {/* Contenido del grupo */}
                  {expandedGroups.has(group.groupKey) && (
                    <div className="space-y-3 ml-2">
                      {group.consultas.map((consulta, index) => {
                        // Formatear fecha sin problemas de zona horaria
                        const [year, month, day] = consulta.fechaConsulta.split('-');
                        const formattedDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day)).toLocaleDateString('es-AR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        });
                        
                        return (
                          <div
                            key={`${group.groupKey}-consulta-${index}`}
                            className="border-l-4 border-teal-500 pl-4 py-3 bg-white rounded-r-lg shadow-sm border cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleConsultaClick(consulta)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className="text-xs font-medium bg-teal-50 text-teal-700 border-teal-200"
                                >
                                  {consulta.doctor.firstName} {consulta.doctor.lastName}
                                </Badge>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Calendar className="h-3 w-3" />
                                  <span>{formattedDate}</span>
                                </div>
                                {consulta.especialidad && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {consulta.especialidad}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              {consulta.motivoConsulta && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Motivo de Consulta:
                                  </span>
                                  <p className="text-sm text-gray-800 mt-1">
                                    {truncateText(consulta.motivoConsulta, 80)}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.enfermedadActual && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Enfermedad Actual:
                                  </span>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {truncateText(consulta.enfermedadActual, 100)}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.diagnosticosPresuntivos && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Diagnósticos Presuntivos:
                                  </span>
                                  <p className="text-sm text-gray-700 mt-1">
                                    {truncateText(consulta.diagnosticosPresuntivos, 100)}
                                  </p>
                                </div>
                              )}
                              
                              {consulta.mediciones.length > 0 && (
                                <div>
                                  <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                                    Mediciones ({consulta.mediciones.length}):
                                  </span>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {consulta.mediciones.slice(0, 3).map((medicion, medicionIndex) => (
                                      <Badge
                                        key={medicionIndex}
                                        variant="outline"
                                        className="text-xs bg-purple-50 text-purple-700 border-purple-200"
                                      >
                                        {medicion.dataType.name}: {medicion.value}
                                      </Badge>
                                    ))}
                                    {consulta.mediciones.length > 3 && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-50 text-gray-600 border-gray-200"
                                      >
                                        +{consulta.mediciones.length - 3} más
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
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
