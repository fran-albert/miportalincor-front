import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, FilePenLine, PenLine, Save, X } from "lucide-react";
import { toast } from "sonner";
import {
  addStudyReportAddendum,
  getMyStudyReports,
  getStudyReportTemplates,
  getStudyReportViewer,
  previewStudyReport,
  saveStudyReportDraft,
  signStudyReport,
} from "@/api/StudyReport/study-report.actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { environment } from "@/config/environment";
import type {
  StudyReportField,
  StudyReportListItem,
  StudyReportTemplate,
} from "@/types/StudyReport/StudyReport.types";

const reportsQueryKey = ["study-reports", "mine"] as const;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-AR") : "Sin fecha";

interface FieldProps {
  field: StudyReportField;
  value: unknown;
  disabled: boolean;
  onChange: (value: string | number) => void;
}

function Field({ field, value, disabled, onChange }: FieldProps) {
  const stringValue = value === undefined || value === null ? "" : String(value);

  if (field.type === "select") {
    return (
      <label className="grid gap-1.5 text-sm font-medium">
        <span>{field.label}</span>
        <select
          className="h-10 rounded-md border bg-background px-3"
          disabled={disabled}
          value={stringValue}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Seleccionar</option>
          {field.options?.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      </label>
    );
  }

  if (field.type === "number") {
    return (
      <label className="grid gap-1.5 text-sm font-medium">
        <span>{field.label}</span>
        <Input
          disabled={disabled}
          type="number"
          value={stringValue}
          onChange={(event) => onChange(event.target.valueAsNumber)}
        />
      </label>
    );
  }

  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>{field.label}</span>
      <Textarea
        className="min-h-28 resize-y"
        disabled={disabled}
        value={stringValue}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

interface EditorProps {
  item: StudyReportListItem;
  templates: StudyReportTemplate[];
  onClose: () => void;
}

function Editor({ item, templates, onClose }: EditorProps) {
  const queryClient = useQueryClient();
  const [report, setReport] = useState(item.report);
  const [templateKey, setTemplateKey] = useState(
    item.report?.templateKey ?? templates[0]?.key ?? "",
  );
  const [content, setContent] = useState<Record<string, unknown>>(
    item.report?.content ?? {},
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [addendum, setAddendum] = useState("");
  const template = useMemo(
    () => templates.find((candidate) => candidate.key === templateKey),
    [templates, templateKey],
  );
  const reportId = report?.id;
  const signed = report?.status === "FIRMADO";

  const save = useMutation({
    mutationFn: () => saveStudyReportDraft(item.sourceInboxItemId, templateKey, content),
    onSuccess: (next) => {
      setReport(next);
      queryClient.invalidateQueries({ queryKey: reportsQueryKey });
    },
    onError: () => toast.error("No se pudo guardar el borrador"),
  });
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const viewer = useQuery({
    queryKey: ["study-reports", "viewer", reportId],
    queryFn: () => getStudyReportViewer(reportId!),
    enabled: Boolean(reportId),
  });
  const viewerUrl = viewer.data?.viewerPath.startsWith("http")
    ? viewer.data.viewerPath
    : viewer.data?.viewerPath
      ? `${environment.API_INCOR_HC_URL.replace(/\/$/, "")}/${viewer.data.viewerPath.replace(/^\//, "")}`
      : undefined;

  useEffect(() => {
    if (!reportId && templateKey && !saveRef.current.isPending) {
      // El backend elige la plantilla por el subtipo del turno y prellena el
      // content con el texto normal: hidratamos el estado local con lo que
      // devuelve para que la médica vea el informe-normal (no campos vacíos).
      void saveRef.current.mutateAsync().then((created) => {
        setTemplateKey(created.templateKey);
        setContent(created.content);
      });
    }
  }, [reportId, templateKey]);

  useEffect(() => {
    if (!reportId || signed || !hasUnsavedChanges) {
      return;
    }

    const timer = window.setTimeout(() => {
      void saveRef.current.mutateAsync();
    }, 900);

    return () => window.clearTimeout(timer);
  }, [content, hasUnsavedChanges, reportId, signed, templateKey]);

  const updateField = (fieldKey: string, value: string | number) => {
    setContent((current) => ({
      ...current,
      [fieldKey]: Number.isNaN(value) ? "" : value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleTemplateChange = (nextTemplateKey: string) => {
    setTemplateKey(nextTemplateKey);
    setContent({});
    setHasUnsavedChanges(true);
  };

  const preview = async () => {
    if (!reportId) {
      return;
    }

    const url = URL.createObjectURL(await previewStudyReport(reportId));
    setPdfUrl(url);
  };

  const sign = async () => {
    if (!reportId) {
      return;
    }

    const next = await signStudyReport(reportId);
    setReport(next);
    queryClient.invalidateQueries({ queryKey: reportsQueryKey });
    toast.success("Informe firmado");
  };

  const addSignedAddendum = async () => {
    if (!reportId) {
      return;
    }

    await addStudyReportAddendum(reportId, addendum);
    setAddendum("");
    toast.success("Adenda firmada");
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="flex h-16 items-center justify-between border-b px-5">
        <div>
          <p className="font-semibold">{item.patientName ?? "Paciente sin nombre"}</p>
          <p className="text-sm text-muted-foreground">
            DNI {item.patientDni ?? "—"} · {formatDate(item.studyDate)} ·{" "}
            {item.studyType ?? "Ecografía"}
          </p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          <X className="mr-2 h-4 w-4" />
          Cerrar
        </Button>
      </div>

      <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-2">
        <section className="min-h-0 border-r bg-muted/20">
          <iframe
            className="h-full w-full border-0"
            src={viewerUrl}
            title="Visor de imágenes DICOM"
          />
        </section>

        <section className="min-h-0 overflow-y-auto p-5">
          <div className="mx-auto max-w-2xl space-y-5">
            {signed ? (
              <>
                <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                  Informe firmado. El original quedó cerrado.
                </p>
                <Label htmlFor="adenda">Agregar adenda firmada</Label>
                <Textarea
                  id="adenda"
                  value={addendum}
                  onChange={(event) => setAddendum(event.target.value)}
                />
                <Button disabled={!addendum.trim()} onClick={() => void addSignedAddendum()}>
                  Firmar adenda
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <label className="grid flex-1 gap-1.5 text-sm font-medium">
                    <span>Plantilla</span>
                    <select
                      className="h-10 rounded-md border bg-background px-3"
                      value={templateKey}
                      onChange={(event) => handleTemplateChange(event.target.value)}
                    >
                      {templates.map((candidate) => (
                        <option key={candidate.key} value={candidate.key}>
                          {candidate.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <Button
                    disabled={save.isPending || !templateKey}
                    onClick={() => save.mutate()}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Guardar borrador
                  </Button>
                </div>

                {template?.fields.map((field) => (
                  <Field
                    key={field.key}
                    disabled={false}
                    field={field}
                    value={content[field.key]}
                    onChange={(value) => updateField(field.key, value)}
                  />
                ))}

                <div className="flex flex-wrap gap-2 border-t pt-5">
                  <Button variant="outline" disabled={!reportId} onClick={() => void preview()}>
                    <Eye className="mr-2 h-4 w-4" />
                    Previsualizar PDF
                  </Button>
                  <Button disabled={!reportId} onClick={() => void sign()}>
                    <PenLine className="mr-2 h-4 w-4" />
                    Firmar informe
                  </Button>
                </div>
              </>
            )}
          </div>
        </section>
      </div>

      <Dialog
        open={Boolean(pdfUrl)}
        onOpenChange={(open) => {
          if (!open && pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
          }
        }}
      >
        <DialogContent className="h-[92vh] max-w-5xl">
          <DialogHeader>
            <DialogTitle>Previsualización del informe final</DialogTitle>
          </DialogHeader>
          {pdfUrl && <iframe className="h-full w-full" src={pdfUrl} title="Previsualización PDF" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function StudyReportsPage() {
  const [active, setActive] = useState<StudyReportListItem | null>(null);
  const reports = useQuery({
    queryKey: reportsQueryKey,
    queryFn: getMyStudyReports,
  });
  const templates = useQuery({
    queryKey: ["study-reports", "templates"],
    queryFn: getStudyReportTemplates,
    staleTime: Infinity,
  });

  if (active && templates.data) {
    return <Editor item={active} templates={templates.data} onClose={() => setActive(null)} />;
  }

  return (
    <>
      <Helmet>
        <title>Mis estudios por informar</title>
      </Helmet>
      <main className="space-y-5 p-4 md:p-6">
        <header>
          <h1 className="text-2xl font-semibold">Mis estudios por informar</h1>
          <p className="text-sm text-muted-foreground">
            Ecografías con imágenes listas para informar.
          </p>
        </header>

        {reports.isError ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            El editor no está habilitado para esta médica o no se pudo cargar la cola.
          </p>
        ) : reports.data?.length === 0 ? (
          <p className="rounded-md border border-dashed p-6 text-sm text-muted-foreground">
            No hay estudios por informar.
          </p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left">
                <tr>
                  <th className="p-3">Paciente</th>
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Estado</th>
                  <th className="p-3" />
                </tr>
              </thead>
              <tbody>
                {reports.data?.map((item) => (
                  <tr key={item.sourceInboxItemId} className="border-t">
                    <td className="p-3">
                      <p className="font-medium">{item.patientName ?? "Sin nombre"}</p>
                      <p className="text-muted-foreground">DNI {item.patientDni ?? "—"}</p>
                    </td>
                    <td className="p-3">{formatDate(item.studyDate)}</td>
                    <td className="p-3">{item.studyType ?? "Ecografía"}</td>
                    <td className="p-3">
                      {item.state === "SIN_EMPEZAR" ? "Sin empezar" : "Borrador"}
                    </td>
                    <td className="p-3 text-right">
                      <Button size="sm" onClick={() => setActive(item)}>
                        <FilePenLine className="mr-2 h-4 w-4" />
                        {item.state === "SIN_EMPEZAR" ? "Informar" : "Continuar"}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
