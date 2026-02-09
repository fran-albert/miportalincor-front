import { Dialog, DialogContent } from "@/components/ui/dialog";
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
  Clock,
  X,
  Stethoscope,
  Layers,
} from "lucide-react";
import { formatDateArgentina, formatDoctorName } from "@/common/helpers/helpers";

interface ViewPrescriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PrescriptionRequest | null;
  /** If this is a batch, pass all requests in the batch */
  batchRequests?: PrescriptionRequest[];
  userRole: "patient" | "doctor";
  onCancel?: (request: PrescriptionRequest) => void;
  isLoading?: boolean;
}

/** Parse green card description into structured parts */
function parseGreenCardDescription(description: string) {
  const cleaned = description
    .replace("Solicitud de receta desde Carton Verde: ", "")
    .replace("Solicitud de receta desde Cartón Verde: ", "");

  const cantMatch = cleaned.match(/\s*-\s*Cant:\s*(.+)$/);
  const withoutCant = cantMatch ? cleaned.replace(cantMatch[0], "") : cleaned;

  const scheduleMatch = withoutCant.match(/\s*\(([^)]+)\)\s*$/);
  const withoutSchedule = scheduleMatch
    ? withoutCant.replace(scheduleMatch[0], "")
    : withoutCant;

  const lastDash = withoutSchedule.lastIndexOf(" - ");
  const name =
    lastDash > 0
      ? withoutSchedule.substring(0, lastDash).trim()
      : withoutSchedule.trim();
  const dosage =
    lastDash > 0 ? withoutSchedule.substring(lastDash + 3).trim() : "";

  return {
    name,
    dosage,
    schedule: scheduleMatch?.[1] || "",
    quantity: cantMatch?.[1]?.trim() || "",
  };
}

export default function ViewPrescriptionRequestModal({
  isOpen,
  onClose,
  request,
  batchRequests,
  userRole,
  onCancel,
  isLoading = false,
}: ViewPrescriptionRequestModalProps) {
  if (!request) return null;

  const isPending = request.status === PrescriptionRequestStatus.PENDING;
  const isCompleted = request.status === PrescriptionRequestStatus.COMPLETED;
  const isRejected = request.status === PrescriptionRequestStatus.REJECTED;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Detalle de Solicitud</h2>
              <p className="text-sm text-white/80 mt-1">
                Información completa de la solicitud de receta
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Status and Date */}
          <div className="flex items-center justify-between">
            <StatusBadge status={request.status} />
            <div className="flex items-center text-sm text-gray-500 gap-1">
              <Calendar className="h-4 w-4" />
              {formatDateArgentina(request.createdAt)}
            </div>
          </div>

          {/* Patient/Doctor Info Card */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 space-y-3">
            {userRole === "doctor" && request.patient && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Paciente</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {request.patient.firstName} {request.patient.lastName}
                  </p>
                  {request.patient.phoneNumber && (
                    <p className="text-xs text-blue-600 mt-0.5">
                      Tel: {request.patient.phoneNumber}
                    </p>
                  )}
                </div>
              </div>
            )}

            {request.doctor && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <Stethoscope className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900">Medico</p>
                  <p className="text-sm text-blue-700 mt-1">
                    {formatDoctorName(request.doctor)}
                  </p>
                  {request.doctor.specialities &&
                    request.doctor.specialities.length > 0 && (
                      <p className="text-xs text-blue-600 mt-0.5">
                        {request.doctor.specialities.join(", ")}
                      </p>
                    )}
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            {batchRequests ? (
              <>
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-purple-600" />
                  Medicamentos del Lote ({batchRequests.length})
                </h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {batchRequests.map((req) => {
                    const isGreenCard = req.description.includes("Cartón Verde") || req.description.includes("Carton Verde");
                    if (isGreenCard) {
                      const parsed = parseGreenCardDescription(req.description);
                      return (
                        <div
                          key={req.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="font-medium text-gray-900">
                            {parsed.name}
                          </span>
                          {parsed.dosage && (
                            <span className="text-gray-500">- {parsed.dosage}</span>
                          )}
                          {parsed.schedule && (
                            <span className="text-gray-400 text-xs">
                              ({parsed.schedule})
                            </span>
                          )}
                          {parsed.quantity && (
                            <span className="text-gray-400 text-xs">
                              Cant: {parsed.quantity}
                            </span>
                          )}
                        </div>
                      );
                    }
                    return (
                      <div
                        key={req.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                        <span className="text-gray-700">{req.description}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-greenPrimary" />
                  Descripcion de la Solicitud
                </h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {request.description}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Attachments */}
          {request.attachmentUrls && request.attachmentUrls.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-gray-700">
                {request.attachmentUrls.length > 1
                  ? "Imagenes Adjuntas"
                  : "Imagen Adjunta"}
              </h3>
              <div className="space-y-1">
                {request.attachmentUrls.map((url, index) => (
                  <a
                    key={index}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    {request.attachmentUrls && request.attachmentUrls.length > 1
                      ? `Ver adjunto ${index + 1}`
                      : "Ver imagen adjunta"}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prescription (if completed) */}
          {isCompleted && ((request.prescriptionUrls && request.prescriptionUrls.length > 0) || request.prescriptionLink) && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
              <h3 className="text-sm font-semibold text-green-800 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Receta{request.prescriptionUrls && request.prescriptionUrls.length > 1 ? "s" : ""}
              </h3>
              {/* Multiple prescription files */}
              {request.prescriptionUrls && request.prescriptionUrls.length > 0 && (
                <div className="space-y-2">
                  {request.prescriptionUrls.map((url, index) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {request.prescriptionUrls && request.prescriptionUrls.length > 1
                        ? `Receta ${index + 1}`
                        : "Descargar / Ver Receta"}
                    </a>
                  ))}
                </div>
              )}
              {/* External link */}
              {request.prescriptionLink && (
                <a
                  href={request.prescriptionLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-green-700 hover:text-green-800 font-medium"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Receta (Link Externo)
                </a>
              )}
              {request.doctorNotes && (
                <div className="pt-2 border-t border-green-200">
                  <p className="text-xs font-semibold text-green-800">
                    Notas del medico:
                  </p>
                  <p className="text-sm text-green-700 mt-1">
                    {request.doctorNotes}
                  </p>
                </div>
              )}
              {request.completedAt && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <Clock className="h-3 w-3" />
                  Completada: {formatDateArgentina(request.completedAt)}
                </div>
              )}
            </div>
          )}

          {/* Rejected Reason */}
          {isRejected && request.rejectedReason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="text-sm font-semibold text-red-800 flex items-center gap-2 mb-2">
                <X className="h-4 w-4" />
                Motivo de Rechazo
              </h3>
              <p className="text-sm text-red-700">{request.rejectedReason}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            {userRole === "patient" && isPending && onCancel && (
              <Button
                variant="outline"
                onClick={() => onCancel(request)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar Solicitud
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6 hover:bg-gray-50"
            >
              Cerrar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
