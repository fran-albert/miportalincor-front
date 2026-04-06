import { searchPatients } from '@/api/Patient/search-patients.action';
import type { Patient } from '@/types/Patient/Patient';

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
