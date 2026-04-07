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
  Users,
  PhoneCall,
  UserCheck,
  UserX,
  MoreHorizontal,
  RefreshCcw,
  ArrowLeft,
  ArrowRight,
  Clock,
  CheckCircle,
  Volume2,
  UserPlus,
  AlertTriangle,
} from 'lucide-react';
import {
  useWaitingQueue,
  useActiveQueue,
  useQueueStats,
  useCallNextPatient,
  useCallSpecificPatient,
  useRecallPatient,
  useMarkAsAttending,
  useMarkAsCompleted,
  useMarkAsNoShow,
} from '@/hooks/Queue';
import type {
  QueueEntry,
  QueueStatus,
  AppointmentType,
  QueueCallDestination,
} from '@/types/Queue';
import { useQueryClient } from '@tanstack/react-query';
import { queueKeys } from '@/hooks/Queue';
import { formatWaitingTime, getWaitingTimeColor } from '@/common/helpers/helpers';

const statusColors: Record<QueueStatus, string> = {
  WAITING: 'bg-yellow-500',
  CALLED: 'bg-blue-500',
  ATTENDING: 'bg-green-500',
  COMPLETED: 'bg-gray-500',
  NO_SHOW: 'bg-red-500',
};

const statusLabels: Record<QueueStatus, string> = {
  WAITING: 'Esperando',
  CALLED: 'Llamado',
  ATTENDING: 'Atendiendo',
  COMPLETED: 'Completado',
  NO_SHOW: 'Ausente',
};

// Configuracion de badges por tipo de turno
const appointmentTypeLabels: Record<AppointmentType, string> = {
  SCHEDULED_APPOINTMENT: 'Con turno',
  WALK_IN: 'Sin turno',
  ADMINISTRATIVE: 'Administrativo',
};

const appointmentTypeColors: Record<AppointmentType, string> = {
  SCHEDULED_APPOINTMENT: 'bg-green-100 text-green-800 border-green-300',
  WALK_IN: 'bg-orange-100 text-orange-800 border-orange-300',
  ADMINISTRATIVE: 'bg-gray-100 text-gray-800 border-gray-300',
};

const callDestinationOptions: Array<{
  value: QueueCallDestination;
  label: string;
  Icon: typeof ArrowLeft;
  className: string;
}> = [
  {
    value: 'RECEPCION',
    label: 'Recepción',
    Icon: ArrowLeft,
    className:
      'border-2 border-slate-300 bg-slate-200 text-slate-900 hover:bg-slate-300 hover:text-slate-950 shadow-sm shadow-slate-950/10',
  },
  {
    value: 'VENTANILLA',
    label: 'Ventanilla',
    Icon: ArrowRight,
    className:
      'border-2 border-emerald-200 bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white shadow-sm shadow-emerald-950/15',
  },
];

const formatServicePoint = (servicePoint?: string): string => {
  if (!servicePoint) return '-';

  switch (servicePoint.toUpperCase()) {
    case 'RECEPCION':
      return 'Recepción';
    case 'VENTANILLA':
      return 'Ventanilla';
    default:
      return servicePoint;
  }
};

const getServicePointBadgeClass = (servicePoint?: string): string => {
  if (!servicePoint) {
    return 'border-slate-200 bg-slate-100 text-slate-500';
  }

  switch (servicePoint.toUpperCase()) {
    case 'RECEPCION':
      return 'border-slate-300 bg-slate-200 text-slate-900';
    case 'VENTANILLA':
      return 'border-emerald-200 bg-emerald-500 text-white';
    default:
      return 'border-slate-200 bg-white text-slate-900';
  }
};

const CallDestinationButtons = ({
  onCall,
  disabled,
  size = 'default',
  compact = false,
}: {
  onCall: (destination: QueueCallDestination) => void;
  disabled: boolean;
  size?: 'sm' | 'default' | 'lg';
  compact?: boolean;
}) => (
  <div
    className={
      compact
        ? 'flex flex-col gap-2 sm:flex-row sm:justify-end'
        : 'flex flex-col gap-2 sm:flex-row'
    }
  >
    {callDestinationOptions.map(({ value, label, Icon, className }) => {
      const isReception = value === 'RECEPCION';
      const sizeClasses = compact
        ? 'min-w-[148px] px-4 text-sm'
        : 'min-w-[178px] px-5 text-base';

      return (
        <Button
          key={value}
          type="button"
          size={size}
          variant="outline"
          className={`justify-center gap-2 whitespace-nowrap rounded-2xl font-extrabold transition-all ${sizeClasses} ${className}`}
          disabled={disabled}
          onClick={() => onCall(value)}
        >
          {isReception && <Icon className="h-4 w-4" />}
          <span>{label}</span>
          {!isReception && <Icon className="h-4 w-4" />}
        </Button>
      );
    })}
  </div>
);

export const QueuePanel = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: waitingQueue, isLoading: loadingWaiting } = useWaitingQueue();
  const { data: activeQueue } = useActiveQueue();
  const { data: stats, isLoading: loadingStats } = useQueueStats();

  // Mutations
  const callNextMutation = useCallNextPatient();
  const callSpecificMutation = useCallSpecificPatient();
  const recallMutation = useRecallPatient();
  const attendingMutation = useMarkAsAttending();
  const completedMutation = useMarkAsCompleted();
  const noShowMutation = useMarkAsNoShow();

  const handleCallNext = (servicePoint: QueueCallDestination) => {
    callNextMutation.mutate({ servicePoint });
  };

  const handleCallSpecific = (
    entry: QueueEntry,
    servicePoint: QueueCallDestination,
  ) => {
    callSpecificMutation.mutate({ queueEntryId: entry.id, servicePoint });
  };

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: queueKeys.all });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">En espera</p>
                <p className="text-3xl font-bold text-yellow-600">
                  {loadingStats ? <Skeleton className="h-9 w-12" /> : stats?.waiting ?? 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Llamados</p>
                <p className="text-3xl font-bold text-blue-600">
                  {loadingStats ? <Skeleton className="h-9 w-12" /> : stats?.called ?? 0}
                </p>
              </div>
              <PhoneCall className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Atendiendo</p>
                <p className="text-3xl font-bold text-green-600">
                  {loadingStats ? <Skeleton className="h-9 w-12" /> : stats?.attending ?? 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tiempo promedio</p>
                <p className="text-3xl font-bold text-purple-600">
                  {loadingStats ? (
                    <Skeleton className="h-9 w-16" />
                  ) : (
                    `${stats?.averageWaitTimeMinutes ?? 0}m`
                  )}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Next Button */}
      <div className="flex flex-col gap-3 rounded-[1.75rem] border border-slate-200 bg-gradient-to-r from-white via-slate-50 to-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xl font-semibold">
            <PhoneCall className="h-5 w-5 text-green-600" />
            Llamar siguiente
          </div>
          <p className="text-sm text-muted-foreground">
            Elegí el destino del paciente con un solo click.
          </p>
        </div>
        <CallDestinationButtons
          onCall={handleCallNext}
          disabled={callNextMutation.isPending}
          size="lg"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCcw className="mr-2 h-4 w-4" />
          Actualizar
        </Button>
      </div>

      {/* Active Queue (Called/Attending) */}
      {activeQueue && activeQueue.length > 0 && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-green-700 flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Pacientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeQueue.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="text-2xl font-bold text-green-600">
                        {entry.displayNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.patientName}</p>
                          {entry.isGuest && (
                            <Badge
                              variant="outline"
                              className="bg-amber-100 text-amber-800 border-amber-300 text-xs"
                            >
                              <UserPlus className="w-3 h-3 mr-1" />
                              INVITADO
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          DNI: {entry.patientDocument}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`rounded-full px-3 py-1 text-sm font-bold ${getServicePointBadgeClass(entry.servicePoint)}`}
                      >
                        {formatServicePoint(entry.servicePoint)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[entry.status]}>
                        {statusLabels[entry.status]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {entry.status === 'CALLED' && (
                            <>
                              <DropdownMenuItem
                                onClick={() => recallMutation.mutate(entry.id)}
                              >
                                <Volume2 className="mr-2 h-4 w-4" />
                                Re-llamar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => attendingMutation.mutate(entry.id)}
                              >
                                <UserCheck className="mr-2 h-4 w-4" />
                                Marcar Atendiendo
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => noShowMutation.mutate(entry.id)}
                                className="text-red-600"
                              >
                                <UserX className="mr-2 h-4 w-4" />
                                Marcar Ausente
                              </DropdownMenuItem>
                            </>
                          )}
                          {entry.status === 'ATTENDING' && (
                            <DropdownMenuItem
                              onClick={() => completedMutation.mutate(entry.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Finalizar Atención
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Waiting Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cola de Espera
            {waitingQueue && waitingQueue.length > 0 && (
              <Badge variant="secondary">{waitingQueue.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWaiting ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : waitingQueue && waitingQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Tiempo Espera
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingQueue.map((entry) => {
                  const waitTimeColors = getWaitingTimeColor(entry.waitingTimeMinutes);
                  return (
                    <TableRow key={entry.id} className="bg-slate-50/60">
                      <TableCell>
                        <span className="text-xl font-bold text-yellow-600">
                          {entry.displayNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={appointmentTypeColors[entry.appointmentType]}
                        >
                          {appointmentTypeLabels[entry.appointmentType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entry.patientName}</p>
                            {entry.isGuest && (
                              <Badge
                                variant="outline"
                                className="bg-amber-100 text-amber-800 border-amber-300 text-xs"
                              >
                                <UserPlus className="w-3 h-3 mr-1" />
                                INVITADO
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            DNI: {entry.patientDocument}
                          </p>
                          {entry.isGuest && (
                            <p className="text-xs text-amber-600 mt-1">
                              Requiere registro en secretaria
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.doctorName}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.speciality}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.scheduledTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`font-mono ${waitTimeColors.text} ${waitTimeColors.bg} ${waitTimeColors.border}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatWaitingTime(entry.waitingTimeMinutes)}
                          </Badge>
                          {entry.waitingTimeMinutes !== undefined && entry.waitingTimeMinutes > 60 && (
                            <span title="Tiempo de espera prolongado"><AlertTriangle className="h-4 w-4 text-red-500" /></span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <CallDestinationButtons
                          onCall={(servicePoint) => handleCallSpecific(entry, servicePoint)}
                          disabled={callSpecificMutation.isPending}
                          size="sm"
                          compact
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay pacientes en espera</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
