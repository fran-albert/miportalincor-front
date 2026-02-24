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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import { DoctorSelect } from "../Select/DoctorSelect";
import { PatientSelectWithGuestOption } from "../Select/PatientSelectWithGuestOption";
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
  const [guestDni, setGuestDni] = useState<string | null>(null);
  const [guestFirstName, setGuestFirstName] = useState("");
  const [guestLastName, setGuestLastName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");
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

  const handleCreateGuestClick = (documentNumber: string) => {
    setGuestDni(documentNumber);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setGuestEmail("");
    form.setValue("patientId", undefined as unknown as number);
  };

  const handleClearGuest = () => {
    setGuestDni(null);
    setGuestFirstName("");
    setGuestLastName("");
    setGuestPhone("");
    setGuestEmail("");
  };

  const handleGuestSubmit = async () => {
    if (!guestDni || !onGuestSubmit) return;
    if (!guestFirstName || !guestLastName || !guestPhone) return;

    const doctorId = form.getValues("doctorId");
    const date = form.getValues("date");
    const hour = form.getValues("hour");
    const reason = form.getValues("reason");

    if (!doctorId || !date || !hour) return;

    await onGuestSubmit({
      doctorId,
      date,
      hour,
      reason,
      guestDocumentNumber: guestDni,
      guestFirstName,
      guestLastName,
      guestPhone,
      guestEmail: guestEmail || undefined,
    });
  };

  const isGuestMode = guestDni !== null;
  const canSubmitGuest = isGuestMode && guestFirstName && guestLastName && guestPhone && watchDoctorId && watchDate && watchHour;

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
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <FormLabel>Paciente (Invitado)</FormLabel>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleClearGuest}
                className="text-orange-600 hover:text-orange-800 hover:bg-orange-100 h-7 px-2"
              >
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
            <div className="flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded-md">
              <UserPlus className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-orange-900">DNI: {guestDni}</span>
              <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                INVITADO
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guestFirstNameOT" className="text-sm">Nombre *</Label>
                <Input
                  id="guestFirstNameOT"
                  placeholder="Nombre"
                  value={guestFirstName}
                  onChange={(e) => setGuestFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestLastNameOT" className="text-sm">Apellido *</Label>
                <Input
                  id="guestLastNameOT"
                  placeholder="Apellido"
                  value={guestLastName}
                  onChange={(e) => setGuestLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="guestPhoneOT" className="text-sm">Teléfono *</Label>
                <Input
                  id="guestPhoneOT"
                  placeholder="Teléfono"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="guestEmailOT" className="text-sm">Email (opcional)</Label>
                <Input
                  id="guestEmailOT"
                  type="email"
                  placeholder="Email"
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                />
              </div>
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
                    onCreateGuestClick={handleCreateGuestClick}
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
