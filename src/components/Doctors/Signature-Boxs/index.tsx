import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import { toast } from "sonner";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";

interface ImageUploadBoxProps {
  id: string;
  label: string;
  image: string | null;
  doctorId: number;
  isEditing: boolean;
}

export function ImageUploadBox({
  id,
  label,
  image,
  doctorId,
  isEditing,
}: ImageUploadBoxProps) {
  const { uploadSignatureMutation, uploadSelloMutation } = useDoctorMutations();
  const [currentImage, setCurrentImage] = useState<string | null>(image);

  useEffect(() => {
    console.log("Actualizando currentImage a:", image);
    setCurrentImage(image);
  }, [image]);
  

  const mutation =
    label.toLowerCase() === "sello"
      ? uploadSelloMutation
      : uploadSignatureMutation;

  const handleImageSelect = async (croppedImage: string) => {
    try {
      const formData = createFormDataFromBase64(croppedImage);
      const returnedUrl = await mutation.mutateAsync({
        idUser: doctorId,
        formData,
      });
      const toastDuration = 5000;
      toast.success("Imagen subida correctamente", { duration: toastDuration });
      setTimeout(() => {
        setCurrentImage(returnedUrl);
      }, toastDuration);
    } catch (error) {
      toast.error("Error al subir la imagen");
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
              : "cursor-not-allowed bg-gray-200"
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
      {isEditing && (
        <div className="pt-2">
          <ImagePickerDialog onImageSelect={handleImageSelect} />
        </div>
      )}
    </div>
  );
}
