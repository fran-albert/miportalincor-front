import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  useConfirmArrival,
  useMarkAsCompleted,
  useMarkAsNoShow,
} from '@/hooks/Queue';
import type { QueueEntry, QueueStatus, AppointmentType } from '@/types/Queue';
import { useQueryClient } from '@tanstack/react-query';
import { queueKeys } from '@/hooks/Queue';
import { formatWaitingTime, getWaitingTimeColor, parseBoolean } from '@/common/helpers/helpers';
import { formatTimeAR, formatTimeFromDateAR } from '@/common/helpers/timezone';

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

const overturnBadgeClassName = 'bg-cyan-100 text-cyan-800 border-cyan-300';

const hasMeaningfulText = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized !== '' && normalized !== '0';
};

const getAppointmentTypePresentation = (
  entry: QueueEntry
): { label: string; className: string } => {
  if (entry.appointmentType === 'SCHEDULED_APPOINTMENT' && entry.overturnId) {
    return {
      label: 'Sobreturno',
      className: overturnBadgeClassName,
    };
  }

  return {
    label: appointmentTypeLabels[entry.appointmentType],
    className: appointmentTypeColors[entry.appointmentType],
  };
};

const formatQueueHour = (entry: QueueEntry): string => {
  if (entry.appointmentType === 'SCHEDULED_APPOINTMENT') {
    if (!entry.scheduledTime) return '-';
    return /^\d{2}:\d{2}$/.test(entry.scheduledTime)
      ? entry.scheduledTime
      : formatTimeAR(entry.scheduledTime);
  }

  if (entry.checkedInAt) {
    return formatTimeFromDateAR(entry.checkedInAt);
  }

  if (!entry.scheduledTime) return '-';
  return /^\d{2}:\d{2}$/.test(entry.scheduledTime)
    ? entry.scheduledTime
    : formatTimeAR(entry.scheduledTime);
};

const formatSecretaryWaitingTime = (minutes: number | undefined): string => {
  if (minutes === undefined || minutes === null) return '-';
  if (minutes <= 0) return 'Recién ingresó';
  return formatWaitingTime(minutes);
};

const getAttentionLabels = (entry: QueueEntry): { primary: string; secondary?: string } => {
  if (entry.appointmentType === 'ADMINISTRATIVE') {
    return {
      primary: 'Secretaría',
      secondary: 'Trámite administrativo',
    };
  }

  if (entry.appointmentType === 'WALK_IN') {
    return {
      primary: 'Secretaría',
      secondary: 'Consulta sin turno',
    };
  }

  const primary = hasMeaningfulText(entry.doctorName) ? entry.doctorName : 'Sin asignar';
  const secondary = hasMeaningfulText(entry.speciality) ? entry.speciality : undefined;

  return { primary, secondary };
};

export const QueuePanel = () => {
  const queryClient = useQueryClient();
  const [servicePoint, setServicePoint] = useState('Recepción');
  const [callDialogOpen, setCallDialogOpen] = useState(false);

  // Queries
  const { data: waitingQueue, isLoading: loadingWaiting } = useWaitingQueue();
  const { data: activeQueue } = useActiveQueue();
  const { data: stats, isLoading: loadingStats } = useQueueStats();

  // Mutations
  const callNextMutation = useCallNextPatient();
  const callSpecificMutation = useCallSpecificPatient();
  const recallMutation = useRecallPatient();
  const confirmArrivalMutation = useConfirmArrival();
  const completedMutation = useMarkAsCompleted();
  const noShowMutation = useMarkAsNoShow();

  const handleCallNext = () => {
    callNextMutation.mutate({ servicePoint });
    setCallDialogOpen(false);
  };

  const handleCallSpecific = (entry: QueueEntry) => {
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
      <div className="flex items-center gap-4">
        <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <PhoneCall className="mr-2 h-5 w-5" />
              Llamar Siguiente en Recepción
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Llamar al siguiente paciente en recepción</DialogTitle>
              <DialogDescription>
                Ingrese el punto de atención de recepción
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={servicePoint}
                onChange={(e) => setServicePoint(e.target.value)}
                placeholder="Ej: Recepción"
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCallDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleCallNext}
                disabled={callNextMutation.isPending || !servicePoint}
              >
                {callNextMutation.isPending ? 'Llamando...' : 'Llamar a recepción'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

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
              Recepción Activa
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Destino</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeQueue.map((entry) => {
                  const appointmentTypePresentation = getAppointmentTypePresentation(entry);

                  return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="text-2xl font-bold text-green-600">
                        {entry.displayNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={appointmentTypePresentation.className}
                      >
                        {appointmentTypePresentation.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{entry.patientName}</p>
                          {parseBoolean(entry.isGuest) && (
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
                    <TableCell>{entry.servicePoint || '-'}</TableCell>
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
                              {entry.appointmentType === 'SCHEDULED_APPOINTMENT' ? (
                                <DropdownMenuItem
                                  onClick={() => confirmArrivalMutation.mutate(entry.id)}
                                >
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  Pasar a espera médica
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => completedMutation.mutate(entry.id)}
                                >
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Cerrar trámite
                                </DropdownMenuItem>
                              )}
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
                              Cerrar trámite
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )})}
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
            Cola de Recepción
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
                  <TableHead>Atención</TableHead>
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
                  const isGuest = parseBoolean(entry.isGuest);
                  const attention = getAttentionLabels(entry);
                  const appointmentTypePresentation = getAppointmentTypePresentation(entry);
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <span className="text-xl font-bold text-yellow-600">
                          {entry.displayNumber}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={appointmentTypePresentation.className}
                        >
                          {appointmentTypePresentation.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{entry.patientName}</p>
                            {isGuest && (
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
                          {isGuest && (
                            <p className="text-xs text-amber-600 mt-1">
                              Requiere registro en secretaria
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{attention.primary}</p>
                          {attention.secondary && (
                            <p className="text-sm text-muted-foreground">
                              {attention.secondary}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{formatQueueHour(entry)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={`font-mono ${waitTimeColors.text} ${waitTimeColors.bg} ${waitTimeColors.border}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatSecretaryWaitingTime(entry.waitingTimeMinutes)}
                          </Badge>
                          {entry.waitingTimeMinutes !== undefined && entry.waitingTimeMinutes > 60 && (
                            <span title="Tiempo de espera prolongado"><AlertTriangle className="h-4 w-4 text-red-500" /></span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCallSpecific(entry)}
                          disabled={callSpecificMutation.isPending}
                        >
                          <PhoneCall className="mr-1 h-3 w-3" />
                          Llamar a recepción
                        </Button>
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
