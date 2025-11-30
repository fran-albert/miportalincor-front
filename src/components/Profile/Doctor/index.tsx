import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { formatDni } from "@/common/helpers/helpers";
import { State } from "@/types/State/State";
import { Doctor } from "@/types/Doctor/Doctor";
import { useForm } from "react-hook-form";
import { DoctorSchema } from "@/validators/doctor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { City } from "@/types/City/City";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import CustomDatePicker from "@/components/Date-Picker";
import ChangePasswordDialog from "../Change-Password";
import {
  Edit2,
  Save,
  X,
  UserCircle,
  Mail,
  Phone,
  Heart,
  Briefcase,
  Shield,
  Stethoscope,
  MapPin,
  FileText,
  User,
} from "lucide-react";
import { ImageUploadBox } from "@/components/Doctors/Signature-Boxs";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
type FormValues = z.infer<typeof DoctorSchema>;
export default function ProfileDoctorCardComponent({
  data,
}: {
  data: Doctor | undefined;
}) {
  const { updateDoctorMutation } = useDoctorMutations();
  const { promiseToast } = useToastContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(DoctorSchema),
  });
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    data?.address?.city?.state
  );
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    data?.address?.city
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    data?.birthDate ? new Date(data.birthDate.toString()) : undefined
  );

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
  };

  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  useEffect(() => {
    if (data) {
      setValue("firstName", data.firstName);
      setValue("lastName", data.lastName);
      setValue("email", data.email);
      setValue("userName", formatDni(String(data.dni)));
      if (data?.birthDate) {
        setStartDate(new Date(data.birthDate.toString()));
        setValue("birthDate", data.birthDate.toString());
      }
      setValue("phoneNumber", data.phoneNumber);
      setValue("phoneNumber2", data.phoneNumber2 || "");
      setValue("bloodType", String(data.bloodType) || "");
      setValue("matricula", data.matricula || "");
      setValue("rhFactor", String(data.rhFactor) || "");
      setValue("gender", String(data.gender) || "");
      setValue("maritalStatus", String(data.maritalStatus) || "");
      setValue("observations", data.observations || "");
      setValue("address.street", data?.address.street);
      setValue("address.number", data?.address.number);
      setValue("address.description", data?.address.description || "");
      setValue("address.phoneNumber", data?.address.phoneNumber || "");
      setSelectedState(data?.address?.city?.state);
      setSelectedCity(data?.address?.city);
      if (data?.address?.city?.state) {
        setValue("address.city.state", String(data.address.city.state.id));
      }
    }
  }, [data, setValue]);
  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    const formValues = form.getValues();

    // Especialidades y obras sociales del doctor (no editables en este form, se mantienen)
    const specialitiesToSend = data?.specialities
      .filter((s): s is { id: number; name: string } => s.id !== undefined)
      .map((s) => ({ id: s.id, name: s.name }));

    const healthInsurancesToSend = data?.healthInsurances
      .filter((h): h is { id: number; name: string } => h.id !== undefined)
      .map((h) => ({ id: h.id, name: h.name }));

    const dataToSend = {
      // Datos personales
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      userName: formValues.userName?.replace(/\./g, ""), // Remover puntos del DNI formateado
      birthDate: formValues.birthDate,
      gender: formValues.gender,
      maritalStatus: formValues.maritalStatus,

      // Datos de contacto
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      phoneNumber2: formValues.phoneNumber2 || "",

      // Datos médicos
      bloodType: formValues.bloodType,
      rhFactor: formValues.rhFactor,
      observations: formValues.observations || "",

      // Datos profesionales
      matricula: formValues.matricula,
      specialities: specialitiesToSend,
      healthInsurances: healthInsurancesToSend,

      // Dirección
      address: {
        id: data?.address?.id,
        street: formValues.address?.street || "",
        number: formValues.address?.number || "",
        description: formValues.address?.description || "",
        phoneNumber: formValues.address?.phoneNumber || "",
        city: selectedCity,
      },
    };

    try {
      const dataCreationPromise = updateDoctorMutation.mutateAsync({
        id: data?.id || "",
        doctor: dataToSend,
      });
      await promiseToast(dataCreationPromise, {
        loading: {
          title: "Actualizando datos del médico",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Médico actualizado",
          description: "Médico actualizado con éxito",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar médico",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar el Médico", error);
    }
  };

  const breadcrumbItems = [
    { label: "Inicio", href: "/inicio" },
    { label: "Mi Perfil" },
  ];
  return (
    <>
      {/* PageHeader */}
      <PageHeader
        breadcrumbItems={breadcrumbItems}
        title="Mi Perfil"
        description={`Información completa de ${data?.firstName} ${data?.lastName}`}
        icon={<UserCircle className="h-6 w-6" />}
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
              <ChangePasswordDialog idUser={data?.userId ?? 0} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                type="button"
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          )
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
        <form className="space-y-6">
          {/* Avatar Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-md border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-greenPrimary to-teal-600 h-32" />
              <CardContent className="relative pb-6">
                <div className="absolute -top-16 left-6">
                  <div
                    className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xl
       flex items-center justify-center"
                  >
                    {data?.photo ? (
                      <img
                        src={data.photo}
                        alt="Foto de perfil"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-full h-full rounded-full bg-gradient-to-br
       from-greenPrimary to-teal-600 flex items-center justify-center"
                      >
                        <UserCircle className="h-20 w-20 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-20 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {data?.firstName} {data?.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {data?.email}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {data?.bloodType && data?.rhFactor && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Sangre: {data.bloodType} {data.rhFactor}
                      </Badge>
                    )}
                    {data?.matricula && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700
       border-blue-200"
                      >
                        <Briefcase className="h-3 w-3 mr-1" />
                        Mat. {data.matricula}
                      </Badge>
                    )}
                    {data?.healthInsurances?.[0] && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700
       border-green-200"
                      >
                        <Shield className="h-3 w-3 mr-1" />
                        {data.healthInsurances[0].name}
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
            <Card className="shadow-md border-0">
              <CardHeader
                className="bg-gradient-to-r from-blue-50 to-blue-100 border-b
       border-blue-200"
              >
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
                            disabled
                            placeholder="Ingresar D.N.I..."
                            readOnly
                            className="cursor-not-allowed"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none
       peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Fecha de Nacimiento
                    </label>
                    <CustomDatePicker
                      setStartDate={setStartDate}
                      setValue={setValue}
                      fieldName="birthDate"
                      initialDate={startDate}
                      disabled={!isEditing}
                    />
                  </div>
                  <FormField
                    control={control}
                    name="gender"
                    render={() => (
                      <FormItem>
                        <FormLabel>Género</FormLabel>
                        <FormControl>
                          <GenderSelect
                            control={control}
                            defaultValue={String(data?.gender) || ""}
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
                            defaultValue={String(data?.maritalStatus) || ""}
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
            <Card className="shadow-md border-0">
              <CardHeader
                className="bg-gradient-to-r from-teal-50 to-teal-100 border-b
       border-teal-200"
              >
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
                            disabled={!isEditing}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none
       peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Especialidades
                    </label>
                    <Input
                      disabled
                      value={
                        data?.specialities
                          .map((speciality) => speciality.name)
                          .join(", ") || ""
                      }
                      className="cursor-not-allowed"
                      readOnly
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label
                      className="text-sm font-medium leading-none
       peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Obras Sociales
                    </label>
                    <Input
                      disabled
                      className="cursor-not-allowed"
                      value={data?.healthInsurances
                        .map(
                          (item) =>
                            item.name.charAt(0).toUpperCase() +
                            item.name.slice(1).toLowerCase()
                        )
                        .join(", ")}
                      readOnly
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
              <CardHeader
                className="bg-gradient-to-r from-purple-50 to-purple-100 border-b
       border-purple-200"
              >
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
                            disabled={!isEditing}
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
                        <FormLabel>Teléfono 2</FormLabel>
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
          {/* Card 4: Información Médica (Red) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader
                className="bg-gradient-to-r from-red-50 to-red-100 border-b
       border-red-200"
              >
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
                          <BloodSelect
                            control={control}
                            defaultValue={String(data?.bloodType) || ""}
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
                        <FormLabel>Factor R.H.</FormLabel>
                        <FormControl>
                          <RHFactorSelect
                            control={control}
                            defaultValue={String(data?.rhFactor) || ""}
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
            <Card className="shadow-md border-0">
              <CardHeader
                className="bg-gradient-to-r from-orange-50 to-orange-100 border-b
       border-orange-200"
              >
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
                    <label
                      className="text-sm font-medium leading-none
       peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Provincia
                    </label>
                    <StateSelect
                      control={control}
                      disabled={!isEditing}
                      name="address.city.state"
                      defaultValue={data?.address?.city?.state}
                      onStateChange={handleStateChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label
                      className="text-sm font-medium leading-none
       peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Ciudad
                    </label>
                    {selectedState && (
                      <CitySelect
                        control={control}
                        disabled={!isEditing}
                        defaultValue={selectedCity}
                        idState={selectedState.id}
                        onCityChange={handleCityChange}
                      />
                    )}
                  </div>
                  <FormField
                    control={control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle</FormLabel>
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
                    control={control}
                    name="address.number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
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
                    control={control}
                    name="address.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Piso</FormLabel>
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
                    control={control}
                    name="address.phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Departamento</FormLabel>
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
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card className="shadow-md border-0">
              <CardHeader
                className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-b
       border-indigo-200"
              >
                <CardTitle className="flex items-center gap-3 text-indigo-900">
                  <div className="p-2 bg-indigo-600 rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  Firma y Sello
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploadBox
                    id="firma"
                    label="Firma"
                    image={data?.firma || null}
                    doctorId={data?.userId ?? 0}
                    isEditing={isEditing}
                  />
                  <ImageUploadBox
                    id="sello"
                    label="Sello"
                    doctorId={data?.userId ?? 0}
                    isEditing={isEditing}
                    image={data?.sello || null}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </form>
      </Form>
    </>
  );
}
