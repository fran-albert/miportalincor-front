import { searchPatients } from '@/api/Patient/search-patients.action';
import type { Patient } from '@/types/Patient/Patient';
import type { ApiError } from '@/types/Error/ApiError';

// Mensaje exacto del backend (queue.service) cuando la fila ya quedó
// vinculada a un paciente distinto: el alta manual no lo resuelve.
export const QUEUE_LINKED_TO_OTHER_PATIENT_MESSAGE =
  'Esta fila ya está vinculada a otro paciente.';

export const getApiErrorMessage = (error: unknown): string | undefined => {
  const apiError = error as ApiError;
  return apiError.response?.data?.message || apiError.message;
};

export const normalizeDocument = (value?: string | null): string =>
  (value ?? '').replace(/\D/g, '').trim();

export const findExactPatientByDocument = async (
  document: string,
): Promise<Patient | null> => {
  const normalizedDocument = normalizeDocument(document);

  if (!normalizedDocument) {
    return null;
  }

  const response = await searchPatients({
    search: normalizedDocument,
    page: 1,
    limit: 10,
  });

  return (
    response.data.find((patient) => {
      const normalizedUserName = normalizeDocument(patient.userName);
      const normalizedDni = normalizeDocument(patient.dni);

      return (
        normalizedUserName === normalizedDocument ||
        normalizedDni === normalizedDocument
      );
    }) ?? null
  );
};
