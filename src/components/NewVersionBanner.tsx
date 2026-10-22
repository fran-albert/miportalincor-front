import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNewVersionAvailable } from "@/hooks/useNewVersionAvailable";

// No recarga sola: una médica puede estar escribiendo un informe sin guardar.
export const NewVersionBanner = () => {
  const isNewVersionAvailable = useNewVersionAvailable();

  if (!isNewVersionAvailable) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-3 z-[100] flex justify-center px-4">
      <div
        role="status"
        className="pointer-events-auto flex w-full max-w-xl items-center gap-3 overflow-hidden rounded-lg border border-slate-200 border-l-4 border-l-greenPrimary bg-white py-3 pl-4 pr-3 shadow-lg"
      >
        <RefreshCw className="h-5 w-5 shrink-0 text-greenPrimary" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900">
            Hay una versión nueva del portal
          </p>
          <p className="text-xs text-slate-500">
            Guardá lo que estés haciendo y actualizá para ver los últimos cambios.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          className="shrink-0 bg-greenPrimary text-white hover:bg-greenPrimary/90"
          onClick={() => window.location.reload()}
        >
          Actualizar
        </Button>
      </div>
    </div>
  );
};
