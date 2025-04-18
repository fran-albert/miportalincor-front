import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import { toast } from "sonner";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

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
  const [currentImage, setCurrentImage] = useState<string | null>(image);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setCurrentImage(image);
  }, [image]);

  const mutation =
    label.toLowerCase() === "sello"
      ? uploadSelloMutation
      : uploadSignatureMutation;

  const handleImageSelect = async (croppedImage: string) => {
    try {
      setIsUploading(true);
      const formData = createFormDataFromBase64(croppedImage);

      const uploadPromise = mutation.mutateAsync({
        idUser: doctorId,
        formData,
      });

      toast.promise(uploadPromise, {
        loading: <LoadingToast message="Subiendo imagen..." />,
        success: <SuccessToast message="Imagen subida con éxito!" />,
        error: (err) => {
          if (err?.response?.status === 409) {
            return <ErrorToast message="La imagen ya existe" />;
          }
          return <ErrorToast message="Error al subir la imagen" />;
        },
      });

      const returnedUrl = await uploadPromise;
      setCurrentImage(returnedUrl);

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
    const file = new File([u8arr], "image.jpg", { type: mime });
    const formData = new FormData();

    if (label.toLowerCase() === "sello") {
      formData.append("sello", file);
    } else {
      formData.append("firma", file);
    }
    return formData;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Card
        className={`p-4 h-40 flex flex-col items-center justify-center border-2 border-dashed relative 
          ${
            isEditing
              ? "cursor-pointer hover:bg-muted/50 transition-colors"
              : "cursor-not-allowed "
          }`}
      >
        {currentImage ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={currentImage || "/placeholder.svg"}
              alt={label}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <>
            <p className="text-center font-medium mb-2">{label}</p>
            <p className="text-sm text-muted-foreground text-center">
              {isEditing
                ? "Haga clic en 'Subir imagen' para seleccionar una imagen"
                : "Edición deshabilitada"}
            </p>
          </>
        )}
      </Card>
      {isEditing && !isUploading && (
        <div className="pt-2">
          <ImagePickerDialog onImageSelect={handleImageSelect} />
        </div>
      )}
    </div>
  );
}
