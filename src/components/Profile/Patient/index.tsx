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
  User,
} from "lucide-react";
import TooltipInfo from "@/components/Tooltip";
import ChangePasswordDialog from "../Change-Password";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";

type FormValues = z.infer<typeof PatientSchema>;

function MyProfilePatientComponent({ patient }: { patient: Patient }) {
  const { updatePatientMutation } = usePatientMutations();
  const { promiseToast } = useToastContext();
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
      affiliationNumber: patient?.affiliationNumber || "",
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

  useEffect(() => {
    if (patient?.address?.city?.state) {
      form.setValue(
        "address.city.state",
        String(patient.address.city.state.id)
      );
    }
  }, [patient, form]);

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
  const removeDotsFromDni = (dni: string) => dni.replace(/\./g, "");

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

  useEffect(() => {
    if (patient) {
      if (selectedCity) {
        setValue("address.city", selectedCity, { shouldValidate: true });
      }
    }
  }, [patient, selectedCity, selectedHealthInsurance, setValue]);

  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    setSelectedHealthInsurance(healthInsurance);
  };

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
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
      id: patient.id,
      userId: patient.userId,
      dni: patient.dni,
      cuil: patient.cuil,
      affiliationNumber: patient.affiliationNumber,
      registrationDate: patient.registrationDate,
      roles: patient.roles,
      priority: patient.priority,
      module: patient.module,
      description: patient.description,
      currentPassword: patient.currentPassword,
      password: patient.password,
      newPassword: patient.newPassword,
      code: patient.code,
      confirmPassword: patient.confirmPassword,
      registeredByName: patient.registeredByName,
    } as Patient;
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
          description: "Paciente actualizado con éxito",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar paciente",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
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
    const dataToSend: Patient = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      photo: patient.photo,
      registeredById: patient.registeredById,
      healthPlans: healthPlansToSend,
    } as Patient;
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
          description: "Paciente actualizado con éxito",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar paciente",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mi Perfil" },
  ];

  return (
    <div className="space-y-6 p-6">
      {/* PageHeader */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mi Perfil"
        description="Gestiona tu información personal y configuración de cuenta"
        icon={<User className="h-6 w-6" />}
        actions={
          !isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                type="button"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <ChangePasswordDialog idUser={patient.userId} />
            </div>
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
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
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
          )
        }
      />

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Indicador de modo edición */}
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border-l-4 border-l-blue-500 rounded-lg p-4 mb-6 shadow-sm"
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

          {/* Header de Perfil con Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md border-0 mb-6 overflow-hidden">
              <div className="bg-gradient-to-r from-greenPrimary to-teal-600 h-32" />
              <CardContent className="relative pb-6">
                {/* Avatar */}
                <div className="absolute -top-16 left-6">
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center">
                    {patient.photo ? (
                      <img
                        src={patient.photo}
                        alt="Foto de perfil"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center">
                        <UserCircle className="h-20 w-20 text-white" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Info del paciente */}
                <div className="pt-20 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {patient.firstName} {patient.lastName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      {patient.email}
                    </div>
                    {patient.phoneNumber && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {patient.phoneNumber}
                      </div>
                    )}
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
                    {patient.healthPlans?.[0] && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
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

          {/* Grid de Cards Informativas */}
          <div className="grid grid-cols-1 gap-6">
            {/* Card 1: Información Personal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
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
                    {/* Nombre */}
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Nombre
                          </FormLabel>
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

                    {/* Apellido */}
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Apellido
                          </FormLabel>
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

                    {/* Email */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
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

                    {/* DNI */}
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between text-black">
                            D.N.I.
                            <TooltipInfo infoMessage="Este campo no se puede editar." />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar D.N.I..."
                              disabled={true}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Fecha de Nacimiento */}
                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
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

                    {/* Género */}
                    <FormField
                      control={form.control}
                      name="gender"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Sexo
                          </FormLabel>
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

                    {/* Estado Civil */}
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Estado Civil
                          </FormLabel>
                          <FormControl>
                            <MaritalStatusSelect
                              control={control}
                              defaultValue={
                                String(patient?.maritalStatus) || ""
                              }
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

            {/* Card 2: Información de Contacto */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Información de Contacto
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Teléfonos y datos de comunicación
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Teléfono 1 */}
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Teléfono Principal
                          </FormLabel>
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

                    {/* Teléfono 2 */}
                    <FormField
                      control={form.control}
                      name="phoneNumber2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Teléfono Secundario
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
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

            {/* Card 3: Información Médica */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center flex-shrink-0">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        Información Médica
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Datos clínicos y grupo sanguíneo
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipo de Sangre */}
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
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

                    {/* Factor RH */}
                    <FormField
                      control={form.control}
                      name="rhFactor"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
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
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Card 4: Obra Social */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
            >
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center flex-shrink-0">
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
                    {/* Obra Social */}
                    <FormField
                      control={form.control}
                      name="healthPlans"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
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

                    {/* Número de Afiliación */}
                    <FormField
                      control={form.control}
                      name="affiliationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between text-black">
                            Número de Afiliación
                            <TooltipInfo infoMessage="Este campo no se puede editar." />
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={true}
                              placeholder="Ingresar número de afiliación..."
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

            {/* Card 5: Dirección */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card className="shadow-md border-0">
                <CardHeader className="border-b bg-gray-50/50">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dirección</CardTitle>
                      <p className="text-sm text-gray-500">
                        Domicilio y ubicación
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-6">
                    {/* Provincia y Ciudad */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="address.city.state"
                        render={() => (
                          <FormItem>
                            <FormLabel className="text-black flex items-center justify-between">
                              Provincia
                            </FormLabel>
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
                            <FormLabel className="text-black flex items-center justify-between">
                              Ciudad
                            </FormLabel>
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
                    </div>

                    {/* Calle, Número, Piso, Depto */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="address.street"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-black flex items-center justify-between">
                              Calle
                            </FormLabel>
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
                            <FormLabel className="text-black flex items-center justify-between">
                              Número
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="N°"
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
                            <FormLabel className="text-black flex items-center justify-between">
                              Piso
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="Piso"
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
                            <FormLabel className="text-black flex items-center justify-between">
                              Depto
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                disabled={!isEditing}
                                placeholder="Depto"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default MyProfilePatientComponent;
