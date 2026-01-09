import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Clock, ArrowRight, UserCheck } from 'lucide-react';
import { useDoctorDayAgenda, isWaiting } from '@/hooks/Doctor/useDoctorDayAgenda';

/**
 * Widget compacto para mostrar en el Dashboard del médico.
 * Muestra un resumen de la sala de espera y acceso rápido.
 * Usa la misma fuente de datos que la página de sala de espera.
 */
export const DoctorQueueWidget = () => {
  const navigate = useNavigate();
  const { agenda, stats, isLoading } = useDoctorDayAgenda({ refetchInterval: 15000 });

  const waitingPatients = agenda.filter((item) => isWaiting(item.status));
  const nextPatient = waitingPatients[0];

  const getPatientName = (patient: { firstName: string; lastName: string } | null) => {
    if (!patient) return 'Sin paciente';
    return `${patient.lastName}, ${patient.firstName}`;
  };

  return (
    <Card className="border-l-4 border-l-teal-500">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-teal-600" />
            Mi Sala de Espera
          </CardTitle>
          {!isLoading && stats.waiting > 0 && (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
              {stats.waiting} en espera
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
                  <p className="font-semibold">{getPatientName(nextPatient.patient)}</p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-mono">{nextPatient.hour}</span>
                    <span>·</span>
                    <span>{nextPatient.type === 'appointment' ? 'Turno' : 'Sobreturno'}</span>
                  </div>
                </div>
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
