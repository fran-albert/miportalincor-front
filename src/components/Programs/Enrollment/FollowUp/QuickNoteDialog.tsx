import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useFollowUpMutations } from "@/hooks/Program/useFollowUpMutations";
import { useToast } from "@/hooks/use-toast";
import { FollowUpVisibility } from "@/types/Program/ProgramFollowUp";

interface QuickNoteDialogProps {
  enrollmentId: string;
  patientName: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export default function QuickNoteDialog({
  enrollmentId,
  patientName,
  isOpen,
  setIsOpen,
}: QuickNoteDialogProps) {
  const { toast } = useToast();
  const { createNoteMutation } = useFollowUpMutations(enrollmentId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [visibleToPatient, setVisibleToPatient] = useState(false);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setVisibleToPatient(false);
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Falta contenido",
        description: "La observación debe tener contenido antes de guardarse.",
      });
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        title: title.trim() || undefined,
        content: content.trim(),
        visibility: visibleToPatient
          ? FollowUpVisibility.PATIENT_VISIBLE
          : FollowUpVisibility.INTERNAL,
      });
      resetForm();
      setIsOpen(false);
      toast({ title: "Observación guardada" });
    } catch (error) {
      console.error("Error al guardar la observación del programa:", error);
      toast({
        title: "No se pudo guardar",
        description: "Hubo un error al registrar la observación.",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Nueva nota de seguimiento</DialogTitle>
          <DialogDescription>{patientName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quick-note-title">Título (opcional)</Label>
            <Input
              id="quick-note-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Control nutricional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-note-content">Nota</Label>
            <Textarea
              id="quick-note-content"
              value={content}
              onChange={(event) => setContent(event.target.value)}
              rows={5}
              className="min-h-[120px]"
            />
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={visibleToPatient}
              onCheckedChange={setVisibleToPatient}
            />
            <span className="text-sm font-medium text-slate-700">
              Visible para paciente
            </span>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={createNoteMutation.isPending}
          >
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
