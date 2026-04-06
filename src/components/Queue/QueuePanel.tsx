import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import {
  Users,
  PhoneCall,
  UserCheck,
  UserX,
  RefreshCcw,
  Clock,
  CheckCircle,
  Volume2,
  UserPlus,
  AlertTriangle,
  ArrowRightCircle,
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
import { queueKeys } from '@/hooks/Queue';
import type { QueueEntry, QueueStatus, AppointmentType } from '@/types/Queue';
import { formatWaitingTime, getWaitingTimeColor } from '@/common/helpers/helpers';
import { QueuePatientRegistrationModal } from './QueuePatientRegistrationModal';

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

const requiresRegistration = (entry: QueueEntry) =>
  entry.isGuest || entry.patientId === null;

const isUnregisteredEntry = (entry: QueueEntry) =>
  !entry.isGuest && entry.patientId === null;

type QueueAction = {
  icon: typeof PhoneCall;
  label: string;
  onClick: () => void;
  className?: string;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
};

const ActionButtons = ({ actions }: { actions: QueueAction[] }) => {
  if (actions.length === 0) return null;

  const columnsClass =
    actions.length >= 3
      ? 'xl:grid-cols-3'
      : actions.length === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-1';

  return (
    <div className={cn('grid gap-2 sm:min-w-[320px]', columnsClass)}>
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.label}
            type="button"
            size="sm"
            variant={action.variant ?? 'outline'}
            className={cn(
              'h-11 justify-center rounded-xl px-4 text-sm font-semibold shadow-sm',
              action.className,
            )}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            <Icon className="mr-2 h-4 w-4" />
            {action.label}
          </Button>
        );
      })}
    </div>
  );
};

const PatientBadges = ({ entry }: { entry: QueueEntry }) => (
  <div className="flex flex-wrap items-center gap-2">
    {entry.isGuest && (
      <Badge
        variant="outline"
        className="bg-amber-100 text-amber-800 border-amber-300 text-xs"
      >
        <UserPlus className="w-3 h-3 mr-1" />
        INVITADO
      </Badge>
    )}
    {isUnregisteredEntry(entry) && (
      <Badge
        variant="outline"
        className="bg-rose-100 text-rose-800 border-rose-300 text-xs"
      >
        <AlertTriangle className="w-3 h-3 mr-1" />
        NO REGISTRADO
      </Badge>
    )}
  </div>
);

export const QueuePanel = () => {
  const queryClient = useQueryClient();
  const [servicePoint, setServicePoint] = useState('Recepción');
  const [callDialogOpen, setCallDialogOpen] = useState(false);
  const [registrationEntry, setRegistrationEntry] = useState<QueueEntry | null>(
    null,
  );

  const { data: waitingQueue, isLoading: loadingWaiting } = useWaitingQueue();
  const { data: activeQueue } = useActiveQueue();
  const { data: stats, isLoading: loadingStats } = useQueueStats();

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

  const buildWaitingActions = (entry: QueueEntry): QueueAction[] => {
    const actions: QueueAction[] = [
      {
        icon: PhoneCall,
        label: 'Llamar a recepción',
        onClick: () => handleCallSpecific(entry),
        disabled: callSpecificMutation.isPending,
        className:
          'bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600',
      },
    ];

    if (requiresRegistration(entry)) {
      actions.push({
        icon: UserPlus,
        label: 'Dar de alta paciente',
        onClick: () => setRegistrationEntry(entry),
        disabled: false,
        className:
          'bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200',
      });
    }

    return actions;
  };

  const buildActiveActions = (entry: QueueEntry): QueueAction[] => {
    if (entry.status === 'ATTENDING') {
      const actions: QueueAction[] = [];

      if (requiresRegistration(entry)) {
        actions.push({
          icon: UserPlus,
          label: 'Dar de alta paciente',
          onClick: () => setRegistrationEntry(entry),
          className:
            'bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200',
        });
      }

      actions.push({
        icon: CheckCircle,
        label: 'Cerrar trámite',
        onClick: () => completedMutation.mutate(entry.id),
        disabled: completedMutation.isPending,
        className:
          'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
      });

      return actions;
    }

    const actions: QueueAction[] = [
      {
        icon: Volume2,
        label: 'Re-llamar',
        onClick: () => recallMutation.mutate(entry.id),
        disabled: recallMutation.isPending,
        className: 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600',
      },
    ];

    if (requiresRegistration(entry)) {
      actions.push({
        icon: UserPlus,
        label: 'Dar de alta paciente',
        onClick: () => setRegistrationEntry(entry),
        className:
          'bg-white text-emerald-700 hover:bg-emerald-50 border-emerald-200',
      });
    }

    if (entry.appointmentType === 'SCHEDULED_APPOINTMENT') {
      actions.push({
        icon: ArrowRightCircle,
        label: 'Pasar a espera médica',
        onClick: () => confirmArrivalMutation.mutate(entry.id),
        disabled: confirmArrivalMutation.isPending,
        className:
          'bg-amber-500 text-white hover:bg-amber-600 border-amber-500',
      });
    } else {
      actions.push({
        icon: CheckCircle,
        label: 'Cerrar trámite',
        onClick: () => completedMutation.mutate(entry.id),
        disabled: completedMutation.isPending,
        className:
          'bg-slate-900 text-white hover:bg-slate-800 border-slate-900',
      });
    }

    if (!requiresRegistration(entry)) {
      actions.push({
        icon: UserX,
        label: 'Marcar ausente',
        onClick: () => noShowMutation.mutate(entry.id),
        disabled: noShowMutation.isPending,
        variant: 'destructive',
        className: 'bg-rose-600 text-white hover:bg-rose-700 border-rose-600',
      });
    }

    return actions.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
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

      <div className="flex items-center gap-4">
        <Dialog open={callDialogOpen} onOpenChange={setCallDialogOpen}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-green-600 hover:bg-green-700">
              <PhoneCall className="mr-2 h-5 w-5" />
              Llamar siguiente en recepción
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

      {activeQueue && activeQueue.length > 0 && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700">
              <UserCheck className="h-5 w-5" />
              Gestión activa en recepción
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Puesto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="min-w-[360px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {activeQueue.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <span className="text-2xl font-bold text-blue-700">
                        {entry.displayNumber}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{entry.patientName}</p>
                        <PatientBadges entry={entry} />
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
                    <TableCell>
                      <ActionButtons actions={buildActiveActions(entry)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Cola del Día
            {waitingQueue && waitingQueue.length > 0 && (
              <Badge variant="secondary">{waitingQueue.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingWaiting ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : waitingQueue && waitingQueue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Responsable</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Espera
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[320px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingQueue.map((entry) => {
                  const waitTimeColors = getWaitingTimeColor(
                    entry.waitingTimeMinutes,
                  );

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
                          className={appointmentTypeColors[entry.appointmentType]}
                        >
                          {appointmentTypeLabels[entry.appointmentType]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium">{entry.patientName}</p>
                          <PatientBadges entry={entry} />
                          <p className="text-sm text-muted-foreground">
                            DNI: {entry.patientDocument}
                          </p>
                          {requiresRegistration(entry) && (
                            <p className="text-xs text-amber-700">
                              Requiere alta administrativa en secretaría
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{entry.doctorName || 'Recepción'}</p>
                          <p className="text-sm text-muted-foreground">
                            {entry.speciality || 'Sin especialidad'}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{entry.scheduledTime}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'font-mono',
                              waitTimeColors.text,
                              waitTimeColors.bg,
                              waitTimeColors.border,
                            )}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            {formatWaitingTime(entry.waitingTimeMinutes)}
                          </Badge>
                          {entry.waitingTimeMinutes !== undefined &&
                            entry.waitingTimeMinutes > 60 && (
                              <span title="Tiempo de espera prolongado">
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <ActionButtons actions={buildWaitingActions(entry)} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Users className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>No hay pacientes en espera en recepción</p>
            </div>
          )}
        </CardContent>
      </Card>

      <QueuePatientRegistrationModal
        entry={registrationEntry}
        open={Boolean(registrationEntry)}
        onOpenChange={(open) => {
          if (!open) {
            setRegistrationEntry(null);
          }
        }}
      />
    </div>
  );
};
