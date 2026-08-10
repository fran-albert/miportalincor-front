/**
 * La cobertura del paciente, tal como se muestra en el bloque del turno.
 *
 * Se arma con lo que haya: un paciente sin obra social cargada pero con número
 * de afiliado mostraba literalmente "undefined 12345" en la agenda. Si no hay
 * ninguno de los dos devuelve string vacío, para que quien lo use lo pueda
 * descartar con un `filter(Boolean)`.
 */
export const buildPatientCoverageLabel = (
  healthInsurance?: string,
  affiliationNumber?: string,
): string => [healthInsurance, affiliationNumber].filter(Boolean).join(" ");
