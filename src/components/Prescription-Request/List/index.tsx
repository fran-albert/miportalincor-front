import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import PrescriptionRequestCard from "../Card";
import { FileText } from "lucide-react";

interface PrescriptionRequestListProps {
  requests: PrescriptionRequest[];
  userRole: "patient" | "doctor";
  onView?: (request: PrescriptionRequest) => void;
  onCancel?: (request: PrescriptionRequest) => void;
  onTake?: (request: PrescriptionRequest) => void;
  onComplete?: (request: PrescriptionRequest) => void;
  onReject?: (request: PrescriptionRequest) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function PrescriptionRequestList({
  requests,
  userRole,
  onView,
  onCancel,
  onTake,
  onComplete,
  onReject,
  isLoading = false,
  emptyMessage = "No hay solicitudes de recetas",
}: PrescriptionRequestListProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-sm text-gray-500">
          {userRole === "patient"
            ? "Cuando solicite una receta, aparecera aqui"
            : "Cuando un paciente solicite una receta, aparecera aqui"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
      {requests.map((request) => (
        <PrescriptionRequestCard
          key={request.id}
          request={request}
          userRole={userRole}
          onView={onView}
          onCancel={onCancel}
          onTake={onTake}
          onComplete={onComplete}
          onReject={onReject}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
