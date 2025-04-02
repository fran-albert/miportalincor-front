import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface CollaboratorAvatarProps {
  src?: string | null;
  photoBuffer?: { type: "Buffer"; data: number[] } | null;
  alt: string;
}

function CollaboratorAvatar({
  src,
  photoBuffer,
  alt,
}: CollaboratorAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);

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
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      )}
      {hasValidImage ? (
        <img
          src={imageDataUrl}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(false)}
          className={`h-32 w-32 object-cover border-2 border-greenPrimary shadow-md ${
            loaded ? "block" : "hidden"
          }`}
        />
      ) : null}
      {(!hasValidImage || !loaded) && (
        <div className="h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 shadow-md">
          <User className="h-12 w-12 text-gray-500" />
        </div>
      )}
    </div>
  );
}

export default CollaboratorAvatar;
