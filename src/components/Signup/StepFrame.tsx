import { ReactNode } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const DATA_STEPS_TOTAL = 5;

interface StepFrameProps {
  /** Número de paso (1..5). Sin número, la barra se muestra completa. */
  step?: number;
  title: string;
  description?: string;
  children: ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isNextLoading?: boolean;
  nextTestId?: string;
}

/**
 * Un paso por pantalla: "Paso 2 de 5", barra de progreso, el contenido y
 * los botones Atrás / Siguiente. Pensado para el celular: botones altos y
 * a todo el ancho.
 */
export function StepFrame({
  step,
  title,
  description,
  children,
  onBack,
  onNext,
  nextLabel = "Siguiente",
  isNextLoading = false,
  nextTestId = "signup-next",
}: StepFrameProps) {
  const progress =
    step === undefined ? 100 : Math.round((step / DATA_STEPS_TOTAL) * 100);

  return (
    <form
      noValidate
      className="space-y-6"
      onSubmit={(event) => {
        event.preventDefault();
        if (!isNextLoading) onNext?.();
      }}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-600" data-testid="signup-step-label">
            {step === undefined
              ? "Revisá y confirmá"
              : `Paso ${step} de ${DATA_STEPS_TOTAL}`}
          </span>
        </div>
        <div
          className="h-2 w-full rounded-full bg-gray-100 overflow-hidden"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-greenPrimary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="space-y-1 pt-1">
          <h1 className="text-2xl font-bold text-greenPrimary">{title}</h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
      </div>

      <div className="space-y-5">{children}</div>

      {(onBack || onNext) && (
        <div className="flex flex-col-reverse gap-3 sm:flex-row pt-2">
          {onBack && (
            <Button
              type="button"
              variant="outline"
              className="h-12 w-full sm:w-auto sm:flex-1 text-base border-gray-300"
              onClick={onBack}
              disabled={isNextLoading}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Atrás
            </Button>
          )}
          {onNext && (
            <Button
              type="submit"
              variant="incor"
              className="h-12 w-full sm:flex-1 text-base font-medium"
              disabled={isNextLoading}
              data-testid={nextTestId}
            >
              {isNextLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {nextLabel}
            </Button>
          )}
        </div>
      )}
    </form>
  );
}

export function FieldError({ message, id }: { message?: string; id?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="text-sm font-medium text-red-600" role="alert">
      {message}
    </p>
  );
}

/** Aviso neutro: fondo blanco, borde gris y el ícono como único acento. */
export function Notice({
  icon,
  children,
  tone = "neutral",
  testId,
}: {
  icon: ReactNode;
  children: ReactNode;
  tone?: "neutral" | "error";
  testId?: string;
}) {
  return (
    <div
      data-testid={testId}
      role={tone === "error" ? "alert" : "status"}
      className={
        tone === "error"
          ? "flex items-start gap-3 rounded-lg border border-red-200 bg-white p-3 text-sm text-red-700"
          : "flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3 text-sm text-gray-700"
      }
    >
      <span className="mt-0.5 shrink-0">{icon}</span>
      <div className="space-y-1">{children}</div>
    </div>
  );
}
