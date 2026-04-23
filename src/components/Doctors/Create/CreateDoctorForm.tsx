import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { BloodSelect } from "@/components/Select/Blood/select";
import { RHFactorSelect } from "@/components/Select/RHFactor/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { MaritalStatusSelect } from "@/components/Select/MaritalStatus/select";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
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
import moment from "moment-timezone";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { Speciality } from "@/types/Speciality/Speciality";
import { State } from "@/types/State/State";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { HealthInsuranceDoctorSelect } from "@/components/Select/HealthInsurace/Doctor/select";
import { SpecialitySelect } from "@/components/Select/Speciality/select";
import { DoctorSchema } from "@/validators/doctor.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { City } from "@/types/City/City";
import { goBack } from "@/common/helpers/helpers";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import { useToastContext } from "@/hooks/Toast/toast-context";
import useUserRole from "@/hooks/useRoles";
import { motion } from "framer-motion";
import { Heart, MapPin, Phone, Stethoscope, User } from "lucide-react";
import CustomDatePicker from "@/components/Date-Picker";
import { ApiError } from "@/types/Error/ApiError";
import { CreateDoctorDto } from "@/types/Doctor/Doctor";

type FormValues = z.infer<typeof DoctorSchema>;

function CreateDoctorComponent() {
  const { session } = useUserRole();
  const { addDoctorMutation, convertPatientToDoctorMutation } = useDoctorMutations();
  const { showSuccess, showError, showLoading, removeToast } = useToastContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(DoctorSchema),
  });
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedSpecialities, setSelectedSpecialities] = useState<
    Speciality[]
  >([]);
  const [selectedHealthInsurances, setSelectedHealthInsurances] = useState<
    HealthInsurance[]
  >([]);
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  // State for patient-to-doctor conversion dialog
  const [showConversionDialog, setShowConversionDialog] = useState(false);
  const [pendingConversionUserName, setPendingConversionUserName] = useState<string | null>(null);

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState);
    }
  };

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
    setValue("address.city.state", String(state.id));
  };

  const handleConvertPatientToDoctor = async () => {
    if (!pendingConversionUserName) return;

    const values = form.getValues();
    try {
      await convertPatientToDoctorMutation.mutateAsync({
        userName: pendingConversionUserName,
        data: {
          matricula: values.matricula,
          specialities: selectedSpecialities
            .filter((speciality) => speciality.id !== undefined)
            .map((speciality) => ({
              id: speciality.id!,
              name: speciality.name,
            })),
          healthInsurances: selectedHealthInsurances
            .filter((insurance) => insurance.id !== undefined)
            .map((insurance) => ({
              id: insurance.id!,
              name: insurance.name,
            })),
        },
      });
      showSuccess(
        "¡Paciente convertido a médico!",
        "El paciente ha sido convertido exitosamente a médico"
      );
      setShowConversionDialog(false);
      setPendingConversionUserName(null);
      goBack();
    } catch (error) {
      console.error("Error converting patient to doctor:", error);
      showError(
        "Error al convertir",
        "Ocurrió un error al convertir el paciente a médico"
      );
    }
  };

  async function onSubmit(values: z.infer<typeof DoctorSchema>) {
    const dateInArgentina = moment(values.birthDate).tz(
      "America/Argentina/Buenos_Aires"
    );

    const payload: CreateDoctorDto = {
      firstName: values.firstName,
      lastName: values.lastName,
      userName: values.userName,
      email: values.email || "",
      phoneNumber: values.phoneNumber,
      phoneNumber2: values.phoneNumber2,
      birthDate: dateInArgentina.format(),
      gender: values.gender,
      maritalStatus: values.maritalStatus || "",
      matricula: values.matricula,
      bloodType: values.bloodType,
      rhFactor: values.rhFactor,
      observations: values.observations,
      photo: "",
      specialities: selectedSpecialities
        .filter((speciality) => speciality.id !== undefined)
        .map((speciality) => ({
          id: speciality.id!,
          name: speciality.name,
        })),
      healthInsurances: selectedHealthInsurances
        .filter((insurance) => insurance.id !== undefined)
        .map((insurance) => ({
          id: insurance.id!,
          name: insurance.name,
        })),
      address: {
        street: values.address.street || "",
        number: values.address.number || "",
        description: values.address.description || "",
        phoneNumber: values.address.phoneNumber || "",
        city: selectedCity || {
          id: 0,
          name: "",
          state: {
            id: 0,
            name: "",
            country: { id: 0, name: "" },
          },
        },
      },
      registeredById: String(session?.id),
    };

    const loadingId = showLoading("Creando médico...", "Por favor espera mientras procesamos tu solicitud");

    try {
      await addDoctorMutation.mutateAsync(payload);
      removeToast(loadingId);
      showSuccess("¡Médico creado!", "El médico se ha creado exitosamente");
      goBack();
    } catch (error) {
      removeToast(loadingId);
      const apiError = error as ApiError;

      // Check if user is already a patient - show conversion dialog
      if (
        apiError.response?.status === 409 &&
        apiError.response?.data?.code === "USER_IS_PATIENT"
      ) {
        setPendingConversionUserName(apiError.response.data.userName ?? null);
        setShowConversionDialog(true);
        return;
      }

      // Handle other 409 errors (user already exists as doctor)
      if (apiError.response?.status === 409) {
        showError("Médico ya existe", "El médico ya se encuentra registrado en el sistema");
        return;
      }

      // Handle generic errors
      showError(
        "Error al crear médico",
        apiError.response?.data?.message || "Ha ocurrido un error inesperado"
      );
      console.error("Error en onSubmit:", error);
    }
  }

  return (
    <div key="1">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Card 1: Información Personal (Blue) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
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
                          <Input
                            {...field}
                            placeholder="Ingresar apellido..."
                          />
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

          {/* Card 2: Información Profesional (Teal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200">
                <CardTitle className="flex items-center gap-3 text-teal-900">
                  <div className="p-2 bg-teal-600 rounded-full">
                    <Stethoscope className="h-6 w-6 text-white" />
                  </div>
                  Información Profesional
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar matrícula..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Especialidades
                    </label>
                    <SpecialitySelect
                      selected={selectedSpecialities}
                      onSpecialityChange={(newSelection) =>
                        setSelectedSpecialities(newSelection)
                      }
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Obras Sociales que Acepta
                    </label>
                    <HealthInsuranceDoctorSelect
                      selected={selectedHealthInsurances}
                      onHIChange={(newSelection: HealthInsurance[]) =>
                        setSelectedHealthInsurances(newSelection)
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 3: Información de Contacto (Purple) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
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
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono..."
                          />
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
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono..."
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

          {/* Card 4: Información Médica (Red) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
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

          {/* Card 5: Dirección (Orange) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
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
                        (cityError &&
                        typeof cityError === "object" &&
                        "message" in cityError
                          ? (cityError.message as string)
                          : undefined);

                      return (
                        <FormItem>
                          <FormLabel>Ciudad</FormLabel>
                          <FormControl>
                            <CitySelect
                              control={control}
                              idState={
                                selectedState ? Number(selectedState.id) : 0
                              }
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
                          <Input
                            {...field}
                            placeholder="Ingresar departamento"
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

          {/* Botones de Acción */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={goBack}>
                Cancelar
              </Button>
              <Button
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                type="submit"
                disabled={addDoctorMutation.isPending}
              >
                Confirmar
              </Button>
            </div>
          </motion.div>
        </form>
      </Form>

      {/* Dialog for converting patient to doctor */}
      <AlertDialog open={showConversionDialog} onOpenChange={setShowConversionDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Paciente ya registrado</AlertDialogTitle>
            <AlertDialogDescription>
              El DNI <strong>{pendingConversionUserName}</strong> ya está registrado como paciente en el sistema.
              ¿Desea convertirlo a médico? Esto eliminará su rol de paciente y le asignará el rol de médico
              con la matrícula, especialidades y obras sociales que configuró en el formulario.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setShowConversionDialog(false);
                setPendingConversionUserName(null);
              }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConvertPatientToDoctor}
              disabled={convertPatientToDoctorMutation.isPending}
              className="bg-greenPrimary hover:bg-greenPrimary/90"
            >
              {convertPatientToDoctorMutation.isPending
                ? "Convirtiendo..."
                : "Convertir a Médico"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default CreateDoctorComponent;
