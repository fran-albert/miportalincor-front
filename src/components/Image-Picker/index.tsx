import React, { useState, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import ReactCrop, { Crop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import { Camera, Upload, Check, X, Crop as CropIcon, Undo } from "lucide-react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";

interface CropWithAspect extends Crop {
  aspect?: number;
}

interface ImagePickerProps {
  onImageSelect: (image: string) => void;
}

const ImagePicker: React.FC<ImagePickerProps> = ({ onImageSelect }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<CropWithAspect>({
    x: 0,
    y: 0,
    width: 50,
    height: 50,
    unit: "%",
    aspect: 1,
  });
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [usingWebcam, setUsingWebcam] = useState<boolean>(false);
  const [isPreviewMode, setIsPreviewMode] = useState<boolean>(false);
  const webcamRef = useRef<Webcam>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setIsPreviewMode(false);
        setCroppedImage(null);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setSelectedImage(imageSrc);
        setUsingWebcam(false);
        setIsPreviewMode(false);
        setCroppedImage(null);
      }
    }
  }, []);

  const onImageLoaded = (
    event: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    imgRef.current = event.currentTarget;
  };

  const generateCroppedImage = () => {
    if (imgRef.current && crop.width && crop.height) {
      const canvas = document.createElement("canvas");
      const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
      const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(
          imgRef.current,
          (crop.x || 0) * scaleX,
          (crop.y || 0) * scaleY,
          (crop.width || 0) * scaleX,
          (crop.height || 0) * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
        const base64Image = canvas.toDataURL("image/jpeg");
        setCroppedImage(base64Image);
        setIsPreviewMode(true);
      }
    }
  };

  return (
    <div className="w-full max-w-md mx-auto overflow-hidden">
      <div className="p-5 space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            type="button"
            onClick={() => setUsingWebcam(true)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-all duration-300 transform ${
              usingWebcam
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-secondary/80 text-secondary-foreground hover:scale-105 hover:shadow-lg"
            }`}
          >
            <Camera className="w-5 h-5" />
            <span>Usar cámara</span>
          </Button>

          <Label className="flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg">
            <Upload className="w-5 h-5" />
            <span>Subir imagen</span>
            <input
              type="file"
              accept="image/*"
              onChange={onSelectFile}
              className="hidden"
            />
          </Label>
        </div>

        {usingWebcam && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-md border border-gray-200">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full"
              />
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                onClick={capture}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-greenPrimary hover:bg-greenPrimary/90 text-primary-foreground transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span>Capturar</span>
              </Button>
              <Button
                type="button"
                onClick={() => setUsingWebcam(false)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-destructive hover:bg-destructive/90 text-destructive-foreground transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Cancelar</span>
              </Button>
            </div>
          </div>
        )}

        {!isPreviewMode && selectedImage && (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-md border border-gray-200">
              <ReactCrop
                crop={crop}
                onChange={(newCrop: CropWithAspect) => setCrop(newCrop)}
                className="max-h-[400px] overflow-auto"
              >
                <img
                  src={selectedImage || "/placeholder.svg"}
                  onLoad={onImageLoaded}
                  alt="Imagen para recortar"
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={generateCroppedImage}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary hover:bg-primary/90 text-primary-foreground transition-colors"
              >
                <CropIcon className="w-5 h-5" />
                <span>Confirmar recorte</span>
              </Button>
            </div>
          </div>
        )}

        {isPreviewMode && croppedImage && (
          <div className="space-y-4">
            <div className="p-4 rounded-md border border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-500 mb-2">Vista previa:</p>
              <div className="flex justify-center">
                <img
                  src={croppedImage || "/placeholder.svg"}
                  alt="Imagen recortada"
                  className="max-w-full h-auto rounded-md shadow-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 justify-center">
              <Button
                type="button"
                onClick={() => onImageSelect(croppedImage)}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
              >
                <Check className="w-5 h-5" />
                <span>Usar esta imagen</span>
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setIsPreviewMode(false);
                  setCroppedImage(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              >
                <Undo className="w-5 h-5" />
                <span>Volver a recortar</span>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePicker;
