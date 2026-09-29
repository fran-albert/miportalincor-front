import { UserPen } from "lucide-react";
import { cn } from "@/lib/utils";

export const SELF_SIGNUP_BADGE_TEXT = "Autoregistro · revisar datos";

/**
 * Distintivo del paciente que se registró solo y todavía no verificó
 * recepción. Neutro, con el verde solo en el ícono.
 */
export function SelfSignupBadge({ className }: { className?: string }) {
  return (
    <span
      data-testid="self-signup-badge"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700",
        className
      )}
    >
      <UserPen className="h-3.5 w-3.5 text-greenPrimary" aria-hidden />
      {SELF_SIGNUP_BADGE_TEXT}
    </span>
  );
}
