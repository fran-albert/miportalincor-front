import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import {
  DoctorAbsenceResponseDto,
  Absence,
  AbsenceLabels,
  CreateDoctorAbsenceDto
} from "@/types/Doctor-Absence/Doctor-Absence";
import { useDoctorAbsences } from "@/hooks/DoctorAbsence";
import { useDoctorAbsenceMutations } from "@/hooks/DoctorAbsence/useDoctorAbsenceMutations";
import { CalendarOff, Palmtree, FileText, HelpCircle, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { formatDateAR, formatDateForCalendar } from "@/common/helpers/timezone";
import { motion } from "framer-motion";
import { useToastContext } from "@/hooks/Toast/toast-context";

interface MyAbsencesEditableProps {
  doctorId: number;
}

const absenceSchema = z.object({
  type: z.nativeEnum(Absence),
  startDate: z.string().min(1, "La fecha de inicio es requerida"),
  endDate: z.string().min(1, "La fecha de fin es requerida"),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

type AbsenceFormData = z.infer<typeof absenceSchema>;

const getAbsenceIcon = (type: Absence) => {
  switch (type) {
    case Absence.VACATION:
      return <Palmtree className="h-4 w-4" />;
    case Absence.LICENCE:
      return <FileText className="h-4 w-4" />;
    default:
      return <HelpCircle className="h-4 w-4" />;
  }
};

const getAbsenceBadgeColor = (type: Absence) => {
  switch (type) {
    case Absence.VACATION:
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case Absence.LICENCE:
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};

const formatTimeRange = (absence: DoctorAbsenceResponseDto) => {
  if (!absence.startTime && !absence.endTime) {
    return 'Todo el día';
  }
  return `${absence.startTime || '00:00'} - ${absence.endTime || '23:59'}`;
};

const CreateAbsenceDialog = ({ doctorId, onSuccess }: { doctorId: number; onSuccess: () => void }) => {
  const [open, setOpen] = useState(false);
  const { createAbsence, isCreating } = useDoctorAbsenceMutations();
  const { showSuccess, showError } = useToastContext();

  const form = useForm<AbsenceFormData>({
    resolver: zodResolver(absenceSchema),
    defaultValues: {
      type: Absence.VACATION,
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
    },
  });

  const handleSubmit = async (data: AbsenceFormData) => {
    try {
      const dto: CreateDoctorAbsenceDto = {
        doctorId,
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
      };

      await createAbsence.mutateAsync(dto);
      showSuccess("Ausencia creada", "La ausencia se creó correctamente");
      setOpen(false);
      form.reset();
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo crear la ausencia";
      showError("Error", errorMessage);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="mb-4">
          <Plus className="mr-2 h-4 w-4" />
          Agregar Ausencia
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agregar Ausencia</DialogTitle>
          <DialogDescription>
            Registrá una nueva ausencia (vacaciones, licencia, etc.)
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Ausencia *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(AbsenceLabels).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Inicio *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                      onChange={(date: Date | undefined) => {
                        if (date) {
                          field.onChange(formatDateForCalendar(date));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de Fin *</FormLabel>
                  <FormControl>
                    <DatePicker
                      value={field.value ? new Date(field.value + 'T12:00:00') : undefined}
                      onChange={(date: Date | undefined) => {
                        if (date) {
                          field.onChange(formatDateForCalendar(date));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Inicio (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        placeholder="HH:MM"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora Fin (opcional)</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        placeholder="HH:MM"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Ausencia
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export const MyAbsencesEditable = ({ doctorId }: MyAbsencesEditableProps) => {
  const { absences, isLoading, refetch } = useDoctorAbsences({
    doctorId,
    enabled: doctorId > 0
  });
  const { deleteAbsence, isDeleting } = useDoctorAbsenceMutations();
  const { showSuccess, showError } = useToastContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAbsenceId, setSelectedAbsenceId] = useState<number | null>(null);

  const handleDelete = async () => {
    if (selectedAbsenceId === null) return;

    try {
      await deleteAbsence.mutateAsync({ id: selectedAbsenceId, doctorId });
      showSuccess("Ausencia eliminada", "La ausencia se eliminó correctamente");
      setDeleteDialogOpen(false);
      setSelectedAbsenceId(null);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "No se pudo eliminar la ausencia";
      showError("Error", errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-40" />
        <Skeleton className="h-12 w-full" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <CreateAbsenceDialog doctorId={doctorId} onSuccess={refetch} />

      {absences.length === 0 ? (
        <div className="text-center py-12">
          <CalendarOff className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-lg text-muted-foreground">No tenés ausencias registradas</p>
          <p className="text-sm text-muted-foreground">
            Hacé clic en "Agregar Ausencia" para registrar vacaciones o licencias
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardContent className="p-0">
              <div className="rounded-lg border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Tipo</TableHead>
                      <TableHead>Desde</TableHead>
                      <TableHead>Hasta</TableHead>
                      <TableHead>Horario</TableHead>
                      <TableHead className="w-[80px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {absences.map((absence) => (
                      <TableRow key={absence.id} className="hover:bg-gray-50/50">
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`${getAbsenceBadgeColor(absence.type)} flex items-center gap-1 w-fit`}
                          >
                            {getAbsenceIcon(absence.type)}
                            {AbsenceLabels[absence.type]}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDateAR(absence.startDate)}
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatDateAR(absence.endDate)}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatTimeRange(absence)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedAbsenceId(absence.id);
                              setDeleteDialogOpen(true);
                            }}
                            disabled={isDeleting}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Eliminar Ausencia
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro que querés eliminar esta ausencia? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedAbsenceId(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyAbsencesEditable;
