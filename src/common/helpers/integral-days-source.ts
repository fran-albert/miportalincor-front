/**
 * De dónde salen los días del control ginecológico integral para quien está
 * mirando la pantalla.
 *
 * 🔴 Hay **dos endpoints y cuatro roles**, así que la cuenta no cierra por
 * negación. Decidir con "¿no es paciente?" mandaba a la médica al listado de
 * secretaría —que le contesta 403— y le dejaba el listado muerto justo cuando
 * quería mover su propio control. Acá se decide por **capacidad**: quién mira
 * la grilla del personal (la clínica, desde adentro) y quién mira la suya (la
 * paciente, en su portal).
 *
 * Los roles del personal se enumeran en un solo lugar y el default es la
 * grilla de la paciente: **un rol nuevo no hereda** el listado del personal
 * por descarte. Sumar un rol del personal mañana es sumarlo a esta lista, y el
 * test enumera los cuatro roles de hoy.
 */

export type IntegralDaysSource = "staff" | "patient";

/** Los flags de rol tal como los devuelve `useUserRole`. */
export interface IntegralDaysViewerRoles {
  isPatient?: boolean;
  isDoctor?: boolean;
  isSecretary?: boolean;
  isAdmin?: boolean;
}

/** Quiénes trabajan desde adentro de la clínica y ven la grilla del personal. */
const STAFF_ROLE_FLAGS = [
  "isSecretary",
  "isAdmin",
  "isDoctor",
] as const satisfies ReadonlyArray<keyof IntegralDaysViewerRoles>;

export const integralDaysSource = (
  roles: IntegralDaysViewerRoles,
): IntegralDaysSource =>
  STAFF_ROLE_FLAGS.some((flag) => roles[flag] === true) ? "staff" : "patient";
