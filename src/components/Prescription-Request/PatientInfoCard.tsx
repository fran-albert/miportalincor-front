import { PatientSummary } from "@/types/Prescription-Request/Prescription-Request";
import { User } from "lucide-react";
import { getPatientHealthInsuranceName } from "./utils/patientInfo";

interface PatientInfoCardProps {
  patient?: PatientSummary | null;
  variant?: "card" | "embedded";
}

export default function PatientInfoCard({
  patient,
  variant = "card",
}: PatientInfoCardProps) {
  if (!patient) return null;

  const patientHealthInsurance = getPatientHealthInsuranceName(patient);
  const fullName = [patient.firstName, patient.lastName].filter(Boolean).join(" ");
  const content = (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
        <User className="h-4 w-4 text-blue-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-blue-900">Paciente</p>
        <p className="text-sm text-blue-700 mt-1">{fullName}</p>
        {patient.phoneNumber && (
          <p className="text-xs text-blue-600 mt-0.5">
            Tel: {patient.phoneNumber}
          </p>
        )}
        {patientHealthInsurance && (
          <p className="text-xs text-blue-600 mt-0.5">
            Obra social: {patientHealthInsurance}
          </p>
        )}
        {patient.affiliationNumber && (
          <p className="text-xs text-blue-600 mt-0.5">
            Nro. afiliado: {patient.affiliationNumber}
          </p>
        )}
      </div>
    </div>
  );

  if (variant === "embedded") {
    return content;
  }

  return (
    <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
      {content}
    </div>
  );
}
