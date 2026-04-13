import { useEffect, useMemo, useState } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { FileText, MessageSquareText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useFollowUpEntries } from "@/hooks/Program/useFollowUpEntries";
import { useMonthlySummary } from "@/hooks/Program/useMonthlySummary";
import { useMonthlySummaryPDF } from "@/hooks/Program/useMonthlySummaryPDF";
import { MonthlySummaryDetailDialog } from "@/components/Programs/FollowUp/MonthlySummaryDetailDialog";
import { MonthlySummaryList } from "@/components/Programs/FollowUp/MonthlySummaryList";
import { NotesList } from "@/components/Programs/FollowUp/NotesList";
import { Card, CardContent } from "@/components/ui/card";
import {
  FollowUpEntryType,
  FollowUpVisibility,
  ProgramFollowUpSummaryContent,
} from "@/types/Program/ProgramFollowUp";

interface MyFollowUpTabProps {
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

export default function MyFollowUpTab({
  enrollmentId,
  patientName,
  programName,
}: MyFollowUpTabProps) {
  const { toast } = useToast();
  const { entries } = useFollowUpEntries(enrollmentId);
  const { isGenerating, generatePDF } = useMonthlySummaryPDF();
  const [previewMonth, setPreviewMonth] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const visibleNoteEntries = useMemo(
    () =>
      entries.filter(
        (entry) =>
          entry.entryType === FollowUpEntryType.NOTE &&
          entry.visibility === FollowUpVisibility.PATIENT_VISIBLE
      ),
    [entries]
  );
  const visibleSummaryEntries = useMemo(
    () =>
      entries
        .filter(
          (entry) =>
            entry.entryType === FollowUpEntryType.MONTHLY_SUMMARY &&
            entry.visibility === FollowUpVisibility.PATIENT_VISIBLE
        )
        .map((entry) => {
          const value = formatMonthValue(entry.periodYear, entry.periodMonth);

          if (!value) {
            return null;
          }

          return {
            value,
            label: getMonthLabel(value, "MMM yyyy"),
            title: entry.title || getMonthHeading(value),
          };
        })
        .filter((value): value is { value: string; label: string; title: string } =>
          Boolean(value)
        )
        .sort((a, b) => b.value.localeCompare(a.value)),
    [entries]
  );

  useEffect(() => {
    if (!visibleSummaryEntries.length) {
      setPreviewMonth(null);
      return;
    }

    if (!previewMonth) {
      setPreviewMonth(visibleSummaryEntries[0].value);
      return;
    }

    if (!visibleSummaryEntries.some((entry) => entry.value === previewMonth)) {
      setPreviewMonth(visibleSummaryEntries[0].value);
    }
  }, [previewMonth, visibleSummaryEntries]);

  const activeMonth = previewMonth ?? format(new Date(), "yyyy-MM");
  const { year, month } = parseMonthValue(activeMonth);
  const {
    monthlySummary,
    isLoading: isLoadingMonthlySummary,
  } = useMonthlySummary(enrollmentId, year, month);
  const summaryEntry =
    monthlySummary?.entry?.entryType === FollowUpEntryType.MONTHLY_SUMMARY &&
    monthlySummary.entry.visibility === FollowUpVisibility.PATIENT_VISIBLE
      ? monthlySummary.entry
      : null;
  const summarySnapshot = summaryEntry
    ? monthlySummary?.snapshot ?? summaryEntry.metricsSnapshot
    : undefined;

  const openPreview = (monthValue: string) => {
    setPreviewMonth(monthValue);
    setIsPreviewOpen(true);
  };

  const handleDownloadSummary = async () => {
    if (!summaryEntry?.summaryContent || !summarySnapshot || !previewMonth) {
      toast({
        title: "No hay resumen disponible",
        description: "Todavía no tenés un resumen visible para descargar.",
      });
      return;
    }

    const result = await generatePDF({
      patientName,
      programName,
      periodLabel: getMonthLabel(previewMonth),
      title: summaryEntry.title || `Resumen ${getMonthLabel(previewMonth)}`,
      summaryContent: summaryEntry.summaryContent as ProgramFollowUpSummaryContent,
      snapshot: summarySnapshot,
    });

    if (!result.success) {
      toast({
        title: "No se pudo generar el PDF",
      });
    }
  };

  const hasVisibleContent =
    visibleSummaryEntries.length > 0 || visibleNoteEntries.length > 0;

  return (
    <>
      {hasVisibleContent ? (
        <div className="space-y-6">
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-greenPrimary to-teal-600 p-2.5 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Resúmenes</h3>
            </div>
            <MonthlySummaryList
              items={visibleSummaryEntries}
              selectedValue={previewMonth}
              onSelect={openPreview}
              title="Resúmenes disponibles"
              emptyMessage="Todavía no hay resúmenes visibles para vos."
              variant="patient"
            />
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-gradient-to-br from-greenPrimary to-teal-600 p-2.5 text-white shadow-sm">
                <MessageSquareText className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Notas</h3>
            </div>

            <NotesList
              entries={visibleNoteEntries}
              emptyMessage="Todavía no hay notas visibles para vos en este programa."
              variant="patient"
            />
          </section>
        </div>
      ) : (
        <Card className="border-0 shadow-md">
          <CardContent className="py-8 text-center text-sm leading-6 text-slate-500">
            Cuando el equipo cargue información visible para vos, la vas a
            encontrar acá.
          </CardContent>
        </Card>
      )}

      <MonthlySummaryDetailDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        title={summaryEntry?.title || (previewMonth ? getMonthHeading(previewMonth) : "Resumen")}
        periodLabel={previewMonth ? getMonthHeading(previewMonth) : ""}
        summaryContent={summaryEntry?.summaryContent}
        isLoading={isLoadingMonthlySummary}
        onDownload={handleDownloadSummary}
        isDownloading={isGenerating}
      />
    </>
  );
}
