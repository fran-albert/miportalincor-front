import { PatientSummary } from "@/types/Prescription-Request/Prescription-Request";

export function getPatientHealthInsuranceName(
  patient?: PatientSummary | null
): string | undefined {
  return (
    patient?.healthInsuranceName || patient?.healthPlans?.[0]?.healthInsurance?.name
  );
}
