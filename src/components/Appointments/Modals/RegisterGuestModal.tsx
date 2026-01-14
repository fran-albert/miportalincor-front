import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import moment from "moment-timezone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StateSelect } from "@/components/Select/State/select";
import { CitySelect } from "@/components/Select/City/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import CustomDatePicker from "@/components/Date-Picker";
import { AppointmentFullResponseDto } from "@/types/Appointment/Appointment";
import { State } from "@/types/State/State";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { HealthPlans } from "@/types/Health-Plans/HealthPlan";
import { Patient } from "@/types/Patient/Patient";
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import { useConvertGuest } from "@/hooks/Appointments";
import { useToastContext } from "@/hooks/Toast/toast-context";
import useUserRole from "@/hooks/useRoles";
import { UserPlus, Loader2 } from "lucide-react";
import { ApiError } from "@/types/Error/ApiError";

// Simplified schema for guest registration
const GuestRegistrationSchema = z.object({
  firstName: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  lastName: z.string().min(2, "El apellido debe tener al menos 2 caracteres"),
  userName: z.string().min(7, "El DNI debe tener al menos 7 caracteres"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  phoneNumber: z.string().min(8, "El teléfono debe tener al menos 8 caracteres"),
  // CustomDatePicker stores ISO string, so we coerce it to Date
  birthDate: z.coerce.date({ required_error: "La fecha de nacimiento es requerida" }),
  gender: z.string().min(1, "El género es requerido"),
  address: z.object({
    city: z.object({
      id: z.number(),
      name: z.string(),
      state: z.object({
        id: z.number(),
        name: z.string(),
        country: z.object({
          id: z.number(),
          name: z.string(),
        }).optional(),
      }),
    }),
    street: z.string().optional(),
    number: z.string().optional(),
  }),
  healthPlans: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).min(1, "Debe seleccionar una obra social"),
  affiliationNumber: z.string().optional(),
});

type FormValues = z.infer<typeof GuestRegistrationSchema>;

interface RegisterGuestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: AppointmentFullResponseDto;
  onSuccess?: () => void;
}

export const RegisterGuestModal = ({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: RegisterGuestModalProps) => {
  const { showSuccess, showError } = useToastContext();
  const { session } = useUserRole();
  const { addPatientMutation } = usePatientMutations();
  const { convertGuest } = useConvertGuest();

  const [selectedHealthInsurance, setSelectedHealthInsurance] = useState<HealthInsurance | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<HealthPlans | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(GuestRegistrationSchema),
    defaultValues: {
      firstName: appointment.guestFirstName || "",
      lastName: appointment.guestLastName || "",
      userName: appointment.guestDocumentNumber || "",
      email: appointment.guestEmail || "",
      phoneNumber: appointment.guestPhone || "",
      address: {
        street: "",
        number: "",
      },
    },
  });

  const { setValue, control, watch } = form;

  // Watch the selected state from the form to pass to CitySelect
  const watchedState = watch("address.city.state") as State | undefined;

  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    if (healthInsurance.id !== undefined) {
      const plan: HealthPlans = {
        id: healthInsurance.id,
        name: healthInsurance.name,
      };
      setSelectedHealthInsurance(healthInsurance);
      setSelectedPlan(plan);
      setValue("healthPlans", [plan], { shouldValidate: true });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const dateInArgentina = moment(data.birthDate).tz("America/Argentina/Buenos_Aires");

      // Ensure state has country (required by backend)
      const stateWithCountry = {
        ...data.address.city.state,
        country: data.address.city.state.country || { id: 1, name: "Argentina" },
      };

      const cityWithFullState = {
        ...data.address.city,
        state: stateWithCountry,
      };

      // Create patient payload - use form data directly since Select components now store full objects
      const patientPayload = {
        ...data,
        email: data.email || "",
        address: {
          ...data.address,
          city: cityWithFullState,
        },
        healthPlans: selectedPlan
          ? [
              {
                id: selectedPlan.id,
                name: selectedPlan.name,
                healthInsurance: {
                  id: selectedHealthInsurance?.id || 0,
                  name: selectedHealthInsurance?.name || "",
                },
              },
            ]
          : [],
        photo: "",
        birthDate: dateInArgentina.format(),
        registeredById: String(session?.id),
        // Optional fields
        cuil: "",
        cuit: "",
        phoneNumber2: "",
        bloodType: "",
        rhFactor: "",
        maritalStatus: "",
        observations: "",
      } as unknown as Patient;

      // Step 1: Create the patient
      let createdPatient;
      try {
        createdPatient = await addPatientMutation.mutateAsync(patientPayload);
      } catch (error) {
        const apiError = error as ApiError;
        if (apiError.response?.status === 409) {
          showError("Paciente ya existe", "Este DNI ya está registrado en el sistema");
        } else {
          showError("Error al crear paciente", apiError.response?.data?.message || "No se pudo crear el paciente");
        }
        return;
      }

      // Step 2: Convert the guest appointment to use the new patient
      try {
        await convertGuest.mutateAsync({
          appointmentId: appointment.id,
          patientId: Number(createdPatient.userId),
        });
      } catch (error) {
        const apiError = error as ApiError;
        showError(
          "Error al vincular turno",
          `El paciente se creó (ID: ${createdPatient.userId}) pero no se pudo vincular al turno: ${apiError.response?.data?.message || "Error desconocido"}`
        );
        return;
      }

      showSuccess("Paciente registrado", "El invitado ha sido registrado como paciente exitosamente");

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      const apiError = error as ApiError;
      showError("Error inesperado", apiError.response?.data?.message || "Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-purple-600" />
            Registrar Paciente
          </DialogTitle>
          <DialogDescription>
            Complete los datos para registrar al invitado como paciente del sistema.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Pre-filled data from guest */}
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <p className="text-sm font-medium text-purple-900 mb-2">Datos del invitado (pre-cargados)</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>D.N.I.</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="DNI" disabled className="bg-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Teléfono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nombre" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Apellido" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={control}
                name="email"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Email (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="Email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional required data */}
            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900">Datos adicionales requeridos</p>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="birthDate"
                  render={() => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento *</FormLabel>
                      <FormControl>
                        <CustomDatePicker
                          setStartDate={setStartDate}
                          setValue={setValue}
                          fieldName="birthDate"
                          initialDate={startDate}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="gender"
                  render={() => (
                    <FormItem>
                      <FormLabel>Género *</FormLabel>
                      <FormControl>
                        <GenderSelect control={control} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="address.city.state"
                  render={() => (
                    <FormItem>
                      <FormLabel>Provincia *</FormLabel>
                      <FormControl>
                        <StateSelect
                          control={control}
                          name="address.city.state"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="address.city"
                  render={() => (
                    <FormItem>
                      <FormLabel>Ciudad *</FormLabel>
                      <FormControl>
                        <CitySelect
                          control={control}
                          name="address.city"
                          idState={watchedState?.id || 0}
                          currentState={watchedState}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="healthPlans"
                  render={() => (
                    <FormItem>
                      <FormLabel>Obra Social *</FormLabel>
                      <FormControl>
                        <HealthInsuranceSelect
                          onHealthInsuranceChange={handleHealthInsuranceChange}
                          control={control}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="affiliationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>N° Afiliado</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Número de afiliado" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Registrar Paciente
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterGuestModal;
