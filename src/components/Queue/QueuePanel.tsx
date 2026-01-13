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
import type { QueueEntry, QueueStatus, AppointmentType } from '@/types/Queue';
import { useQueryClient } from '@tanstack/react-query';
import { queueKeys } from '@/hooks/Queue';

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

export const QueuePanel = () => {
  const queryClient = useQueryClient();
  const [servicePoint, setServicePoint] = useState('Consultorio 1');
  const [callDialogOpen, setCallDialogOpen] = useState(false);

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

  const getWaitTime = (checkedInAt: string) => {
    const diff = Date.now() - new Date(checkedInAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
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
              Llamar Siguiente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Llamar al siguiente paciente</DialogTitle>
              <DialogDescription>
                Ingrese el punto de atención (consultorio, box, etc.)
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                value={servicePoint}
                onChange={(e) => setServicePoint(e.target.value)}
                placeholder="Ej: Consultorio 1"
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
                {callNextMutation.isPending ? 'Llamando...' : 'Llamar'}
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
              Pacientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Turno</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead>Consultorio</TableHead>
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
                  <TableHead>Esperando</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitingQueue.map((entry) => (
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
                      <Badge variant="outline" className="font-mono">
                        {getWaitTime(entry.checkedInAt)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCallSpecific(entry)}
                        disabled={callSpecificMutation.isPending}
                      >
                        <PhoneCall className="mr-1 h-3 w-3" />
                        Llamar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
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
