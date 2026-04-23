import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ProgramFollowUpSummaryContent } from "@/types/Program/ProgramFollowUp";
import { Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface MonthlySummaryDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  periodLabel: string;
  summaryContent?: ProgramFollowUpSummaryContent;
  isLoading?: boolean;
  onDownload?: () => void;
  isDownloading?: boolean;
  primaryAction?: ReactNode;
}

export function MonthlySummaryDetailDialog({
  open,
  onOpenChange,
  title,
  periodLabel,
  summaryContent,
  isLoading = false,
  onDownload,
  isDownloading = false,
  primaryAction,
}: MonthlySummaryDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100vw-1rem)] max-h-[88vh] max-w-3xl overflow-hidden border-0 p-0 shadow-2xl sm:w-full sm:rounded-3xl">
        <div className="flex h-full max-h-[88vh] flex-col">
          <DialogHeader className="bg-gradient-to-r from-greenPrimary/10 via-white to-cyan-50 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1">
                <DialogTitle className="text-xl text-slate-900">{title}</DialogTitle>
                <p className="text-sm text-slate-500">{periodLabel}</p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {primaryAction}
                {onDownload && (
                  <Button
                    variant="outline"
                    onClick={onDownload}
                    disabled={isDownloading || !summaryContent}
                    className="h-10 border-greenPrimary/20 text-greenPrimary hover:bg-greenPrimary/5 hover:text-greenPrimary"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
            {isLoading ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Cargando resumen...
              </div>
            ) : summaryContent ? (
              <div className="space-y-4">
                {[
                  {
                    title: "Situación general",
                    content: summaryContent.situation,
                  },
                  {
                    title: "Evolución observada",
                    content: summaryContent.evolution,
                  },
                  {
                    title: "Objetivo próximo mes",
                    content: summaryContent.nextObjective,
                  },
                ].map((section, index) => (
                  <section
                    key={section.title}
                    className={cn(
                      "rounded-3xl px-5 py-5 shadow-sm",
                      index === 0 ? "bg-slate-50" : "bg-white"
                    )}
                  >
                    <p className="mb-2 text-sm font-medium text-slate-500">
                      {section.title}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {section.content}
                    </p>
                  </section>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-500">
                No se encontró el resumen seleccionado.
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
