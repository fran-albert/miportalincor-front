import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, FileImage } from "lucide-react";
import { cn } from "@/lib/utils";
import { DoctorSignatureAssetStatus } from "@/hooks/Doctor/useDoctorWithSignatures";

interface DoctorSignatureAssetProps {
  label: "Firma" | "Sello";
  src?: string | null;
  status?: DoctorSignatureAssetStatus;
  isLoading?: boolean;
  isUploading?: boolean;
  className?: string;
}

export function DoctorSignatureAsset({
  label,
  src,
  status,
  isLoading = false,
  isUploading = false,
  className,
}: DoctorSignatureAssetProps) {
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [src]);

  const resolvedStatus = imageFailed ? "broken" : status ?? (src ? "available" : "missing");
  const canShowImage = resolvedStatus === "available" && Boolean(src);

  if (isLoading || isUploading) {
    return (
      <div
        className={cn(
          "flex h-full min-h-28 w-full items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500",
          className,
        )}
      >
        {isUploading ? "Subiendo imagen..." : "Verificando imagen..."}
      </div>
    );
  }

  if (canShowImage) {
    return (
      <div
        className={cn(
          "flex h-full min-h-28 w-full items-center justify-center rounded-md border border-slate-200 bg-white p-3",
          className,
        )}
      >
        <img
          src={src!}
          alt={label}
          className="max-h-full max-w-full object-contain"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  const isBroken = resolvedStatus === "broken";

  return (
    <div
      className={cn(
        "flex h-full min-h-28 w-full flex-col items-center justify-center rounded-md border border-dashed p-4 text-center",
        isBroken
          ? "border-amber-300 bg-amber-50 text-amber-900"
          : "border-slate-300 bg-slate-50 text-slate-600",
        className,
      )}
    >
      {isBroken ? (
        <AlertTriangle className="mb-2 h-5 w-5" />
      ) : (
        <FileImage className="mb-2 h-5 w-5" />
      )}
      <p className="text-sm font-medium">
        {isBroken ? `${label} no disponible` : `${label} no cargada`}
      </p>
      <p className="mt-1 max-w-48 text-xs leading-5">
        {isBroken
          ? "La referencia existe, pero la imagen no se puede abrir. Volvé a cargarla."
          : "Cargá este archivo para que el médico pueda firmar estudios cuando corresponda."}
      </p>
    </div>
  );
}

export function DoctorSignatureAssetStatusBadge({
  label,
  status,
}: {
  label: "Firma" | "Sello";
  status?: DoctorSignatureAssetStatus;
}) {
  const resolvedStatus = status ?? "missing";
  const isAvailable = resolvedStatus === "available";
  const isBroken = resolvedStatus === "broken";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium",
        isAvailable && "bg-emerald-50 text-emerald-700",
        isBroken && "bg-amber-50 text-amber-800",
        !isAvailable && !isBroken && "bg-slate-100 text-slate-600",
      )}
    >
      {isAvailable ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
      {label}:{" "}
      {isAvailable ? "cargada" : isBroken ? "no disponible" : "pendiente"}
    </span>
  );
}
