import { useEffect, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { formatDni } from "@/common/helpers/helpers";
import { State } from "@/types/State/State";
import { Doctor } from "@/types/Doctor/Doctor";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { DoctorSchema } from "@/validators/doctor.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { City } from "@/types/City/City";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import CustomDatePicker from "@/components/Date-Picker";
import ChangePasswordDialog from "../Change-Password";
import { Edit2, Save, X } from "lucide-react";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import { ImageUploadBox } from "@/components/Doctors/Signature-Boxs";

type FormValues = z.infer<typeof DoctorSchema>;
export default function ProfileDoctorCardComponent({
  data,
}: {
  data: Doctor | undefined;
}) {
  const { updateDoctorMutation } = useDoctorMutations();
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
  const removeDotsFromDni = (dni: any) => dni.replace(/\./g, "");
  const [selloImage, setSelloImage] = useState<string | null>(null);
  const [firmaImage, setFirmaImage] = useState<string | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "sello" | "firma"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (type === "sello") {
          setSelloImage(event.target?.result as string);
        } else {
          setFirmaImage(event.target?.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };
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
      setValue("address.city.state", data?.address?.city?.state.id.toString());
      setValue("address.city", data?.address?.city);
      setValue("address.street", data?.address.street);
      setValue("address.number", data?.address.number);
      setValue("address.description", data?.address.description || "");
      setValue("address.phoneNumber", data?.address.phoneNumber || "");
      setSelectedState(data?.address?.city?.state);
      setSelectedCity(data?.address?.city);
    }
  }, [data, setValue]);
  const onSubmit: SubmitHandler<any> = async (formData) => {
    const specialitiesToSend = data?.specialities.map((s) => ({
      id: s.id,
      name: s.name,
    }));
    const healthInsuranceToSend = data?.healthInsurances.map((h) => ({
      id: h.id,
      name: h.name,
    }));

    const { address, ...rest } = formData;
    const formattedUserName = removeDotsFromDni(formData.userName);
    const addressToSend = {
      ...address,
      id: data?.address?.id,
      city: {
        ...selectedCity,
        state: selectedState,
      },
    };

    const dataToSend: any = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      specialities: specialitiesToSend,
      healthInsurances: healthInsuranceToSend,
      photo: data?.photo,
      registeredById: data?.registeredById,
    };

    try {
      const doctorCreationPromise = updateDoctorMutation.mutateAsync({
        id: Number(data?.userId),
        doctor: dataToSend,
      });

      toast.promise(doctorCreationPromise, {
        loading: "Actualizando médico...",
        success: "Médico actualizado con éxito!",
        error: "Error al actualizar el médico",
      });

      doctorCreationPromise.catch((error) => {
        console.error("Error al actualizar el médico", error);
      });
    } catch (error) {
      console.error("Error al actualizar el médico", error);
    }
  };

  const handleSave = async () => {
    const isValid = await form.trigger();
    if (!isValid) return;
    const specialitiesToSend = data?.specialities.map((s) => ({
      id: s.id,
      name: s.name,
    }));
    const healthInsuranceToSend = data?.healthInsurances.map((h) => ({
      id: h.id,
      name: h.name,
    }));

    const { address, ...rest } = form.getValues();
    const formattedUserName = removeDotsFromDni(form.getValues("userName"));
    const addressToSend = {
      ...address,
      id: data?.address?.id,
      city: {
        ...selectedCity,
        state: selectedState,
      },
    };

    const dataToSend: any = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      specialities: specialitiesToSend,
      healthInsurances: healthInsuranceToSend,
      photo: data?.photo,
      registeredById: data?.registeredById,
    };
    try {
      console.log(dataToSend);
      const dataCreationPromise = updateDoctorMutation.mutateAsync({
        id: Number(data?.userId),
        doctor: dataToSend,
      });

      toast.promise(dataCreationPromise, {
        loading: <LoadingToast message="Actualizando datos del médico..." />,
        success: <SuccessToast message="Médico actualizado con éxito!" />,
        error: <ErrorToast message="Error al actualizar el Médico" />,
      });

      dataCreationPromise
        .then(() => {
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Error al actualizar el Médico", error);
        });
    } catch (error) {
      console.error("Error al actualizar el Médico", error);
    }
  };

  return (
    <div key="1" className="w-full container px-4 sm:px-6 lg:px-8 mt-2">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="profileForm">
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
                  <ChangePasswordDialog idUser={Number(data?.userId)} />
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
                          <FormLabel className="text-black">Nombre</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar nombre..."
                              defaultValue={data?.firstName}
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
                          <FormLabel className="text-black">Apellido</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar apellido..."
                              defaultValue={data?.lastName}
                              disabled={!isEditing}
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
                          <FormLabel className="text-black">
                            Correo Electrónico
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar correo electrónico..."
                              defaultValue={data?.email}
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
                          <FormLabel className="text-black">D.N.I.</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar D.N.I..."
                              defaultValue={formatDni(String(data?.dni))}
                              readOnly
                              className="w-full text-gray-800 cursor-not-allowed"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={control}
                      name="birthDate"
                      render={({}) => (
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
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
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
                              defaultValue={data?.phoneNumber}
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
                          <FormLabel className="text-black">
                            Teléfono 2
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              defaultValue={data?.phoneNumber2}
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
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">Sangre</FormLabel>
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
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="rhFactor"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Factor R.H.
                          </FormLabel>
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
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">Sexo</FormLabel>
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
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Estado Civil
                          </FormLabel>
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
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Obra Social
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="w-full text-gray-800 cursor-not-allowed"
                              value={data?.healthInsurances
                                .map(
                                  (item) =>
                                    item.name.charAt(0).toUpperCase() +
                                    item.name.slice(1).toLowerCase()
                                )
                                .join(", ")}
                              readOnly
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
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Especialidades
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              value={
                                data?.specialities
                                  .map((speciality) => speciality.name)
                                  .join(", ") || ""
                              }
                              className="w-full text-gray-800 cursor-not-allowed"
                              readOnly
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
                    <Label htmlFor="affiliationNumber">
                      Número de Obra Social
                    </Label>
                    <Input
                      id="affiliationNumber"
                      className="w-full text-gray-800 cursor-not-allowed"
                      // defaultValue={data?.affiliationNumber}
                      readOnly
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="observations"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Observaciones
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              className="w-full text-gray-800 cursor-not-allowed"
                              defaultValue={data?.observations}
                              readOnly
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="address.city.state"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Provincia
                          </FormLabel>
                          <FormControl>
                            <StateSelect
                              control={control}
                              disabled={!isEditing}
                              name="address.city.state"
                              defaultValue={data?.address?.city?.state}
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
                          <FormLabel className="text-black">Ciudad</FormLabel>
                          <FormControl>
                            {selectedState && (
                              <CitySelect
                                control={control}
                                disabled={!isEditing}
                                defaultValue={selectedCity}
                                idState={selectedState.id}
                                onCityChange={handleCityChange}
                              />
                            )}
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
                          <FormLabel className="text-black">Calle</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar calle"
                              defaultValue={data?.address.street}
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
                          <FormLabel className="text-black">N°</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar número"
                              defaultValue={data?.address.number}
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
                          <FormLabel className="text-black">Piso</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar número"
                              defaultValue={data?.address.description}
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
                          <FormLabel className="text-black">
                            Departamento
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar departamento"
                              defaultValue={data?.address.phoneNumber}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <ImageUploadBox
                  id="sello"
                  label="SELLO"
                  image={selloImage}
                  isEditing={isEditing}
                  onImageUpload={(e) => handleImageUpload(e, "sello")}
                />
                <ImageUploadBox
                  id="firma"
                  label="FIRMA"
                  image={firmaImage}
                  isEditing={isEditing}
                  onImageUpload={(e) => handleImageUpload(e, "firma")}
                />
              </div>
            </CardContent>
          </form>
        </Form>
      </Card>
    </div>
  );
}
