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
}

const ImagePickerDialog: React.FC<ImagePickerDialogProps> = ({
  onImageSelect,
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
          <DialogDescription>
            Elige una imagen para subir o captura una desde la cámara.
          </DialogDescription>
        </DialogHeader>
        <ImagePicker onImageSelect={handleImageSelect} />
      </DialogContent>
    </Dialog>
  );
};

export default ImagePickerDialog;
