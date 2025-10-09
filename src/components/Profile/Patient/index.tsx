import { formatDni } from "@/common/helpers/helpers";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SubmitHandler, useForm } from "react-hook-form";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { BloodSelect } from "@/components/Select/Blood/select";
import { RHFactorSelect } from "@/components/Select/RHFactor/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { MaritalStatusSelect } from "@/components/Select/MaritalStatus/select";
import { City } from "@/types/City/City";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { State } from "@/types/State/State";
import { useEffect, useState } from "react";
import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import { z } from "zod";
import { PatientSchema } from "@/validators/patient.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@/types/Patient/Patient";
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import CustomDatePicker from "@/components/Date-Picker";
import {
  Edit2,
  Save,
  X,
  UserCircle,
  Phone,
  MapPin,
  Heart,
  Shield,
  Mail,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import useUserRole from "@/hooks/useRoles";
type FormValues = z.infer<typeof PatientSchema>;
interface PatientProfileComponentProps {
  patient: Patient;
  breadcrumbItems: Array<{ label: string; href?: string }>;
}
function PatientProfileComponent({
  patient,
  breadcrumbItems,
}: PatientProfileComponentProps) {
  const { updatePatientMutation } = usePatientMutations();
  const { promiseToast } = useToastContext();
  const { isSecretary, isAdmin } = useUserRole();
  const form = useForm<FormValues>({
    resolver: zodResolver(PatientSchema),
    defaultValues: {
      firstName: patient?.firstName || "",
      lastName: patient?.lastName || "",
      email: patient?.email || "",
      userName: patient?.dni ? formatDni(String(patient.dni)) : "",
      birthDate: patient?.birthDate
        ? typeof patient.birthDate === "string" ||
          patient.birthDate instanceof Date
          ? new Date(patient.birthDate).toISOString()
          : ""
        : "",
      phoneNumber: patient?.phoneNumber || "",
      phoneNumber2: patient?.phoneNumber2 || "",
      bloodType: patient?.bloodType || "",
      rhFactor: patient?.rhFactor || "",
      gender: patient?.gender || "",
      maritalStatus: patient?.maritalStatus || "",
      observations: patient?.observations || "",
      address: {
        street: patient?.address?.street || "",
        number: patient?.address?.number || "",
        description: patient?.address?.description || "",
        phoneNumber: patient?.address?.phoneNumber || "",
        city: patient?.address?.city || null,
      },
      healthPlans:
        patient?.healthPlans?.map((plan) => ({
          id: plan.id,
          name: plan.name,
          healthInsurance: {
            id: plan.healthInsurance.id,
            name: plan.healthInsurance.name,
          },
        })) || [],
    },
  });
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    patient?.address?.city?.state
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    patient?.address?.city
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHealthInsurance, setSelectedHealthInsurance] = useState<
    HealthInsurance | undefined
  >(patient?.healthPlans?.[0]?.healthInsurance);
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    patient?.birthDate ? new Date(patient.birthDate.toString()) : undefined
  );
  const removeDotsFromDni = (dni: any) => dni.replace(/\./g, "");

  const handleStateChange = (state: State) => {
    setSelectedState(state);
  };

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState, { shouldValidate: true });
    }
  };

  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    if (healthInsurance.id !== undefined) {
      const healthPlanToSend = {
        id: healthInsurance.id,
        name: healthInsurance.name,
      };
      setSelectedHealthInsurance(healthInsurance);
      setValue("healthPlans", [healthPlanToSend], {
        shouldValidate: true,
      });
    } else {
      console.error("Health insurance does not have a valid ID");
    }
  };

  useEffect(() => {
    if (patient?.address?.city?.state) {
      form.setValue(
        "address.city.state",
        String(patient.address.city.state.id)
      );
    }
  }, [patient, form]);

  const onSubmit: SubmitHandler<any> = async (formData) => {
    const formattedUserName = removeDotsFromDni(formData.userName);
    const { address, ...rest } = formData;
    const addressToSend = {
      ...address,
      id: patient?.address?.id,
      city: {
        ...selectedCity,
        state: selectedState,
      },
    };
    const healthPlansToSend = [
      {
        id: selectedHealthInsurance?.id,
        name: selectedHealthInsurance?.name,
        healthInsurance: {
          id: selectedHealthInsurance?.id,
          name: selectedHealthInsurance?.name,
        },
      },
    ];
    const dataToSend = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      photo: patient.photo,
      registeredById: patient.registeredById,
      healthPlans: healthPlansToSend,
    };
    try {
      const patientCreationPromise = updatePatientMutation.mutateAsync({
        id: Number(patient?.userId),
        patient: dataToSend,
      });

      await promiseToast(patientCreationPromise, {
        loading: {
          title: "Actualizando paciente...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Paciente actualizado!",
          description: "El paciente se ha actualizado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al actualizar paciente",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
    }
  };

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    const formattedUserName = removeDotsFromDni(form.getValues("userName"));
    const { address, ...rest } = form.getValues();
    const addressToSend = {
      ...address,
      id: patient?.address?.id,
      city: {
        ...selectedCity,
        state: selectedState,
      },
    };
    const healthPlansToSend = [
      {
        id: selectedHealthInsurance?.id,
        name: selectedHealthInsurance?.name,
        healthInsurance: {
          id: selectedHealthInsurance?.id,
          name: selectedHealthInsurance?.name,
        },
      },
    ];
    const dataToSend: any = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      photo: patient.photo,
      registeredById: patient.registeredById,
      healthPlans: healthPlansToSend,
    };
    try {
      const patientCreationPromise = updatePatientMutation.mutateAsync({
        id: Number(patient?.userId),
        patient: dataToSend,
      });

      await promiseToast(patientCreationPromise, {
        loading: {
          title: "Actualizando datos del paciente",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Paciente actualizado",
          description: "Los datos del paciente se actualizaron exitosamente",
        },
        error: (error: any) => ({
          title: "Error al actualizar el paciente",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Perfil del Paciente"
        description={`Información completa de ${patient?.firstName} ${patient?.lastName}`}
        icon={<UserCircle className="h-6 w-6" />}
        actions={
          (isSecretary || isAdmin) &&
          (!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
              type="button"
            >
              <Edit2 className="h-4 w-4 mr-2" />
              Editar Perfil
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                type="button"
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                disabled={updatePatientMutation.isPending}
              >
                {updatePatientMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-ful  animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          ))
        }
      />

      {/* Edit Mode Indicator */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 shadow-sm"
        >
          <div className="flex items-center gap-2">
            <Edit2 className="h-4 w-4 text-blue-600" />
            <p className="text-sm text-blue-900 font-medium">
              Modo de edición activo - Modifica los campos que necesites
              actualizar
            </p>
          </div>
        </motion.div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} id="profileForm">
          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md border-0 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-greenPrimary to-teal-600 h-32" />
              <CardContent className="relative pb-6">
                {/* Avatar positioned over gradient */}
                <div className="absolute -top-16 left-6">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-x flex items-center justify-center">
                    {patient.photo ? (
                      <img
                        src={patient.photo}
                        alt="Foto de perfil"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-b from-greenPrimary to-teal-600 flex items-center justify-center">
                        <UserCircle className="h-20 w-20 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Patient info */}
                <div className="pt-20 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {patient.email}
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {patient.bloodType && patient.rhFactor && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Sangre: {patient.bloodType} {patient.rhFactor}
                      </Badge>
                    )}
                    {patient.healthPlans?.[0]?.healthInsurance && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-70 border-green-200"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {patient.healthPlans[0].healthInsurance.name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 1: Información Personal (Blue) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-600 flex items-center justify-center flex-shrink-0">
                    <UserCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Información Personal
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Datos básicos de identificación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Nombre</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar nombre..."
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Apellido</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar apellido..."
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">D.N.I.</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar D.N.I..."
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="birthDate"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Fecha de Nacimiento
                        </FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            setStartDate={setStartDate}
                            setValue={setValue}
                            fieldName="birthDate"
                            initialDate={startDate}
                            disabled={!isEditing}
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

          {/* Card 2: Información de Contacto (Purple) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-50 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Información de Contacto
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Teléfonos y correo electrónico
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar correo electrónico..."
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Teléfono</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono..."
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phoneNumber2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Teléfono 2</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono..."
                            disabled={!isEditing}
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

          {/* Card 3: Información Médica (Red) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-60 flex items-center justify-center flex-shrink-0">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Información Médica
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Datos de salud del paciente
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="bloodType"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Tipo de Sangre
                        </FormLabel>
                        <FormControl>
                          <BloodSelect
                            control={control}
                            disabled={!isEditing}
                            defaultValue={String(patient?.bloodType) || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="rhFactor"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Factor R.H.
                        </FormLabel>
                        <FormControl>
                          <RHFactorSelect
                            control={control}
                            defaultValue={String(patient?.rhFactor) || ""}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gender"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">Sexo</FormLabel>
                        <FormControl>
                          <GenderSelect
                            control={control}
                            defaultValue={String(patient?.gender) || ""}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maritalStatus"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Estado Civil
                        </FormLabel>
                        <FormControl>
                          <MaritalStatusSelect
                            control={control}
                            defaultValue={String(patient?.maritalStatus) || ""}
                            disabled={!isEditing}
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

          {/* Card 4: Obra Social (Green) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-50 to-green-600 flex items-center justify-center flex-shrink-0">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Obra Social</CardTitle>
                    <p className="text-sm text-gray-500">
                      Cobertura médica y afiliación
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="healthPlans"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Obra Social
                        </FormLabel>
                        <FormControl>
                          <HealthInsuranceSelect
                            onHealthInsuranceChange={
                              handleHealthInsuranceChange
                            }
                            control={control}
                            defaultValue={selectedHealthInsurance}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="affiliationNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Número de Afiliado
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar número de afiliado..."
                            disabled={!isEditing}
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
                      <FormItem className="md:col-span-2">
                        <FormLabel className="text-black">
                          Observaciones
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
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
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-50 to-orange-600 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Dirección</CardTitle>
                    <p className="text-sm text-gray-500">
                      Ubicación y domicilio
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address.city.state"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">Provincia</FormLabel>
                        <FormControl>
                          <StateSelect
                            control={control}
                            name="address.city.state"
                            disabled={!isEditing}
                            defaultValue={patient?.address?.city?.state}
                            onStateChange={handleStateChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.city"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">Ciudad</FormLabel>
                        <FormControl>
                          <CitySelect
                            control={control}
                            disabled={!isEditing}
                            defaultValue={selectedCity}
                            idState={selectedState ? selectedState.id : 0}
                            onCityChange={handleCityChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Calle</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="Ingresar calle"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Número</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="Ingresar número"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Piso</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
                            placeholder="Ingresar piso"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="address.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Departamento
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            disabled={!isEditing}
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
        </form>
      </Form>
    </div>
  );
}

export default PatientProfileComponent;
