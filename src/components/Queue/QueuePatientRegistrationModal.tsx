import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import moment from 'moment-timezone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { StateSelect } from '@/components/Select/State/select';
import { CitySelect } from '@/components/Select/City/select';
import { GenderSelect } from '@/components/Select/Gender/select';
import { HealthInsuranceSelect } from '@/components/Select/HealthInsurace/select';
import CustomDatePicker from '@/components/Date-Picker';
import { usePatientMutations } from '@/hooks/Patient/usePatientMutation';
import { useRegisterQueuePatient } from '@/hooks/Queue';
import { useToastContext } from '@/hooks/Toast/toast-context';
import useUserRole from '@/hooks/useRoles';
import type { QueueEntry } from '@/types/Queue';
import type { State } from '@/types/State/State';
import type { HealthInsurance } from '@/types/Health-Insurance/Health-Insurance';
import type { HealthPlans } from '@/types/Health-Plans/HealthPlan';
import type { Patient } from '@/types/Patient/Patient';
import { Loader2, UserPlus } from 'lucide-react';
import { ApiError } from '@/types/Error/ApiError';
import {
  findExactPatientByDocument,
  normalizeDocument,
} from './patient-registration.helpers';

const QueueRegistrationSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  userName: z.string().min(6, 'El DNI debe tener al menos 6 caracteres'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phoneNumber: z.string().min(8, 'El teléfono debe tener al menos 8 caracteres'),
  birthDate: z.coerce.date({ required_error: 'La fecha de nacimiento es requerida' }),
  gender: z.string().min(1, 'El género es requerido'),
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
  healthPlans: z
    .array(
      z.object({
        id: z.number(),
        name: z.string(),
      }),
    )
    .min(1, 'Debe seleccionar una obra social'),
  affiliationNumber: z.string().optional(),
});

type FormValues = z.infer<typeof QueueRegistrationSchema>;

interface QueuePatientRegistrationModalProps {
  entry: QueueEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_PATIENT_LABEL = 'Registro pendiente';
const ALREADY_REGISTERED_QUEUE_MESSAGE =
  'Esta fila no requiere alta administrativa adicional.';

const parseInitialNames = (patientName?: string) => {
  if (!patientName || patientName === EMPTY_PATIENT_LABEL) {
    return { firstName: '', lastName: '' };
  }

  if (patientName.includes(',')) {
    const [lastName, firstName] = patientName.split(',').map((value) => value.trim());
    return {
      firstName: firstName || '',
      lastName: lastName || '',
    };
  }

  const parts = patientName.trim().split(/\s+/);
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' };
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' '),
  };
};

export const QueuePatientRegistrationModal = ({
  entry,
  open,
  onOpenChange,
}: QueuePatientRegistrationModalProps) => {
  const { showError, showSuccess } = useToastContext();
  const { session } = useUserRole();
  const { addPatientMutation } = usePatientMutations();
  const registerQueuePatient = useRegisterQueuePatient();

  const [selectedHealthInsurance, setSelectedHealthInsurance] = useState<
    HealthInsurance | undefined
  >(undefined);
  const [selectedPlan, setSelectedPlan] = useState<HealthPlans | null>(null);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialNames = useMemo(
    () => parseInitialNames(entry?.patientName),
    [entry?.patientName],
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(QueueRegistrationSchema),
    defaultValues: {
      firstName: initialNames.firstName,
      lastName: initialNames.lastName,
      userName: entry?.patientDocument || '',
      email: '',
      phoneNumber: '',
      address: {
        street: '',
        number: '',
      },
    },
  });

  const { control, setValue, watch } = form;

  useEffect(() => {
    if (!open || !entry) return;

    const names = parseInitialNames(entry.patientName);
    form.reset({
      firstName: names.firstName,
      lastName: names.lastName,
      userName: entry.patientDocument || '',
      email: '',
      phoneNumber: '',
      address: {
        street: '',
        number: '',
      },
    });
    setSelectedHealthInsurance(undefined);
    setSelectedPlan(null);
    setStartDate(undefined);
  }, [entry, form, open]);

  const watchedState = watch('address.city.state') as State | undefined;

  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    if (healthInsurance.id === undefined) return;

    const plan: HealthPlans = {
      id: healthInsurance.id,
      name: healthInsurance.name,
    };
    setSelectedHealthInsurance(healthInsurance);
    setSelectedPlan(plan);
    setValue('healthPlans', [plan], { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    if (
      !entry ||
      isSubmitting ||
      addPatientMutation.isPending ||
      registerQueuePatient.isPending
    ) {
      return;
    }

    const queueEntryId = entry.id;
    setIsSubmitting(true);

    try {
      const dateInArgentina = moment(data.birthDate).tz(
        'America/Argentina/Buenos_Aires',
      );

      const stateWithCountry = {
        ...data.address.city.state,
        country: data.address.city.state.country || {
          id: 1,
          name: 'Argentina',
        },
      };

      const cityWithFullState = {
        ...data.address.city,
        state: stateWithCountry,
      };

      const patientPayload = {
        ...data,
        userName: normalizeDocument(data.userName),
        email: data.email || '',
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
                  name: selectedHealthInsurance?.name || '',
                },
              },
            ]
          : [],
        photo: '',
        birthDate: dateInArgentina.format(),
        registeredById: String(session?.id),
        cuil: '',
        cuit: '',
        phoneNumber2: '',
        bloodType: '',
        rhFactor: '',
        maritalStatus: '',
        observations: '',
      } as unknown as Patient;

      const createdPatient = await addPatientMutation.mutateAsync(patientPayload);

      await registerQueuePatient.mutateAsync({
        queueEntryId,
        patientId: Number(createdPatient.userId),
        resolutionType: 'CREATED_NEW_PATIENT',
      });

      showSuccess(
        'Paciente registrado',
        'La fila quedó vinculada al nuevo paciente correctamente.',
      );

      onOpenChange(false);
    } catch (error) {
      const apiError = error as ApiError;
      const apiMessage = apiError.response?.data?.message;

      if (apiMessage === ALREADY_REGISTERED_QUEUE_MESSAGE) {
        showSuccess(
          'Paciente registrado',
          'La fila ya había quedado vinculada y no requiere repetir el alta.',
        );
        onOpenChange(false);
      } else if (apiError.response?.status === 409) {
        try {
          const existingPatient = await findExactPatientByDocument(data.userName);

          if (existingPatient?.userId) {
            await registerQueuePatient.mutateAsync({
              queueEntryId,
              patientId: Number(existingPatient.userId),
            });

            showSuccess(
              'Paciente existente vinculado',
              'La fila quedó asociada al paciente ya registrado.',
            );

            onOpenChange(false);
          } else {
            showError(
              'Paciente ya existe',
              'El DNI ya está registrado, pero no se pudo vincular automáticamente la fila. Revise el paciente en padrón.',
            );
          }
        } catch (linkError) {
          console.error('Error auto-linking existing patient', linkError);
          showError(
            'No se pudo vincular automáticamente',
            'El DNI ya existe, pero el sistema no logró asociar la fila. Revise el paciente en padrón.',
          );
        }
      } else {
        showError(
          'Error al registrar paciente',
          apiMessage || 'No se pudo completar el alta.',
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!entry) return null;

  const isGuestEntry = entry.isGuest;
  const isUnregisteredEntry = !entry.isGuest && entry.patientId === null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-emerald-600" />
            Dar de alta paciente
          </DialogTitle>
          <DialogDescription>
            {isGuestEntry
              ? 'Complete los datos faltantes para convertir al invitado en paciente formal.'
              : isUnregisteredEntry
                ? 'El DNI no existe en el sistema. Complete el alta para vincular esta fila.'
                : 'Complete el alta para vincular esta fila al paciente.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="mb-2 text-sm font-medium text-emerald-900">
                Datos base de la fila
              </p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>D.N.I.</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="DNI"
                          disabled={Boolean(entry.patientDocument)}
                          className="bg-white"
                        />
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

              <div className="mt-4 grid grid-cols-2 gap-4">
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

            <div className="space-y-4">
              <p className="text-sm font-medium text-gray-900">
                Datos adicionales requeridos
              </p>

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
                        <StateSelect control={control} name="address.city.state" />
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

            <div className="flex justify-end gap-3 border-t pt-4">
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
                className="bg-emerald-600 hover:bg-emerald-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registrando...
                  </>
                ) : (
                  <>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Guardar y vincular
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
