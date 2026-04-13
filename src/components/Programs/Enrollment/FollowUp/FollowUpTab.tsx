import { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useRoles from "@/hooks/useRoles";
import { useProgramMembership } from "@/hooks/Program/useProgramMembership";
import { useFollowUpEntries } from "@/hooks/Program/useFollowUpEntries";
import { useMonthlySummary } from "@/hooks/Program/useMonthlySummary";
import { useFollowUpMutations } from "@/hooks/Program/useFollowUpMutations";
import { useMonthlySummaryPDF } from "@/hooks/Program/useMonthlySummaryPDF";
import { MonthlySummaryDetailDialog } from "@/components/Programs/FollowUp/MonthlySummaryDetailDialog";
import { MonthlySummaryFormDialog } from "@/components/Programs/FollowUp/MonthlySummaryFormDialog";
import { MonthlySummaryList } from "@/components/Programs/FollowUp/MonthlySummaryList";
import { NotesList } from "@/components/Programs/FollowUp/NotesList";
import {
  FollowUpEntryType,
  FollowUpVisibility,
  FollowUpVisibilityLabels,
  ProgramFollowUpEntry,
  ProgramFollowUpSummaryContent,
} from "@/types/Program/ProgramFollowUp";
import { Pencil, Plus, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FollowUpTabProps {
  programId: string;
  enrollmentId: string;
  patientName: string;
  programName: string;
}

const parseMonthValue = (value: string) => {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
};

const formatMonthValue = (year?: number, month?: number) => {
  if (!year || !month) {
    return null;
  }

  return `${year}-${String(month).padStart(2, "0")}`;
};

const getMonthLabel = (value: string, pattern = "MMMM yyyy") =>
  format(parse(`${value}-01`, "yyyy-MM-dd", new Date()), pattern, {
    locale: es,
  });

const getMonthHeading = (value: string) => {
  const monthLabel = getMonthLabel(value);
  return `${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
};

const buildDefaultTitle = (value: string) => `Resumen ${getMonthHeading(value)}`;

export default function FollowUpTab({
  programId,
  enrollmentId,
  patientName,
  programName,
}: FollowUpTabProps) {
  const { toast } = useToast();
  const { session } = useRoles();
  const { isCoordinator } = useProgramMembership(programId);
  const { entries, isLoading: isLoadingEntries } = useFollowUpEntries(enrollmentId);
  const {
    createNoteMutation,
    updateNoteMutation,
    upsertMonthlySummaryMutation,
  } = useFollowUpMutations(enrollmentId);
  const { isGenerating, generatePDF } = useMonthlySummaryPDF();
  const currentMonth = format(new Date(), "yyyy-MM");

  const [previewMonth, setPreviewMonth] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formMonth, setFormMonth] = useState(currentMonth);

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteVisibleToPatient, setNoteVisibleToPatient] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const [summaryTitle, setSummaryTitle] = useState(buildDefaultTitle(currentMonth));
  const [situation, setSituation] = useState("");
  const [evolution, setEvolution] = useState("");
  const [nextObjective, setNextObjective] = useState("");
  const [summaryVisibleToPatient, setSummaryVisibleToPatient] = useState(false);

  const noteEntries = useMemo(
    () => entries.filter((entry) => entry.entryType === FollowUpEntryType.NOTE),
    [entries]
  );
  const summaryEntries = useMemo(
    () =>
      entries
        .filter((entry) => entry.entryType === FollowUpEntryType.MONTHLY_SUMMARY)
        .map((entry) => {
          const value = formatMonthValue(entry.periodYear, entry.periodMonth);

          if (!value) {
            return null;
          }

          return {
            value,
            label: getMonthLabel(value, "MMM yyyy"),
            title: entry.title || buildDefaultTitle(value),
            meta: FollowUpVisibilityLabels[entry.visibility],
          };
        })
        .filter(
          (
            value
          ): value is { value: string; label: string; title: string; meta: string } =>
            Boolean(value)
        )
        .sort((a, b) => b.value.localeCompare(a.value)),
    [entries]
  );
  const canManageMonthlySummary =
    isCoordinator;

  const activeSummaryMonth =
    (isFormOpen ? formMonth : previewMonth) ?? currentMonth;
  const { year, month } = parseMonthValue(activeSummaryMonth);
  const {
    monthlySummary,
    isLoading: isLoadingMonthlySummary,
  } = useMonthlySummary(enrollmentId, year, month);
  const summaryEntry =
    monthlySummary?.entry?.entryType === FollowUpEntryType.MONTHLY_SUMMARY
      ? monthlySummary.entry
      : null;
  const summarySnapshot = monthlySummary?.snapshot ?? summaryEntry?.metricsSnapshot;

  useEffect(() => {
    if (!isFormOpen || formMode !== "edit") {
      return;
    }

    setSummaryTitle(summaryEntry?.title ?? buildDefaultTitle(formMonth));
    setSituation(summaryEntry?.summaryContent?.situation ?? "");
    setEvolution(summaryEntry?.summaryContent?.evolution ?? "");
    setNextObjective(summaryEntry?.summaryContent?.nextObjective ?? "");
    setSummaryVisibleToPatient(
      summaryEntry?.visibility === FollowUpVisibility.PATIENT_VISIBLE
    );
  }, [formMode, formMonth, isFormOpen, summaryEntry]);

  const resetNoteForm = () => {
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteVisibleToPatient(false);
  };

  const canEditNote = (entry: ProgramFollowUpEntry) =>
    canManageMonthlySummary || entry.authorUserId === session?.id;

  const startEditingNote = (entry: ProgramFollowUpEntry) => {
    setEditingNoteId(entry.id);
    setNoteTitle(entry.title ?? "");
    setNoteContent(entry.content ?? "");
    setNoteVisibleToPatient(
      entry.visibility === FollowUpVisibility.PATIENT_VISIBLE
    );
  };

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Falta contenido",
        description: "La observación debe tener contenido antes de guardarse.",
      });
      return;
    }

    try {
      if (editingNoteId) {
        await updateNoteMutation.mutateAsync({
          entryId: editingNoteId,
          dto: {
            title: noteTitle.trim() || undefined,
            content: noteContent.trim(),
            visibility: noteVisibleToPatient
              ? FollowUpVisibility.PATIENT_VISIBLE
              : FollowUpVisibility.INTERNAL,
          },
        });
      } else {
        await createNoteMutation.mutateAsync({
          title: noteTitle.trim() || undefined,
          content: noteContent.trim(),
          visibility: noteVisibleToPatient
            ? FollowUpVisibility.PATIENT_VISIBLE
            : FollowUpVisibility.INTERNAL,
        });
      }

      resetNoteForm();
      toast({
        title: editingNoteId ? "Observación actualizada" : "Observación guardada",
      });
    } catch (error) {
      console.error("Error al guardar la observación del programa:", error);
      toast({
        title: "No se pudo guardar",
        description: "Hubo un error al registrar la observación.",
      });
    }
  };

  const openCreateSummary = () => {
    setFormMode("create");
    setFormMonth(currentMonth);
    setSummaryTitle(buildDefaultTitle(currentMonth));
    setSituation("");
    setEvolution("");
    setNextObjective("");
    setSummaryVisibleToPatient(false);
    setIsFormOpen(true);
  };

  const openPreview = (monthValue: string) => {
    setPreviewMonth(monthValue);
    setIsPreviewOpen(true);
  };

  const openEditSummary = () => {
    const monthValue = previewMonth ?? currentMonth;
    setFormMode("edit");
    setFormMonth(monthValue);
    setIsPreviewOpen(false);
    setIsFormOpen(true);
  };

  const handleFormMonthChange = (value: string) => {
    setFormMonth(value);
    if (formMode === "create") {
      setSummaryTitle(buildDefaultTitle(value));
    }
  };

  const handleSaveSummary = async () => {
    if (!canManageMonthlySummary) {
      return;
    }

    const { year: formYear, month: formMonthNumber } = parseMonthValue(formMonth);

    if (!situation.trim() || !evolution.trim() || !nextObjective.trim()) {
      toast({
        title: "Faltan campos",
        description: "Completá situación, evolución y objetivo antes de guardar.",
      });
      return;
    }

    try {
      await upsertMonthlySummaryMutation.mutateAsync({
        year: formYear,
        month: formMonthNumber,
        dto: {
          title: summaryTitle.trim() || buildDefaultTitle(formMonth),
          situation: situation.trim(),
          evolution: evolution.trim(),
          nextObjective: nextObjective.trim(),
          visibility: summaryVisibleToPatient
            ? FollowUpVisibility.PATIENT_VISIBLE
            : FollowUpVisibility.INTERNAL,
        },
      });

      setIsFormOpen(false);
      setPreviewMonth(formMonth);
      toast({ title: "Resumen guardado" });
    } catch (error) {
      console.error("Error al guardar el resumen mensual:", error);
      toast({
        title: "No se pudo guardar el resumen",
        description: "Revisá los datos e intentá nuevamente.",
      });
    }
  };

  const handleDownloadSummary = async () => {
    if (!summaryEntry?.summaryContent || !summarySnapshot || !previewMonth) {
      toast({
        title: "No se puede exportar",
        description: "Todavía no hay datos disponibles para generar el PDF.",
      });
      return;
    }

    const result = await generatePDF({
      patientName,
      programName,
      periodLabel: getMonthLabel(previewMonth),
      title: summaryEntry.title || buildDefaultTitle(previewMonth),
      summaryContent: summaryEntry.summaryContent as ProgramFollowUpSummaryContent,
      snapshot: summarySnapshot,
    });

    if (!result.success) {
      toast({
        title: "No se pudo generar el PDF",
      });
    }
  };

  return (
    <>
      <Tabs defaultValue="summaries" className="space-y-5">
        <TabsList className="grid h-auto w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
          <TabsTrigger className="h-10 text-sm" value="summaries">
            Resúmenes
          </TabsTrigger>
          <TabsTrigger className="h-10 text-sm" value="notes">
            Observaciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="summaries" className="mt-0">
          <MonthlySummaryList
            items={summaryEntries}
            selectedValue={previewMonth}
            onSelect={openPreview}
            title="Resúmenes cargados"
            emptyMessage="Todavía no hay resúmenes cargados."
            headerAction={
              canManageMonthlySummary ? (
                <Button
                  type="button"
                  className="h-10 px-4 text-sm font-semibold"
                  onClick={openCreateSummary}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo resumen
                </Button>
              ) : null
            }
          />
        </TabsContent>

        <TabsContent value="notes" className="mt-0 space-y-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-slate-900">Notas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                <div className="space-y-2">
                  <Label htmlFor="note-title">Título</Label>
                  <Input
                    id="note-title"
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Ej. Control nutricional"
                    className="h-10 text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="note-content">Nota</Label>
                  <Textarea
                    id="note-content"
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    rows={5}
                    className="min-h-[120px] text-sm leading-6"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-3 rounded-full border border-slate-200 px-4 py-3">
                  <Switch
                    checked={noteVisibleToPatient}
                    onCheckedChange={setNoteVisibleToPatient}
                  />
                  <span className="text-sm font-medium text-slate-700">
                    Visible para paciente
                  </span>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {editingNoteId && (
                    <Button
                      variant="outline"
                      className="h-10 px-4 text-sm font-semibold"
                      onClick={resetNoteForm}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                  <Button
                    className="h-10 px-4 text-sm font-semibold"
                    onClick={handleCreateNote}
                    disabled={
                      createNoteMutation.isPending || updateNoteMutation.isPending
                    }
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {editingNoteId ? "Actualizar" : "Guardar"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {isLoadingEntries ? (
            <Card className="border-dashed shadow-none">
              <CardContent className="py-10 text-center text-sm text-slate-500">
                Cargando observaciones...
              </CardContent>
            </Card>
          ) : (
            <NotesList
              entries={noteEntries}
              emptyMessage="Todavía no hay observaciones registradas para esta inscripción."
              variant="staff"
              renderActions={(entry) =>
                canEditNote(entry) ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn("h-9 rounded-full px-4 text-sm")}
                    onClick={() => startEditingNote(entry)}
                  >
                    <Pencil className="mr-2 h-3.5 w-3.5" />
                    Editar
                  </Button>
                ) : null
              }
            />
          )}
        </TabsContent>
      </Tabs>

      <MonthlySummaryDetailDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={summaryEntry?.title || (previewMonth ? buildDefaultTitle(previewMonth) : "Resumen")}
        periodLabel={previewMonth ? getMonthHeading(previewMonth) : ""}
        summaryContent={summaryEntry?.summaryContent}
        isLoading={isLoadingMonthlySummary}
        onDownload={handleDownloadSummary}
        isDownloading={isGenerating}
        primaryAction={
          canManageMonthlySummary && summaryEntry ? (
            <Button
              variant="outline"
              onClick={openEditSummary}
              className="h-10 px-4 text-sm font-semibold"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : null
        }
      />

      <MonthlySummaryFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        mode={formMode}
        patientName={patientName}
        programName={programName}
        monthValue={formMonth}
        onMonthChange={handleFormMonthChange}
        titleValue={summaryTitle}
        onTitleChange={setSummaryTitle}
        situation={situation}
        onSituationChange={setSituation}
        evolution={evolution}
        onEvolutionChange={setEvolution}
        nextObjective={nextObjective}
        onNextObjectiveChange={setNextObjective}
        visibleToPatient={summaryVisibleToPatient}
        onVisibleToPatientChange={setSummaryVisibleToPatient}
        onSubmit={handleSaveSummary}
        isSubmitting={upsertMonthlySummaryMutation.isPending}
      />
    </>
  );
}
