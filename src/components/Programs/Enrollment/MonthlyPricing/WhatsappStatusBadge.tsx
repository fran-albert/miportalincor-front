import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ProgramMonthlyWhatsappStatus,
  ProgramMonthlyWhatsappStatusLabels,
} from "@/types/Program/ProgramMonthlyPlan";

const statusClasses: Record<ProgramMonthlyWhatsappStatus, string> = {
  [ProgramMonthlyWhatsappStatus.SENT]:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  [ProgramMonthlyWhatsappStatus.NOT_REQUESTED]:
    "border-sky-200 bg-sky-50 text-sky-700",
  [ProgramMonthlyWhatsappStatus.PENDING]:
    "border-amber-200 bg-amber-50 text-amber-700",
  [ProgramMonthlyWhatsappStatus.FAILED]:
    "border-red-200 bg-red-50 text-red-700",
  [ProgramMonthlyWhatsappStatus.SKIPPED_NO_PHONE]:
    "border-slate-300 bg-slate-50 text-slate-700",
  [ProgramMonthlyWhatsappStatus.DISABLED]:
    "border-slate-200 bg-white text-slate-500",
};

interface WhatsappStatusBadgeProps {
  status: ProgramMonthlyWhatsappStatus;
  className?: string;
}

export const WhatsappStatusBadge = ({
  status,
  className,
}: WhatsappStatusBadgeProps) => (
  <Badge
    variant="outline"
    className={cn("whitespace-nowrap font-medium", statusClasses[status], className)}
  >
    {ProgramMonthlyWhatsappStatusLabels[status]}
  </Badge>
);
