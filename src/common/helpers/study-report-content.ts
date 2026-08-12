/**
 * Aplica al contenido del informe el valor que acaba de escribir la médica.
 *
 * Los cuadros numéricos del editor mandan `event.target.valueAsNumber`, que es
 * NaN mientras el cuadro está vacío o a medio tipear ("1.", "-"). Guardar ese
 * NaN como "" metía un texto en un campo numérico y el backend rechazaba el
 * autoguardado entero: la médica seguía escribiendo, la previsualización le
 * mostraba la copia vieja del servidor y no se persistía nada hasta que volvía
 * a poner un número válido en ese cuadro (bug de producción del 2026-08-10,
 * reportado por la ecografista).
 *
 * Vaciar un campo es sacarlo del contenido, no ponerle "".
 */
export function applyStudyReportField(
  content: Record<string, unknown>,
  fieldKey: string,
  value: string | number,
): Record<string, unknown> {
  if (typeof value === "number" && Number.isNaN(value)) {
    const next = { ...content };
    delete next[fieldKey];
    return next;
  }

  return { ...content, [fieldKey]: value };
}
