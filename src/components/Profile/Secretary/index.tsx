import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { User } from "@/types/User/User";
import { State } from "@/types/State/State";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MaritalStatusSelect } from "@/components/Select/MaritalStatus/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { RHFactorSelect } from "@/components/Select/RHFactor/select";
import { BloodSelect } from "@/components/Select/Blood/select";
import { z } from "zod";
import { City } from "@/types/City/City";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { UserSchema } from "@/validators/user.schema";
import CustomDatePicker from "@/components/Date-Picker";
import {
  Edit2,
  Save,
  X,
  UserCircle,
  Mail,
  Heart,
  User as UserIcon,
  Phone,
  MapPin,
} from "lucide-react";
import ChangePasswordDialog from "../Change-Password";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { PageHeader } from "@/components/PageHeader";
import { motion } from "framer-motion";
type FormValues = z.infer<typeof UserSchema>;
export default function SecretaryProfileComponent({ user }: { user: User }) {
  const { updateUserMutation } = useUserMutations();
  const { promiseToast } = useToastContext();
  const form = useForm<FormValues>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      userName: user?.dni || "",
      birthDate: user?.birthDate
        ? typeof user.birthDate === "string" || user.birthDate instanceof Date
          ? new Date(user.birthDate).toISOString()
          : ""
        : "",
      phoneNumber: user?.phoneNumber || "",
      phoneNumber2: user?.phoneNumber2 || "",
      bloodType: user?.bloodType || "",
      rhFactor: user?.rhFactor || "",
      gender: user?.gender || "",
      maritalStatus: user?.maritalStatus || "",
      observations: user?.observations || "",
      address: {
        street: user?.address?.street || "",
        number: user?.address?.number || "",
        description: user?.address?.description || "",
        phoneNumber: user?.address?.phoneNumber || "",
        city: user?.address?.city
          ? {
              id: user.address.city.id,
              name: user.address.city.name,
              state: user.address.city.state
                ? {
                    id: user.address.city.state.id,
                    name: user.address.city.state.name,
                    country: user.address.city.state.country || {
                      id: 1,
                      name: "Argentina"
                    }
                  }
                : String(user.address.city.state)
            }
          : {
              id: 0,
              name: "",
              state: {
                id: 0,
                name: "",
                country: {
                  id: 1,
                  name: "Argentina"
                }
              }
            },
      },
    },
  });
  const { setValue, control } = form;
  const [isEditing, setIsEditing] = useState(false);
  const [selectedState, setSelectedState] = useState<State | undefined>(
    user?.address?.city?.state
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    user?.address?.city
  );
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    user?.birthDate ? new Date(user.birthDate.toString()) : undefined
  );
  useEffect(() => {
    if (user) {
      setValue("firstName", user.firstName);
      setValue("lastName", user.lastName);
      setValue("email", user.email);
      setValue("userName", user.dni);
      if (user?.birthDate) {
        setStartDate(new Date(user.birthDate.toString()));
        setValue("birthDate", user.birthDate.toString());
      }
      setValue("phoneNumber", user.phoneNumber);
      setValue("phoneNumber2", user.phoneNumber2 || "");
      setValue("bloodType", String(user.bloodType));
      setValue("rhFactor", String(user.rhFactor));
      setValue("gender", String(user.gender));
      setValue("maritalStatus", String(user.maritalStatus));
      setValue("observations", user.observations || "");
      setValue("address.street", user?.address?.street);
      setValue("address.number", user?.address?.number);
      setValue("address.description", user?.address?.description);
      setValue("address.phoneNumber", user?.address?.phoneNumber);
      setSelectedState(user?.address?.city?.state);
      setSelectedCity(user?.address?.city);
    }
  }, [user, setValue]);
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
  const handleSave = async () => {
    try {
      console.log("🔵 handleSave called");
      console.log("🔵 Form values:", form.getValues());
      console.log("🔵 Form errors before trigger:", form.formState.errors);

      const isValid = await form.trigger();
      console.log("🔵 Form is valid:", isValid);
      console.log("🔵 Form errors after trigger:", form.formState.errors);

      if (!isValid) {
        console.log("❌ Validation failed, stopping");
        return;
      }

      console.log("✅ Validation passed, proceeding with save");
      const formattedUserName = removeDotsFromDni(form.getValues("userName"));
      const { address, ...rest } = form.getValues();
      const addressToSend = {
        ...address,
        id: user?.address?.id,
        street: address.street,
        number: address.number,
        description: address.description,
        phoneNumber: address.phoneNumber,
        city: {
          ...selectedCity,
          state: selectedState,
        },
      };
      const dataToSend: User = {
        ...rest,
        userName: formattedUserName,
        address: addressToSend,
        photo: user?.photo,
      } as User;
      const patientUpdatePromise = updateUserMutation.mutateAsync({
        id: Number(user?.id),
        user: dataToSend,
      });
      await promiseToast(patientUpdatePromise, {
        loading: {
          title: "Actualizando datos",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "Datos actualizados",
          description: "Datos actualizados con éxito",
        },
        error: (error: unknown) => ({
          title: "Error al actualizar datos",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar los datos", error);
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
        description={`Información completa de ${user?.firstName} ${user?.lastName}`}
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
              <ChangePasswordDialog idUser={user.userId} />
            </div>
          ) : (
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                type="button"
                className="bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar
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
                  <div className="w-32 h-32 rounded-full bg-white border-4 border-white shadow-xllex items-center justify-center">
                    {user?.photo ? (
                      <img
                        src={user.photo}
                        alt="Foto de perfil"
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-gradient-to-brrom-greenPrimary to-teal-600 flex items-center justify-center">
                        <UserCircle className="h-20 w-20 text-white" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="pt-20 pl-6">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                    <Mail className="h-4 w-4" />
                    {user?.email}
                  </div>
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {user?.bloodType && user?.rhFactor && (
                      <Badge
                        variant="outline"
                        className="bg-red-50 text-red-700 border-red-200"
                      >
                        <Heart className="h-3 w-3 mr-1" />
                        Sangre: {user.bloodType} {user.rhFactor}
                      </Badge>
                    )}
                    {user?.gender && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700order-blue-200"
                      >
                        <UserIcon className="h-3 w-3 mr-1" />
                        {user.gender}
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
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-border-blue-200">
                <CardTitle className="flex items-center gap-3 text-blue-900">
                  <div className="p-2 bg-blue-600 rounded-full">
                    <UserIcon className="h-6 w-6 text-white" />
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
                    <label className="text-sm font-medium leading-noneeer-disabled:cursor-not-allowed peer-disabled:opacity-70">
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
                            defaultValue={String(user?.gender) || ""}
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
                            defaultValue={String(user?.maritalStatus) || ""}
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
                          <BloodSelect
                            control={control}
                            disabled={!isEditing}
                            defaultValue={String(user?.bloodType) || ""}
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
                            defaultValue={String(user?.rhFactor) || ""}
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
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-noneeer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Provincia
                    </label>
                    <StateSelect
                      control={control}
                      name="address.city.state"
                      disabled={!isEditing}
                      defaultValue={user?.address?.city?.state}
                      onStateChange={handleStateChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium leading-noneeer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Ciudad
                    </label>
                    <CitySelect
                      control={control}
                      disabled={!isEditing}
                      defaultValue={selectedCity}
                      idState={selectedState ? selectedState.id : 0}
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
        </form>
      </Form>
    </div>
  );
}
