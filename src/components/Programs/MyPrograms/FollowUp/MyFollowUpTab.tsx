import { useState } from "react";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useFollowUpEntries } from "@/hooks/Program/useFollowUpEntries";
import { useMonthlySummary } from "@/hooks/Program/useMonthlySummary";
import { useMonthlySummaryPDF } from "@/hooks/Program/useMonthlySummaryPDF";
import { NotesList } from "@/components/Programs/FollowUp/NotesList";
import { MonthlySummarySnapshotCard } from "@/components/Programs/FollowUp/MonthlySummarySnapshotCard";
import {
  FollowUpEntryType,
  ProgramFollowUpSummaryContent,
} from "@/types/Program/ProgramFollowUp";
import { Download } from "lucide-react";

interface MyFollowUpTabProps {
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

export default function MyFollowUpTab({
  enrollmentId,
  patientName,
  programName,
}: MyFollowUpTabProps) {
  const { toast } = useToast();
  const { entries, isLoading: isLoadingEntries } = useFollowUpEntries(enrollmentId);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), "yyyy-MM"));
  const { year, month } = parseMonthValue(selectedMonth);
  const {
    monthlySummary,
    isLoading: isLoadingMonthlySummary,
  } = useMonthlySummary(enrollmentId, year, month);
  const { isGenerating, generatePDF } = useMonthlySummaryPDF();

  const visibleNoteEntries = entries.filter(
    (entry) => entry.entryType === FollowUpEntryType.NOTE
  );
  const summaryEntry =
    monthlySummary?.entry?.entryType === FollowUpEntryType.MONTHLY_SUMMARY
      ? monthlySummary.entry
      : null;
  const summarySnapshot = monthlySummary?.snapshot ?? summaryEntry?.metricsSnapshot;

  const handleDownloadSummary = async () => {
    if (!summaryEntry?.summaryContent || !summarySnapshot) {
      toast({
        title: "No hay resumen disponible",
        description: "Todavía no tenés un resumen mensual visible para descargar.",
      });
      return;
    }

    const result = await generatePDF({
      patientName,
      programName,
      periodLabel: getMonthLabel(selectedMonth),
      title: summaryEntry.title || `Resumen ${getMonthLabel(selectedMonth)}`,
      summaryContent: summaryEntry.summaryContent as ProgramFollowUpSummaryContent,
      snapshot: summarySnapshot,
    });

    if (!result.success) {
      toast({
        title: "No se pudo generar el PDF",
        description: "Hubo un error al preparar el resumen mensual.",
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
                Consultá tu evolución del programa y descargá el resumen en PDF.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">Lectura</Badge>
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
          {isLoadingMonthlySummary ? (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Cargando resumen mensual...
              </CardContent>
            </Card>
          ) : summaryEntry?.summaryContent ? (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <CardTitle className="text-base">
                    {summaryEntry.title || "Resumen mensual"}
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={handleDownloadSummary}
                    disabled={isGenerating}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Descargar PDF
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Situación general
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {summaryEntry.summaryContent.situation}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Evolución observada
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {summaryEntry.summaryContent.evolution}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
                    Objetivo próximo mes
                  </h3>
                  <p className="whitespace-pre-wrap text-sm text-gray-700">
                    {summaryEntry.summaryContent.nextObjective}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-gray-500">
                Todavía no hay un resumen visible para el período seleccionado.
              </CardContent>
            </Card>
          )}

          <MonthlySummarySnapshotCard
            snapshot={summarySnapshot}
            title="Métricas automáticas del período"
          />
        </CardContent>
      </Card>

      {isLoadingEntries ? (
        <Card>
          <CardContent className="py-8 text-center text-gray-500">
            Cargando observaciones visibles...
          </CardContent>
        </Card>
      ) : (
        <NotesList
          entries={visibleNoteEntries}
          emptyMessage="Todavía no tenés observaciones visibles del equipo para este programa."
        />
      )}
    </div>
  );
}
