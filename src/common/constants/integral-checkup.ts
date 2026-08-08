/**
 * Control ginecológico integral: la paciente reserva en un solo paso la
 * consulta y la ecografía, que entra 15 minutos antes.
 *
 * Config de instancia (datos de Incor): quién es la ginecóloga que ofrece el
 * control. Los horarios los resuelve el backend; el front solo muestra los
 * días que le devuelve.
 */

/** Victoria Tudela: la única profesional que hoy ofrece el control. */
export const INTEGRAL_CHECKUP_DOCTOR_ID = 388;

export const INTEGRAL_CHECKUP_LABEL = "Control ginecológico integral";

export const INTEGRAL_CHECKUP_SHORT_LABEL = "Control integral";

/**
 * El fucsia **vive en el catálogo**, no acá: sale del tipo de consulta
 * "Control Ginecológico Integral" y viaja en `integralCheckup.color` (y en
 * `colorControlIntegral` para la sala de espera), porque el sobreturno no
 * puede tener tipo.
 *
 * Este valor es solo el **fallback** para cuando el backend no lo manda —por
 * ejemplo si el tipo todavía no está sembrado—: sirve para que el turno se
 * siga distinguiendo en vez de quedar pintado como uno común. Si querés
 * cambiar el color del control, cambialo en el catálogo.
 */
export const INTEGRAL_CHECKUP_FALLBACK_COLOR = "#D946EF";
