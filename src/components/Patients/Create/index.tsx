import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StateSelect } from "@/components/Select/State/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import moment from "moment-timezone";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { State } from "@/types/State/State";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { goBack } from "@/common/helpers/helpers";
import { RHFactorSelect } from "@/components/Select/RHFactor/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { MaritalStatusSelect } from "@/components/Select/MaritalStatus/select";
import { CitySelect } from "@/components/Select/City/select";
import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import { BloodSelect } from "@/components/Select/Blood/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PatientSchema } from "@/validators/patient.schema";
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import { City } from "@/types/City/City";
import { Patient } from "@/types/Patient/Patient";
import useUserRole from "@/hooks/useRoles";
import { HealthPlans } from "@/types/Health-Plans/HealthPlan";
import { useToastContext } from "@/hooks/Toast/toast-context";
import CustomDatePicker from "@/components/Date-Picker";
import { motion } from "framer-motion";
import { User, Phone, Heart, MapPin } from "lucide-react";
import { ApiError } from "@/types/Error/ApiError";
type FormValues = z.infer<typeof PatientSchema>;
export function CreatePatientComponent() {
  const { session } = useUserRole();
  const { addPatientMutation } = usePatientMutations();
  const { promiseToast } = useToastContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(PatientSchema),
  });
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);
  const [selectedPlan, setSelectedPlan] = useState<HealthPlans | null>(null);
  const [selectedHealthInsurance, setSelectedHealthInsurance] = useState<
    HealthInsurance | undefined
  >(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState, { shouldValidate: true });
    }
  };
  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    if (healthInsurance.id !== undefined) {
      const selectedPlan: HealthPlans = {
        id: healthInsurance.id,
        name: healthInsurance.name,
      };
      setSelectedHealthInsurance(healthInsurance);
      setSelectedPlan(selectedPlan);

      // Actualizar el valor en el formulario para que pase la validación
      setValue("healthPlans", [selectedPlan], { shouldValidate: true });
    } else {
      console.error("Health insurance does not have a valid ID");
    }
  };
  const handleStateChange = (state: State) => {
    console.log('handleStateChange called with state:', state);
    setSelectedState(state);
    setSelectedCity(undefined);
    // Don't reset address.city.state here as it causes the select to reset
    // The StateSelect component already handles updating this value
  };
  async function onSubmit(data: z.infer<typeof PatientSchema>) {
    console.log("✅ onSubmit ejecutado - Formulario válido");
    console.log("📋 Data recibida:", data);

    const dateInArgentina = moment(data.birthDate).tz(
      "America/Argentina/Buenos_Aires"
    );

    const payload = {
      ...data,
      email: data.email || "",
      address: {
        ...data.address,
        city: selectedCity,
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
    } as Patient;
    try {
      const promise = addPatientMutation.mutateAsync(payload);
      await promiseToast(promise, {
        loading: {
          title: "Creando paciente...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Paciente creado!",
          description: "El paciente se ha creado exitosamente",
        },
        error: (error: ApiError) => {
          if (error.response && error.response.status === 409) {
            return {
              title: "Paciente ya existe",
              description:
                "El paciente ya se encuentra registrado en el sistema",
            };
          }
          return {
            title: "Error al crear paciente",
            description:
              error.response?.data?.message ||
              "Ha ocurrido un error inesperado",
          };
        },
      });
      goBack();
    } catch (error) {
      console.error("Error al crear el paciente", error);
    }
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(
          onSubmit,
          (errors) => {
            console.log("❌ Errores de validación encontrados:");
            console.log("📝 form.formState.errors:", form.formState.errors);
            console.log("📝 errors del handleSubmit:", errors);

            // Mostrar cada error individualmente
            Object.entries(errors).forEach(([field, error]) => {
              console.log(`  🔴 Campo "${field}":`, error?.message || error);
            });
          }
        )}
        className="space-y-6">
        {/* Card 1: Información Personal (Blue) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-border-blue-200">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="p-2 bg-blue-600 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar nombre..." />
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
                        <Input {...field} placeholder="Ingresar apellido..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>D.N.I.</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar D.N.I..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="birthDate"
                  render={() => (
                    <FormItem>
                      <FormLabel>Fecha de Nacimiento</FormLabel>
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
                      <FormLabel>Género</FormLabel>
                      <FormControl>
                        <GenderSelect control={control} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="maritalStatus"
                  render={() => (
                    <FormItem>
                      <FormLabel>Estado Civil</FormLabel>
                      <FormControl>
                        <MaritalStatusSelect control={control} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Card 2: Información de Contacto (Purple) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-border-purple-200">
              <CardTitle className="flex items-center gap-3 text-purple-900">
                <div className="p-2 bg-purple-600 rounded-full">
                  <Phone className="h-6 w-6 text-white" />
                </div>
                Información de Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresar correo electrónico..."
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
                        <Input {...field} placeholder="Ingresar teléfono..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="phoneNumber2"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono 2</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar teléfono..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Card 3: Información Médica (Red) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-border-red-200">
              <CardTitle className="flex items-center gap-3 text-red-900">
                <div className="p-2 bg-red-600 rounded-full">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                Información Médica
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="bloodType"
                  render={() => (
                    <FormItem>
                      <FormLabel>Tipo de Sangre</FormLabel>
                      <FormControl>
                        <BloodSelect control={control} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="rhFactor"
                  render={() => (
                    <FormItem>
                      <FormLabel>Factor R.H.</FormLabel>
                      <FormControl>
                        <RHFactorSelect control={control} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="healthPlans"
                  render={() => (
                    <FormItem>
                      <FormLabel>Obra Social</FormLabel>
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
                      <FormLabel>Número de Obra Social <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresar Número de Afiliado"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="observations"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Observaciones</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresar observaciones..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Card 4: Dirección (Orange) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-border-orange-200">
              <CardTitle className="flex items-center gap-3 text-orange-900">
                <div className="p-2 bg-orange-600 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={control}
                  name="address.city.state"
                  render={() => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <FormControl>
                        <StateSelect
                          control={control}
                          name="address.city.state"
                          onStateChange={handleStateChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="address.city"
                  render={() => {
                    const cityError = form.formState.errors?.address?.city;
                    const errorMessage =
                      (cityError?.id as { message?: string })?.message ||
                      (cityError?.name as { message?: string })?.message ||
                      (cityError && typeof cityError === 'object' && 'message' in cityError ? cityError.message as string : undefined);

                    return (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <CitySelect
                            control={control}
                            idState={selectedState ? Number(selectedState.id) : 0}
                            onCityChange={handleCityChange}
                          />
                        </FormControl>
                        {errorMessage && (
                          <p className="text-sm font-medium text-destructive">
                            {errorMessage}
                          </p>
                        )}
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar calle" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="address.number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar número" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="address.description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Piso</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar piso" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={control}
                  name="address.phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Departamento</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar departamento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex justify-end gap-3">
            <Button variant="outline" type="button" onClick={goBack}>
              Cancelar
            </Button>
            <Button
              className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
              type="submit"
              disabled={addPatientMutation.isPending}
            >
              Confirmar
            </Button>
          </div>
        </motion.div>
      </form>
    </Form>
  );
}
