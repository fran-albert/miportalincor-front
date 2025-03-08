import { useEffect, useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { User } from "@/types/User/User";
import { formatDni } from "@/common/helpers/helpers";
import { State } from "@/types/State/State";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { Edit2, Save, X } from "lucide-react";
import ChangePasswordDialog from "../Change-Password";
type FormValues = z.infer<typeof UserSchema>;
export default function SecretaryProfileComponent({ user }: { user: User }) {
  const { updateUserMutation } = useUserMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(UserSchema),
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
      setValue("address.city.state", user?.address?.city?.state);
      setValue("address.city", user?.address?.city);
      setValue("address.street", user?.address?.street);
      setValue("address.number", user?.address?.number);
      setValue("address.description", user?.address?.description);
      setValue("address.phoneNumber", user?.address?.phoneNumber);
      // setValue("affiliationNumber", user?.affiliationNumber);
      setSelectedState(user?.address?.city?.state);
      setSelectedCity(user?.address?.city);
    }
  }, [user, setValue]);
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

  const handleSave = async () => {
    try {
      const isValid = await form.trigger(); // Valida el formulario antes de enviar
      if (!isValid) return;

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

      const dataToSend: any = {
        ...rest,
        userName: formattedUserName,
        address: addressToSend,
        photo: user?.photo, // Mantén la foto actual si no se ha cambiado
      };

      const patientUpdatePromise = updateUserMutation.mutateAsync({
        id: Number(user?.id),
        user: dataToSend,
      });

      toast.promise(patientUpdatePromise, {
        loading: "Actualizando datos...",
        success: "Datos actualizados con éxito!",
        error: "Error al actualizar los datos",
      });

      await patientUpdatePromise;

      setIsEditing(false);
    } catch (error) {
      console.error("Error al actualizar los datos", error);
    }
  };

  return (
    <div key="1" className="w-full container px-4 sm:px-6 lg:px-8 mt-2">
      <Card>
        <Form {...form}>
          <form>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <p className="flex items-center justify-start w-full text-greenPrimary font-bold">
                  Mi Perfil
                </p>
              </CardTitle>
              {!isEditing ? (
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
                    type="button"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                  </Button>
                  <ChangePasswordDialog idUser={user.userId} />
                </div>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
                    type="button"
                    className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
                  >
                    <Save className="mr-2 h-4 w-4" /> Guardar
                  </Button>
                  <Button onClick={() => setIsEditing(false)} variant="outline">
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </div>
              )}
            </CardHeader>

            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
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
                  </div>
                  <div className="space-y-2">
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
                              defaultValue={user?.lastName}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
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
                              defaultValue={user?.email}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center justify-between text-black">
                            D.N.I.
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar D.N.I..."
                              disabled={true}
                              defaultValue={formatDni(String(user?.dni))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
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
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Teléfono
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar teléfono..."
                              defaultValue={user?.phoneNumber}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="phoneNumber2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Teléfono 2
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              defaultValue={user?.phoneNumber2}
                              disabled={!isEditing}
                              placeholder="Ingresar teléfono..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="bloodType"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Sangre
                          </FormLabel>
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
                  </div>
                  <div className="space-y-2">
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
                              defaultValue={String(user?.rhFactor) || ""}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
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
                              defaultValue={String(user?.gender) || ""}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
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
                              defaultValue={String(user?.maritalStatus) || ""}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="address.city.state"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Provincia
                          </FormLabel>
                          <FormControl>
                            <StateSelect
                              control={control}
                              name="address.city.state"
                              disabled={!isEditing}
                              defaultValue={user?.address?.city?.state}
                              onStateChange={handleStateChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="address.city"
                      render={({}) => (
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
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
                              defaultValue={user?.address?.street}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            N°
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar número"
                              defaultValue={user?.address?.number}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
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
                              placeholder="Ingresar número"
                              defaultValue={user?.address?.description}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="address.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black flex items-center justify-between">
                            Departamento
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar departamento"
                              defaultValue={user?.address?.phoneNumber}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
