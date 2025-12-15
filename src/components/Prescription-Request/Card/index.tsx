import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PrescriptionRequest,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";
import { StatusBadge } from "../StatusBadge";
import {
  FileText,
  Calendar,
  User,
  ExternalLink,
  Eye,
  X,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDateArgentina, formatDoctorName } from "@/common/helpers/helpers";

interface PrescriptionRequestCardProps {
  request: PrescriptionRequest;
  userRole: "patient" | "doctor";
  onView?: (request: PrescriptionRequest) => void;
  onCancel?: (request: PrescriptionRequest) => void;
  onTake?: (request: PrescriptionRequest) => void;
  onComplete?: (request: PrescriptionRequest) => void;
  onReject?: (request: PrescriptionRequest) => void;
  isLoading?: boolean;
}

export default function PrescriptionRequestCard({
  request,
  userRole,
  onView,
  onCancel,
  onTake,
  onComplete,
  onReject,
  isLoading = false,
}: PrescriptionRequestCardProps) {
  const isPending = request.status === PrescriptionRequestStatus.PENDING;
  const isInProgress = request.status === PrescriptionRequestStatus.IN_PROGRESS;
  const isCompleted = request.status === PrescriptionRequestStatus.COMPLETED;

  const getBorderColor = () => {
    switch (request.status) {
      case PrescriptionRequestStatus.PENDING:
        return "border-l-yellow-500";
      case PrescriptionRequestStatus.IN_PROGRESS:
        return "border-l-blue-500";
      case PrescriptionRequestStatus.COMPLETED:
        return "border-l-green-500";
      case PrescriptionRequestStatus.REJECTED:
        return "border-l-red-500";
      case PrescriptionRequestStatus.CANCELLED:
        return "border-l-gray-400";
      default:
        return "border-l-gray-300";
    }
  };

  return (
    <Card
      className={`border-l-4 ${getBorderColor()} hover:shadow-md transition-shadow cursor-pointer`}
      onClick={() => onView?.(request)}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-3">
          {/* Header - Status and Date */}
          <div className="flex items-center justify-between">
            <StatusBadge status={request.status} />
            <div className="flex items-center text-xs text-gray-500 gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateArgentina(request.createdAt)}
            </div>
          </div>

          {/* Patient/Doctor Info */}
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-gray-400" />
            {userRole === "doctor" && request.patient ? (
              <span className="font-medium">
                {request.patient.firstName} {request.patient.lastName}
              </span>
            ) : request.doctor ? (
              <span className="font-medium">
                {formatDoctorName(request.doctor)}
                {request.doctor.specialities &&
                  request.doctor.specialities.length > 0 && (
                    <span className="text-gray-500 font-normal">
                      {" "}
                      - {request.doctor.specialities[0]}
                    </span>
                  )}
              </span>
            ) : (
              <span className="text-gray-500">Doctor no especificado</span>
            )}
          </div>

          {/* Description */}
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-gray-600 line-clamp-2">
              {request.description}
            </p>
          </div>

          {/* Prescription Link (if completed) */}
          {isCompleted && (request.prescriptionUrl || request.prescriptionLink) && (
            <div className="flex items-center gap-2 p-2 bg-green-50 rounded-md">
              <ExternalLink className="h-4 w-4 text-green-600" />
              <a
                href={request.prescriptionUrl || request.prescriptionLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-green-700 hover:underline font-medium"
                onClick={(e) => e.stopPropagation()}
              >
                Ver receta
              </a>
            </div>
          )}

          {/* Doctor Notes (if completed) */}
          {isCompleted && request.doctorNotes && (
            <div className="text-xs text-gray-500 italic border-t pt-2">
              Notas: {request.doctorNotes}
            </div>
          )}

          {/* Rejected Reason */}
          {request.status === PrescriptionRequestStatus.REJECTED &&
            request.rejectedReason && (
              <div className="text-xs text-red-600 bg-red-50 p-2 rounded-md">
                <span className="font-medium">Motivo de rechazo:</span>{" "}
                {request.rejectedReason}
              </div>
            )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-2 pt-2 border-t"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(request)}
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-1" />
              Ver detalles
            </Button>

            {/* Patient Actions */}
            {userRole === "patient" && isPending && onCancel && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onCancel(request)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            )}

            {/* Doctor Actions */}
            {userRole === "doctor" && isPending && onTake && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTake(request)}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Play className="h-4 w-4 mr-1" />
                Tomar
              </Button>
            )}

            {userRole === "doctor" && isInProgress && (
              <>
                {onComplete && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onComplete(request)}
                    disabled={isLoading}
                    className="text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Completar
                  </Button>
                )}
                {onReject && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReject(request)}
                    disabled={isLoading}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
