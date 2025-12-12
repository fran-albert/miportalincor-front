import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Users,
  UserCheck,
  MoreHorizontal,
  RefreshCcw,
  Clock,
  FileText,
  CheckCircle,
  Play,
  ChevronDown,
  ChevronUp,
  Armchair,
  Stethoscope,
} from 'lucide-react';
import { useState } from 'react';
import {
  useDoctorDayAgenda,
  doctorAgendaKeys,
  type AgendaItem,
  isWaiting,
  isAttending,
  isCompleted,
  isCancelled,
} from '@/hooks/Doctor/useDoctorDayAgenda';
import { useAppointmentMutations } from '@/hooks/Appointments/useAppointmentMutations';
import { useOverturnMutations } from '@/hooks/Overturns/useOverturnMutations';
import {
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusColors,
} from '@/types/Appointment/Appointment';
import {
  OverturnStatus,
  OverturnStatusLabels,
  OverturnStatusColors,
} from '@/types/Overturn/Overturn';
import { useQueryClient } from '@tanstack/react-query';
import { slugify } from '@/common/helpers/helpers';

// ============================================
// HELPERS
// ============================================

const getStatusLabel = (item: AgendaItem): string => {
  if (item.type === 'appointment') {
    return AppointmentStatusLabels[item.status as AppointmentStatus] ?? item.status;
  }
  return OverturnStatusLabels[item.status as OverturnStatus] ?? item.status;
};

const getStatusColor = (item: AgendaItem): string => {
  if (item.type === 'appointment') {
    return AppointmentStatusColors[item.status as AppointmentStatus] ?? 'bg-gray-100 text-gray-800';
  }
  return OverturnStatusColors[item.status as OverturnStatus] ?? 'bg-gray-100 text-gray-800';
};

const getTypeLabel = (type: AgendaItem['type']): string => {
  return type === 'appointment' ? 'Turno' : 'Sobreturno';
};

const getTypeColor = (type: AgendaItem['type']): string => {
  return type === 'appointment'
    ? 'bg-blue-100 text-blue-800 border-blue-300'
    : 'bg-purple-100 text-purple-800 border-purple-300';
};

// ============================================
// COMPONENT
// ============================================

const DoctorWaitingRoomPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Agenda del día (appointments + overturns)
  const {
    agenda,
    stats,
    isLoading,
    isFetching,
  } = useDoctorDayAgenda({ refetchInterval: 15000 }); // Más frecuente para ver cambios de secretaria

  // Filtrar por estados específicos
  const waitingItems = agenda.filter((i) => isWaiting(i.status));
  const attendingItems = agenda.filter((i) => isAttending(i.status));
  const historyItems = agenda.filter((i) => isCompleted(i.status) || isCancelled(i.status));

  // Mutations
  const appointmentMutations = useAppointmentMutations();
  const overturnMutations = useOverturnMutations();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: doctorAgendaKeys.all });
  };

  const handleOpenHistoriaClinica = (item: AgendaItem) => {
    if (!item.patient) return;
    const slug = slugify(`${item.patient.firstName} ${item.patient.lastName}`, item.patient.userId);
    navigate(`/pacientes/${slug}/historia-clinica`);
  };

  const handleChangeStatus = (item: AgendaItem, newStatus: AppointmentStatus | OverturnStatus) => {
    if (item.type === 'appointment') {
      appointmentMutations.changeStatus.mutate({
        id: item.id,
        status: newStatus as AppointmentStatus,
      });
    } else {
      overturnMutations.changeStatus.mutate({
        id: item.id,
        status: newStatus as OverturnStatus,
      });
    }
  };

  const renderPatientName = (item: AgendaItem) => {
    if (!item.patient) {
      return <span className="text-muted-foreground italic">Sin paciente</span>;
    }
    return `${item.patient.lastName}, ${item.patient.firstName}`;
  };

  // Tabla para pacientes en espera (vista principal)
  const renderWaitingTable = () => {
    if (isLoading) {
      return (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      );
    }

    if (waitingItems.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Armchair className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay pacientes esperando</p>
          <p className="text-sm">Cuando la secretaria marque un paciente "En Espera", aparecerá aquí</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {waitingItems.map((item) => {
          const isChangingStatus =
            (item.type === 'appointment' && appointmentMutations.isChangingStatus) ||
            (item.type === 'overturn' && overturnMutations.isChangingStatus);

          return (
            <div
              key={`${item.type}-${item.id}`}
              className="flex items-center justify-between p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-orange-600 font-mono w-16">
                  {item.hour}
                </div>
                <div>
                  <p className="font-semibold text-lg">{renderPatientName(item)}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className={getTypeColor(item.type)}>
                      {getTypeLabel(item.type)}
                    </Badge>
                    <Badge className={getStatusColor(item)}>
                      {getStatusLabel(item)}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => handleChangeStatus(
                    item,
                    item.type === 'appointment' ? AppointmentStatus.ATTENDING : OverturnStatus.ATTENDING
                  )}
                  disabled={isChangingStatus}
                >
                  <Play className="h-5 w-5 mr-2" />
                  Atender
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {item.patient && (
                      <DropdownMenuItem onClick={() => handleOpenHistoriaClinica(item)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Historia Clínica
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Card para paciente en atención
  const renderAttendingCard = () => {
    if (attendingItems.length === 0) return null;

    return (
      <Card className="border-green-300 bg-green-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-green-700">
            <Stethoscope className="h-5 w-5" />
            Atendiendo Ahora
          </CardTitle>
        </CardHeader>
        <CardContent>
          {attendingItems.map((item) => {
            const isChangingStatus =
              (item.type === 'appointment' && appointmentMutations.isChangingStatus) ||
              (item.type === 'overturn' && overturnMutations.isChangingStatus);

            return (
              <div
                key={`${item.type}-${item.id}`}
                className="flex items-center justify-between p-4 bg-green-100 border border-green-300 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="text-xl font-bold text-green-700 font-mono">
                    {item.hour}
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{renderPatientName(item)}</p>
                    <Badge variant="outline" className={getTypeColor(item.type)}>
                      {getTypeLabel(item.type)}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-200"
                    onClick={() => handleChangeStatus(
                      item,
                      item.type === 'appointment' ? AppointmentStatus.COMPLETED : OverturnStatus.COMPLETED
                    )}
                    disabled={isChangingStatus}
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Completar
                  </Button>
                  {item.patient && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleOpenHistoriaClinica(item)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

  // Historial colapsable
  const renderHistory = () => {
    return (
      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Historial del Día ({historyItems.length})
                </div>
                {isHistoryOpen ? (
                  <ChevronUp className="h-5 w-5" />
                ) : (
                  <ChevronDown className="h-5 w-5" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent>
              {historyItems.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  No hay turnos completados o cancelados
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Hora</TableHead>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historyItems.map((item) => (
                      <TableRow key={`${item.type}-${item.id}`} className="opacity-70">
                        <TableCell className="font-mono">{item.hour}</TableCell>
                        <TableCell>{renderPatientName(item)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getTypeColor(item.type)}>
                            {getTypeLabel(item.type)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(item)}>
                            {getStatusLabel(item)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.patient && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenHistoriaClinica(item)}
                            >
                              <FileText className="h-4 w-4 mr-1" />
                              HC
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Mi Sala de Espera</title>
      </Helmet>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Mi Sala de Espera</h1>
          <p className="text-muted-foreground">
            Pacientes listos para ser atendidos
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isFetching}>
          <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Stats Cards - Simplificados */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En Espera</p>
                <p className="text-3xl font-bold text-orange-600">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : waitingItems.length}
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atendiendo</p>
                <p className="text-3xl font-bold text-green-600">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : attendingItems.length}
                </p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completados</p>
                <p className="text-3xl font-bold text-gray-600">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.completed}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total del Día</p>
                <p className="text-3xl font-bold text-blue-600">
                  {isLoading ? <Skeleton className="h-9 w-12" /> : stats.total}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paciente en Atención (si hay) */}
      {renderAttendingCard()}

      {/* Pacientes en Espera - Vista Principal */}
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <Armchair className="h-5 w-5" />
            Pacientes en Espera ({waitingItems.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderWaitingTable()}
        </CardContent>
      </Card>

      {/* Historial Colapsable */}
      {renderHistory()}
    </div>
  );
};

export default DoctorWaitingRoomPage;
