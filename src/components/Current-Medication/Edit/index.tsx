import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { useUpdateCurrentMedication } from "@/hooks/Current-Medication/useCurrentMedication";
import {
  CurrentMedication,
  UpdateCurrentMedicationDto,
} from "@/types/Current-Medication/Current-Medication";
import { Edit } from "lucide-react";

type UserData = Patient | Doctor;

interface EditCurrentMedicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  medication: CurrentMedication;
  userData: UserData;
  userType: "patient" | "doctor";
}

const updateMedicationSchema = z.object({
  medicationName: z.string().optional(),
  dosage: z.string().optional(),
  frequency: z.string().optional(),
  observations: z.string().optional(),
});

type UpdateMedicationFormData = z.infer<typeof updateMedicationSchema>;

export default function EditCurrentMedicationModal({
  isOpen,
  onClose,
  medication,
  userData,
  userType,
}: EditCurrentMedicationModalProps) {
  const updateMutation = useUpdateCurrentMedication();

  const form = useForm<UpdateMedicationFormData>({
    resolver: zodResolver(updateMedicationSchema),
    defaultValues: {
      medicationName: medication.medicationName || "",
      dosage: medication.dosage || "",
      frequency: medication.frequency || "",
      observations: medication.observations || "",
    },
  });

  const onSubmit = (data: UpdateMedicationFormData) => {
    const updateData: UpdateCurrentMedicationDto = {
      medicationName: data.medicationName || undefined,
      dosage: data.dosage || undefined,
      frequency: data.frequency || undefined,
      observations: data.observations || undefined,
    };

    updateMutation.mutate(
      {
        id: String(medication.id),
        data: updateData,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  // Check if user can edit this medication
  const canEdit =
    userType === "doctor" || medication.idDoctor === userData.id.toString();

  if (!canEdit) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-red-600" />
              Sin Permisos
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-600">
              No tienes permisos para editar esta medicación.
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={onClose}>Cerrar</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5 text-purple-600" />
            Editar Medicación
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="medicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Medicamento</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Paracetamol, Ibuprofeno..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosis</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: 500mg, 1 comprimido..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frecuencia</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 3 veces al día..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Indicaciones especiales, reacciones adversas, etc..."
                      className="resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {updateMutation.isPending ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
