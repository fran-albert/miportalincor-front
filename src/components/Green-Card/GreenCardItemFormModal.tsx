import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Clock, Utensils } from "lucide-react";
import { toast } from "sonner";
import {
  GreenCardItemSchema,
  GreenCardItemFormValues,
} from "@/validators/green-card.schema";
import { GreenCardItem } from "@/types/Green-Card/GreenCard";
import { useGreenCardMutations } from "@/hooks/Green-Card/useGreenCardMutation";

interface GreenCardItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  greenCardId: string;
  item?: GreenCardItem | null;
}

// Meal-based schedule options
const MEAL_SCHEDULES = [
  { value: "Ayuno", label: "Ayuno", description: "En ayunas, antes del desayuno" },
  { value: "Desayuno", label: "Desayuno", description: "Con el desayuno" },
  { value: "Media mañana", label: "Media mañana", description: "Entre desayuno y almuerzo" },
  { value: "Almuerzo", label: "Almuerzo", description: "Con el almuerzo" },
  { value: "Merienda", label: "Merienda", description: "A media tarde" },
  { value: "Cena", label: "Cena", description: "Con la cena" },
  { value: "Antes de dormir", label: "Antes de dormir", description: "Antes de acostarse" },
];

// Time-based schedule options (every hour from 6:00 to 23:00)
const TIME_SCHEDULES = [
  { value: "06:00", label: "06:00 hs" },
  { value: "07:00", label: "07:00 hs" },
  { value: "08:00", label: "08:00 hs" },
  { value: "09:00", label: "09:00 hs" },
  { value: "10:00", label: "10:00 hs" },
  { value: "11:00", label: "11:00 hs" },
  { value: "12:00", label: "12:00 hs" },
  { value: "13:00", label: "13:00 hs" },
  { value: "14:00", label: "14:00 hs" },
  { value: "15:00", label: "15:00 hs" },
  { value: "16:00", label: "16:00 hs" },
  { value: "17:00", label: "17:00 hs" },
  { value: "18:00", label: "18:00 hs" },
  { value: "19:00", label: "19:00 hs" },
  { value: "20:00", label: "20:00 hs" },
  { value: "21:00", label: "21:00 hs" },
  { value: "22:00", label: "22:00 hs" },
  { value: "23:00", label: "23:00 hs" },
];

// Check if a schedule is a time format (HH:MM)
const isTimeSchedule = (schedule: string) => /^\d{2}:\d{2}$/.test(schedule);

// Check if schedule is a meal-based option
const isMealSchedule = (schedule: string) =>
  MEAL_SCHEDULES.some((m) => m.value === schedule);

export function GreenCardItemFormModal({
  isOpen,
  onClose,
  greenCardId,
  item,
}: GreenCardItemFormModalProps) {
  const { addItemMutation, updateItemMutation } = useGreenCardMutations();
  const isEditing = !!item;

  // Determine initial tab based on existing schedule
  const getInitialTab = () => {
    if (!item?.schedule) return "meals";
    if (isTimeSchedule(item.schedule)) return "times";
    if (isMealSchedule(item.schedule)) return "meals";
    return "custom";
  };

  const [scheduleTab, setScheduleTab] = useState(getInitialTab);
  const [customSchedule, setCustomSchedule] = useState(
    item?.schedule && !isTimeSchedule(item.schedule) && !isMealSchedule(item.schedule)
      ? item.schedule
      : ""
  );

  const form = useForm<GreenCardItemFormValues>({
    resolver: zodResolver(GreenCardItemSchema),
    defaultValues: {
      schedule: item?.schedule || "",
      medicationName: item?.medicationName || "",
      dosage: item?.dosage || "",
      quantity: item?.quantity || "",
      notes: item?.notes || "",
    },
  });

  const selectedSchedule = form.watch("schedule");

  // Reset form when item changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      const schedule = item?.schedule || "";
      form.reset({
        schedule,
        medicationName: item?.medicationName || "",
        dosage: item?.dosage || "",
        quantity: item?.quantity || "",
        notes: item?.notes || "",
      });

      // Set the appropriate tab
      if (!schedule) {
        setScheduleTab("meals");
        setCustomSchedule("");
      } else if (isTimeSchedule(schedule)) {
        setScheduleTab("times");
        setCustomSchedule("");
      } else if (isMealSchedule(schedule)) {
        setScheduleTab("meals");
        setCustomSchedule("");
      } else {
        setScheduleTab("custom");
        setCustomSchedule(schedule);
      }
    }
  }, [isOpen, item, form]);

  const handleScheduleSelect = (value: string) => {
    form.setValue("schedule", value, { shouldValidate: true });
  };

  const handleCustomScheduleChange = (value: string) => {
    setCustomSchedule(value);
    form.setValue("schedule", value, { shouldValidate: true });
  };

  const onSubmit = async (data: GreenCardItemFormValues) => {
    try {
      if (isEditing && item) {
        await updateItemMutation.mutateAsync({
          cardId: greenCardId,
          itemId: item.id,
          dto: data,
        });
        toast.success("Medicamento actualizado correctamente");
      } else {
        await addItemMutation.mutateAsync({
          cardId: greenCardId,
          dto: data,
        });
        toast.success("Medicamento agregado correctamente");
      }
      onClose();
    } catch (error) {
      toast.error(
        isEditing
          ? "Error al actualizar el medicamento"
          : "Error al agregar el medicamento"
      );
    }
  };

  const isLoading = addItemMutation.isPending || updateItemMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle className="text-green-700">
            {isEditing ? "Editar Medicamento" : "Agregar Medicamento"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Modifica los datos del medicamento en el cartón verde"
              : "Completa los datos para agregar un medicamento al cartón verde"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Schedule Selection */}
            <FormField
              control={form.control}
              name="schedule"
              render={() => (
                <FormItem>
                  <FormLabel>
                    Horario <span className="text-red-500">*</span>
                  </FormLabel>

                  <Tabs value={scheduleTab} onValueChange={setScheduleTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 mb-3">
                      <TabsTrigger value="meals" className="flex items-center gap-1">
                        <Utensils className="h-3 w-3" />
                        Comidas
                      </TabsTrigger>
                      <TabsTrigger value="times" className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Horario
                      </TabsTrigger>
                      <TabsTrigger value="custom">Otro</TabsTrigger>
                    </TabsList>

                    {/* Meal-based schedules */}
                    <TabsContent value="meals" className="mt-0">
                      <div className="flex flex-wrap gap-2">
                        {MEAL_SCHEDULES.map((option) => (
                          <Badge
                            key={option.value}
                            variant={selectedSchedule === option.value ? "default" : "outline"}
                            className={`cursor-pointer py-2 px-3 text-sm transition-all ${
                              selectedSchedule === option.value
                                ? "bg-green-600 hover:bg-green-700"
                                : "hover:bg-green-50 hover:border-green-300"
                            }`}
                            onClick={() => handleScheduleSelect(option.value)}
                          >
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                      {selectedSchedule && isMealSchedule(selectedSchedule) && (
                        <p className="text-xs text-gray-500 mt-2">
                          {MEAL_SCHEDULES.find((m) => m.value === selectedSchedule)?.description}
                        </p>
                      )}
                    </TabsContent>

                    {/* Time-based schedules */}
                    <TabsContent value="times" className="mt-0">
                      <div className="grid grid-cols-6 gap-2">
                        {TIME_SCHEDULES.map((option) => (
                          <Badge
                            key={option.value}
                            variant={selectedSchedule === option.value ? "default" : "outline"}
                            className={`cursor-pointer py-2 px-2 text-xs justify-center transition-all ${
                              selectedSchedule === option.value
                                ? "bg-green-600 hover:bg-green-700"
                                : "hover:bg-green-50 hover:border-green-300"
                            }`}
                            onClick={() => handleScheduleSelect(option.value)}
                          >
                            {option.label}
                          </Badge>
                        ))}
                      </div>
                    </TabsContent>

                    {/* Custom schedule */}
                    <TabsContent value="custom" className="mt-0">
                      <Input
                        placeholder="Ej: Cada 8 horas, Día por medio, Lunes y Jueves..."
                        value={customSchedule}
                        onChange={(e) => handleCustomScheduleChange(e.target.value)}
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        Escriba un horario personalizado si ninguna opcion se ajusta
                      </p>
                    </TabsContent>
                  </Tabs>

                  {selectedSchedule && (
                    <div className="mt-2 p-2 bg-green-50 rounded-md">
                      <span className="text-sm text-green-700">
                        Horario seleccionado: <strong>{selectedSchedule}</strong>
                      </span>
                    </div>
                  )}

                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Medication Name */}
            <FormField
              control={form.control}
              name="medicationName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Medicamento <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Losartan 50mg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Dosage and Quantity */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dosage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Dosis <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 1 comprimido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cantidad (envases)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej: 2, 3 cajas" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observaciones</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Indicaciones adicionales..."
                      className="resize-none"
                      rows={3}
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
                disabled={isLoading}
                className="bg-green-700 hover:bg-green-800"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Guardar Cambios" : "Agregar Medicamento"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
