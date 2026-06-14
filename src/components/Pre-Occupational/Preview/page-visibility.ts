// Helpers de visibilidad de paginas del informe preocupacional.
// Regla uniforme: una pagina/seccion aparece solo si tiene datos cargados.

interface ClinicalPageInput {
  aspectoGeneral?: string;
  peso?: string;
  talla?: string;
  imc?: string;
  agudezaSc?: { right?: string; left?: string };
  agudezaCc?: { right?: string; left?: string };
  visionCromatica?: "normal" | "anormal";
  notasVision?: string;
}

const hasText = (value?: string): boolean => Boolean(value && value.trim());

/**
 * Determina si la pagina de Examen Clinico (pagina 2) tiene algun dato cargado:
 * aspecto general, mediciones (peso/talla/imc), agudeza visual, vision cromatica
 * u observaciones de vision. Si no hay nada, la pagina no debe imprimirse.
 */
export function hasClinicalPageData(input: ClinicalPageInput): boolean {
  const hasClinical =
    hasText(input.aspectoGeneral) ||
    hasText(input.peso) ||
    hasText(input.talla) ||
    hasText(input.imc);

  const hasVisual =
    hasText(input.agudezaSc?.right) ||
    hasText(input.agudezaSc?.left) ||
    hasText(input.agudezaCc?.right) ||
    hasText(input.agudezaCc?.left) ||
    input.visionCromatica === "normal" ||
    input.visionCromatica === "anormal" ||
    hasText(input.notasVision);

  return hasClinical || hasVisual;
}
