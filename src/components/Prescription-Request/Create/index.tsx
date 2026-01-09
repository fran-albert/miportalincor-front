import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePrescriptionRequest } from "@/hooks/Prescription-Request/usePrescriptionRequest";
import { CreatePrescriptionRequestDto } from "@/types/Prescription-Request/Prescription-Request";
import { FileText, User, Plus, Info, Camera, Image, X, Loader2 } from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { formatDoctorName, getDoctorTitle } from "@/common/helpers/helpers";
import { uploadPrescriptionAttachment } from "@/api/Prescription-Request";

interface DoctorOption {
  id: string;
  firstName: string;
  lastName: string;
  gender?: string;
  specialities?: string[];
  notes?: string;
}

interface CreatePrescriptionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  doctors: DoctorOption[];
  isLoadingDoctors?: boolean;
}

export default function CreatePrescriptionRequestModal({
  isOpen,
  onClose,
  doctors,
  isLoadingDoctors = false,
}: CreatePrescriptionRequestModalProps) {
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const createMutation = useCreatePrescriptionRequest();
  const { promiseToast, showError, showSuccess } = useToastContext();

  // Get selected doctor for showing notes
  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      showError(
        "Tipo de archivo no permitido",
        "Solo se permiten imagenes JPG, PNG, WEBP o archivos PDF"
      );
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      showError("Archivo muy grande", "El archivo no debe superar los 5MB");
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
      const response = await uploadPrescriptionAttachment(file);
      setAttachmentUrl(response.url);
      showSuccess("Imagen subida", "La imagen se subio correctamente");
    } catch (error) {
      showError(
        "Error al subir imagen",
        error instanceof Error ? error.message : "No se pudo subir la imagen"
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
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAttachmentUrl("");
  };

  const handleSubmit = async () => {
    if (!selectedDoctorId) {
      showError("Campo requerido", "Debe seleccionar un medico");
      return;
    }

    if (!description.trim() || description.trim().length < 10) {
      showError(
        "Campo requerido",
        "La descripcion debe tener al menos 10 caracteres"
      );
      return;
    }

    try {
      const createData: CreatePrescriptionRequestDto = {
        doctorUserId: selectedDoctorId,
        description: description.trim(),
        ...(attachmentUrl && { attachmentUrl }),
      };

      const promise = createMutation.mutateAsync(createData);

      await promiseToast(promise, {
        loading: {
          title: "Enviando solicitud...",
          description: "Procesando su solicitud de receta",
        },
        success: {
          title: "Solicitud enviada",
          description: "Su solicitud de receta ha sido enviada correctamente",
        },
        error: (error: unknown) => ({
          title: "Error al enviar",
          description:
            (error instanceof Error ? error.message : undefined) ||
            "No se pudo enviar la solicitud. Intente nuevamente.",
        }),
      });

      handleClose();
    } catch {
      // Error handled by promiseToast
    }
  };

  const handleClose = () => {
    setSelectedDoctorId("");
    setDescription("");
    setAttachmentUrl("");
    setSelectedFile(null);
    setPreviewUrl(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Solicitar Receta</h2>
              <p className="text-sm text-white/80 mt-1">
                Complete los campos para solicitar una receta a su medico
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Doctor Selection */}
          <div className="space-y-2">
            <Label
              htmlFor="doctor"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <User className="h-4 w-4 text-greenPrimary" />
              Seleccionar Medico *
            </Label>
            {doctors.length === 0 && !isLoadingDoctors ? (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  No hay medicos disponibles para solicitar recetas en este momento.
                  Por favor, intente mas tarde o contacte a la secretaria.
                </p>
              </div>
            ) : (
              <>
                <Select
                  value={selectedDoctorId}
                  onValueChange={setSelectedDoctorId}
                  disabled={isLoadingDoctors}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingDoctors
                          ? "Cargando medicos..."
                          : "Seleccione un medico"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {formatDoctorName(doctor)}
                        {doctor.specialities && doctor.specialities.length > 0 && (
                          <span className="text-gray-500 ml-1">
                            - {doctor.specialities[0]}
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Doctor notes (if selected and has notes) */}
                {selectedDoctor?.notes && (
                  <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800">
                          Nota {getDoctorTitle(selectedDoctor.gender)} {selectedDoctor.lastName}:
                        </p>
                        <p className="text-sm text-amber-700 mt-1">
                          {selectedDoctor.notes}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-sm font-semibold text-gray-700 flex items-center gap-2"
            >
              <FileText className="h-4 w-4 text-greenPrimary" />
              Descripcion de la Solicitud *
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa el medicamento que necesita, la dosis habitual, y cualquier informacion relevante para el medico..."
              rows={6}
              className="resize-none focus:ring-2 focus:ring-greenPrimary focus:border-greenPrimary"
              maxLength={1000}
            />
            <div className="flex items-center justify-between text-xs">
              <p className="text-gray-500">
                Ejemplo: Necesito receta de Enalapril 10mg, 2 cajas. Lo tomo
                para la presion.
              </p>
              <span className="text-gray-400">
                {description.length} / 1000
              </span>
            </div>
          </div>

          {/* Image Upload */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <Image className="h-4 w-4 text-greenPrimary" />
              Imagen Adjunta (opcional)
            </Label>

            {/* Hidden file inputs */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileInputChange}
              className="hidden"
            />

            {/* Preview or upload buttons */}
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
                    <div className="h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center">
                      <FileText className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                    {isUploading && (
                      <div className="flex items-center gap-2 mt-1 text-greenPrimary">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-xs">Subiendo...</span>
                      </div>
                    )}
                    {attachmentUrl && !isUploading && (
                      <p className="text-xs text-green-600 mt-1">Subida correctamente</p>
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 h-20 flex-col gap-1 border-dashed hover:border-greenPrimary hover:bg-green-50"
                >
                  <Camera className="h-6 w-6 text-greenPrimary" />
                  <span className="text-xs">Tomar Foto</span>
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 h-20 flex-col gap-1 border-dashed hover:border-greenPrimary hover:bg-green-50"
                >
                  <Image className="h-6 w-6 text-greenPrimary" />
                  <span className="text-xs">Elegir Imagen</span>
                </Button>
              </div>
            )}
            <p className="text-xs text-gray-500">
              Puede adjuntar una foto de una receta anterior o la caja del
              medicamento (max. 5MB)
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Nota:</strong> El medico revisara su solicitud y emitira
              la receta si lo considera apropiado. Recibira una notificacion
              cuando la solicitud sea procesada.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={handleClose}
              className="px-6 hover:bg-gray-50"
              disabled={createMutation.isPending || isUploading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                !selectedDoctorId ||
                description.trim().length < 10 ||
                createMutation.isPending ||
                isUploading
              }
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md min-w-[160px]"
            >
              {createMutation.isPending ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Enviar Solicitud
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
