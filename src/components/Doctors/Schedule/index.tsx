import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useDoctorAvalaibility } from "@/hooks/Doctor-Avalaibilty/useDoctorAvailability";
import { Clock, Save } from "lucide-react";
import { useDoctorAvailabilityMutations } from "@/hooks/Doctor-Avalaibilty/useDoctorAvailabilityMutations";

const DIAS_SEMANA = [
  { nombre: "Lunes", weekDay: 1 },
  { nombre: "Martes", weekDay: 2 },
  { nombre: "Miércoles", weekDay: 3 },
  { nombre: "Jueves", weekDay: 4 },
  { nombre: "Viernes", weekDay: 5 },
  { nombre: "Sábado", weekDay: 6 },
  { nombre: "Domingo", weekDay: 7 },
];

interface HorarioEditable {
  id?: number;
  dia: string;
  weekDay: number;
  activo: boolean;
  horaInicio: string;
  horaFin: string;
  descanso: string;
}

interface Props {
  doctorId: number;
}

export default function ScheduleDoctor({ doctorId }: Props) {
  const { doctor: availData, isLoading } = useDoctorAvalaibility({
    auth: true,
    id: doctorId,
  });
  const {
    addDoctorAvailabilityMutations,
    deleteDoctorAvailabilityMutations,
    updateDoctorAvailabilityMutations,
  } = useDoctorAvailabilityMutations();
  const [horariosEditables, setHorariosEditables] = useState<HorarioEditable[]>(
    DIAS_SEMANA.map((d) => ({
      id: undefined,
      dia: d.nombre,
      weekDay: d.weekDay,
      activo: false,
      horaInicio: "09:00",
      horaFin: "17:00",
      descanso: "",
    }))
  );
  useEffect(() => {
    if (!isLoading && availData) {
      const mapped = DIAS_SEMANA.map(({ nombre, weekDay }) => {
        const found = availData.find((h: any) => h.weekDay === weekDay);
        return {
          id: found?.id,
          dia: nombre,
          weekDay,
          activo: Boolean(found),
          horaInicio: found ? found.startTime.slice(0, 5) : "09:00",
          horaFin: found ? found.endTime.slice(0, 5) : "17:00",
          descanso: "",
        };
      });
      setHorariosEditables(mapped);
    }
  }, [availData, isLoading]);

  const actualizarHorario = (
    index: number,
    campo: keyof HorarioEditable,
    valor: any
  ) => {
    const nuevos = [...horariosEditables];
    nuevos[index] = { ...nuevos[index], [campo]: valor };
    setHorariosEditables(nuevos);
  };

  const handleGuardar = async () => {
    for (const h of horariosEditables) {
      const dto = {
        doctorId,
        weekDay: h.weekDay,
        startTime: `${h.horaInicio}:00`,
        endTime: `${h.horaFin}:00`,
      };
      if (h.activo) {
        if (h.id)
          await updateDoctorAvailabilityMutations.mutateAsync({
            id: h.id,
            dto,
          });
        else await addDoctorAvailabilityMutations.mutateAsync(dto);
      } else if (h.id) {
        await deleteDoctorAvailabilityMutations.mutateAsync(h.id);
      }
    }
  };
  const saving =
    addDoctorAvailabilityMutations.isPending ||
    deleteDoctorAvailabilityMutations.isPending ||
    updateDoctorAvailabilityMutations.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Configuración de Horarios
          </CardTitle>
          <Button onClick={handleGuardar} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Guardando..." : "Guardar Horarios"}
          </Button>
        </div>
        <CardDescription>
          Configure los horarios de atención del médico para cada día de la
          semana
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {horariosEditables.map((horario, i) => (
            <div
              key={horario.dia}
              className="flex items-center gap-4 p-4 border rounded-lg"
            >
              <div className="w-20">
                <span className="font-medium">{horario.dia}</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={horario.activo}
                  onCheckedChange={(val) => actualizarHorario(i, "activo", val)}
                />
                <span className="text-sm text-muted-foreground">Activo</span>
              </div>
              {horario.activo && (
                <>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Inicio:</Label>
                    <Input
                      type="time"
                      value={horario.horaInicio}
                      onChange={(e) =>
                        actualizarHorario(i, "horaInicio", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Fin:</Label>
                    <Input
                      type="time"
                      value={horario.horaFin}
                      onChange={(e) =>
                        actualizarHorario(i, "horaFin", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Label className="text-sm">Descanso:</Label>
                    <Input
                      placeholder="12:00-13:00"
                      value={horario.descanso}
                      onChange={(e) =>
                        actualizarHorario(i, "descanso", e.target.value)
                      }
                      className="w-32"
                    />
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
