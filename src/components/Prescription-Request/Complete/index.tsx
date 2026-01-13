import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import {
  useCompletePrescriptionRequest,
  useUploadDoctorPrescription,
} from "@/hooks/Prescription-Request/usePrescriptionRequest";
import {
  FileText,
  Link,
  CheckCircle,
  User,
  Upload,
  X,
  Loader2,
  File as FileIcon,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface CompletePrescriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: PrescriptionRequest | null;
}

export default function CompletePrescriptionRequestModal({
  isOpen,
  onClose,
  request,
}: CompletePrescriptionRequestModalProps) {
  // Form state
  const [prescriptionUrl, setPrescriptionUrl] = useState("");
  const [prescriptionLink, setPrescriptionLink] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");

  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const completeMutation = useCompletePrescriptionRequest();
  const uploadMutation = useUploadDoctorPrescription();
  const { promiseToast, showError, showSuccess } = useToastContext();

  if (!request) return null;

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];
    if (!allowedTypes.includes(file.type)) {
      showError(
        "Tipo de archivo no permitido",
        "Solo se permiten archivos JPG, PNG, WEBP o PDF"
      );
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("Archivo muy grande", "El archivo no debe superar los 10MB");
      return;
    }

    setSelectedFile(file);

    // Create preview for images
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewUrl(null);
    }

    // Upload to S3
    setIsUploading(true);
    try {
      const response = await uploadMutation.mutateAsync({
        requestId: String(request.id),
        file,
      });
      setPrescriptionUrl(response.url);
      showSuccess(
        "Archivo subido",
        "El archivo de receta se subio correctamente"
      );
    } catch (error) {
      showError(
        "Error al subir archivo",
        error instanceof Error ? error.message : "No se pudo subir el archivo"
      );
      setSelectedFile(null);
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setPrescriptionUrl("");
  };

  const handleSubmit = async () => {
    const hasFile = uploadMethod === "file" && prescriptionUrl;
    const hasLink = uploadMethod === "link" && prescriptionLink;

    if (!hasFile && !hasLink) {
      showError(
        "Campo requerido",
        uploadMethod === "file"
          ? "Debe subir un archivo de receta"
          : "Debe proporcionar un link externo"
      );
      return;
    }

    try {
      const promise = completeMutation.mutateAsync({
        id: String(request.id),
        data: {
          ...(hasFile && { prescriptionUrl }),
          ...(hasLink && { prescriptionLink }),
          ...(doctorNotes && { doctorNotes }),
        },
      });

      await promiseToast(promise, {
        loading: {
          title: "Completando solicitud...",
          description: "Procesando la receta",
        },
        success: {
          title: "Solicitud completada",
          description: "La receta ha sido enviada al paciente",
        },
        error: (error: unknown) => ({
          title: "Error al completar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo completar la solicitud",
        }),
      });

      handleClose();
    } catch {
      // Error handled by promiseToast
    }
  };

  const handleClose = () => {
    setPrescriptionUrl("");
    setPrescriptionLink("");
    setDoctorNotes("");
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadMethod("file");
    onClose();
  };

  const isSubmitDisabled =
    (uploadMethod === "file" && !prescriptionUrl) ||
    (uploadMethod === "link" && !prescriptionLink) ||
    completeMutation.isPending ||
    isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Completar Solicitud</h2>
              <p className="text-sm text-white/80 mt-1">
                Adjunte la receta para enviar al paciente
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Patient Info */}
          {request.patient && (
            <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Paciente
                  </p>
                  <p className="text-sm text-blue-700">
                    {request.patient.firstName} {request.patient.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Request Description */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Solicitud del Paciente
            </Label>
            <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
              {request.description}
            </div>
          </div>

          {/* Upload Method Selector */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold text-gray-700">
              Metodo de entrega de receta
            </Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={uploadMethod === "file" ? "default" : "outline"}
                onClick={() => setUploadMethod("file")}
                className={
                  uploadMethod === "file"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                <Upload className="h-4 w-4 mr-2" />
                Subir Archivo
              </Button>
              <Button
                type="button"
                variant={uploadMethod === "link" ? "default" : "outline"}
                onClick={() => setUploadMethod("link")}
                className={
                  uploadMethod === "link"
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }
              >
                <Link className="h-4 w-4 mr-2" />
                Link Externo
              </Button>
            </div>
          </div>

          {/* File Upload Section */}
          {uploadMethod === "file" && (
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-600" />
                Archivo de Receta (PDF o Imagen)
              </Label>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* Preview or upload button */}
              {selectedFile ? (
                <div className="relative border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded-lg border"
                      />
                    ) : (
                      <div className="h-20 w-20 bg-green-100 rounded-lg flex items-center justify-center">
                        <FileIcon className="h-8 w-8 text-green-600" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-700 truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      {isUploading && (
                        <div className="flex items-center gap-2 mt-1 text-green-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs">Subiendo...</span>
                        </div>
                      )}
                      {prescriptionUrl && !isUploading && (
                        <p className="text-xs text-green-600 mt-1">
                          Subido correctamente
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveFile}
                      disabled={isUploading}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 flex-col gap-2 border-dashed hover:border-green-500 hover:bg-green-50"
                >
                  <Upload className="h-8 w-8 text-green-600" />
                  <span className="text-sm">
                    Click para seleccionar archivo
                  </span>
                  <span className="text-xs text-gray-500">
                    PDF, JPG, PNG, WEBP (max. 10MB)
                  </span>
                </Button>
              )}
            </div>
          )}

          {/* External Link Section */}
          {uploadMethod === "link" && (
            <div className="space-y-2">
              <Label
                htmlFor="prescriptionLink"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Link className="h-4 w-4 text-green-600" />
                Link Externo de Receta
              </Label>
              <Input
                id="prescriptionLink"
                type="url"
                value={prescriptionLink}
                onChange={(e) => setPrescriptionLink(e.target.value)}
                placeholder="https://recetario.ejemplo.com/ver/12345"
                className="focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
              <p className="text-xs text-gray-500">
                Link externo a un sistema de recetas electronicas
              </p>
            </div>
          )}

          {/* Doctor Notes */}
          <div className="space-y-2">
            <Label
              htmlFor="doctorNotes"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-green-600" />
              Notas para el Paciente (opcional)
            </Label>
            <Textarea
              id="doctorNotes"
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="Indicaciones adicionales, posologia, duracion del tratamiento..."
              rows={3}
              className="resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
              maxLength={500}
            />
            <div className="text-right">
              <span className="text-xs text-gray-400">
                {doctorNotes.length} / 500
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={completeMutation.isPending || isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="px-6 bg-green-600 hover:bg-green-700 text-white shadow-md min-w-[160px]"
            >
              {completeMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar y Enviar
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
