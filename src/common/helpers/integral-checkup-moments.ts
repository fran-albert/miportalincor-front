import { INTEGRAL_CHECKUP_ULTRASOUND_DEFAULT_LABEL } from "@/common/constants/integral-checkup";
import type { IntegralCheckupSlot } from "@/types/Appointment/Appointment";

/** Un momento del control, tal como se le muestra a la paciente. */
export interface IntegralMoment {
  /** `HH:MM`. */
  hour: string;
  label: string;
  kind: "ULTRASOUND" | "CONSULTATION";
}

type Slot = Pick<
  IntegralCheckupSlot,
  "consultationHour" | "ultrasoundHour" | "ultrasoundPublicLabel"
>;

/** Minutos desde medianoche de un `HH:MM`. */
const minutos = (hora: string): number =>
  Number(hora.slice(0, 2)) * 60 + Number(hora.slice(3, 5));

/**
 * Cómo se nombra la ecografía frente a la paciente.
 *
 * 🔴 Lo decide el BACKEND, no el front. Cuando el catálogo impone un nombre
 * público —"Ecografía" a secas, porque el subtipo lo indica la médica y la
 * paciente no lo ve— lo manda en el slot. Cuando no manda nada, el portal
 * escribe el texto de siempre. Así esta pantalla no tiene que preguntar en qué
 * circuito está: muestra lo que le mandan.
 */
const etiquetaDeLaEco = (slot: Slot): string =>
  slot.ultrasoundPublicLabel?.trim() || INTEGRAL_CHECKUP_ULTRASOUND_DEFAULT_LABEL;

/**
 * Los dos momentos del control, **ordenados por hora**.
 *
 * 🔴 El orden sale de los datos, no del nombre de los campos. Hasta agosto de
 * 2026 la ecografía iba primero y la consulta después; desde septiembre es al
 * revés. Si el front cableara "primero la eco", la pantalla mentiría el día
 * que la clínica invierta el circuito — y lo invirtió. Los dos horarios los
 * manda el backend; acá solo se comparan.
 *
 * `HH:MM` con ceros a la izquierda se ordena bien como texto ("09:00" <
 * "10:40"), que es la forma en la que viajan.
 */
export const integralMomentsInOrder = (
  slot: Slot,
  doctorLabel: string,
): IntegralMoment[] =>
  [
    {
      hour: slot.ultrasoundHour,
      label: etiquetaDeLaEco(slot),
      kind: "ULTRASOUND" as const,
    },
    {
      hour: slot.consultationHour,
      label: doctorLabel ? `Consulta con ${doctorLabel}` : "Consulta",
      kind: "CONSULTATION" as const,
    },
  ].sort((a, b) => a.hour.localeCompare(b.hour));

/**
 * La línea corta que resume el día en el listado ("Consulta 10:20 hs ·
 * Ecografía 10:40 hs"), en el mismo orden en el que va a pasar.
 *
 * Acá la eco se nombra siempre "Ecografía": es el listado de días, donde nunca
 * se dijo el subtipo.
 */
export const integralDaySummary = (slot: Slot): string =>
  integralMomentsInOrder(slot, "")
    .map((moment) =>
      moment.kind === "ULTRASOUND"
        ? `Ecografía ${moment.hour} hs`
        : `Consulta ${moment.hour} hs`,
    )
    .join(" · ");

/**
 * Cómo explicarle a la paciente en qué orden le toca cada cosa.
 *
 * La separación se **mide** entre los dos horarios en vez de afirmar un número
 * fijo: eran 15 minutos mientras la eco iba antes, y con la consulta primero
 * depende del día (la grilla de las dos médicas no da lo mismo el miércoles
 * que el jueves). Un "15 minutos" escrito a mano se volvía mentira.
 */
export const integralOrderHint = (slot: Slot): string => {
  const diferencia = Math.abs(
    minutos(slot.consultationHour) - minutos(slot.ultrasoundHour),
  );
  const ecoPrimero = slot.ultrasoundHour < slot.consultationHour;
  const cuando = ecoPrimero ? "antes de" : "después de";
  return `La ecografía es ${diferencia} minutos ${cuando} la consulta: en una sola visita te hacés las dos cosas.`;
};
