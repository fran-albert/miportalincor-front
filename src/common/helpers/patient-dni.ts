import { isAxiosError } from "axios";

export const DNI_FORMAT_MESSAGE =
  "El DNI debe tener entre 6 y 10 números, sin puntos ni espacios.";

const DNI_PATTERN = /^\d{6,10}$/;

/** "20.181.345", "20 181 345" o "20-181-345" -> "20181345". */
export const normalizeDni = (value: string | null | undefined): string =>
  (value ?? "").replace(/\D/g, "");

export const isValidDni = (value: string | null | undefined): boolean =>
  DNI_PATTERN.test(normalizeDni(value));

export interface PatientUpdateError {
  message: string;
  field?: "userName";
}

interface PatientUpdateErrorBody {
  message?: string | string[];
  code?: string;
  field?: string;
}

const GENERIC_ERROR = "Ha ocurrido un error inesperado";
const NETWORK_ERROR =
  "No se pudo conectar con el servidor. Revisá la conexión e intentá de nuevo.";

/**
 * Traduce el error de PUT /patient/:id a un texto para la secretaria y, si
 * corresponde, al campo del formulario donde mostrarlo. La API devuelve 409
 * con `code` PATIENT_DNI_* y `field: "userName"` cuando el DNI ya existe, y
 * 400 con un array de mensajes cuando falla la validacion.
 */
export const getPatientUpdateError = (error: unknown): PatientUpdateError => {
  if (!isAxiosError<PatientUpdateErrorBody>(error)) {
    return { message: GENERIC_ERROR };
  }

  if (!error.response) {
    return { message: NETWORK_ERROR };
  }

  const body = error.response.data ?? {};
  const messages = (Array.isArray(body.message) ? body.message : [body.message])
    .filter((text): text is string => typeof text === "string")
    .map((text) => text.trim())
    .filter((text) => text.length > 0);
  const message = messages.length > 0 ? messages.join(". ") : GENERIC_ERROR;

  const isDniError =
    body.field === "userName" ||
    (body.code ?? "").startsWith("PATIENT_DNI_") ||
    messages.some((text) => /\bDNI\b/.test(text));

  return isDniError ? { message, field: "userName" } : { message };
};
