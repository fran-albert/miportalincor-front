import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelectWithGuestOption, GuestData } from "../Select/PatientSelectWithGuestOption";
import {
  CreateOverturnSchema,
  CreateOverturnFormData
} from "@/validators/Appointment/appointment.schema";
import { formatDateForCalendar, getTodayDateAR } from "@/common/helpers/timezone";
import { Loader2, UserPlus, X, Stethoscope } from "lucide-react";
import { useDoctors } from "@/hooks/Doctor/useDoctors";
import { formatDoctorName } from "@/common/helpers/helpers";

export interface GuestOverturnData {
  doctorId: number;
  date: string;
  hour: string;
  reason?: string;
  guestDocumentNumber: string;
  guestFirstName: string;
  guestLastName: string;
  guestPhone: string;
  guestEmail?: string;
}

interface CreateOverturnFormProps {
  onSubmit: (data: CreateOverturnFormData) => Promise<void>;
  /** Called when creating a guest overturn */
  onGuestSubmit?: (data: GuestOverturnData) => Promise<void>;
  isLoading?: boolean;
  defaultDoctorId?: number;
  defaultPatientId?: number;
  defaultDate?: string;
  /** If true, allow creating guest overturns */
  allowGuestCreation?: boolean;
  /** If provided, fixes the doctor and disables doctor select */
  fixedDoctorId?: number;
}

export const CreateOverturnForm = ({
  onSubmit,
  onGuestSubmit,
  isLoading = false,
  defaultDoctorId,
  defaultPatientId,
  defaultDate,
  allowGuestCreation = true,
  fixedDoctorId,
}: CreateOverturnFormProps) => {
  const [guestData, setGuestData] = useState<GuestData | null>(null);
  const { doctors } = useDoctors({ auth: true, fetchDoctors: !!fixedDoctorId });
  const fixedDoctor = fixedDoctorId
    ? doctors.find(d => Number(d.userId) === fixedDoctorId)
    : undefined;

  const form = useForm<CreateOverturnFormData>({
    resolver: zodResolver(CreateOverturnSchema),
    mode: "onSubmit",
    defaultValues: {
      doctorId: defaultDoctorId && defaultDoctorId > 0 ? defaultDoctorId : undefined,
      patientId: defaultPatientId && defaultPatientId > 0 ? defaultPatientId : undefined,
      date: defaultDate || getTodayDateAR(),
      hour: "",
      reason: "",
    },
  });

  const watchDoctorId = form.watch("doctorId");
  const watchDate = form.watch("date");
  const watchHour = form.watch("hour");

  const handleSubmit = async (data: CreateOverturnFormData) => {
    await onSubmit(data);
  };

  const handleGuestSelect = (data: GuestData) => {
    setGuestData(data);
    // Clear patient selection when switching to guest mode
    form.setValue("patientId", undefined as unknown as number);
  };

  const handleClearGuest = () => {
    setGuestData(null);
  };

  const handleGuestSubmit = async () => {
    if (!guestData || !onGuestSubmit) return;

    const doctorId = form.getValues("doctorId");
    const date = form.getValues("date");
    const hour = form.getValues("hour");
    const reason = form.getValues("reason");

    if (!doctorId || !date || !hour) {
      return;
    }

    await onGuestSubmit({
      doctorId,
      date,
      hour,
      reason,
      guestDocumentNumber: guestData.documentNumber,
      guestFirstName: guestData.firstName,
      guestLastName: guestData.lastName,
      guestPhone: guestData.phone,
      guestEmail: guestData.email,
    });
  };

  const isGuestMode = guestData !== null;
  const canSubmitGuest = isGuestMode && watchDoctorId && watchDate && watchHour;

  return (
    <Form {...form}>
      <form onSubmit={isGuestMode ? (e) => { e.preventDefault(); handleGuestSubmit(); } : form.handleSubmit(handleSubmit)} className="space-y-4">
        {fixedDoctorId ? (
          <div className="space-y-2">
            <FormLabel>Médico</FormLabel>
            <div className="flex items-center gap-2 h-10 w-full rounded-md border border-input bg-muted px-3 py-2">
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">
                {fixedDoctor ? formatDoctorName(fixedDoctor) : "Cargando..."}
              </span>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="doctorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Médico *</FormLabel>
                <FormControl>
                  <DoctorSelect
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Seleccionar médico"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* Patient/Guest Selection */}
        {isGuestMode ? (
          <div className="space-y-2">
            <FormLabel>Paciente (Invitado)</FormLabel>
            <div className="flex items-center gap-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
              <UserPlus className="h-5 w-5 text-orange-600" />
              <div className="flex-1">
                <p className="font-medium text-orange-900">
                  {guestData.firstName} {guestData.lastName}
                </p>
                <p className="text-sm text-orange-700">
                  DNI: {guestData.documentNumber} | Tel: {guestData.phone}
                </p>
              </div>
              <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                INVITADO
              </Badge>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClearGuest}
                className="text-orange-600 hover:text-orange-800 hover:bg-orange-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <FormField
            control={form.control}
            name="patientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Paciente *</FormLabel>
                <FormControl>
                  <PatientSelectWithGuestOption
                    value={field.value}
                    onValueChange={field.onChange}
                    onGuestSelect={handleGuestSelect}
                    placeholder="Buscar paciente por DNI..."
                    allowGuestCreation={allowGuestCreation && !!onGuestSubmit}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Fecha *</FormLabel>
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
          name="hour"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Horario *</FormLabel>
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
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Motivo del sobreturno</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Ej: Paciente con urgencia, control post-operatorio..."
                  rows={3}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            type="submit"
            disabled={isLoading || (isGuestMode && !canSubmitGuest)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isGuestMode && <UserPlus className="mr-2 h-4 w-4" />}
            {isGuestMode ? "Crear Sobreturno Invitado" : "Crear Sobreturno"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CreateOverturnForm;
