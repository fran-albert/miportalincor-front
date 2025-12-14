import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { useDoctorWaitingQueue, useDoctorQueueStats } from '@/hooks/Queue';

/**
 * Widget compacto para mostrar en el Dashboard del médico.
 * Muestra un resumen de la sala de espera y acceso rápido.
 */
export const DoctorQueueWidget = () => {
  const navigate = useNavigate();
  const { data: queue, isLoading: loadingQueue } = useDoctorWaitingQueue();
  const { data: stats, isLoading: loadingStats } = useDoctorQueueStats();

  const waitingPatients = queue?.filter((e) => e.status === 'WAITING') || [];
  const nextPatient = waitingPatients[0];

  const getWaitTime = (checkedInAt: string) => {
    const diff = Date.now() - new Date(checkedInAt).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Mi Sala de Espera
          </CardTitle>
          {!loadingStats && (stats?.waiting ?? 0) > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {stats?.waiting} en espera
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loadingQueue || loadingStats ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : waitingPatients.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay pacientes en espera</p>
          </div>
        ) : (
          <>
            {/* Próximo paciente */}
            <div className="bg-muted/50 rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-1">Próximo paciente</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold">{nextPatient.patientName}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-mono">{nextPatient.displayNumber}</span>
                    <span>·</span>
                    <span>{nextPatient.scheduledTime}</span>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {getWaitTime(nextPatient.checkedInAt)}
                </Badge>
              </div>
            </div>

            {/* Resumen de otros pacientes */}
            {waitingPatients.length > 1 && (
              <p className="text-sm text-muted-foreground text-center">
                +{waitingPatients.length - 1} paciente{waitingPatients.length > 2 ? 's' : ''} más en espera
              </p>
            )}
          </>
        )}

        {/* Botón de acceso */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate('/mi-sala-de-espera')}
        >
          Ver sala de espera
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default DoctorQueueWidget;
