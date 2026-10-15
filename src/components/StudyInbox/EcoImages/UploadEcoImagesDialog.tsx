import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ImagePlus, Trash2, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateAR } from "@/common/helpers/timezone";
import { getReceptionEcoImage } from "@/api/StudyReport/reception-eco-images.actions";
import {
  useReceptionEcoImageMutations,
  useReceptionEcoItemImages,
} from "@/hooks/StudyReport/useReceptionEcoImages";
import {
  ReceptionEcoItem,
  ReceptionUploadedImage,
} from "@/types/StudyReport/ReceptionEcoImages.types";
import {
  ACCEPTED_ECO_IMAGE_EXTENSIONS,
  MAX_ECO_IMAGES_PER_UPLOAD,
  MAX_ECO_IMAGE_BYTES,
  isAcceptedEcoImage,
  toUploadableEcoImage,
} from "@/utils/ecoImageFiles";

interface UploadEcoImagesDialogProps {
  item: ReceptionEcoItem | null;
  onClose: () => void;
}

interface SelectedFile {
  key: string;
  file: File;
  previewUrl: string | null;
}

export const UploadEcoImagesDialog = ({
  item,
  onClose,
}: UploadEcoImagesDialogProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<SelectedFile[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const [reportIds, setReportIds] = useState<string[]>([]);
  const [preparing, setPreparing] = useState(false);
  const itemId = item?.sourceInboxItemId ?? null;
  const { images, isLoading } = useReceptionEcoItemImages(itemId);
  const { upload, remove } = useReceptionEcoImageMutations();

  const reports = item?.reports ?? [];
  const mustChooseReport = reports.length > 1;
  const targets = mustChooseReport
    ? reports.filter((report) => reportIds.includes(report.id))
    : reports;
  const goesToHistory =
    targets.length > 0 &&
    targets.every((report) => report.status === "FIRMADO");
  const mixed =
    targets.some((report) => report.status === "FIRMADO") && !goesToHistory;

  // Cerrar o cambiar de estudio limpia la selección y libera las vistas previas.
  useEffect(() => {
    setSelected([]);
    setRejected([]);
    setReportIds([]);
  }, [itemId]);
  useEffect(
    () => () => {
      for (const entry of selected) {
        if (entry.previewUrl) URL.revokeObjectURL(entry.previewUrl);
      }
    },
    [selected],
  );

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: SelectedFile[] = [];
    const refused: string[] = [];
    for (const file of Array.from(list)) {
      if (!isAcceptedEcoImage(file)) {
        refused.push(`${file.name}: no es JPG, PNG ni BMP`);
        continue;
      }
      if (file.size > MAX_ECO_IMAGE_BYTES * 4) {
        refused.push(`${file.name}: es demasiado grande`);
        continue;
      }
      accepted.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random()}`,
        file,
        // El navegador muestra el BMP en <img>, así que se previsualiza igual.
        previewUrl: URL.createObjectURL(file),
      });
    }
    setSelected((current) =>
      [...current, ...accepted].slice(0, MAX_ECO_IMAGES_PER_UPLOAD),
    );
    setRejected(refused);
  };

  const removeSelected = (key: string) =>
    setSelected((current) => current.filter((entry) => entry.key !== key));

  const handleUpload = async () => {
    if (!itemId || selected.length === 0) return;
    setPreparing(true);
    try {
      const files: File[] = [];
      for (const entry of selected) {
        files.push(await toUploadableEcoImage(entry.file));
      }
      const tooBig = files.find((file) => file.size > MAX_ECO_IMAGE_BYTES);
      if (tooBig) {
        setRejected([`${tooBig.name}: pesa más de 15 MB`]);
        return;
      }
      upload.mutate(
        {
          itemId,
          files,
          reportIds: mustChooseReport ? reportIds : [],
        },
        { onSuccess: () => setSelected([]) },
      );
    } catch {
      setRejected(["No se pudo preparar una de las imágenes. Probá de nuevo."]);
    } finally {
      setPreparing(false);
    }
  };

  const busy = preparing || upload.isPending;
  const canUpload =
    selected.length > 0 && (!mustChooseReport || reportIds.length > 0) && !busy;

  return (
    <Dialog open={Boolean(item)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Imágenes de la ecografía</DialogTitle>
          {item && (
            <DialogDescription>
              {[
                item.patientName,
                item.patientDni ? `DNI ${item.patientDni}` : null,
                item.studyDate ? formatDateAR(item.studyDate.slice(0, 10)) : null,
                item.doctorName,
              ]
                .filter(Boolean)
                .join(" · ")}
            </DialogDescription>
          )}
        </DialogHeader>

        {mustChooseReport && (
          <section className="space-y-2">
            <p className="text-sm font-medium text-gray-900">
              La médica dividió el estudio. ¿A qué informe van estas imágenes?
            </p>
            <div className="flex flex-wrap gap-4">
              {reports.map((report) => (
                <div key={report.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`report-${report.id}`}
                    checked={reportIds.includes(report.id)}
                    onCheckedChange={(checked) =>
                      setReportIds((current) =>
                        checked
                          ? [...current, report.id]
                          : current.filter((id) => id !== report.id),
                      )
                    }
                  />
                  <Label htmlFor={`report-${report.id}`} className="text-sm">
                    {report.splitLabel || "Informe"}
                    {report.status === "FIRMADO" && (
                      <span className="ml-1 text-gray-500">(firmado)</span>
                    )}
                  </Label>
                </div>
              ))}
            </div>
          </section>
        )}

        {(goesToHistory || mixed) && (
          <Alert>
            <AlertDescription>
              {goesToHistory
                ? "El informe ya está firmado: las imágenes se suman a la historia del paciente. El PDF firmado no cambia."
                : "Una parte ya está firmada: ahí las imágenes se suman a la historia; en lo que falta firmar, salen en el PDF."}
            </AlertDescription>
          </Alert>
        )}
        {!goesToHistory && !mixed && (
          <p className="text-sm text-gray-600">
            Las imágenes salen en el PDF del informe cuando la médica lo firme.
          </p>
        )}

        <section className="space-y-3">
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_ECO_IMAGE_EXTENSIONS.join(",")}
            className="hidden"
            data-testid="eco-images-input"
            onChange={(event) => {
              addFiles(event.target.files);
              event.target.value = "";
            }}
          />
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
          >
            <ImagePlus className="h-4 w-4" />
            Elegir imágenes del pendrive
          </Button>

          {rejected.length > 0 && (
            <ul className="space-y-1 text-sm text-rose-700">
              {rejected.map((message) => (
                <li key={message}>{message}</li>
              ))}
            </ul>
          )}

          {selected.length > 0 && (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {selected.map((entry) => (
                <div
                  key={entry.key}
                  className="relative overflow-hidden rounded-md border"
                >
                  {entry.previewUrl && (
                    <img
                      src={entry.previewUrl}
                      alt={entry.file.name}
                      className="aspect-square w-full object-cover"
                    />
                  )}
                  <button
                    type="button"
                    className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 shadow hover:text-rose-700"
                    onClick={() => removeSelected(entry.key)}
                    aria-label={`Quitar ${entry.file.name}`}
                    disabled={busy}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-2">
          <p className="text-sm font-medium text-gray-900">Ya subidas</p>
          {isLoading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="aspect-square w-full" />
              ))}
            </div>
          ) : images.length === 0 ? (
            <p className="text-sm text-gray-500">Todavía no hay imágenes.</p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {images.map((image) => (
                <UploadedThumb
                  key={image.id}
                  itemId={itemId!}
                  image={image}
                  deleting={remove.isPending}
                  onDelete={() =>
                    remove.mutate({ itemId: itemId!, imageId: image.id })
                  }
                />
              ))}
            </div>
          )}
        </section>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={handleUpload} disabled={!canUpload}>
            {busy
              ? "Subiendo..."
              : selected.length === 0
                ? "Subir imágenes"
                : selected.length === 1
                  ? "Subir 1 imagen"
                  : `Subir ${selected.length} imágenes`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface UploadedThumbProps {
  itemId: string;
  image: ReceptionUploadedImage;
  deleting: boolean;
  onDelete: () => void;
}

const UploadedThumb = ({
  itemId,
  image,
  deleting,
  onDelete,
}: UploadedThumbProps) => {
  const { data: blob } = useQuery({
    queryKey: ["reception-eco-image", itemId, image.id],
    queryFn: () => getReceptionEcoImage(itemId, image.id),
    staleTime: Infinity,
  });
  const objectUrl = useMemo(
    () => (blob ? URL.createObjectURL(blob) : null),
    [blob],
  );
  useEffect(
    () => () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
    [objectUrl],
  );

  return (
    <div className="space-y-1">
      <div className="relative overflow-hidden rounded-md border">
        {objectUrl ? (
          <button
            type="button"
            className="block w-full"
            onClick={() => window.open(objectUrl, "_blank")}
            title={`Ver ${image.originalName} más grande`}
          >
            <img
              src={objectUrl}
              alt={image.originalName}
              className="aspect-square w-full object-cover"
            />
          </button>
        ) : (
          <Skeleton className="aspect-square w-full" />
        )}
        {image.canDelete && (
          <button
            type="button"
            className="absolute right-1 top-1 rounded-full bg-white/90 p-1 text-gray-700 shadow hover:text-rose-700"
            onClick={onDelete}
            disabled={deleting}
            aria-label={`Borrar ${image.originalName}`}
          >
            <Trash2 className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1">
        {image.splitLabel && (
          <Badge variant="outline" className="text-[10px]">
            {image.splitLabel}
          </Badge>
        )}
        {image.attachedToHistory && (
          <Badge variant="secondary" className="text-[10px]">
            En la historia
          </Badge>
        )}
      </div>
    </div>
  );
};
