import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Syringe } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { useVaccinationMutations } from "@/hooks/Vaccination/useVaccinationMutations";
import type {
  VaccinationApplication,
  VaccinationCatalog,
  VaccinationScheduleRule,
} from "@/types/Vaccination/Vaccination";
import {
  VaccinationApplicationFormValues,
  VaccinationApplicationSchema,
} from "@/validators/vaccination.schema";

interface VaccinationApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientUserId: string;
  catalog?: VaccinationCatalog;
  application?: VaccinationApplication | null;
  initialScheduleRuleId?: string;
}

const todayDateOnly = () => new Date().toISOString().slice(0, 10);

export function VaccinationApplicationFormModal({
  isOpen,
  onClose,
  patientUserId,
  catalog,
  application,
  initialScheduleRuleId,
}: VaccinationApplicationFormModalProps) {
  const isEditing = Boolean(application);
  const { showSuccess, showError } = useToastContext();
  const { createApplicationMutation, updateApplicationMutation } =
    useVaccinationMutations();

  const rulesByVaccine = useMemo(() => {
    const map = new Map<string, VaccinationScheduleRule[]>();
    for (const rule of catalog?.scheduleRules ?? []) {
      const existing = map.get(rule.vaccineId) ?? [];
      existing.push(rule);
      map.set(rule.vaccineId, existing);
    }
    return map;
  }, [catalog?.scheduleRules]);

  const form = useForm<VaccinationApplicationFormValues>({
    resolver: zodResolver(VaccinationApplicationSchema),
    defaultValues: {
      scheduleRuleId: application?.scheduleRuleId ?? initialScheduleRuleId ?? "",
      appliedDate: application?.appliedDate ?? todayDateOnly(),
      observations: application?.observations ?? "",
    },
  });

  useEffect(() => {
    if (isOpen) {
      form.reset({
        scheduleRuleId:
          application?.scheduleRuleId ?? initialScheduleRuleId ?? "",
        appliedDate: application?.appliedDate ?? todayDateOnly(),
        observations: application?.observations ?? "",
      });
    }
  }, [application, form, initialScheduleRuleId, isOpen]);

  const onSubmit = async (values: VaccinationApplicationFormValues) => {
    const payload = {
      scheduleRuleId: values.scheduleRuleId,
      appliedDate: values.appliedDate,
      observations: values.observations?.trim() || undefined,
    };

    try {
      if (isEditing && application) {
        await updateApplicationMutation.mutateAsync({
          applicationId: application.id,
          dto: payload,
        });
        showSuccess("Vacuna actualizada correctamente");
      } else {
        await createApplicationMutation.mutateAsync({
          patientUserId,
          dto: payload,
        });
        showSuccess("Vacuna cargada correctamente");
      }
      onClose();
    } catch {
      showError(
        isEditing
          ? "Error al actualizar la vacuna"
          : "Error al cargar la vacuna"
      );
    }
  };

  const isLoading =
    createApplicationMutation.isPending || updateApplicationMutation.isPending;

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-[620px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-green-700">
            <Syringe className="h-5 w-5" />
            {isEditing ? "Editar vacuna" : "Cargar vacuna"}
          </DialogTitle>
          <DialogDescription>
            Selecciona la vacuna del calendario y registra la fecha aplicada.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="scheduleRuleId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vacuna y dosis</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!catalog || isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar vacuna y dosis" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(catalog?.vaccines ?? []).map((vaccine) => {
                        const rules = rulesByVaccine.get(vaccine.id) ?? [];
                        if (rules.length === 0) return null;

                        return (
                          <SelectGroup key={vaccine.id}>
                            <SelectLabel>{vaccine.name}</SelectLabel>
                            {rules.map((rule) => (
                              <SelectItem key={rule.id} value={rule.id}>
                                {rule.doseLabel}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="appliedDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de aplicacion</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      max={todayDateOnly()}
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Observaciones clinicas, lote, lugar de aplicacion..."
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar" : "Cargar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
