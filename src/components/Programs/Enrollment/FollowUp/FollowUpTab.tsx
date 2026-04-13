import { useEffect, useState } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import useRoles from "@/hooks/useRoles";
import { useProgramMembers } from "@/hooks/Program/useProgramMembers";
import { useFollowUpEntries } from "@/hooks/Program/useFollowUpEntries";
import { useMonthlySummary } from "@/hooks/Program/useMonthlySummary";
import { useFollowUpMutations } from "@/hooks/Program/useFollowUpMutations";
import { useMonthlySummaryPDF } from "@/hooks/Program/useMonthlySummaryPDF";
import { NotesList } from "@/components/Programs/FollowUp/NotesList";
import { MonthlySummarySnapshotCard } from "@/components/Programs/FollowUp/MonthlySummarySnapshotCard";
import { MemberRole } from "@/types/Program/ProgramMember";
import {
  FollowUpEntryType,
  FollowUpVisibility,
  ProgramFollowUpSummaryContent,
} from "@/types/Program/ProgramFollowUp";
import { Download, Save } from "lucide-react";

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

const getMonthLabel = (value: string) =>
  format(parse(`${value}-01`, "yyyy-MM-dd", new Date()), "MMMM yyyy", {
    locale: es,
  });

const buildDefaultTitle = (value: string) => {
  const monthLabel = getMonthLabel(value);
  return `Resumen ${monthLabel.charAt(0).toUpperCase()}${monthLabel.slice(1)}`;
};

export default function FollowUpTab({
  programId,
  enrollmentId,
  patientName,
  programName,
}: FollowUpTabProps) {
  const { toast } = useToast();
  const { isAdmin, session } = useRoles();
  const { members } = useProgramMembers(programId);
  const { entries, isLoading: isLoadingEntries } = useFollowUpEntries(enrollmentId);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const { year, month } = parseMonthValue(selectedMonth);
  const {
    monthlySummary,
    isLoading: isLoadingMonthlySummary,
  } = useMonthlySummary(enrollmentId, year, month);
  const {
    createNoteMutation,
    upsertMonthlySummaryMutation,
  } = useFollowUpMutations(enrollmentId);
  const { isGenerating, generatePDF } = useMonthlySummaryPDF();

  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteVisibleToPatient, setNoteVisibleToPatient] = useState(false);

  const [summaryTitle, setSummaryTitle] = useState(buildDefaultTitle(selectedMonth));
  const [situation, setSituation] = useState("");
  const [evolution, setEvolution] = useState("");
  const [nextObjective, setNextObjective] = useState("");
  const [summaryVisibleToPatient, setSummaryVisibleToPatient] = useState(false);

  const noteEntries = entries.filter((entry) => entry.entryType === FollowUpEntryType.NOTE);
  const summaryEntry =
    monthlySummary?.entry?.entryType === FollowUpEntryType.MONTHLY_SUMMARY
      ? monthlySummary.entry
      : null;
  const summarySnapshot = monthlySummary?.snapshot ?? summaryEntry?.metricsSnapshot;
  const canManageMonthlySummary =
    isAdmin ||
    members.some(
      (member) => member.userId === session?.id && member.role === MemberRole.COORDINATOR
    );

  useEffect(() => {
    setSummaryTitle(summaryEntry?.title ?? buildDefaultTitle(selectedMonth));
    setSituation(summaryEntry?.summaryContent?.situation ?? "");
    setEvolution(summaryEntry?.summaryContent?.evolution ?? "");
    setNextObjective(summaryEntry?.summaryContent?.nextObjective ?? "");
    setSummaryVisibleToPatient(
      summaryEntry?.visibility === FollowUpVisibility.PATIENT_VISIBLE
    );
  }, [selectedMonth, summaryEntry]);

  const handleCreateNote = async () => {
    if (!noteContent.trim()) {
      toast({
        title: "Falta contenido",
        description: "La observación debe tener contenido antes de guardarse.",
      });
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        title: noteTitle.trim() || undefined,
        content: noteContent.trim(),
        visibility: noteVisibleToPatient
          ? FollowUpVisibility.PATIENT_VISIBLE
          : FollowUpVisibility.INTERNAL,
      });
      setNoteTitle("");
      setNoteContent("");
      setNoteVisibleToPatient(false);
      toast({
        title: "Observación guardada",
        description: "La nota quedó registrada en el seguimiento del programa.",
      });
    } catch (error) {
      console.error("Error al crear la observación del programa:", error);
      toast({
        title: "No se pudo guardar",
        description: "Hubo un error al registrar la observación.",
      });
    }
  };

  const handleSaveSummary = async () => {
    if (!canManageMonthlySummary) {
      return;
    }

    if (!situation.trim() || !evolution.trim() || !nextObjective.trim()) {
      toast({
        title: "Faltan campos",
        description: "Completá situación, evolución y objetivo antes de guardar.",
      });
      return;
    }

    try {
      await upsertMonthlySummaryMutation.mutateAsync({
        year,
        month,
        dto: {
          title: summaryTitle.trim() || buildDefaultTitle(selectedMonth),
          situation: situation.trim(),
          evolution: evolution.trim(),
          nextObjective: nextObjective.trim(),
          visibility: summaryVisibleToPatient
            ? FollowUpVisibility.PATIENT_VISIBLE
            : FollowUpVisibility.INTERNAL,
        },
      });
      toast({
        title: "Resumen mensual guardado",
        description: "El resumen quedó actualizado con el snapshot del período.",
      });
    } catch (error) {
      console.error("Error al guardar el resumen mensual:", error);
      toast({
        title: "No se pudo guardar el resumen",
        description: "Revisá los datos e intentá nuevamente.",
      });
    }
  };

  const handleDownloadSummary = async () => {
    if (!summarySnapshot) {
      toast({
        title: "Sin métricas para exportar",
        description: "Todavía no hay datos automáticos para este período.",
      });
      return;
    }

    const summaryContent: ProgramFollowUpSummaryContent = {
      situation: situation.trim(),
      evolution: evolution.trim(),
      nextObjective: nextObjective.trim(),
    };

    if (
      !summaryContent.situation ||
      !summaryContent.evolution ||
      !summaryContent.nextObjective
    ) {
      toast({
        title: "Faltan textos del resumen",
        description: "Completá el resumen narrativo antes de exportar el PDF.",
      });
      return;
    }

    const periodLabel = getMonthLabel(selectedMonth);
    const result = await generatePDF({
      patientName,
      programName,
      periodLabel,
      title: summaryTitle.trim() || buildDefaultTitle(selectedMonth),
      summaryContent,
      snapshot: summarySnapshot,
    });

    if (!result.success) {
      toast({
        title: "No se pudo generar el PDF",
        description: "Hubo un error al crear el archivo del resumen mensual.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Resumen mensual</CardTitle>
              <p className="text-sm text-gray-500">
                Consolidá el seguimiento del período y generá el PDF para compartir con el
                paciente.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {canManageMonthlySummary ? (
                <Badge variant="outline">Coordinador / admin</Badge>
              ) : (
                <Badge variant="secondary">Solo lectura</Badge>
              )}
              <Input
                type="month"
                value={selectedMonth}
                onChange={(event) => setSelectedMonth(event.target.value)}
                className="w-[170px]"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!canManageMonthlySummary && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              Solo el coordinador del programa o un administrador puede guardar el resumen
              mensual. El resto del equipo lo ve en modo lectura.
            </div>
          )}

          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Redacción del resumen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={summaryTitle}
                    onChange={(event) => setSummaryTitle(event.target.value)}
                    disabled={!canManageMonthlySummary}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Situación general</Label>
                  <Textarea
                    value={situation}
                    onChange={(event) => setSituation(event.target.value)}
                    rows={4}
                    disabled={!canManageMonthlySummary}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Evolución observada</Label>
                  <Textarea
                    value={evolution}
                    onChange={(event) => setEvolution(event.target.value)}
                    rows={4}
                    disabled={!canManageMonthlySummary}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Objetivo próximo mes</Label>
                  <Textarea
                    value={nextObjective}
                    onChange={(event) => setNextObjective(event.target.value)}
                    rows={3}
                    disabled={!canManageMonthlySummary}
                  />
                </div>

                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={summaryVisibleToPatient}
                      onCheckedChange={setSummaryVisibleToPatient}
                      disabled={!canManageMonthlySummary}
                    />
                    <Label>Visible para el paciente</Label>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={handleDownloadSummary}
                      disabled={isGenerating || isLoadingMonthlySummary}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Exportar PDF
                    </Button>
                    <Button
                      onClick={handleSaveSummary}
                      disabled={
                        !canManageMonthlySummary || upsertMonthlySummaryMutation.isPending
                      }
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Guardar resumen
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <MonthlySummarySnapshotCard
              snapshot={summarySnapshot}
              title={
                isLoadingMonthlySummary
                  ? "Cargando métricas del período..."
                  : "Snapshot automático del período"
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Observaciones del equipo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Nueva observación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Título</Label>
                  <Input
                    value={noteTitle}
                    onChange={(event) => setNoteTitle(event.target.value)}
                    placeholder="Ej. Control nutricional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Contenido</Label>
                  <Textarea
                    value={noteContent}
                    onChange={(event) => setNoteContent(event.target.value)}
                    rows={5}
                    placeholder="Escribí la observación para el seguimiento del paciente."
                  />
                </div>
                <div className="flex items-center gap-3">
                  <Switch
                    checked={noteVisibleToPatient}
                    onCheckedChange={setNoteVisibleToPatient}
                  />
                  <Label>Visible para el paciente</Label>
                </div>
                <Button
                  className="w-full"
                  onClick={handleCreateNote}
                  disabled={createNoteMutation.isPending}
                >
                  Guardar observación
                </Button>
              </CardContent>
            </Card>

            {isLoadingEntries ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-500">
                  Cargando observaciones...
                </CardContent>
              </Card>
            ) : (
              <NotesList
                entries={noteEntries}
                emptyMessage="Todavía no hay observaciones registradas para esta inscripción."
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
