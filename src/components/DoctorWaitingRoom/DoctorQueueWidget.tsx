import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ArrowRight, UserCheck, AlertTriangle } from 'lucide-react';
import { useDoctorWaitingQueue } from '@/hooks/Doctor/useDoctorWaitingQueue';
import { formatWaitingTime, getWaitingTimeColor } from '@/common/helpers/helpers';

/**
 * Widget compacto para mostrar en el Dashboard del médico.
 * Muestra un resumen de la sala de espera y acceso rápido.
 * Usa el endpoint /queue/waiting que devuelve waitingTimeMinutes del backend.
 */
export const DoctorQueueWidget = () => {
  const navigate = useNavigate();
  const { waitingQueue, isLoading } = useDoctorWaitingQueue({ refetchInterval: 15000 });

  const nextPatient = waitingQueue[0];

  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Mi Sala de Espera
          </CardTitle>
          {!isLoading && waitingQueue.length > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {waitingQueue.length} en espera
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : waitingQueue.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No hay pacientes en espera</p>
          </div>
        ) : (
          <>
            {/* Próximo paciente */}
            {(() => {
              const waitingMinutes = nextPatient.waitingTimeMinutes;
              const waitTimeColors = getWaitingTimeColor(waitingMinutes);
              const type = nextPatient.overturnId ? 'Sobreturno' : 'Turno';

              return (
                <div className="bg-muted/50 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Próximo paciente</p>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-semibold">{nextPatient.patientName}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono">{nextPatient.scheduledTime}</span>
                        <span>·</span>
                        <span>{type}</span>
                      </div>
                      {waitingMinutes !== undefined && (
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant="outline"
                            className={`text-xs font-mono ${waitTimeColors.text} ${waitTimeColors.bg} ${waitTimeColors.border}`}
                          >
                            <Clock className="h-3 w-3 mr-1" />
                            Esperando {formatWaitingTime(waitingMinutes)}
                          </Badge>
                          {waitingMinutes > 60 && (
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Resumen de otros pacientes */}
            {waitingQueue.length > 1 && (
              <p className="text-sm text-muted-foreground text-center">
                +{waitingQueue.length - 1} paciente{waitingQueue.length > 2 ? 's' : ''} más en espera
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
