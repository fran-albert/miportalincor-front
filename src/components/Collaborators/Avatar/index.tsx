import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface CollaboratorAvatarProps {
  src?: string | null;
  photoBuffer?: { type: "Buffer"; data: number[] } | null;
  alt: string;
  size?: "sm" | "md" | "lg";
}

function CollaboratorAvatar({
  src,
  photoBuffer,
  alt,
  size = "lg",
}: CollaboratorAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const sizeClasses = {
    sm: {
      image: "h-14 w-14",
      fallback: "h-14 w-14",
      icon: "h-7 w-7",
      skeleton: "h-14 w-14",
    },
    md: {
      image: "h-20 w-20",
      fallback: "h-20 w-20",
      icon: "h-10 w-10",
      skeleton: "h-20 w-20",
    },
    lg: {
      image: "h-32 w-32",
      fallback: "h-24 w-24",
      icon: "h-12 w-12",
      skeleton: "w-[100px] h-[20px]",
    },
  }[size];

  useEffect(() => {
    // Si tenemos un photoBuffer, lo convertimos a dataURL
    if (photoBuffer && photoBuffer.data && Array.isArray(photoBuffer.data)) {
      const uint8Array = new Uint8Array(photoBuffer.data);
      const blob = new Blob([uint8Array], { type: "image/jpeg" });
      const reader = new FileReader();

      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        setImageDataUrl(dataUrl);
      };

      reader.readAsDataURL(blob);
    } else {
      // Si no hay photoBuffer, usamos el src directamente
      setImageDataUrl(src || null);
    }
  }, [photoBuffer, src]);

  // Verificamos si tenemos una imagen válida para mostrar
  const hasValidImage = imageDataUrl && imageDataUrl.trim() !== "";

  return (
    <div className="relative flex flex-col items-center">
      {hasValidImage && !loaded && (
        <Skeleton className={`${sizeClasses.skeleton} rounded-full`} />
      )}
      {hasValidImage ? (
        <img
          src={imageDataUrl}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className={`${sizeClasses.image} rounded-full object-cover border-2 border-greenPrimary shadow-md ${
            loaded ? "block" : "hidden"
          }`}
        />
      ) : null}
      {(!hasValidImage || !loaded) && (
        <div
          className={`${sizeClasses.fallback} flex items-center justify-center rounded-full border-2 border-gray-300 bg-gray-200 shadow-md`}
        >
          <User className={`${sizeClasses.icon} text-gray-500`} />
        </div>
      )}
    </div>
  );
}

export default CollaboratorAvatar;
