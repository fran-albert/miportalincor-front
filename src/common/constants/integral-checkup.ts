/**
 * Control ginecológico integral: la paciente reserva en un solo paso la
 * consulta y la ecografía, que entra 15 minutos antes.
 *
 * Config de instancia (datos de Incor): quién es la ginecóloga que ofrece el
 * control y con qué color se lo distingue. Los horarios los resuelve el
 * backend; el front solo muestra los días que le devuelve.
 */

/** Victoria Tudela: la única profesional que hoy ofrece el control. */
export const INTEGRAL_CHECKUP_DOCTOR_ID = 388;

export const INTEGRAL_CHECKUP_LABEL = "Control ginecológico integral";

export const INTEGRAL_CHECKUP_SHORT_LABEL = "Control integral";

/**
 * El fucsia del control integral.
 *
 * NO sale de `consultation_types.color`: se pinta por ser parte de un control
 * vinculado, con prioridad sobre el color del tipo, para que los turnos
 * comunes de esos mismos tipos sigan viéndose como siempre.
 */
export const INTEGRAL_CHECKUP_COLORS = {
  background: "#fce7f3",
  text: "#9d174d",
  border: "#db2777",
} as const;
