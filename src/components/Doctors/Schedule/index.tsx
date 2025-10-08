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
import { toast } from "sonner";
import ErrorToast from "@/components/Toast/Error";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  duracionTurno?: string;
  turnoMañanaActivo?: boolean;
  turnoMañanaInicio?: string;
  turnoMañanaFin?: string;
  turnoTardeActivo?: boolean;
  turnoTardeInicio?: string;
  turnoTardeFin?: string;
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
      duracionTurno: "30",
      turnoMañanaActivo: false,
      turnoMañanaInicio: "09:00",
      turnoMañanaFin: "12:00",
      turnoTardeActivo: false,
      turnoTardeInicio: "14:00",
      turnoTardeFin: "17:00",
    }))
  );
  useEffect(() => {
    if (!isLoading && availData) {
      const mapped: HorarioEditable[] = DIAS_SEMANA.map(
        ({ nombre, weekDay }) => {
          // todos los bloques de ese día, ordenados
          const bloques = availData
            .filter((h: any) => h.weekDay === weekDay)
            .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

          const manana = bloques[0];
          const tarde = bloques[1];

          return {
            id: undefined,
            dia: nombre,
            weekDay,
            activo: bloques.length > 0,

            // estas tres no pueden faltar
            horaInicio: manana ? manana.startTime.slice(0, 5) : "09:00",
            horaFin: tarde ? tarde.endTime.slice(0, 5) : "17:00",

            // slotDuration (tomamos de mañana si existe, si no de tarde)
            duracionTurno: (
              manana?.slotDuration ??
              tarde?.slotDuration ??
              30
            ).toString(),

            // bloques separados
            turnoMañanaActivo: Boolean(manana),
            turnoMañanaInicio: manana?.startTime.slice(0, 5),
            turnoMañanaFin: manana?.endTime.slice(0, 5),

            turnoTardeActivo: Boolean(tarde),
            turnoTardeInicio: tarde?.startTime.slice(0, 5),
            turnoTardeFin: tarde?.endTime.slice(0, 5),
          };
        }
      );

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

  // dentro de ScheduleDoctor, reemplaza tu handleGuardar por esto:

  const handleGuardar = () => {
    const prom = (async () => {
      // 1) Borro TODO lo que hubiera antes para este doctor
      for (const prev of availData!) {
        await deleteDoctorAvailabilityMutations.mutateAsync(prev.id!);
      }

      // 2) Recorro cada día y, si está activo, creo mañana/tarde según corresponda
      for (const h of horariosEditables) {
        if (!h.activo) continue;

        const slotDuration = Number(h.duracionTurno);

        // Mañana
        if (h.turnoMañanaActivo && h.turnoMañanaInicio && h.turnoMañanaFin) {
          await addDoctorAvailabilityMutations.mutateAsync({
            doctorId,
            weekDay: h.weekDay,
            startTime: `${h.turnoMañanaInicio}:00`,
            endTime: `${h.turnoMañanaFin}:00`,
            slotDuration,
          });
        }

        // Tarde
        if (h.turnoTardeActivo && h.turnoTardeInicio && h.turnoTardeFin) {
          await addDoctorAvailabilityMutations.mutateAsync({
            doctorId,
            weekDay: h.weekDay,
            startTime: `${h.turnoTardeInicio}:00`,
            endTime: `${h.turnoTardeFin}:00`,
            slotDuration,
          });
        }
      }
    })();

    toast.promise(prom, {
      loading: <LoadingToast message="Guardando disponibilidad…" />,
      success: (
        <SuccessToast message="Horarios actualizados correctamente 🎉" />
      ),
      error: (err) => (
        <ErrorToast message={`Error al guardar: ${(err as Error).message}`} />
      ),
    });
  };

  const saving =
    addDoctorAvailabilityMutations.isPending ||
    deleteDoctorAvailabilityMutations.isPending ||
    updateDoctorAvailabilityMutations.isPending;

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <p>Cargando horarios...</p>
      </div>
    );
  }

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
          {horariosEditables.map((horario, index) => (
            <div
              key={horario.dia}
              className="flex flex-col gap-4 p-4 border rounded-lg"
            >
              <div className="flex items-center gap-4">
                <div className="w-20">
                  <span className="font-medium">{horario.dia}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={horario.activo}
                    onCheckedChange={(checked) =>
                      actualizarHorario(index, "activo", checked)
                    }
                  />
                  <span className="text-sm text-muted-foreground">Activo</span>
                </div>
              </div>
              {horario.activo && (
                <>
                  {/* Turno Mañana */}
                  <div className="flex items-center gap-4">
                    <div className="w-20">
                      <span className="font-medium">Mañana</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={horario.turnoMañanaActivo}
                        onCheckedChange={(checked) =>
                          actualizarHorario(index, "turnoMañanaActivo", checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Activo
                      </span>
                    </div>
                    {horario.turnoMañanaActivo && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Inicio:</Label>
                          <Input
                            type="time"
                            value={horario.turnoMañanaInicio}
                            onChange={(e) =>
                              actualizarHorario(
                                index,
                                "turnoMañanaInicio",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Fin:</Label>
                          <Input
                            type="time"
                            value={horario.turnoMañanaFin}
                            onChange={(e) =>
                              actualizarHorario(
                                index,
                                "turnoMañanaFin",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Duración:</Label>
                          <Select
                            value={horario.duracionTurno}
                            onValueChange={(value) =>
                              actualizarHorario(index, "duracionTurno", value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="10">10 min</SelectItem>
                              <SelectItem value="15">15 min</SelectItem>
                              <SelectItem value="20">20 min</SelectItem>
                              <SelectItem value="25">25 min</SelectItem>
                              <SelectItem value="30">30 min</SelectItem>
                              <SelectItem value="45">45 min</SelectItem>
                              <SelectItem value="60">60 min</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Turno Tarde */}
                  <div className="flex items-center gap-4">
                    <div className="w-20">
                      <span className="font-medium">Tarde</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={horario.turnoTardeActivo}
                        onCheckedChange={(checked) =>
                          actualizarHorario(index, "turnoTardeActivo", checked)
                        }
                      />
                      <span className="text-sm text-muted-foreground">
                        Activo
                      </span>
                    </div>
                    {horario.turnoTardeActivo && (
                      <>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Inicio:</Label>
                          <Input
                            type="time"
                            value={horario.turnoTardeInicio}
                            onChange={(e) =>
                              actualizarHorario(
                                index,
                                "turnoTardeInicio",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Fin:</Label>
                          <Input
                            type="time"
                            value={horario.turnoTardeFin}
                            onChange={(e) =>
                              actualizarHorario(
                                index,
                                "turnoTardeFin",
                                e.target.value
                              )
                            }
                            className="w-32"
                          />
                        </div>
                      </>
                    )}
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
