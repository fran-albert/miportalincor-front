import { formatDni, goBack } from "@/common/helpers/helpers";
import { BloodSelect } from "@/components/Select/Blood/select";
import { RHFactorSelect } from "@/components/Select/RHFactor/select";
import { GenderSelect } from "@/components/Select/Gender/select";
import { MaritalStatusSelect } from "@/components/Select/MaritalStatus/select";
import { CardTitle, CardHeader, CardContent, Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CitySelect } from "@/components/Select/City/select";
import { StateSelect } from "@/components/Select/State/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm, SubmitHandler } from "react-hook-form";
import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { State } from "@/types/State/State";

import { useEffect, useState } from "react";

import { toast } from "sonner";
import { Doctor } from "@/types/Doctor/Doctor";
import { Speciality } from "@/types/Speciality/Speciality";
import { SpecialitySelect } from "@/components/Select/Speciality/select";
import { City } from "@/types/City/City";
import { DoctorSchema } from "@/validators/doctor.schema";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDoctorMutations } from "@/hooks/Doctor/useDoctorMutation";
import { HealthInsuranceDoctorSelect } from "@/components/Select/HealthInsurace/Doctor/select";
import { Edit2, Save, X } from "lucide-react";
import CustomDatePicker from "@/components/Date-Picker";

type FormValues = z.infer<typeof DoctorSchema>;
function DoctorProfileComponent({ doctor }: { doctor: Doctor }) {
  const { updateDoctorMutation } = useDoctorMutations();
  const [selectedState, setSelectedState] = useState<State | undefined>(
    doctor?.address?.city?.state
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(
    doctor?.address?.city
  );
  const [selectedHealthInsurances, setSelectedHealthInsurances] = useState<
    HealthInsurance[]
  >(doctor?.healthInsurances || []);
  const [selectedSpecialities, setSelectedSpecialities] = useState<
    Speciality[]
  >(doctor?.specialities || []);

  const form = useForm<FormValues>({
    resolver: zodResolver(DoctorSchema),
  });
  const { setValue, control } = form;
  const removeDotsFromDni = (dni: any) => dni.replace(/\./g, "");
  const [startDate, setStartDate] = useState<Date | undefined>(() =>
    doctor?.birthDate ? new Date(doctor.birthDate.toString()) : undefined
  );
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    if (doctor) {
      setValue("firstName", doctor.firstName);
      setValue("lastName", doctor.lastName);
      setValue("email", doctor.email);
      setValue("userName", formatDni(String(doctor.dni)));
      if (doctor?.birthDate) {
        setStartDate(new Date(doctor.birthDate.toString()));
        setValue("birthDate", doctor.birthDate.toString());
      }
      setValue("phoneNumber", doctor.phoneNumber);
      setValue("phoneNumber2", doctor.phoneNumber2 || "");
      setValue("bloodType", String(doctor.bloodType) || "");
      setValue("matricula", doctor.matricula || "");
      setValue("rhFactor", String(doctor.rhFactor) || "");
      setValue("gender", String(doctor.gender) || "");
      setValue("maritalStatus", String(doctor.maritalStatus) || "");
      setValue("observations", doctor.observations || "");
      setValue("address.city.state", doctor?.address?.city?.state);
      setValue("address.city", doctor?.address?.city);
      setValue("address.street", doctor?.address.street);
      setValue("address.number", doctor?.address.number);
      setValue("address.description", doctor?.address.description || "");
      setValue("address.phoneNumber", doctor?.address.phoneNumber || "");
      setSelectedHealthInsurances(doctor.healthInsurances || []);
      setSelectedSpecialities(doctor.specialities || []);
      setSelectedCity(doctor?.address?.city);
      setSelectedState(doctor?.address?.city?.state);
    }
  }, [doctor, setValue]);

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
  };
  const handleCityChange = (city: City) => {
    setSelectedCity(city);
  };

  const onSubmit: SubmitHandler<any> = async (formData) => {
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

    const dataToSend: any = {
      ...rest,
      userName: formattedUserName,
      address: addressToSend,
      specialities: specialitiesToSend,
      healthInsurances: healthInsuranceToSend,
      photo: doctor?.photo,
      registeredById: doctor?.registeredById,
    };

    try {
      const doctorCreationPromise = updateDoctorMutation.mutateAsync({
        id: Number(doctor?.userId),
        doctor: dataToSend,
      });

      toast.promise(doctorCreationPromise, {
        loading: "Actualizando médico...",
        success: "Médico actualizado con éxito!",
        error: "Error al actualizar el médico",
      });

      doctorCreationPromise
        .then(() => {
          goBack();
        })
        .catch((error) => {
          console.error("Error al actualizar el médico", error);
        });
    } catch (error) {
      console.error("Error al actualizar el médico", error);
    }
  };
  const handleSave = () => {
    // Aquí iría la lógica para guardar los cambios en el backend
    setIsEditing(false);
  };
  return (
    <div key="1" className="">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="profileForm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <p className="flex items-center justify-start w-full text-greenPrimary font-bold">
                  Perfil Completo
                </p>
              </CardTitle>
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Editar
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button
                    onClick={handleSave}
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
              <div className="grid grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-6">
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
                              defaultValue={doctor?.firstName}
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
                              defaultValue={doctor?.lastName}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
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
                              defaultValue={doctor?.email}
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
                      name="matricula"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Matrícula
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresarmatrícula..."
                              defaultValue={doctor?.matricula}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
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
                              placeholder="Ingresar D.N.I..."
                              defaultValue={formatDni(String(doctor?.dni))}
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
                <div className="grid grid-cols-2 gap-6">
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
                              disabled={!isEditing}
                              placeholder="Ingresar teléfono..."
                              defaultValue={doctor?.phoneNumber}
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
                              defaultValue={doctor?.phoneNumber2}
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
                <div className="grid grid-cols-2 gap-6">
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
                              defaultValue={String(doctor?.bloodType) || ""}
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
                              defaultValue={String(doctor?.rhFactor) || ""}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
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
                              disabled={!isEditing}
                              defaultValue={String(doctor?.gender) || ""}
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
                              defaultValue={String(doctor?.maritalStatus) || ""}
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

              <div className="grid grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="healthInsurances"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Obra Social
                          </FormLabel>
                          <FormControl>
                            <HealthInsuranceDoctorSelect
                              selected={selectedHealthInsurances}
                              onHIChange={(newSelection) =>
                                setSelectedHealthInsurances(newSelection)
                              }
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
                      name="specialities"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Especialidades
                          </FormLabel>
                          <FormControl>
                            <SpecialitySelect
                              selected={selectedSpecialities}
                              onSpecialityChange={(newSelection) =>
                                setSelectedSpecialities(newSelection)
                              }
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="">
                  {/* <div className="space-y-2">
                  <Label htmlFor="affiliationNumber">Número de Obra Social</Label>
                  <Input
                    id="affiliationNumber"
                    placeholder="Ingresar Número de Afiliado"
                    {...register("affiliationNumber", {
                      required: "Este campo es obligatorio",
                      pattern: {
                        value: /^[0-9]+$/,
                        message: "El número de afiliado debe contener solo números",
                      },
                    })}
                  />
                </div> */}
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
                              placeholder="Ingresar observaciones..."
                              defaultValue={doctor?.observations || undefined}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6">
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
                              defaultValue={doctor?.address?.city?.state}
                              onStateChange={handleStateChange}
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
                      name="address.city"
                      render={({}) => (
                        <FormItem>
                          <FormLabel className="text-black">Ciudad</FormLabel>
                          <FormControl>
                            <CitySelect
                              control={control}
                              defaultValue={selectedCity}
                              idState={selectedState ? selectedState.id : 0}
                              onCityChange={handleCityChange}
                              disabled={!isEditing}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-6">
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
                              placeholder="Ingresar calle"
                              defaultValue={doctor?.address?.street}
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
                      name="address.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">N°</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar número"
                              defaultValue={doctor?.address?.number}
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
                      name="address.description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">Piso</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar número"
                              defaultValue={doctor?.address?.description}
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
                      name="address.phoneNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Departamento
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar departamento"
                              defaultValue={doctor?.address?.phoneNumber}
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
            </CardContent>
            {/* <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={goBack}>
                Cancelar
              </Button>
              <Button
                variant="incor"
                type="submit"
                disabled={updateDoctorMutation.isPending}
              >
                Confirmar
              </Button>
            </CardFooter> */}
          </form>
        </Form>
      </Card>
    </div>
  );
}

export default DoctorProfileComponent;
