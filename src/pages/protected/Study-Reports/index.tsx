import { useEffect, useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Eye, FilePenLine, PenLine, RefreshCw, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  addStudyReportAddendum,
  discardStudyReport,
  getMyStudyReports,
  getStudyReportTemplates,
  previewStudyReport,
  saveStudyReportDraft,
  signStudyReport,
  splitStudyReport,
} from "@/api/StudyReport/study-report.actions";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/Table/table";
import { PageHeader } from "@/components/PageHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { StudyReportImagesGallery } from "@/components/StudyReport/StudyReportImagesGallery";
import type {
  StudyReportField,
  StudyReportListItem,
  StudyReportSplitGroup,
  StudyReportTemplate,
} from "@/types/StudyReport/StudyReport.types";
import { StudyReportSplitPanel } from "@/components/StudyReport/StudyReportSplitPanel";

const reportsQueryKey = ["study-reports", "mine"] as const;

const formatDate = (value: string | null) =>
  value ? new Date(value).toLocaleDateString("es-AR") : "Sin fecha";

interface StudyReportColumnsProps {
  onOpen: (item: StudyReportListItem) => void;
  onSplit: (item: StudyReportListItem) => void;
  onDiscard: (item: StudyReportListItem) => void;
}

const getStudyReportColumns = ({
  onOpen,
  onSplit,
  onDiscard,
}: StudyReportColumnsProps): ColumnDef<StudyReportListItem>[] => [
  {
    accessorKey: "patientName",
    header: "Paciente",
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.patientName ?? "Sin nombre"}</p>
        <p className="text-muted-foreground">DNI {row.original.patientDni ?? "—"}</p>
      </div>
    ),
  },
  {
    accessorKey: "studyDate",
    header: "Fecha",
    cell: ({ row }) => formatDate(row.original.studyDate),
  },
  {
    accessorKey: "studyType",
    header: "Tipo",
    // Para un informe dividido, el "tipo" es el nombre que le puso la médica
    // (splitLabel); si no está dividido, el subtipo del turno.
    cell: ({ row }) =>
      row.original.splitLabel ?? row.original.studyType ?? "Ecografía",
  },
  {
    accessorKey: "state",
    header: "Estado",
    cell: ({ row }) =>
      row.original.state === "SIN_EMPEZAR" ? "Sin empezar" : "Borrador",
  },
  {
    id: "actions",
    header: "",
    meta: { headerClassName: "text-right", cellClassName: "text-right" },
    cell: ({ row }) => (
      <div className="flex justify-end gap-2">
        {row.original.state === "SIN_EMPEZAR" && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSplit(row.original)}
          >
            Dividir
          </Button>
        )}
        {row.original.state === "BORRADOR" && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onDiscard(row.original)}
            title="Descartar borrador"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
        <Button size="sm" onClick={() => onOpen(row.original)}>
          <FilePenLine className="mr-2 h-4 w-4" />
          {row.original.state === "SIN_EMPEZAR" ? "Informar" : "Continuar"}
        </Button>
      </div>
    ),
  },
];

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

  const discard = useMutation({
    mutationFn: () => {
      if (!reportId) throw new Error("Sin informe para descartar");
      return discardStudyReport(reportId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      toast.success("Borrador descartado");
      onClose();
    },
    onError: () => toast.error("No se pudo descartar el borrador"),
  });

  const handleDiscard = () => {
    if (!reportId) return;
    if (
      window.confirm(
        "¿Descartar este borrador? Se pierde lo escrito y el estudio vuelve a estar sin empezar.",
      )
    ) {
      discard.mutate();
    }
  };

  const save = useMutation({
    mutationFn: () =>
      saveStudyReportDraft(item.sourceInboxItemId, templateKey, content, reportId),
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
        <div className="flex gap-2">
          {reportId && !signed && (
            <Button
              variant="ghost"
              className="text-rose-700 hover:text-rose-800"
              disabled={discard.isPending}
              onClick={handleDiscard}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Descartar borrador
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </div>

      <div className="grid h-[calc(100vh-4rem)] lg:grid-cols-2">
        <section className="min-h-0 border-r bg-muted/20">
          {reportId ? (
            <StudyReportImagesGallery reportId={reportId} />
          ) : (
            <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
              Preparando el informe y sus imágenes…
            </div>
          )}
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
  const [splitItem, setSplitItem] = useState<StudyReportListItem | null>(null);
  const queryClient = useQueryClient();
  const reports = useQuery({
    queryKey: reportsQueryKey,
    queryFn: getMyStudyReports,
  });
  const templates = useQuery({
    queryKey: ["study-reports", "templates"],
    queryFn: getStudyReportTemplates,
    staleTime: Infinity,
  });
  const splitMutation = useMutation({
    mutationFn: (groups: StudyReportSplitGroup[]) => {
      if (!splitItem) throw new Error("No hay un item seleccionado");
      return splitStudyReport(splitItem.sourceInboxItemId, groups);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      setSplitItem(null);
      toast.success("Estudio dividido en informes");
    },
    onError: () => toast.error("No se pudo dividir el estudio"),
  });
  const discardMutation = useMutation({
    mutationFn: (reportId: string) => discardStudyReport(reportId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportsQueryKey });
      toast.success("Borrador descartado");
    },
    onError: () => toast.error("No se pudo descartar el borrador"),
  });
  const columns = useMemo(
    () =>
      getStudyReportColumns({
        onOpen: setActive,
        onSplit: setSplitItem,
        onDiscard: (item) => {
          if (!item.report?.id) return;
          if (
            window.confirm(
              "¿Descartar este borrador? Se pierde lo escrito y el estudio vuelve a estar sin empezar.",
            )
          ) {
            discardMutation.mutate(item.report.id);
          }
        },
      }),
    [discardMutation],
  );

  if (active && templates.data) {
    return <Editor item={active} templates={templates.data} onClose={() => setActive(null)} />;
  }

  return (
    <>
      <Helmet>
        <title>Mis estudios por informar</title>
      </Helmet>
      <main className="space-y-5 p-4 md:p-6">
        <PageHeader
          breadcrumbItems={[
            { label: "Inicio", href: "/inicio" },
            { label: "Mis estudios por informar" },
          ]}
          title="Mis estudios por informar"
          description="Ecografías con imágenes listas para informar."
          icon={<FilePenLine className="h-6 w-6" />}
          actions={
            <Button
              variant="outline"
              disabled={reports.isFetching}
              onClick={() => void reports.refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          }
        />

        {reports.isError ? (
          <p className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            El editor no está habilitado para esta médica o no se pudo cargar la cola.
          </p>
        ) : (
          <div className="overflow-hidden sm:rounded-lg">
            <DataTable
              columns={columns}
              data={reports.data ?? []}
              getRowId={(row) =>
                `${row.sourceInboxItemId}-${row.report?.id ?? "new"}`
              }
              canAddUser={false}
              isLoading={reports.isLoading}
              isFetching={reports.isFetching}
              showDataOnEmptySearch={true}
            />
          </div>
        )}
      </main>
      <Dialog
        open={Boolean(splitItem)}
        onOpenChange={(open) => {
          if (!open && !splitMutation.isPending) setSplitItem(null);
        }}
      >
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Dividir estudio en informes</DialogTitle>
          </DialogHeader>
          {splitItem && templates.data && (
            <StudyReportSplitPanel
              itemId={splitItem.sourceInboxItemId}
              templates={templates.data}
              isPending={splitMutation.isPending}
              onConfirm={(groups) => splitMutation.mutate(groups)}
              onCancel={() => setSplitItem(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
