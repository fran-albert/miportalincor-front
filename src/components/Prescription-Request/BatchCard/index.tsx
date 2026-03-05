import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  PrescriptionRequest,
  PrescriptionRequestStatus,
} from "@/types/Prescription-Request/Prescription-Request";
import { StatusBadge } from "../StatusBadge";
import {
  Layers,
  Calendar,
  User,
  Eye,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { formatDateArgentina, formatDoctorName } from "@/common/helpers/helpers";

interface BatchPrescriptionRequestCardProps {
  batchId: string;
  requests: PrescriptionRequest[];
  userRole: "patient" | "doctor";
  onView?: (request: PrescriptionRequest, batchRequests?: PrescriptionRequest[]) => void;
  onTakeBatch?: (batchId: string, requests: PrescriptionRequest[]) => void;
  onCompleteBatch?: (batchId: string, requests: PrescriptionRequest[]) => void;
  onRejectBatch?: (batchId: string, requests: PrescriptionRequest[]) => void;
  isLoading?: boolean;
}

export default function BatchPrescriptionRequestCard({
  batchId,
  requests,
  userRole,
  onView,
  onTakeBatch,
  onCompleteBatch,
  onRejectBatch,
  isLoading = false,
}: BatchPrescriptionRequestCardProps) {
  if (requests.length === 0) return null;

  const firstRequest = requests[0];
  const status = firstRequest.status;
  const patient = firstRequest.patient;

  const borderColor =
    status === PrescriptionRequestStatus.PENDING
      ? "border-l-yellow-500"
      : status === PrescriptionRequestStatus.IN_PROGRESS
        ? "border-l-blue-500"
        : status === PrescriptionRequestStatus.COMPLETED
          ? "border-l-green-500"
          : status === PrescriptionRequestStatus.REJECTED
            ? "border-l-red-500"
            : "border-l-gray-300";

  const isPending = status === PrescriptionRequestStatus.PENDING;
  const isInProgress = status === PrescriptionRequestStatus.IN_PROGRESS;
  const canTake = isPending && userRole === "doctor";
  const canComplete = (isPending || isInProgress) && userRole === "doctor";
  const canReject = (isPending || isInProgress) && userRole === "doctor";

  return (
    <Card className={`border-l-4 ${borderColor} hover:shadow-md transition-shadow`}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Patient + Batch Badge + Status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              {patient && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-500" />
                  <span className="font-semibold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </span>
                </div>
              )}
              <Badge
                variant="secondary"
                className="bg-purple-100 text-purple-700 border-purple-300"
              >
                <Layers className="h-3 w-3 mr-1" />
                Lote ({requests.length})
              </Badge>
            </div>
            <StatusBadge status={status} />
          </div>

          {/* Medications list */}
          <div className="space-y-1 bg-gray-50 rounded-lg p-3">
            {requests.map((req) => {
              // Parse description: "Solicitud de receta desde Cartón Verde: nombre - dosis (horario) - Cant: N"
              const cleaned = req.description
                .replace("Solicitud de receta desde Carton Verde: ", "")
                .replace("Solicitud de receta desde Cartón Verde: ", "");

              // Extract parts
              const cantMatch = cleaned.match(/\s*-\s*Cant:\s*(.+)$/);
              const withoutCant = cantMatch
                ? cleaned.replace(cantMatch[0], "")
                : cleaned;

              const scheduleMatch = withoutCant.match(/\s*\(([^)]+)\)\s*$/);
              const withoutSchedule = scheduleMatch
                ? withoutCant.replace(scheduleMatch[0], "")
                : withoutCant;

              // "nombre - dosis" → split by last " - "
              const lastDash = withoutSchedule.lastIndexOf(" - ");
              const name =
                lastDash > 0
                  ? withoutSchedule.substring(0, lastDash).trim()
                  : withoutSchedule.trim();
              const dosage =
                lastDash > 0
                  ? withoutSchedule.substring(lastDash + 3).trim()
                  : "";

              return (
                <div
                  key={req.id}
                  className="text-sm text-gray-700 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                  <span className="font-medium text-gray-900">{name}</span>
                  {dosage && (
                    <span className="text-gray-500">- {dosage}</span>
                  )}
                  {cantMatch && (
                    <span className="text-gray-500 text-xs">
                      (Cant: {cantMatch[1].trim()})
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Date */}
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            <span>
              {firstRequest.createdAt
                ? formatDateArgentina(firstRequest.createdAt)
                : ""}
            </span>
            {firstRequest.doctor && (
              <>
                <span className="text-gray-300">|</span>
                <span>{formatDoctorName(firstRequest.doctor)}</span>
              </>
            )}
          </div>

          {/* Actions */}
          {userRole === "doctor" && (
            <div className="flex gap-2 pt-2 border-t border-gray-100 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView?.(firstRequest, requests)}
                className="text-gray-600"
              >
                <Eye className="h-3.5 w-3.5 mr-1" />
                Ver
              </Button>
              {canTake && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onTakeBatch?.(batchId, requests)}
                  disabled={isLoading}
                  className="text-blue-600 border-blue-200 hover:bg-blue-50"
                >
                  <Play className="h-3.5 w-3.5 mr-1" />
                  Tomar Lote
                </Button>
              )}
              {canComplete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onCompleteBatch?.(batchId, requests)}
                  disabled={isLoading}
                  className="text-green-600 border-green-200 hover:bg-green-50"
                >
                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                  Completar Lote
                </Button>
              )}
              {canReject && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRejectBatch?.(batchId, requests)}
                  disabled={isLoading}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Rechazar Lote
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
