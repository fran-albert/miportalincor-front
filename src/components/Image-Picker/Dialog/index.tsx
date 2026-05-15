// ImagePickerDialog.tsx
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import ImagePicker from "..";

interface ImagePickerDialogProps {
  onImageSelect: (image: string) => void;
  cleanLightBackground?: boolean;
  description?: string;
  helperText?: string;
}

const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
  onImageSelect,
  cleanLightBackground = false,
  description = "Elige una imagen para subir o captura una desde la cámara.",
  helperText,
}) => {
  const [open, setOpen] = useState(false);

  const handleImageSelect = (image: string) => {
    onImageSelect(image);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Seleccionar Imagen</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Seleccionar Imagen</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <ImagePicker
          onImageSelect={handleImageSelect}
          cleanLightBackground={cleanLightBackground}
          helperText={helperText}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerDialog;
