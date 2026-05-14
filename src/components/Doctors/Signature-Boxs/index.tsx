import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { ApiError } from "@/types/Error/ApiError";
import { useDoctorWithSignatures } from "@/hooks/Doctor/useDoctorWithSignatures";
import {
  DoctorSignatureAsset,
  DoctorSignatureAssetStatusBadge,
} from "@/components/Doctors/SignatureAsset";

interface ImageUploadBoxProps {
  id: string;
  label: string;
  image: string | null;
  doctorId: number;
  isEditing: boolean;
  onImageUploaded?: () => void;
}

export function ImageUploadBox({
  id,
  label,
  image,
  doctorId,
  isEditing,
  onImageUploaded,
}: ImageUploadBoxProps) {
  const { uploadSignatureMutation, uploadSelloMutation } = useDoctorMutations();
  const { promiseToast } = useToastContext();
  const [currentImage, setCurrentImage] = useState<string | null>(image);
  const [isUploading, setIsUploading] = useState(false);
  const assetType = label.toLowerCase() === "sello" ? "sello" : "firma";
  const {
    data: signatureAssets,
    isLoading: isLoadingAsset,
  } = useDoctorWithSignatures({
    id: String(doctorId),
    auth: Boolean(doctorId),
  });

  useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const mutation =
    assetType === "sello" ? uploadSelloMutation : uploadSignatureMutation;
  const assetSrc =
    assetType === "sello"
      ? signatureAssets?.sealDataUrl
      : signatureAssets?.signatureDataUrl;
  const assetStatus =
    assetType === "sello"
      ? signatureAssets?.sealStatus
      : signatureAssets?.signatureStatus;

  const handleImageSelect = async (croppedImage: string) => {
    try {
      setIsUploading(true);
      const formData = createFormDataFromBase64(croppedImage);

      const promise = mutation.mutateAsync({
        idUser: doctorId,
        formData,
      });

      await promiseToast(promise, {
        loading: {
          title: "Subiendo imagen...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Imagen subida!",
          description: "La imagen se ha subido exitosamente",
        },
        error: (error: ApiError) => {
          if (error?.response?.status === 409) {
            return {
              title: "Imagen ya existe",
              description: "La imagen ya se encuentra en el sistema",
            };
          }
          return {
            title: "Error al subir imagen",
            description:
              error.response?.data?.message || "Ha ocurrido un error inesperado",
          };
        },
      });
      setCurrentImage(null);

      onImageUploaded?.();
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const createFormDataFromBase64 = (base64: string) => {
    const arr = base64.split(",");
    const mimeMatch = arr[0].match(/:(.*?);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    const file = new File([u8arr], `${assetType}.jpg`, { type: mime });
    const formData = new FormData();

    if (assetType === "sello") {
      formData.append("sello", file);
    } else {
      formData.append("firma", file);
    }
    return formData;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        <DoctorSignatureAssetStatusBadge
          label={label as "Firma" | "Sello"}
          status={assetStatus}
        />
      </div>
      <Card
        className={`p-4 h-40 flex flex-col items-center justify-center border-2 border-dashed relative 
          ${
            isEditing
              ? "cursor-pointer hover:bg-muted/50 transition-colors"
              : "cursor-not-allowed "
          }`}
      >
        <DoctorSignatureAsset
          label={label as "Firma" | "Sello"}
          src={assetSrc ?? currentImage}
          status={assetStatus}
          isLoading={isLoadingAsset}
          isUploading={isUploading}
          className="min-h-0 border-0 bg-transparent"
        />
      </Card>
      {isEditing && !isUploading && (
        <div className="pt-2">
          <ImagePickerDialog onImageSelect={handleImageSelect} />
        </div>
      )}
    </div>
  );
}
