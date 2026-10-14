import { useState } from "react";
import { ImagePlus, Images } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDateAR } from "@/common/helpers/timezone";
import { useReceptionEcoItems } from "@/hooks/StudyReport/useReceptionEcoImages";
import { ReceptionEcoItem } from "@/types/StudyReport/ReceptionEcoImages.types";
import { REPORT_STATE_META } from "./status";
import { UploadEcoImagesDialog } from "./UploadEcoImagesDialog";


/**
 * Ecografías que se informaron desde el turno sin imágenes (el ecógrafo no
 * tiene la licencia DICOM): recepción les sube las fotos del pendrive.
 */
export const EcoImagesPanel = () => {
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [active, setActive] = useState<ReceptionEcoItem | null>(null);

  const { items, isLoading, isError } = useReceptionEcoItems({
    onlyWithoutImages: !showAll,
    search,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar por paciente o DNI..."
          className="sm:max-w-sm"
        />
        <div className="flex items-center gap-2">
          <Switch
            id="eco-images-show-all"
            checked={showAll}
            onCheckedChange={setShowAll}
          />
          <Label htmlFor="eco-images-show-all" className="text-sm">
            Mostrar también las que ya tienen imágenes
          </Label>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fecha</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Médica</TableHead>
              <TableHead>Estudio</TableHead>
              <TableHead>Informe</TableHead>
              <TableHead className="text-center">Imágenes</TableHead>
              <TableHead className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading &&
              Array.from({ length: 3 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell colSpan={7}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))}
            {!isLoading && isError && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-rose-700"
                >
                  No se pudo cargar la lista. Probá de nuevo en un rato.
                </TableCell>
              </TableRow>
            )}
            {!isLoading && !isError && items.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="py-8 text-center text-gray-500"
                >
                  {search.trim()
                    ? "No hay ecografías que coincidan con la búsqueda."
                    : showAll
                      ? "No hay ecografías de los últimos 30 días sin imágenes del ecógrafo."
                      : "No hay ecografías esperando imágenes."}
                </TableCell>
              </TableRow>
            )}
            {!isLoading &&
              items.map((item) => {
                const state = REPORT_STATE_META[item.reportState];
                return (
                  <TableRow key={item.sourceInboxItemId}>
                    <TableCell className="whitespace-nowrap">
                      {item.studyDate ? formatDateAR(item.studyDate) : "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {item.patientName || "—"}
                        </span>
                        {item.patientDni && (
                          <span className="text-xs text-gray-500">
                            DNI {item.patientDni}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{item.doctorName || "—"}</TableCell>
                    <TableCell className="max-w-[16rem] text-sm text-gray-700">
                      {item.studyType || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={state.variant}>{state.label}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.uploadedImageCount}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={
                          item.uploadedImageCount > 0 ? "outline" : "default"
                        }
                        className="gap-2"
                        onClick={() => setActive(item)}
                      >
                        {item.uploadedImageCount > 0 ? (
                          <Images className="h-4 w-4" />
                        ) : (
                          <ImagePlus className="h-4 w-4" />
                        )}
                        {item.uploadedImageCount > 0
                          ? "Ver imágenes"
                          : "Subir imágenes"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </div>

      <UploadEcoImagesDialog item={active} onClose={() => setActive(null)} />
    </div>
  );
};
