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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  AlertTriangle,
  CalendarOff,
  CalendarDays,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  useDoctorDayAgenda,
  doctorAgendaKeys,
  type AgendaItem,
  isAttending,
  isCompleted,
  isCancelled,
} from '@/hooks/Doctor/useDoctorDayAgenda';
import { useDoctorWaitingQueue, doctorWaitingQueueKeys } from '@/hooks/Doctor/useDoctorWaitingQueue';
import { useDoctorWorkingToday } from '@/hooks/Doctor/useDoctorWorkingToday';
import { resolveWaitingRoomRestriction } from '@/hooks/Doctor/useDoctorWorkingToday.helpers';
import {
  doctorWaitingRoomHistoryKeys,
  useDoctorWaitingRoomHistory,
} from '@/hooks/Doctor/useDoctorWaitingRoomHistory';
import { useDoctorMarkAsAttending, doctorQueueKeys } from '@/hooks/Queue/useDoctorQueue';
import { useAppointmentMutations } from '@/hooks/Appointments/useAppointmentMutations';
import { useOverturnMutations } from '@/hooks/Overturns/useOverturnMutations';
import {
  AppointmentStatus,
  AppointmentStatusLabels,
  AppointmentStatusColors,
  AppointmentFullResponseDto,
} from '@/types/Appointment/Appointment';
import {
  OverturnStatus,
  OverturnStatusLabels,
  OverturnStatusColors,
} from '@/types/Overturn/Overturn';
import { useQueryClient } from '@tanstack/react-query';
import { slugify, formatWaitingTime, getWaitingTimeColor } from '@/common/helpers/helpers';
import { PageHeader } from '@/components/PageHeader';
import { getAppointmentConsultationTypeChips } from '@/common/helpers/appointment-consultation-types';
import { getQueueEntryConsultationTypeLabels } from '@/common/helpers/queue-consultation-types';
import { ConsultationTypeChips } from '@/components/Appointments/ConsultationTypeChips';
import { IntegralCheckupTag } from '@/components/Appointments/IntegralCheckupTag';
import {
  EcoSubtypeDialog,
  type EcoSubtypeTarget,
} from '@/components/Queue/EcoSubtypeDialog';
import { useSetIntegralUltrasoundTypes } from '@/hooks/Appointments';
import type { IntegralCheckupLink } from '@/types/Appointment/Appointment';
import { getArgentinaTodayDate } from '@/common/helpers/argentinaDate';

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

/**
 * Los estudios de un item de la agenda, uno por etiqueta. La médica tiene que
 * poder leer los tres estudios del turno sin abrirlo: nunca un `+N`.
 */
const getConsultationTypeLabels = (item: AgendaItem): string[] => {
  if (item.type !== 'appointment') return [];
  const apt = item.rawData as AppointmentFullResponseDto;
  return getAppointmentConsultationTypeChips(apt).map((chip) => chip.label);
};

type HistorySelectorValue = 'today' | 'yesterday' | 'last7' | 'date';

const formatHistoryDate = (date: string): string => {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}/${month}/${year}`;
};

const getHistoryPeriodLabel = (
  value: HistorySelectorValue,
  customDate: string,
): string => {
  if (value === 'today') return 'Hoy';
  if (value === 'yesterday') return 'Ayer';
  if (value === 'last7') return 'Últimos 7 días';
  return customDate ? formatHistoryDate(customDate) : 'Fecha puntual';
};


// ============================================
// STATS CARD COMPONENT (Local)
// ============================================

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  isLoading?: boolean;
}

const StatsCard = ({ title, value, icon, gradient, isLoading }: StatsCardProps) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <motion.p
                className="text-3xl font-bold text-gray-900"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
              >
                {value}
              </motion.p>
            </div>
            <div className={`p-3 rounded-xl ${gradient}`}>
              {icon}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// ============================================
// MAIN COMPONENT
// ============================================

const DoctorWaitingRoomPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  /**
   * La consulta del control integral cuya ecografía la médica está indicando.
   * `null` = diálogo cerrado.
   */
  const [ecoTarget, setEcoTarget] = useState<EcoSubtypeTarget | null>(null);
  const setUltrasoundTypes = useSetIntegralUltrasoundTypes();
  const [historyPeriod, setHistoryPeriod] =
    useState<HistorySelectorValue>('today');
  const [historyDate, setHistoryDate] = useState(getArgentinaTodayDate());
  const isLiveHistory = historyPeriod === 'today';
  const historyQueryParams = useMemo(
    () =>
      historyPeriod === 'date'
        ? { preset: 'date' as const, date: historyDate }
        : { preset: historyPeriod },
    [historyDate, historyPeriod],
  );
  const {
    shouldRestrictWaitingRoom,
    isLoading: isWorkingTodayLoading,
  } = useDoctorWorkingToday();

  // Agenda del día (appointments + overturns) - para attending, completed, cancelled
  const {
    agenda,
    stats,
    isLoading: isAgendaLoading,
    isFetching: isAgendaFetching,
  } = useDoctorDayAgenda({ refetchInterval: 15000 });

  // Cola de espera con waitingTimeMinutes del backend
  const {
    waitingQueue,
    isLoading: isQueueLoading,
    isFetching: isQueueFetching,
  } = useDoctorWaitingQueue({ refetchInterval: 15000 });

  const {
    agenda: historicalAgenda,
    response: historicalResponse,
    isLoading: isHistoricalLoading,
    isFetching: isHistoricalFetching,
    isError: isHistoricalError,
  } = useDoctorWaitingRoomHistory({
    params: historyQueryParams,
    enabled: !isLiveHistory && (historyPeriod !== 'date' || Boolean(historyDate)),
  });

  const isLoading = isAgendaLoading || isQueueLoading || isWorkingTodayLoading;
  const restrictWaitingRoom = resolveWaitingRoomRestriction({
    restrictedBySchedule: shouldRestrictWaitingRoom,
    hasActivityToday: agenda.length > 0 || waitingQueue.length > 0,
    isActivityLoading: isAgendaLoading || isQueueLoading,
  });
  const isFetching = isAgendaFetching || isQueueFetching;

  // Filtrar por estados específicos (usando agenda para attending/history)
  const attendingItems = agenda.filter((i) => isAttending(i.status));
  const todayHistoryItems = agenda.filter((i) => isCompleted(i.status) || isCancelled(i.status));
  const selectedHistoryItems = isLiveHistory ? todayHistoryItems : historicalAgenda;
  const isSelectedHistoryLoading = isLiveHistory ? isLoading : isHistoricalLoading;
  const hasAttendingPatient = attendingItems.length > 0;

  // Mutations
  const appointmentMutations = useAppointmentMutations();
  const overturnMutations = useOverturnMutations();
  const markAsAttendingMutation = useDoctorMarkAsAttending();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: doctorAgendaKeys.all });
    queryClient.invalidateQueries({ queryKey: doctorWaitingQueueKeys.all });
    queryClient.invalidateQueries({ queryKey: doctorQueueKeys.all });
    queryClient.invalidateQueries({ queryKey: doctorWaitingRoomHistoryKeys.all });
  };

  const handleHistoryPeriodChange = (value: string) => {
    setHistoryPeriod(value as HistorySelectorValue);
    setIsHistoryOpen(true);
  };

  const handleHistoryDateChange = (value: string) => {
    setHistoryDate(value);
    setIsHistoryOpen(true);
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

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Inicio', href: '/inicio' },
    { label: 'Mi Sala de Espera' },
  ];

  // Stats cards config
  const statsCards = [
    {
      title: 'En Espera',
      value: waitingQueue.length,
      icon: <Users className="h-6 w-6 text-white" />,
      gradient: 'bg-gradient-to-br from-orange-500 to-orange-600',
    },
    {
      title: 'Atendiendo',
      value: attendingItems.length,
      icon: <Stethoscope className="h-6 w-6 text-white" />,
      gradient: 'bg-gradient-to-br from-greenPrimary to-teal-600',
    },
    {
      title: 'Completados',
      value: stats.completed,
      icon: <CheckCircle className="h-6 w-6 text-white" />,
      gradient: 'bg-gradient-to-br from-gray-500 to-gray-600',
    },
    {
      title: 'Total del Día',
      value: stats.total,
      icon: <UserCheck className="h-6 w-6 text-white" />,
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
  ];

  // Helpers para QueueEntry
  const getQueueEntryType = (entry: typeof waitingQueue[0]): 'appointment' | 'overturn' => {
    return entry.overturnId ? 'overturn' : 'appointment';
  };

  const getQueueEntryConsultationTypes = (
    entry: typeof waitingQueue[0],
  ): string[] => {
    // El backend ya manda el array completo; el singular quedó por
    // compatibilidad y sólo nombra el primero.
    const fromQueue = getQueueEntryConsultationTypeLabels(entry);
    if (fromQueue.length > 0) {
      return fromQueue;
    }

    if (entry.overturnId) return [];
    if (!entry.appointmentId) return [];
    const agendaItem = agenda.find(
      (item) => item.type === 'appointment' && item.id === entry.appointmentId
    );
    if (!agendaItem) return [];
    return getConsultationTypeLabels(agendaItem);
  };

  /**
   * El vínculo del control para una entrada de la cola. La cola trae el flag
   * y el color, pero con quién está compartido sale de la agenda del día, que
   * ya lo tiene resuelto.
   */
  const getQueueEntryIntegralCheckup = (
    entry: typeof waitingQueue[0],
  ): IntegralCheckupLink | null => {
    const agendaItem = agenda.find((item) =>
      entry.overturnId
        ? item.type === 'overturn' && item.id === entry.overturnId
        : item.type === 'appointment' && item.id === entry.appointmentId,
    );
    return agendaItem?.integralCheckup ?? null;
  };

  const handleQueueEntryAttend = (entry: typeof waitingQueue[0]) => {
    if (hasAttendingPatient) {
      return;
    }

    // Usar el endpoint de queue para marcar como attending
    // Esto actualiza tanto la queue entry como el appointment/overturn
    markAsAttendingMutation.mutate(entry.id, {
      onSuccess: () => {
        // Refrescar la cola de espera para que desaparezca de "En Espera"
        queryClient.invalidateQueries({ queryKey: doctorWaitingQueueKeys.all });
        // Refrescar la agenda para que aparezca en "Atendiendo"
        queryClient.invalidateQueries({ queryKey: doctorAgendaKeys.all });
      },
    });
  };

  const handleQueueEntryOpenHC = (entry: typeof waitingQueue[0]) => {
    if (!entry.patientId) return;
    const slug = slugify(entry.patientName, entry.patientId);
    navigate(`/pacientes/${slug}/historia-clinica`);
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

    if (waitingQueue.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Armchair className="h-16 w-16 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No hay pacientes esperando</p>
          <p className="text-sm">Cuando secretaría pase un paciente a espera médica, aparecerá aquí</p>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {waitingQueue.map((entry, index) => {
          const type = getQueueEntryType(entry);
          const isChangingStatus = markAsAttendingMutation.isPending;
          const isAttendDisabled = isChangingStatus || hasAttendingPatient;

          const waitingMinutes = entry.waitingTimeMinutes;
          const waitTimeColors = getWaitingTimeColor(waitingMinutes);

          return (
            <motion.div
              key={`queue-${entry.id}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold text-orange-600 font-mono min-w-[4.5rem] shrink-0">
                  {entry.scheduledTime}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-lg truncate">{entry.patientName}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className={getTypeColor(type)}>
                      {getTypeLabel(type)}
                    </Badge>
                    <ConsultationTypeChips
                      labels={getQueueEntryConsultationTypes(entry)}
                    />
                    {(() => {
                      const link = getQueueEntryIntegralCheckup(entry);
                      return link ? <IntegralCheckupTag link={link} /> : null;
                    })()}
                    <Badge className="bg-orange-100 text-orange-800">
                      En espera
                    </Badge>
                    {waitingMinutes !== undefined && (
                      <Badge
                        variant="outline"
                        className={`font-mono ${waitTimeColors.text} ${waitTimeColors.bg} ${waitTimeColors.border}`}
                      >
                        <Clock className="h-3 w-3 mr-1" />
                        {formatWaitingTime(waitingMinutes)}
                      </Badge>
                    )}
                    {waitingMinutes !== undefined && waitingMinutes > 60 && (
                      <span title="Tiempo de espera prolongado"><AlertTriangle className="h-4 w-4 text-red-500" /></span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-greenPrimary to-teal-600 hover:from-greenPrimary/90 hover:to-teal-600/90 shadow-md"
                  onClick={() => handleQueueEntryAttend(entry)}
                  disabled={isAttendDisabled}
                  title={
                    hasAttendingPatient
                      ? 'Complete el paciente en atención antes de iniciar otro'
                      : undefined
                  }
                >
                  <Play className="h-5 w-5 mr-2" />
                  Atender
                </Button>
                {hasAttendingPatient && (
                  <p className="max-w-[180px] text-xs text-muted-foreground">
                    Complete el paciente en atención para iniciar otro.
                  </p>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {entry.patientId && (
                      <DropdownMenuItem onClick={() => handleQueueEntryOpenHC(entry)}>
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Historia Clínica
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  // Card para paciente en atención
  const renderAttendingCard = () => {
    if (attendingItems.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <div className="p-2 rounded-lg bg-gradient-to-br from-greenPrimary to-teal-600">
                <Stethoscope className="h-5 w-5 text-white" />
              </div>
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
                  className="flex items-center justify-between p-4 bg-white/80 border border-green-300 rounded-xl shadow-sm"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-xl font-bold text-green-700 font-mono">
                      {item.hour}
                    </div>
                    <div>
                      <p className="font-semibold text-lg">{renderPatientName(item)}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <Badge variant="outline" className={getTypeColor(item.type)}>
                          {getTypeLabel(item.type)}
                        </Badge>
                        <ConsultationTypeChips
                          labels={getConsultationTypeLabels(item)}
                        />
                        {item.integralCheckup && (
                          <IntegralCheckupTag link={item.integralCheckup} />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* La ginecóloga indica la ecografía ACÁ, con la paciente
                        delante: el tipo viaja a la otra pata del control y de
                        ahí a la worklist, así el ecógrafo ya sabe qué estudio
                        hacer cuando la paciente entra. */}
                    {item.type === 'appointment' &&
                      item.integralCheckup?.role === 'CONSULTATION' &&
                      (() => {
                        // El nombre real de la otra pata dice si la eco ya
                        // esta indicada: mientras es el generico coincide con
                        // el nombre publico ("Ecografia"), y en cuanto la
                        // ginecologa elige el estudio deja de coincidir.
                        const real = item.integralCheckup.counterpartDescription;
                        const publico =
                          item.integralCheckup.counterpartPublicDescription;
                        const yaIndicada = Boolean(publico && real !== publico);
                        return (
                          <Button
                            variant="outline"
                            size="lg"
                            className={
                              yaIndicada
                                ? 'border-pink-400 bg-pink-50 hover:bg-pink-100 text-pink-800 font-medium'
                                : 'border-pink-300 hover:bg-pink-100 text-pink-700 font-medium'
                            }
                            onClick={() =>
                              setEcoTarget({
                                id: item.id,
                                patientName: item.patient
                                  ? `${item.patient.lastName}, ${item.patient.firstName}`
                                  : undefined,
                              })
                            }
                          >
                            {yaIndicada ? (
                              <>
                                <CheckCircle className="mr-2 h-4 w-4" />
                                {real}
                              </>
                            ) : (
                              'Indicar ecografía'
                            )}
                          </Button>
                        );
                      })()}
                    <Button
                      size="lg"
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-md"
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
                        size="lg"
                        className="border-green-300 hover:bg-green-100 text-green-700 font-medium"
                        onClick={() => handleOpenHistoriaClinica(item)}
                      >
                        <FileText className="h-5 w-5 mr-2" />
                        Historia Clínica
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  // Historial colapsable
  const renderHistory = () => {
    const showDateColumn =
      !isLiveHistory &&
      Boolean(historicalResponse) &&
      historicalResponse?.dateFrom !== historicalResponse?.dateTo;
    const nonWorkingCount = historicalResponse?.nonWorkingDates.length ?? 0;
    const hasNoWorkedDates =
      !isLiveHistory &&
      Boolean(historicalResponse) &&
      historicalResponse?.workedDates.length === 0;

    const emptyMessage = hasNoWorkedDates
      ? 'No fue un día de atención del médico.'
      : 'No hay turnos completados o cancelados';

    return (
      <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <Card className="shadow-lg">
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors rounded-t-xl">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-gray-500 to-gray-600">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  Historial ({selectedHistoryItems.length})
                </div>
                {isHistoryOpen ? (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                )}
              </CardTitle>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="w-full sm:w-56">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Período
                    </label>
                    <Select
                      value={historyPeriod}
                      onValueChange={handleHistoryPeriodChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="yesterday">Ayer</SelectItem>
                        <SelectItem value="last7">Últimos 7 días</SelectItem>
                        <SelectItem value="date">Elegir fecha</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {historyPeriod === 'date' && (
                    <div className="w-full sm:w-44">
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Fecha
                      </label>
                      <Input
                        type="date"
                        value={historyDate}
                        max={getArgentinaTodayDate()}
                        onChange={(event) =>
                          handleHistoryDateChange(event.target.value)
                        }
                      />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>
                    {getHistoryPeriodLabel(historyPeriod, historyDate)}
                    {!isLiveHistory && nonWorkingCount > 0
                      ? ` · ${nonWorkingCount} día${nonWorkingCount === 1 ? '' : 's'} sin horario`
                      : ''}
                  </span>
                </div>
              </div>

              {isSelectedHistoryLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, index) => (
                    <Skeleton key={index} className="h-12 w-full" />
                  ))}
                </div>
              ) : isHistoricalError && !isLiveHistory ? (
                <p className="text-center py-4 text-red-600">
                  No se pudo cargar el historial seleccionado.
                </p>
              ) : selectedHistoryItems.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">
                  {emptyMessage}
                </p>
              ) : (
                <div className="rounded-lg border overflow-hidden overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        {showDateColumn && <TableHead>Fecha</TableHead>}
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Consulta</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedHistoryItems.map((item) => (
                        <TableRow key={`${item.type}-${item.date}-${item.id}`} className="opacity-70 hover:opacity-100 transition-opacity">
                          {showDateColumn && (
                            <TableCell>{formatHistoryDate(item.date)}</TableCell>
                          )}
                          <TableCell className="font-mono">{item.hour}</TableCell>
                          <TableCell>{renderPatientName(item)}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={getTypeColor(item.type)}>
                              {getTypeLabel(item.type)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              {(() => {
                                const labels = getConsultationTypeLabels(item);
                                return labels.length > 0 ? (
                                  <ConsultationTypeChips labels={labels} narrow />
                                ) : !item.integralCheckup ? (
                                  <span className="text-muted-foreground text-sm">—</span>
                                ) : null;
                              })()}
                              {item.integralCheckup && (
                                <IntegralCheckupTag link={item.integralCheckup} />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(item)}>
                              {getStatusLabel(item)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.patient && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleOpenHistoriaClinica(item)}
                              >
                                <FileText className="h-4 w-4 mr-1" />
                                Historia Clínica
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <Helmet>
        <title>Mi Sala de Espera</title>
      </Helmet>

      {/* Header con Breadcrumb */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mi Sala de Espera"
        description="Pacientes listos para ser atendidos"
        icon={<Armchair className="h-6 w-6" />}
        actions={
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isFetching || isHistoricalFetching}
            className="shadow-sm hover:shadow-md transition-shadow"
          >
            <RefreshCcw
              className={`h-4 w-4 mr-2 ${
                isFetching || isHistoricalFetching ? 'animate-spin' : ''
              }`}
            />
            Actualizar
          </Button>
        }
      />

      {restrictWaitingRoom ? (
        <Card className="border-dashed border-slate-300 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <CalendarOff className="h-12 w-12 text-slate-400" />
            <div className="space-y-1">
              <p className="text-lg font-semibold text-slate-800">
                Hoy no tenés sala de espera activa
              </p>
              <p className="text-sm text-muted-foreground">
                La sala aparece únicamente los días configurados en tus horarios de atención.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>

          {/* Stats Cards con animaciones */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statsCards.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                gradient={stat.gradient}
                isLoading={isLoading}
              />
            ))}
          </div>

          {/* Paciente en Atención (si hay) */}
          {renderAttendingCard()}

          {/* Pacientes en Espera - Vista Principal */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="border-orange-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
                    <Armchair className="h-5 w-5 text-white" />
                  </div>
                  Pacientes en Espera ({waitingQueue.length})
                </CardTitle>
              </CardHeader>
              <CardContent>{renderWaitingTable()}</CardContent>
            </Card>
          </motion.div>
        </>
      )}

      {/* Historial Colapsable */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
      >
        {renderHistory()}
      </motion.div>

      {/* El mismo selector que usa recepción, en la escena de la médica —pero
          con la lista del control: son las ecos que la clínica habilitó para
          el control integral, no los 15 subtipos del catálogo. La restricción
          también está en el endpoint, así que ofrecer otra sería ofrecer un
          error. */}
      <EcoSubtypeDialog
        entry={ecoTarget}
        scope="integralCheckup"
        title="¿Qué ecografía le indicás?"
        description={
          ecoTarget?.patientName
            ? `Elegí el estudio para ${ecoTarget.patientName}. La ecografista lo va a ver ya definido y llega tipado al ecógrafo.`
            : "Elegí el estudio. La ecografista lo va a ver ya definido y llega tipado al ecógrafo."
        }
        confirmLabel="Indicar"
        isSaving={setUltrasoundTypes.isPending}
        onCancel={() => setEcoTarget(null)}
        onSkip={() => setEcoTarget(null)}
        onConfirm={(consultationTypeIds) => {
          if (!ecoTarget) return;
          setUltrasoundTypes.mutate(
            { consultationId: ecoTarget.id, consultationTypeIds },
            { onSuccess: () => setEcoTarget(null) },
          );
        }}
      />
    </div>
  );
};

export default DoctorWaitingRoomPage;
