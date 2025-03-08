import type React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface ImageUploadBoxProps {
  id: string;
  label: string;
  image: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEditing: boolean;
}

export function ImageUploadBox({
  id,
  label,
  image,
  onImageUpload,
  isEditing,
}: ImageUploadBoxProps) {
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
        {isEditing && (
          <input
            type="file"
            id={id}
            accept="image/*"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={onImageUpload}
          />
        )}

        {image ? (
          <div className="w-full h-full flex items-center justify-center">
            <img
              src={image || "/placeholder.svg"}
              alt={label}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        ) : (
          <>
            <p className="text-center font-medium mb-2">{label}</p>
            <p className="text-sm text-muted-foreground text-center">
              {isEditing
                ? "Haga clic para subir imagen"
                : "Edición deshabilitada"}
            </p>
          </>
        )}
      </Card>
    </div>
  );
}
