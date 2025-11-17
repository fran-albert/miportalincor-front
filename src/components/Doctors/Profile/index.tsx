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
import { HealthInsuranceDoctorSelect } from "@/components/Select/HealthInsurace/Doctor/select";
import { z } from "zod";
import { DoctorSchema } from "@/validators/doctor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Doctor } from "@/types/Doctor/Doctor";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
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
  Stethoscope,
  FileText,
  Briefcase,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import useUserRole from "@/hooks/useRoles";
import ResetDefaultPasswordButton from "@/components/Button/Reset-Default-Password";
import { Speciality } from "@/types/Speciality/Speciality";
import { SpecialitySelect } from "@/components/Select/Speciality/select";
import { ImageUploadBox } from "../Signature-Boxs";
import { Textarea } from "@/components/ui/textarea";

type FormValues = z.infer<typeof DoctorSchema>;

interface DoctorProfileComponentProps {
  doctor: Doctor;
  breadcrumbItems: Array<{ label: string; href?: string }>;
}

function DoctorProfileComponent({
  doctor,
  breadcrumbItems,
}: DoctorProfileComponentProps) {
  const { updateDoctorMutation } = useDoctorMutations();
  const { promiseToast } = useToastContext();
  const { isSecretary, isAdmin } = useUserRole();

  const form = useForm<FormValues>({
    resolver: zodResolver(DoctorSchema),
    defaultValues: {
      firstName: doctor?.firstName || "",
      lastName: doctor?.lastName || "",
      email: doctor?.email || "",
      userName: doctor?.dni ? formatDni(String(doctor.dni)) : "",
      matricula: doctor?.matricula || "",
      birthDate: doctor?.birthDate
        ? typeof doctor.birthDate === "string" ||
          doctor.birthDate instanceof Date
          ? new Date(doctor.birthDate).toISOString()
          : ""
        : "",
      phoneNumber: doctor?.phoneNumber || "",
      phoneNumber2: doctor?.phoneNumber2 || "",
      bloodType: doctor?.bloodType || "",
      rhFactor: doctor?.rhFactor || "",
      gender: doctor?.gender || "",
      maritalStatus: doctor?.maritalStatus || "",
      observations: doctor?.observations || "",
      address: {
        street: doctor?.address?.street ?? "",
        number: doctor?.address?.number ?? "",
        description: doctor?.address?.description ?? "",
        phoneNumber: doctor?.address?.phoneNumber ?? "",
        city: doctor?.address?.city || null,
      },
      healthInsurances: doctor?.healthInsurances || [],
      specialities: doctor?.specialities || [],
    },
  });

  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    doctor?.address?.city?.state
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    doctor?.address?.city
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedHealthInsurances, setSelectedHealthInsurances] = useState<
    HealthInsurance[]
  >(doctor?.healthInsurances || []);
  const [selectedSpecialities, setSelectedSpecialities] = useState<
    Speciality[]
  >(doctor?.specialities || []);
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    doctor?.birthDate ? new Date(doctor.birthDate.toString()) : undefined
  );

  const removeDotsFromDni = (dni: string) => dni.replace(/\./g, "");

  useEffect(() => {
    if (doctor) {
      setValue("firstName", doctor.firstName);
      setValue("lastName", doctor.lastName);
      setValue("email", doctor.email);
      setValue("userName", formatDni(String(doctor.dni)));
      setValue("matricula", doctor.matricula || "");
      if (doctor?.birthDate) {
        setStartDate(new Date(doctor.birthDate.toString()));
        setValue("birthDate", doctor.birthDate.toString());
      }
      setValue("phoneNumber", doctor.phoneNumber);
      setValue("phoneNumber2", doctor.phoneNumber2 || "");
      setValue("bloodType", String(doctor.bloodType) || "");
      setValue("rhFactor", String(doctor.rhFactor) || "");
      setValue("gender", String(doctor.gender) || "");
      setValue("maritalStatus", String(doctor.maritalStatus) || "");
      setValue("observations", doctor.observations || "");
      setValue("address.street", doctor?.address?.street ?? "");
      setValue("address.number", doctor?.address?.number ?? "");
      setValue("address.description", doctor?.address?.description || "");
      setValue("address.phoneNumber", doctor?.address?.phoneNumber || "");
      setValue("address.city", doctor?.address?.city);
      setSelectedHealthInsurances(doctor.healthInsurances || []);
      setSelectedSpecialities(doctor.specialities || []);
      setSelectedCity(doctor?.address?.city);
      setSelectedState(doctor?.address?.city?.state);
      if (doctor?.address?.city?.state) {
        setValue("address.city.state", String(doctor.address.city.state.id));
      }
    }
  }, [doctor, setValue]);

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  const onSubmit: SubmitHandler<FormValues> = async (formData) => {
    const specialitiesToSend = selectedSpecialities.map((s) => ({
      id: s.id,
      name: s.name,
    }));
    const healthInsuranceToSend = selectedHealthInsurances.map((h) => ({
      id: h.id,
      name: h.name,
    }));

    const { address, ...rest } = formData;
    const formattedUserName = removeDotsFromDni(formData.userName);
    const addressToSend = {
      ...address,
      id: doctor?.address?.id,
      city: {
        ...selectedCity,
        state: selectedState,
      },
    };

    const dataToSend = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      specialities: specialitiesToSend,
      healthInsurances: healthInsuranceToSend,
      photo: doctor?.photo,
      registeredById: doctor?.registeredById,
      id: doctor.id,
      dni: doctor.dni,
      userId: doctor.userId,
      registrationDate: doctor.registrationDate,
      roles: doctor.roles,
      priority: doctor.priority,
      module: doctor.module,
      description: doctor.description,
      currentPassword: doctor.currentPassword,
      password: doctor.password,
      newPassword: doctor.newPassword,
      code: doctor.code,
      confirmPassword: doctor.confirmPassword,
      registeredByName: doctor.registeredByName,
      slug: doctor.slug,
      token: doctor.token,
      firma: doctor.firma,
      sello: doctor.sello,
      matricula: formData.matricula,
    } as Doctor;

    try {
      const promise = updateDoctorMutation.mutateAsync({
        id: Number(doctor?.userId),
        doctor: dataToSend,
      });

      await promiseToast(promise, {
        loading: {
          title: "Actualizando médico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Médico actualizado!",
          description: "El médico se ha actualizado exitosamente",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar médico",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el médico", error);
    }
  };

  const handleSave = () => {
    form.handleSubmit(onSubmit)();
  };

  return (
    <div className="space-y-6">
      {/* PageHeader */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Perfil del Médico"
        description={`Información completa de ${doctor?.firstName} ${doctor?.lastName}`}
        icon={<UserCircle className="h-6 w-6" />}
        actions={
          (isSecretary || isAdmin) &&
          (!isEditing ? (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsEditing(true)}
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                type="button"
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Editar Perfil
              </Button>
              <ResetDefaultPasswordButton idUser={doctor.userId} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                type="button"
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                disabled={updateDoctorMutation.isPending}
              >
                {updateDoctorMutation.isPending ? (
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
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl flex items-center justify-center">
                    {doctor.photo ? (
                      <img
                        src={doctor.photo}
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

                <div className="pt-20 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {doctor.firstName} {doctor.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {doctor.email}
                  </div>

                  <div className="flex gap-2 mt-3 flex-wrap">
                    {doctor.bloodType && doctor.rhFactor && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Sangre: {doctor.bloodType} {doctor.rhFactor}
                      </Badge>
                    )}
                    {doctor.matricula && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        <Briefcase className="h-3 w-3 mr-1" />
                        Mat. {doctor.matricula}
                      </Badge>
                    )}
                    {doctor.healthInsurances?.[0] && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {doctor.healthInsurances[0].name}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card 1: Información Personal (Azul) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="shadow-md border-0 mb-6">
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
                  <FormField
                    control={control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
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
                    control={control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
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
                    control={control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>D.N.I.</FormLabel>
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

          {/* Card 2: Información Profesional (Teal) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                    <Stethoscope className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Información Profesional
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Datos de matrícula y especialización
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
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
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="specialities"
                    render={() => (
                      <FormItem>
                        <FormLabel>Especialidades</FormLabel>
                        <FormControl>
                          <SpecialitySelect
                            onSpecialityChange={setSelectedSpecialities}
                            selected={selectedSpecialities}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="healthInsurances"
                    render={() => (
                      <FormItem>
                        <FormLabel>Obras Sociales</FormLabel>
                        <FormControl>
                          <HealthInsuranceDoctorSelect
                            onHIChange={setSelectedHealthInsurances}
                            selected={selectedHealthInsurances}
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

          {/* Card 3: Información de Contacto (Púrpura) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="shadow-md border-0 mb-6">
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
                      Teléfonos y datos personales
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Principal</FormLabel>
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
                    control={control}
                    name="phoneNumber2"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Secundario</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono secundario..."
                            disabled={!isEditing}
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
                          <GenderSelect
                            control={control}
                            defaultValue={doctor.gender}
                            disabled={!isEditing}
                          />
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
                          <MaritalStatusSelect
                            control={control}
                            defaultValue={doctor.maritalStatus}
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

          {/* Card 4: Información Médica (Roja) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="shadow-md border-0 mb-6">
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
                      Datos de salud y observaciones
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="bloodType"
                    render={() => (
                      <FormItem>
                        <FormLabel>Tipo de Sangre</FormLabel>
                        <FormControl>
                          <BloodSelect
                            control={control}
                            defaultValue={doctor.bloodType}
                            disabled={!isEditing}
                          />
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
                        <FormLabel>Factor RH</FormLabel>
                        <FormControl>
                          <RHFactorSelect
                            control={control}
                            defaultValue={doctor.rhFactor}
                            disabled={!isEditing}
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
                          <Textarea
                            {...field}
                            placeholder="Ingresar observaciones..."
                            disabled={!isEditing}
                            rows={3}
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

          {/* Card 5: Dirección (Naranja) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card className="shadow-md border-0 mb-6">
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
                            defaultValue={selectedState}
                            onStateChange={handleStateChange}
                            disabled={!isEditing}
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
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <CitySelect
                            control={control}
                            idState={selectedState?.id || 0}
                            defaultValue={selectedCity}
                            onCityChange={handleCityChange}
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar calle..."
                            disabled={!isEditing}
                            defaultValue={doctor?.address?.street || ""}
                          />
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
                          <Input
                            {...field}
                            placeholder="Ingresar número..."
                            defaultValue={doctor?.address?.number || ""}
                            disabled={!isEditing}
                          />
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
                        <FormLabel>Departamento</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar departamento..."
                            defaultValue={doctor?.address?.description || ""}
                            disabled={!isEditing}
                          />
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
                        <FormLabel>Teléfono Dirección</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Ingresar teléfono..."
                            defaultValue={doctor?.address?.phoneNumber || ""}
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

          {/* Card 6: Firma y Sello (Índigo) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="shadow-md border-0 mb-6">
              <CardHeader className="border-b bg-gray-50/50">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Firma y Sello</CardTitle>
                    <p className="text-sm text-gray-500">
                      Documentación profesional
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploadBox
                    id="sello"
                    label="Sello"
                    doctorId={doctor.userId}
                    isEditing={isEditing}
                    image={doctor.sello || null}
                    onImageUploaded={() => setIsEditing(false)}
                  />
                  <ImageUploadBox
                    id="firma"
                    label="Firma"
                    image={doctor.firma || null}
                    doctorId={Number(doctor.userId)}
                    isEditing={isEditing}
                    onImageUploaded={() => setIsEditing(false)}
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

export default DoctorProfileComponent;
