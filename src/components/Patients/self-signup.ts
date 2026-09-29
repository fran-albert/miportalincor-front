import { Patient } from "@/types/Patient/Patient";

export const isUnverifiedSelfSignup = (
  patient: Pick<Patient, "registrationSource" | "verifiedAt">
): boolean => patient.registrationSource === "SELF_SIGNUP" && !patient.verifiedAt;
