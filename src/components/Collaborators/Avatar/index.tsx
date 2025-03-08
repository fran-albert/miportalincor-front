import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

interface CollaboratorAvatarProps {
  src?: string | null;
  alt: string;
}

function CollaboratorAvatar({ src, alt }: CollaboratorAvatarProps) {
  const [loaded, setLoaded] = useState(false);
  const hasValidImage = src && src.trim() !== "";

  return (
    <div className="relative flex flex-col items-center">
      {hasValidImage && !loaded && (
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      )}
      {hasValidImage ? (
        <img
          src={src!}
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
