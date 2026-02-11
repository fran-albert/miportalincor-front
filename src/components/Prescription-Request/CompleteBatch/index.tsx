import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PrescriptionRequest } from "@/types/Prescription-Request/Prescription-Request";
import {
  useCompleteBatchPrescriptionRequest,
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
  Plus,
  Layers,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface UploadedFile {
  file: File;
  previewUrl: string | null;
  s3Url: string;
  isUploading: boolean;
}

interface CompleteBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  batchId: string;
  requests: PrescriptionRequest[];
}

export default function CompleteBatchModal({
  isOpen,
  onClose,
  batchId,
  requests,
}: CompleteBatchModalProps) {
  const [prescriptionUrls, setPrescriptionUrls] = useState<string[]>([]);
  const [prescriptionLink, setPrescriptionLink] = useState("");
  const [doctorNotes, setDoctorNotes] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMethod, setUploadMethod] = useState<"file" | "link">("file");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const completeBatchMutation = useCompleteBatchPrescriptionRequest();
  const uploadMutation = useUploadDoctorPrescription();
  const { promiseToast, showError, showSuccess } = useToastContext();

  if (requests.length === 0) return null;

  const firstRequest = requests[0];
  const patient = firstRequest.patient;

  const handleFileSelect = async (file: File) => {
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

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("Archivo muy grande", "El archivo no debe superar los 10MB");
      return;
    }

    let previewUrl: string | null = null;
    if (file.type.startsWith("image/")) {
      previewUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
    }

    const newFile: UploadedFile = {
      file,
      previewUrl,
      s3Url: "",
      isUploading: true,
    };
    setUploadedFiles((prev) => [...prev, newFile]);
    setIsUploading(true);

    try {
      // Use the first request's ID for uploading (they all belong to same doctor)
      const response = await uploadMutation.mutateAsync({
        requestId: String(firstRequest.id),
        file,
      });

      setUploadedFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, s3Url: response.url, isUploading: false } : f
        )
      );
      setPrescriptionUrls((prev) => [...prev, response.url]);
      showSuccess("Archivo subido", "El archivo se subio correctamente");
    } catch (error) {
      showError(
        "Error al subir archivo",
        error instanceof Error ? error.message : "No se pudo subir el archivo"
      );
      setUploadedFiles((prev) => prev.filter((f) => f.file !== file));
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        handleFileSelect(file);
      });
    }
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const fileToRemove = uploadedFiles[index];
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
    if (fileToRemove.s3Url) {
      setPrescriptionUrls((prev) =>
        prev.filter((url) => url !== fileToRemove.s3Url)
      );
    }
  };

  const handleSubmit = async () => {
    const hasFiles = uploadMethod === "file" && prescriptionUrls.length > 0;
    const hasLink = uploadMethod === "link" && prescriptionLink;

    if (!hasFiles && !hasLink) {
      showError(
        "Campo requerido",
        uploadMethod === "file"
          ? "Debe subir al menos un archivo de receta"
          : "Debe proporcionar un link externo"
      );
      return;
    }

    try {
      const promise = completeBatchMutation.mutateAsync({
        batchId,
        data: {
          ...(hasFiles && { prescriptionUrls }),
          ...(hasLink && { prescriptionLink }),
          ...(doctorNotes && { doctorNotes }),
        },
      });

      await promiseToast(promise, {
        loading: {
          title: "Completando lote...",
          description: `Procesando ${requests.length} solicitud(es)`,
        },
        success: {
          title: "Lote completado",
          description: `Se completaron ${requests.length} solicitud(es) de receta`,
        },
        error: (error: unknown) => ({
          title: "Error al completar lote",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo completar el lote",
        }),
      });

      handleClose();
    } catch {
      // Error handled by promiseToast
    }
  };

  const handleClose = () => {
    setPrescriptionUrls([]);
    setPrescriptionLink("");
    setDoctorNotes("");
    setUploadedFiles([]);
    setUploadMethod("file");
    onClose();
  };

  const isSubmitDisabled =
    (uploadMethod === "file" && prescriptionUrls.length === 0) ||
    (uploadMethod === "link" && !prescriptionLink) ||
    completeBatchMutation.isPending ||
    isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-green-600 to-green-700 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Layers className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Completar Lote</h2>
              <p className="text-sm text-white/80 mt-1">
                Una receta para {requests.length} medicamento
                {requests.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Patient Info */}
          {patient && (
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
                    {patient.firstName} {patient.lastName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Medications in the batch */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <FileText className="h-4 w-4 text-gray-500" />
              Medicamentos del Lote ({requests.length})
            </Label>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              {requests.map((req) => {
                const cleaned = req.description
                  .replace("Solicitud de receta desde Carton Verde: ", "")
                  .replace("Solicitud de receta desde Cartón Verde: ", "");

                const cantMatch = cleaned.match(/\s*-\s*Cant:\s*(.+)$/);
                const withoutCant = cantMatch
                  ? cleaned.replace(cantMatch[0], "")
                  : cleaned;

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
                  lastDash > 0
                    ? withoutSchedule.substring(lastDash + 3).trim()
                    : "";

                return (
                  <div
                    key={req.id}
                    className="text-sm text-gray-700 flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
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
                Subir Archivos
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
            <div className="space-y-3">
              <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Upload className="h-4 w-4 text-green-600" />
                Archivos de Receta (PDF o Imagen)
                {uploadedFiles.length > 0 && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    {uploadedFiles.length} archivo
                    {uploadedFiles.length > 1 ? "s" : ""}
                  </span>
                )}
              </Label>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
                multiple
              />

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  {uploadedFiles.map((uploadedFile, index) => (
                    <div
                      key={index}
                      className="relative border rounded-lg p-3 bg-gray-50"
                    >
                      <div className="flex items-center gap-3">
                        {uploadedFile.previewUrl ? (
                          <img
                            src={uploadedFile.previewUrl}
                            alt="Preview"
                            className="h-14 w-14 object-cover rounded-lg border"
                          />
                        ) : (
                          <div className="h-14 w-14 bg-green-100 rounded-lg flex items-center justify-center">
                            <FileIcon className="h-6 w-6 text-green-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">
                            {uploadedFile.file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {(uploadedFile.file.size / 1024 / 1024).toFixed(2)}{" "}
                            MB
                          </p>
                          {uploadedFile.isUploading && (
                            <div className="flex items-center gap-2 mt-1 text-green-600">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span className="text-xs">Subiendo...</span>
                            </div>
                          )}
                          {uploadedFile.s3Url && !uploadedFile.isUploading && (
                            <p className="text-xs text-green-600 mt-1">
                              Subido correctamente
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          disabled={uploadedFile.isUploading}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className={`w-full ${
                  uploadedFiles.length > 0
                    ? "h-12 border-dashed"
                    : "h-24 flex-col gap-2 border-dashed"
                } hover:border-green-500 hover:bg-green-50`}
              >
                {uploadedFiles.length > 0 ? (
                  <>
                    <Plus className="h-4 w-4 mr-2 text-green-600" />
                    <span className="text-sm">Agregar mas archivos</span>
                  </>
                ) : (
                  <>
                    <Upload className="h-8 w-8 text-green-600" />
                    <span className="text-sm">
                      Click para seleccionar archivos
                    </span>
                    <span className="text-xs text-gray-500">
                      PDF, JPG, PNG, WEBP (max. 10MB por archivo)
                    </span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* External Link Section */}
          {uploadMethod === "link" && (
            <div className="space-y-2">
              <Label
                htmlFor="batchPrescriptionLink"
                className="text-sm font-semibold text-gray-700 flex items-center gap-2"
              >
                <Link className="h-4 w-4 text-green-600" />
                Link Externo de Receta
              </Label>
              <Input
                id="batchPrescriptionLink"
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
              htmlFor="batchDoctorNotes"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-green-600" />
              Notas para el Paciente (opcional)
            </Label>
            <Textarea
              id="batchDoctorNotes"
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
              disabled={completeBatchMutation.isPending || isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="px-6 bg-green-600 hover:bg-green-700 text-white shadow-md min-w-[160px]"
            >
              {completeBatchMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Completando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Completar Lote ({requests.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
