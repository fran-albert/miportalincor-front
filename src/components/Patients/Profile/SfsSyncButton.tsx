import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useSfsSync } from "@/hooks/Patient/useSfsSync";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Download, CheckCircle } from "lucide-react";

interface SfsSyncButtonProps {
  patientId: string;
}

export default function SfsSyncButton({ patientId }: SfsSyncButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { sfsStatus, isLoadingStatus, syncMutation } = useSfsSync(patientId);
  const { promiseToast } = useToastContext();

  if (isLoadingStatus || !sfsStatus?.hasData) {
    return null;
  }

  const handleSync = async () => {
    try {
      await promiseToast(syncMutation.mutateAsync(), {
        loading: {
          title: "Importando evoluciones SFS",
          description: "Por favor espera mientras se importan los datos",
        },
        success: {
          title: "Evoluciones importadas",
          description: "Las evoluciones de SFS se importaron exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al importar evoluciones",
          description:
            (error as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
    } catch (error) {
      console.error("Error al importar evoluciones SFS", error);
    } finally {
      setIsOpen(false);
    }
  };

  if (sfsStatus.alreadySynced) {
    return (
      <Button variant="outline" disabled className="gap-2">
        <CheckCircle className="h-4 w-4" />
        Evoluciones SFS importadas
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
        >
          <Download className="h-4 w-4" />
          Importar {sfsStatus.count} evoluciones SFS
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Importar Evoluciones SFS</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          Se van a importar {sfsStatus.count} evoluciones del sistema SFS al
          portal. Esta acción no se puede deshacer.
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="incor"
            onClick={handleSync}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? "Importando..." : "Confirmar importación"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
