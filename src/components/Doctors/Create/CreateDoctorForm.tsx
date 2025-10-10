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

type FormValues = z.infer<typeof DoctorSchema>;

function CreateDoctorComponent() {
  const { session } = useUserRole();
  const { addDoctorMutation } = useDoctorMutations();
  const { promiseToast } = useToastContext();
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

  async function onSubmit(values: z.infer<typeof DoctorSchema>) {
    const dateInArgentina = moment(values.birthDate).tz(
      "America/Argentina/Buenos_Aires"
    );

    const payload: any = {
      ...values,
      specialities: selectedSpecialities.map((speciality) => ({
        id: speciality.id,
        name: speciality.name,
      })),
      healthInsurances: selectedHealthInsurances.map((insurance) => ({
        id: insurance.id,
        name: insurance.name,
      })),
      address: {
        ...values.address,
        city: selectedCity,
        id: values.address.id,
      },
      photo: "",
      birthDate: dateInArgentina.format(),
      registeredById: Number(session?.id),
    };

    try {
      const promise = addDoctorMutation.mutateAsync(payload);

      await promiseToast(promise, {
        loading: {
          title: "Creando médico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Médico creado!",
          description: "El médico se ha creado exitosamente",
        },
        error: (error: any) => {
          if (error.response && error.response.status === 409) {
            return {
              title: "Médico ya existe",
              description: "El médico ya se encuentra registrado en el sistema",
            };
          }
          return {
            title: "Error al crear médico",
            description:
              error.response?.data?.message ||
              "Ha ocurrido un error inesperado",
          };
        },
      });

      goBack();
    } catch (error) {
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

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Fecha de Nacimiento
                    </label>
                    <CustomDatePicker
                      setStartDate={setStartDate}
                      setValue={setValue}
                      fieldName="birthDate"
                      initialDate={startDate}
                    />
                  </div>

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
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Provincia
                    </label>
                    <StateSelect
                      control={control}
                      name="address.city.state"
                      onStateChange={handleStateChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Ciudad
                    </label>
                    <CitySelect
                      control={control}
                      idState={selectedState ? Number(selectedState.id) : 0}
                      onCityChange={handleCityChange}
                    />
                  </div>

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
    </div>
  );
}

export default CreateDoctorComponent;
