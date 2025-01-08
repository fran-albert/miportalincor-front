import { formatDni, goBack } from "@/common/helpers/helpers";
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
import { toast } from "sonner";
import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import { z } from "zod";
import { PatientSchema } from "@/validators/patient.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Patient } from "@/types/Patient/Patient";
import { usePatientMutations } from "@/hooks/Patient/usePatientMutation";
import CustomDatePicker from "@/components/Date-Picker";
import { Edit2, Save, X } from "lucide-react";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";
import LoadingToast from "@/components/Toast/Loading";
import useUserRole from "@/hooks/useRoles";
type FormValues = z.infer<typeof PatientSchema>;

function PatientProfileComponent({ patient }: { patient: Patient }) {
  const { updatePatientMutation } = usePatientMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(PatientSchema),
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
  const { isSecretary, isAdmin } = useUserRole();
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
      setValue(
        "healthPlans",
        selectedHealthInsurance
          ? [
              {
                id: selectedHealthInsurance.id!,
                name: selectedHealthInsurance.name,
              },
            ]
          : []
      );
    }
  }, [patient, selectedCity, selectedHealthInsurance, setValue]);

  const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
    if (healthInsurance.id !== undefined) {
      const healthPlanToSend = {
        id: healthInsurance.id,
        name: healthInsurance.name,
        // Add any other necessary fields here
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
    if (patient) {
      setValue("firstName", patient.firstName);
      setValue("lastName", patient.lastName);
      setValue("email", patient.email);
      setValue("userName", formatDni(String(patient.dni)));
      if (patient?.birthDate) {
        setStartDate(new Date(patient.birthDate.toString()));
        setValue("birthDate", patient.birthDate.toString());
      }
      setValue("phoneNumber", patient.phoneNumber);
      setValue("phoneNumber2", patient.phoneNumber2 || "");
      setValue("bloodType", String(patient.bloodType) || "");
      setValue("rhFactor", String(patient.rhFactor) || "");
      setValue("gender", String(patient.gender) || "");
      setValue("maritalStatus", String(patient.maritalStatus) || "");
      setValue("observations", patient.observations || "");
      setValue("address.street", patient.address.street || "");
      setValue("address.number", patient.address.number || "");
      setValue("address.description", patient.address.description || "");
      setValue("address.phoneNumber", patient.address.phoneNumber || "");
      setValue("address.city", patient.address.city);
      setValue("address.city.state", patient.address.city.state);
    }
  }, [patient, setValue]);

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

      toast.promise(patientCreationPromise, {
        loading: <LoadingToast message="Actualizando datos del paciente..." />,
        success: <SuccessToast message="Paciente actualizado con éxito!" />,
        error: <ErrorToast message="Error al actualizar el Paciente" />,
      });

      patientCreationPromise
        .then(() => {
          goBack();
        })
        .catch((error) => {
          console.error("Error al actualizar el paciente", error);
        });
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
    }
  };
  const handleSave = async () => {
    const isValid = await form.trigger(); // Valida el formulario antes de enviar
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

      toast.promise(patientCreationPromise, {
        loading: <LoadingToast message="Actualizando datos del paciente..." />,
        success: <SuccessToast message="Paciente actualizado con éxito!" />,
        error: <ErrorToast message="Error al actualizar el Paciente" />,
      });

      patientCreationPromise
        .then(() => {
          setIsEditing(false);
        })
        .catch((error) => {
          console.error("Error al actualizar el paciente", error);
        });
    } catch (error) {
      console.error("Error al actualizar el paciente", error);
    }
  };
  return (
    <div key="1" className="w-full">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} id="profileForm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>
                <p className="flex items-center justify-start w-full text-greenPrimary font-bold">
                  Perfil Completo
                </p>
              </CardTitle>
              {isSecretary || isAdmin &&
                (!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    type="button"
                    className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
                  >
                    <Edit2 className="mr-2 h-4 w-4" /> Editar
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={handleSave}
                      className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
                    >
                      <Save className="mr-2 h-4 w-4" /> Guardar
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="outline"
                    >
                      <X className="mr-2 h-4 w-4" /> Cancelar
                    </Button>
                  </div>
                ))}
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
                              disabled={!isEditing}
                              defaultValue={patient?.lastName}
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
                              defaultValue={patient?.email}
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
                              placeholder="Ingresar D.N.I..."
                              disabled={!isEditing}
                              defaultValue={formatDni(String(patient?.dni))}
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
                              defaultValue={patient?.phoneNumber}
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
                              defaultValue={patient?.phoneNumber2}
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
                          <FormLabel className="text-black">Sangre</FormLabel>
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
                  </div>
                  <div className="space-y-2">
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
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
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
                  </div>
                  <div className="space-y-2">
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
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
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
                  </div>
                  <div className="space-y-2">
                    {/* <Label htmlFor="healthInsurancePlan">Plan</Label>
                    <HealthPlanSelect
                      idHealthInsurance={Number(selectedHealthInsurance?.id)}
                      selected={selectedHealthInsurance}
                      onPlanChange={handlePlanChange}
                    /> */}
                    <FormField
                      control={form.control}
                      name="affiliationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Número de Obra Social
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              defaultValue={patient?.affiliationNumber}
                              disabled={!isEditing}
                              placeholder="Ingresar número de obra social..."
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
                              placeholder="Ingresar observaciones..."
                              defaultValue={patient?.observations || undefined}
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
                              defaultValue={patient?.address?.city?.state}
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
                          <FormLabel className="text-black">Calle</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={!isEditing}
                              placeholder="Ingresar calle"
                              defaultValue={patient?.address?.street}
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
                              defaultValue={patient?.address?.number}
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
                              defaultValue={patient?.address?.description}
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
                              defaultValue={patient?.address?.phoneNumber}
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
                disabled={updatePatientMutation.isPending}
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

export default PatientProfileComponent;
