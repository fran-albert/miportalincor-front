import { MouseEvent, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { cn } from '@/lib/utils';
import {
  Users,
  UserCheck,
  UserX,
  RefreshCcw,
  Clock,
  CheckCircle,
  Volume2,
  UserPlus,
  AlertTriangle,
  ArrowRightCircle,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import {
  useWaitingQueue,
  useActiveQueue,
  useCallNextPatient,
  useCallSpecificPatient,
  useRecallPatient,
  useConfirmArrival,
  useMarkAsCompleted,
  useMarkAsNoShow,
  useRegisterQueuePatient,
} from '@/hooks/Queue';
import { queueKeys } from '@/hooks/Queue';
import type { QueueEntry, QueueStatus, AppointmentType } from '@/types/Queue';
import {
  formatWaitingTime,
  getWaitingTimeColor,
  parseBoolean,
} from '@/common/helpers/helpers';
import { formatTimeAR } from '@/common/helpers/timezone';
import { useToastContext } from '@/hooks/Toast/toast-context';
import { QueuePatientRegistrationModal } from './QueuePatientRegistrationModal';
import {
  findExactPatientByDocument,
  normalizeDocument,
} from './patient-registration.helpers';

type QueueCallDestination = 'RECEPCION' | 'VENTANILLA';

const statusStyles: Record<QueueStatus, string> = {
  WAITING: 'bg-amber-100 text-amber-900 border-amber-200',
  CALLED: 'bg-sky-100 text-sky-900 border-sky-200',
  ATTENDING:
    'bg-[rgba(24,123,128,0.12)] text-greenSecondary border-[rgba(24,123,128,0.2)]',
  COMPLETED: 'bg-slate-100 text-slate-700 border-slate-200',
  NO_SHOW: 'bg-rose-100 text-rose-900 border-rose-200',
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

const appointmentTypeBadgeStyles: Record<AppointmentType, string> = {
  SCHEDULED_APPOINTMENT:
    'border-[rgba(24,123,128,0.18)] bg-[rgba(24,123,128,0.08)] text-greenSecondary',
  WALK_IN: 'border-sky-200 bg-sky-50 text-sky-900',
  ADMINISTRATIVE: 'border-slate-200 bg-slate-100 text-slate-700',
};

const appointmentTypeRowStyles: Record<AppointmentType, string> = {
  SCHEDULED_APPOINTMENT:
    'border-l-2 border-l-greenPrimary/50 bg-[rgba(24,123,128,0.025)] hover:bg-[rgba(24,123,128,0.04)]',
  WALK_IN: 'border-l-2 border-l-sky-100 bg-white hover:bg-slate-50',
  ADMINISTRATIVE: 'border-l-2 border-l-slate-100 bg-white hover:bg-slate-50',
};

const waitingSortOrder: Record<AppointmentType, number> = {
  SCHEDULED_APPOINTMENT: 0,
  WALK_IN: 1,
  ADMINISTRATIVE: 2,
};

const callDestinationOptions: Array<{
  value: QueueCallDestination;
  label: string;
  Icon: typeof ArrowLeft;
  variant: 'default' | 'outline';
  className: string;
}> = [
  {
    value: 'RECEPCION',
    label: 'Recepción',
    Icon: ArrowLeft,
    variant: 'outline',
    className:
      'border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-slate-900',
  },
  {
    value: 'VENTANILLA',
    label: 'Ventanilla',
    Icon: ArrowRight,
    variant: 'default',
    className:
      'bg-greenPrimary text-white hover:bg-greenSecondary hover:text-white',
  },
];

const hasMeaningfulText = (value: unknown): boolean => {
  if (value === null || value === undefined) return false;
  const normalized = String(value).trim();
  return normalized !== '' && normalized !== '0';
};

const hasLinkedPatient = (entry: QueueEntry) =>
  entry.patientId !== null && entry.patientId !== undefined;

const requiresRegistration = (entry: QueueEntry) => !hasLinkedPatient(entry);

const isUnregisteredEntry = (entry: QueueEntry) =>
  !parseBoolean(entry.isGuest) && !hasLinkedPatient(entry);

const formatQueueHour = (entry: QueueEntry): string => {
  if (entry.appointmentType === 'SCHEDULED_APPOINTMENT') {
    if (!entry.scheduledTime) return '-';
    return /^\d{2}:\d{2}$/.test(entry.scheduledTime)
      ? entry.scheduledTime
      : formatTimeAR(entry.scheduledTime);
  }

  return new Intl.DateTimeFormat('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'America/Argentina/Buenos_Aires',
  }).format(new Date(entry.checkedInAt));
};

const formatSecretaryWaitingTime = (minutes: number | undefined): string => {
  if (minutes === undefined || minutes === null) return '-';
  if (minutes <= 0) return 'Recién ingresó';
  return formatWaitingTime(minutes);
};

const getAttentionLabels = (entry: QueueEntry): { primary: string; secondary?: string } => {
  if (entry.appointmentType === 'ADMINISTRATIVE') {
    return {
      primary: 'Recepción',
      secondary: 'Trámite administrativo',
    };
  }

  if (entry.appointmentType === 'WALK_IN') {
    return {
      primary: 'Recepción',
      secondary: 'Consulta sin turno',
    };
  }

  return {
    primary: hasMeaningfulText(entry.doctorName) ? entry.doctorName : 'Recepción',
    secondary: hasMeaningfulText(entry.speciality) ? entry.speciality : undefined,
  };
};

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
      return 'border-slate-300 bg-slate-100 text-slate-800';
    case 'VENTANILLA':
      return 'border-greenPrimary bg-greenPrimary text-white';
    default:
      return 'border-slate-200 bg-white text-slate-900';
  }
};

type QueueAction = {
  icon: typeof Users;
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
      ? 'lg:grid-cols-3'
      : actions.length === 2
        ? 'sm:grid-cols-2'
        : 'sm:grid-cols-1';

  return (
    <div className={cn('grid gap-2 sm:min-w-[320px]', columnsClass)}>
      {actions.map((action, index) => {
        const Icon = action.icon;
        return (
          <Button
            key={`${action.label}-${index}`}
            type="button"
            size="sm"
            variant={action.variant ?? 'outline'}
            className={cn(
              'h-9 justify-center px-3 text-sm font-medium',
              action.className,
            )}
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              event.stopPropagation();
              action.onClick();
            }}
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
    <Badge
      variant="outline"
      className={cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold',
        appointmentTypeBadgeStyles[entry.appointmentType],
      )}
    >
      {appointmentTypeLabels[entry.appointmentType]}
    </Badge>
    {entry.overturnId && (
      <Badge
        variant="outline"
        className="rounded-full border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-900"
      >
        Sobreturno
      </Badge>
    )}
    {parseBoolean(entry.isGuest) && !hasLinkedPatient(entry) && (
      <Badge
        variant="outline"
        className="rounded-full border-amber-300 bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-900"
      >
        <UserPlus className="mr-1 h-3 w-3" />
        Invitado
      </Badge>
    )}
    {isUnregisteredEntry(entry) && (
      <Badge
        variant="outline"
        className="rounded-full border-rose-200 bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-900"
      >
        <AlertTriangle className="mr-1 h-3 w-3" />
        Registro pendiente
      </Badge>
    )}
  </div>
);

const CallDestinationButtons = ({
  onCall,
  disabled,
  compact = false,
}: {
  onCall: (destination: QueueCallDestination) => void;
  disabled: boolean;
  compact?: boolean;
}) => (
  <div
    className={cn(
      'flex gap-2',
      compact ? 'flex-col xl:flex-row xl:justify-end' : 'flex-col sm:flex-row',
    )}
  >
    {callDestinationOptions.map(({ value, label, Icon, variant, className }) => {
      const isReception = value === 'RECEPCION';

      return (
        <Button
          key={value}
          type="button"
          variant={variant}
          className={cn(
            'gap-2 text-sm transition-colors',
            compact ? 'h-9 min-w-[140px] px-3 font-medium' : 'h-9 min-w-[148px] px-4',
            className,
          )}
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
  const { showError, showSuccess } = useToastContext();
  const [registrationEntry, setRegistrationEntry] = useState<QueueEntry | null>(null);
  const [resolvingRegistrationEntryId, setResolvingRegistrationEntryId] =
    useState<number | null>(null);

  const { data: waitingQueue, isLoading: loadingWaiting } = useWaitingQueue();
  const { data: activeQueue } = useActiveQueue();

  const callNextMutation = useCallNextPatient();
  const callSpecificMutation = useCallSpecificPatient();
  const recallMutation = useRecallPatient();
  const confirmArrivalMutation = useConfirmArrival();
  const completedMutation = useMarkAsCompleted();
  const noShowMutation = useMarkAsNoShow();
  const registerQueuePatientMutation = useRegisterQueuePatient();

  const prioritizedWaitingQueue = useMemo(() => {
    if (!waitingQueue) return [];

    return [...waitingQueue].sort((a, b) => {
      const typeDiff = waitingSortOrder[a.appointmentType] - waitingSortOrder[b.appointmentType];
      if (typeDiff !== 0) return typeDiff;

      if (
        a.appointmentType === 'SCHEDULED_APPOINTMENT' &&
        b.appointmentType === 'SCHEDULED_APPOINTMENT'
      ) {
        const scheduleDiff = (a.scheduledTime || '').localeCompare(b.scheduledTime || '');
        if (scheduleDiff !== 0) return scheduleDiff;
      }

      return new Date(a.checkedInAt).getTime() - new Date(b.checkedInAt).getTime();
    });
  }, [waitingQueue]);

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

  const handleRegistrationAction = async (entry: QueueEntry) => {
    const normalizedDocument = normalizeDocument(entry.patientDocument);

    if (!normalizedDocument) {
      setRegistrationEntry(entry);
      return;
    }

    setResolvingRegistrationEntryId(entry.id);

    try {
      const existingPatient = await findExactPatientByDocument(normalizedDocument);

      if (existingPatient?.userId) {
        await registerQueuePatientMutation.mutateAsync({
          queueEntryId: entry.id,
          patientId: Number(existingPatient.userId),
        });

        showSuccess(
          'Paciente existente vinculado',
          'La fila quedó asociada automáticamente al paciente ya registrado.',
        );
        return;
      }

      setRegistrationEntry(entry);
    } catch (error) {
      console.error('Error resolving queue patient registration', error);
      showError(
        'No se pudo vincular automáticamente',
        'Abrimos el alta manual para completar o revisar el caso.',
      );
      setRegistrationEntry(entry);
    } finally {
      setResolvingRegistrationEntryId(null);
    }
  };

  const buildActiveActions = (entry: QueueEntry): QueueAction[] => {
    const canMoveToMedicalWaiting =
      entry.appointmentType === 'SCHEDULED_APPOINTMENT' && !requiresRegistration(entry);

    if (entry.status === 'ATTENDING') {
      const actions: QueueAction[] = [];

      if (requiresRegistration(entry)) {
        const isResolvingRegistration =
          resolvingRegistrationEntryId === entry.id ||
          registerQueuePatientMutation.isPending;

        actions.push({
          icon: UserPlus,
          label: isResolvingRegistration
            ? 'Vinculando paciente...'
            : 'Dar de alta paciente',
          onClick: () => void handleRegistrationAction(entry),
          disabled: isResolvingRegistration,
          className:
            'border-emerald-200 bg-white text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50',
        });
      }

      actions.push({
        icon: CheckCircle,
        label: 'Cerrar trámite',
        onClick: () => completedMutation.mutate(entry.id),
        disabled: completedMutation.isPending,
        className:
          'border-slate-900 bg-slate-900 text-white hover:border-slate-950 hover:bg-slate-800 shadow-slate-950/15',
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
      const isResolvingRegistration =
        resolvingRegistrationEntryId === entry.id ||
        registerQueuePatientMutation.isPending;
      actions.push({
        icon: UserPlus,
        label: isResolvingRegistration
          ? 'Vinculando paciente...'
          : 'Dar de alta paciente',
        onClick: () => void handleRegistrationAction(entry),
        disabled: isResolvingRegistration,
        className:
          'border-emerald-200 bg-white text-emerald-800 hover:border-emerald-300 hover:bg-emerald-50',
      });
    }

    if (canMoveToMedicalWaiting) {
      actions.push({
        icon: ArrowRightCircle,
        label: 'Pasar a espera médica',
        onClick: () => confirmArrivalMutation.mutate(entry.id),
        disabled: confirmArrivalMutation.isPending,
        className:
          'border-amber-500 bg-amber-500 text-white hover:border-amber-600 hover:bg-amber-600 shadow-amber-950/15',
      });
    } else {
      actions.push({
        icon: CheckCircle,
        label: 'Cerrar trámite',
        onClick: () => completedMutation.mutate(entry.id),
        disabled: completedMutation.isPending,
        className:
          'border-slate-900 bg-slate-900 text-white hover:border-slate-950 hover:bg-slate-800 shadow-slate-950/15',
      });
    }

    if (!requiresRegistration(entry)) {
      actions.push({
        icon: UserX,
        label: 'Marcar ausente',
        onClick: () => noShowMutation.mutate(entry.id),
        disabled: noShowMutation.isPending,
        className:
          'border-rose-200 bg-white text-rose-700 hover:border-rose-300 hover:bg-rose-50',
      });
    }

    return actions.slice(0, 3);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            Cola del Día
          </h1>
          <p className="text-sm text-muted-foreground">
            Usá Recepción o Ventanilla para llamar al siguiente paciente.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Button type="button" variant="outline" onClick={handleRefresh}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <CallDestinationButtons
            onCall={handleCallNext}
            disabled={callNextMutation.isPending || prioritizedWaitingQueue.length === 0}
          />
        </div>
      </div>

      {prioritizedWaitingQueue.length === 0 && !loadingWaiting && (
        <p className="text-sm text-muted-foreground">
          No hay pacientes en espera para llamar.
        </p>
      )}

      {activeQueue && activeQueue.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <UserCheck className="h-5 w-5 text-greenPrimary" />
              Pacientes activos
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
              >
                {activeQueue.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="w-[92px]">Turno</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Destino</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="min-w-[360px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeQueue.map((entry) => (
                    <TableRow key={entry.id} className="border-slate-100">
                      <TableCell className="align-top">
                        <span className="text-2xl font-semibold tracking-tight text-slate-900">
                          {entry.displayNumber}
                        </span>
                      </TableCell>
                      <TableCell className="align-top">
                        <div className="space-y-2.5">
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-900">{entry.patientName}</p>
                            <p className="text-sm text-slate-500">
                              DNI {entry.patientDocument}
                            </p>
                          </div>
                          <PatientBadges entry={entry} />
                        </div>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-full px-3 py-1 text-sm font-semibold',
                            getServicePointBadgeClass(entry.servicePoint),
                          )}
                        >
                          {formatServicePoint(entry.servicePoint)}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <Badge
                          variant="outline"
                          className={cn(
                            'rounded-full px-3 py-1 text-sm font-medium',
                            statusStyles[entry.status],
                          )}
                        >
                          {statusLabels[entry.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="align-top">
                        <ActionButtons actions={buildActiveActions(entry)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="h-5 w-5 text-greenPrimary" />
            Cola del Día
            {prioritizedWaitingQueue.length > 0 && (
              <Badge
                variant="outline"
                className="rounded-full border-slate-200 bg-slate-50 text-slate-600"
              >
                {prioritizedWaitingQueue.length}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {loadingWaiting ? (
            <div className="space-y-2">
              {[1, 2, 3].map((item) => (
                <Skeleton key={item} className="h-16 w-full" />
              ))}
            </div>
          ) : prioritizedWaitingQueue.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="w-[92px]">Turno</TableHead>
                    <TableHead>Paciente</TableHead>
                    <TableHead>Atención</TableHead>
                    <TableHead className="w-[96px]">Hora</TableHead>
                    <TableHead className="w-[148px]">Espera</TableHead>
                    <TableHead className="min-w-[340px] text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prioritizedWaitingQueue.map((entry) => {
                    const waitTimeColors = getWaitingTimeColor(entry.waitingTimeMinutes);
                    const attention = getAttentionLabels(entry);
                    const isResolvingRegistration =
                      resolvingRegistrationEntryId === entry.id ||
                      registerQueuePatientMutation.isPending;

                    return (
                      <TableRow
                        key={entry.id}
                        className={cn(
                          'border-slate-100 transition-colors',
                          appointmentTypeRowStyles[entry.appointmentType],
                        )}
                      >
                        <TableCell className="align-top">
                          <span className="text-2xl font-semibold tracking-tight text-slate-900">
                            {entry.displayNumber}
                          </span>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2.5">
                            <div className="space-y-1">
                              <p className="font-semibold text-slate-900">{entry.patientName}</p>
                              <p className="text-sm text-slate-500">
                                DNI {entry.patientDocument}
                              </p>
                            </div>
                            <PatientBadges entry={entry} />
                            {requiresRegistration(entry) && (
                              <p className="text-xs font-medium text-amber-700">
                                Debe darse de alta antes de pasar a espera médica.
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-1">
                            <p className="font-medium text-slate-900">{attention.primary}</p>
                            {attention.secondary && (
                              <p className="text-sm text-slate-500">{attention.secondary}</p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="align-top text-sm font-medium text-slate-700">
                          {formatQueueHour(entry)}
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className={cn(
                                'rounded-full border px-3 py-1 font-mono text-xs font-medium',
                                waitTimeColors.text,
                                waitTimeColors.bg,
                                waitTimeColors.border,
                              )}
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {formatSecretaryWaitingTime(entry.waitingTimeMinutes)}
                            </Badge>
                            {entry.waitingTimeMinutes !== undefined &&
                              entry.waitingTimeMinutes > 60 && (
                                <span title="Tiempo de espera prolongado">
                                  <AlertTriangle className="h-4 w-4 text-rose-500" />
                                </span>
                              )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right align-top">
                          <div className="flex flex-col items-end gap-2">
                            <CallDestinationButtons
                              onCall={(servicePoint) => handleCallSpecific(entry, servicePoint)}
                              disabled={callSpecificMutation.isPending}
                              compact
                            />
                            {requiresRegistration(entry) && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-9 border-amber-200 bg-white px-3 text-amber-800 hover:bg-amber-50"
                                onClick={() => void handleRegistrationAction(entry)}
                                disabled={isResolvingRegistration}
                              >
                                <UserPlus className="mr-2 h-4 w-4" />
                                {isResolvingRegistration
                                  ? 'Vinculando paciente...'
                                  : 'Dar de alta paciente'}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-10 text-center text-muted-foreground">
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
