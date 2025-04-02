import React from "react";

interface CollaboratorAvatarHtmlProps {
  src?: string | null;
  alt: string;
  photoDataUrl?: string; 
}

const CollaboratorAvatarHtml: React.FC<CollaboratorAvatarHtmlProps> = ({
  src,
  alt,
  photoDataUrl,
}) => {
  const imageSource = photoDataUrl || src;
  const hasValidImage = imageSource && imageSource.trim() !== "";

  return hasValidImage ? (
    <div className="w-20 h-20 border-2 border-[#187B80] overflow-hidden flex items-center justify-center">
      <img
        className="w-full h-full object-cover"
        src={imageSource!}
        alt={alt}
      />
    </div>
  ) : (
    <div className="w-20 h-20 rounded-full border-2 border-[#ccc] flex items-center justify-center bg-[#eee]">
      <span className="text-[12px] text-[#888]">User</span>
    </div>
  );
};

export default CollaboratorAvatarHtml;
