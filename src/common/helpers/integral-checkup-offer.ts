import type { IntegralCheckupConfig } from "@/types/Appointment/Appointment";

/**
 * ¿El médico que eligió la secretaria ofrece el control ginecológico integral?
 *
 * 🔴 **El front no sabe quién es la ginecóloga: pregunta.** Quién atiende el
 * control es config de instancia —hoy en Incor es una ginecóloga concreta, en
 * otra clínica sería otra— y viaja en `/appointments/integral/config`. Acá solo
 * se compara. Si el id estuviera escrito en esta función, cambiar de
 * profesional costaría un deploy del front y otra clínica necesitaría un fork.
 *
 * Se compara contra la médica de la **consulta**: el control se da desde su
 * agenda (es la que la secretaria elige cuando carga el turno), y la eco se
 * crea sola en la agenda de la ecografista. Elegir a la ecografista no ofrece
 * el control: desde ahí no hay control que dar, hay una eco suelta.
 *
 * Sin respuesta del backend devuelve `false`: la modalidad no aparece "por las
 * dudas" mientras no se sabe.
 */
export const doctorOffersIntegralCheckup = (
  config: IntegralCheckupConfig | undefined,
  doctorId: number | undefined,
): boolean =>
  Boolean(config) &&
  Boolean(doctorId) &&
  config?.consultationDoctorId === doctorId;
