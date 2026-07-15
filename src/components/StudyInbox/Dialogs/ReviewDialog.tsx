import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ExternalLink, FileText, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudyInboxDetail } from "@/api/StudyInbox/get-study-inbox-detail.action";
import { PacsImagesGrid } from "./PacsImagesGrid";
import { EcoTypeNoteField } from "./EcoTypeNoteField";
import { useSearchPatients } from "@/hooks/Patient/useSearchPatients";
import { useStudyInboxMutations } from "@/hooks/StudyInbox/useStudyInboxMutations";
import { StudyInboxItem } from "@/types/StudyInbox/StudyInbox.types";
import { STATUS_META, studyTypeLabel } from "../status";

interface ReviewDialogProps {
  item: StudyInboxItem | null;
  open: boolean;
  onClose: () => void;
}

interface SelectedPatient {
  id: string;
  name: string;
  dni: string;
}

export const ReviewDialog = ({ item, open, onClose }: ReviewDialogProps) => {
  const id = item?.id ?? null;
  const { confirm, discard, hold, release } = useStudyInboxMutations();

  const { data: detail, isLoading } = useQuery({
    queryKey: ["study-inbox-detail", id],
    queryFn: () => getStudyInboxDetail(id as string),
    enabled: open && !!id,
  });

  const {
    patients,
    isFetching: isSearching,
    search,
    setSearch,
  } = useSearchPatients({ initialLimit: 5 });

  const [selected, setSelected] = useState<SelectedPatient | null>(null);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [holdInput, setHoldInput] = useState("");

  const confirmable =
    item?.status === "LISTO_PARA_CONFIRMAR" ||
    item?.status === "REQUIERE_REVISION";
  const isEco = item?.suggestedStudyTypeId === 2;
  const hasPacsImages = !!item?.pacsStudyInstanceUID;

  // Precargar fecha detectada y buscar por el nombre detectado al abrir
  useEffect(() => {
    if (!open || !item) return;
    setSelected(null);
    setReason("");
    setHoldInput("");
    setNote("");
    setDate(item.detectedStudyDate ? item.detectedStudyDate.slice(0, 10) : "");
    if (item.detectedPatientName) setSearch(item.detectedPatientName);
  }, [open, item, setSearch]);

  // Preseleccionar el paciente sugerido cuando aparece en los resultados
  useEffect(() => {
    if (selected || !item?.suggestedPatientUserId) return;
    const match = patients.find((p) => p.id === item.suggestedPatientUserId);
    if (match) {
      setSelected({
        id: match.id,
        name: `${match.lastName} ${match.firstName}`,
        dni: match.userName,
      });
    }
  }, [patients, item, selected]);

  const statusMeta = item ? STATUS_META[item.status] : null;

  const canConfirm = useMemo(
    () =>
      confirmable &&
      !!selected &&
      !!date &&
      !confirm.isPending &&
      !item?.onHold,
    [confirmable, selected, date, confirm.isPending, item?.onHold]
  );

  const handleConfirm = () => {
    if (!id || !selected || !date) return;
    confirm.mutate(
      {
        id,
        payload: {
          userId: selected.id,
          date: new Date(date).toISOString(),
          note: note.trim() || undefined,
        },
      },
      { onSuccess: onClose }
    );
  };

  const handleDiscard = () => {
    if (!id) return;
    discard.mutate(
      { id, reason: reason.trim() || "Sin motivo" },
      { onSuccess: onClose }
    );
  };

  const handleHold = () => {
    if (!id) return;
    hold.mutate(
      { id, reason: holdInput.trim() || "Pendiente de pago" },
      { onSuccess: onClose }
    );
  };

  const handleRelease = () => {
    if (!id) return;
    release.mutate(id, { onSuccess: onClose });
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-greenPrimary" />
            Revisar estudio recibido
            {statusMeta && (
              <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* Informe (PDF) + imagenes del PACS */}
          <div className="space-y-3">
            {isLoading ? (
              <Skeleton className="h-[60vh] w-full" />
            ) : (
              <>
                {detail?.signedUrl ? (
                  <div className="space-y-2">
                    <iframe
                      src={detail.signedUrl}
                      title="PDF del estudio"
                      className={`${hasPacsImages ? "h-[38vh]" : "h-[60vh]"} w-full rounded-lg border border-gray-200`}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() =>
                        window.open(detail.signedUrl as string, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4" />
                      Abrir PDF en otra pestaña
                    </Button>
                  </div>
                ) : item?.attachmentId ? (
                  // Hay informe pero la URL firmada no vino: es un ERROR,
                  // distinto de "todavia no hay informe".
                  <div className="flex h-[20vh] items-center justify-center rounded-lg border border-dashed border-rose-200 text-rose-700">
                    No se pudo cargar el PDF del informe. Cerrá y volvé a
                    abrir el item.
                  </div>
                ) : (
                  <div className="flex h-[10vh] items-center justify-center rounded-lg border border-dashed text-sm text-gray-500">
                    Sin informe todavía — se puede confirmar solo con las
                    imágenes.
                  </div>
                )}

                {hasPacsImages && item && (
                  <div className="space-y-2">
                    <p className="text-sm font-semibold text-gray-700">
                      Imágenes del estudio
                      {item.pacsInstanceCount
                        ? ` (${item.pacsInstanceCount})`
                        : ""}
                    </p>
                    <PacsImagesGrid itemId={item.id} />
                  </div>
                )}
              </>
            )}
          </div>

          {/* Datos + paciente */}
          <div className="space-y-5">
            {detail?.nameMismatch && (
              <div className="flex items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>
                  El nombre detectado no coincide del todo con el paciente
                  sugerido. Verificá antes de confirmar.
                </span>
              </div>
            )}

            {item?.onHold && (
              <div className="flex items-start justify-between gap-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>
                    <span className="font-semibold">Retenido.</span>{" "}
                    {item.holdReason || "Pendiente de pago / orden."} No se puede
                    cargar hasta marcarlo como saldado.
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-shrink-0 border-red-300 text-red-700 hover:bg-red-100"
                  disabled={release.isPending}
                  onClick={handleRelease}
                >
                  {release.isPending ? "..." : "Marcar como saldado"}
                </Button>
              </div>
            )}

            <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm">
              <p className="mb-2 font-semibold text-gray-700">Datos detectados</p>
              <dl className="grid grid-cols-2 gap-y-1 text-gray-600">
                <dt>Paciente</dt>
                <dd className="text-right font-medium text-gray-900">
                  {item?.detectedPatientName || "—"}
                </dd>
                <dt>Tipo</dt>
                <dd className="text-right">
                  {studyTypeLabel(item?.suggestedStudyTypeId)}
                  {item?.detectedStudySubtype
                    ? ` · ${item.detectedStudySubtype}`
                    : ""}
                </dd>
                {/* Ficha / Ingreso / Institución son datos de laboratorio: en
                    un item de ecografía no existen y no se muestran vacíos. */}
                {item?.detectedLabFicha && (
                  <>
                    <dt>Ficha</dt>
                    <dd className="text-right">{item.detectedLabFicha}</dd>
                  </>
                )}
                {item?.detectedLabIngreso && (
                  <>
                    <dt>Ingreso</dt>
                    <dd className="text-right">{item.detectedLabIngreso}</dd>
                  </>
                )}
                {item?.detectedInstitution && (
                  <>
                    <dt>Institución</dt>
                    <dd className="text-right">{item.detectedInstitution}</dd>
                  </>
                )}
                {item?.emailSubject && (
                  <>
                    <dt>Asunto del correo</dt>
                    <dd className="text-right">{item.emailSubject}</dd>
                  </>
                )}
              </dl>
            </div>

            {confirmable ? (
              <>
                <div className="space-y-2">
                  <Label>Paciente</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                      className="pl-9"
                      placeholder="Buscar paciente por nombre o DNI..."
                      value={search}
                      onChange={(e) => {
                        setSelected(null);
                        setSearch(e.target.value);
                      }}
                    />
                  </div>
                  {selected ? (
                    <div className="flex items-center justify-between rounded-lg border border-greenPrimary/30 bg-greenPrimary/5 p-2 text-sm">
                      <span className="font-medium text-gray-900">
                        {selected.name}{" "}
                        <span className="text-gray-500">· DNI {selected.dni}</span>
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelected(null)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  ) : (
                    <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-100">
                      {isSearching ? (
                        <div className="p-3 text-sm text-gray-500">Buscando...</div>
                      ) : patients.length ? (
                        patients.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
                            onClick={() =>
                              setSelected({
                                id: p.id,
                                name: `${p.lastName} ${p.firstName}`,
                                dni: p.userName,
                              })
                            }
                          >
                            <span className="font-medium text-gray-900">
                              {p.lastName} {p.firstName}
                            </span>
                            <span className="text-gray-500">DNI {p.userName}</span>
                          </button>
                        ))
                      ) : (
                        <div className="p-3 text-sm text-gray-500">
                          Sin pacientes para esa búsqueda
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="study-date">Fecha del estudio</Label>
                  <Input
                    id="study-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {isEco && (
                  <EcoTypeNoteField
                    value={note}
                    onChange={setNote}
                    detectedSubtype={item?.detectedStudySubtype ?? null}
                  />
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-1">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" className="text-red-600 hover:bg-red-50">
                          Descartar
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Descartar estudio</AlertDialogTitle>
                          <AlertDialogDescription>
                            El estudio no se cargará a ninguna historia clínica.
                            Indicá el motivo.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea
                          placeholder="Motivo del descarte"
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                        />
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-600 hover:bg-red-700"
                            onClick={handleDiscard}
                          >
                            Descartar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {!item?.onHold && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="text-amber-700 hover:bg-amber-50"
                          >
                            Retener
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Retener estudio</AlertDialogTitle>
                            <AlertDialogDescription>
                              No se podrá cargar hasta marcarlo como saldado.
                              Indicá el motivo (ej. deuda, falta de orden).
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <Textarea
                            placeholder="Motivo de la retención"
                            value={holdInput}
                            onChange={(e) => setHoldInput(e.target.value)}
                          />
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-amber-600 hover:bg-amber-700"
                              onClick={handleHold}
                            >
                              Retener
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>

                  <Button
                    className="bg-gradient-to-r from-greenPrimary to-teal-600 text-white"
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                  >
                    {confirm.isPending ? "Cargando..." : "Confirmar carga"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4 text-sm text-gray-600">
                {item?.status === "CARGADO"
                  ? "Este estudio ya fue cargado a la historia clínica."
                  : item?.status === "DESCARTADO"
                    ? `Descartado${item?.rejectionReason ? `: ${item.rejectionReason}` : ""}.`
                    : "Este estudio no está disponible para confirmar."}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
