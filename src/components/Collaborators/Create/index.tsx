import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { IoMdArrowRoundBack } from "react-icons/io";
import { goBack } from "@/common/helpers/helpers";
import { GenderSelect } from "@/components/Select/Gender/select";
import { z } from "zod";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { collaboratorSchema } from "@/validators/Colaborator/collaborator.schema";
import { useCollaboratorMutations } from "@/hooks/Collaborator/useCollaboratorMutation";
import { ApiError } from "@/types/Error/ApiError";
import { CompanySelect } from "@/components/Select/Company/select";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import { StateSelect } from "@/components/Select/State/select";
import { City } from "@/types/City/City";
import { useState } from "react";
import { State } from "@/types/State/State";
// import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { CitySelect } from "@/components/Select/City/select";
import CollaboratorAvatar from "../Avatar";

function dataURLtoFile(dataurl: string, filename: string): File {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export function CreateCollaboratorComponent() {
  const { addCollaboratorMutation } = useCollaboratorMutations();
  const { promiseToast } = useToastContext();
  const form = useForm<z.infer<typeof collaboratorSchema>>({});
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState);
    }
  };

  // const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
  //   if (healthInsurance.id !== undefined) {
  //     setValue("healthInsuranceId", String(healthInsurance.id));
  //   } else {
  //     console.error("El seguro de salud no tiene un ID válido");
  //   }
  // };

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
    setValue("address.city.state", {
      id: state.id,
      name: state.name,
      country: state.country,
    });
  };
  async function onSubmit(data: z.infer<typeof collaboratorSchema>) {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("userName", data.userName);
      formData.append("birthDate", data.birthDate);
      formData.append("phone", data.phone);
      formData.append("gender", data.gender);
      const addressData = {
        street: data.address.street,
        number: data.address.number,
        description: data.address.description,
        phoneNumber: data.address.phoneNumber,
        city: {
          id: selectedCity?.id,
          name: selectedCity?.name,
          state: {
            id: selectedState?.id,
            name: selectedState?.name,
            country: {
              id: 1,
              name: "Argentina",
            },
          },
        },
      };
      formData.append("addressData", JSON.stringify(addressData));
      formData.append("email", data.email);
      formData.append("idCompany", data.idCompany.toString());
      formData.append("positionJob", data.positionJob);
      if (data.file) {
        let fileToSend: File;
        if (typeof data.file === "string") {
          fileToSend = dataURLtoFile(data.file, "profile.jpg");
        } else if (data.file instanceof File) {
          fileToSend = data.file;
        } else {
          throw new Error("Formato de imagen no reconocido");
        }
        formData.append("file", fileToSend);
      }

      const promise = addCollaboratorMutation.mutateAsync(formData);

      await promiseToast(promise, {
        loading: {
          title: "Creando colaborador...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Colaborador creado!",
          description: "El colaborador se ha creado exitosamente",
        },
        error: (error: ApiError) => ({
          title: "Error al crear colaborador",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      goBack();
    } catch (error) {
      console.error("Error al crear el Colaborador", error);
    }
  }

  return (
    <div key="1">
      <Card>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardHeader>
              <CardTitle>
                <button
                  className="flex items-center justify-start w-full text-greenPrimary"
                  onClick={goBack}
                  type="button"
                >
                  <IoMdArrowRoundBack
                    className="text-greenPrimary mr-2"
                    size={25}
                  />
                  Agregar Colaborador
                </button>
              </CardTitle>
              <CardDescription>
                Completa los campos para agregar un nuevo colaborador.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="flex flex-col items-center justify-center">
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="flex items-center justify-center">
                            <CollaboratorAvatar
                              src={
                                typeof field.value === "string"
                                  ? field.value
                                  : null
                              }
                              alt="Avatar"
                            />
                          </div>

                          <ImagePickerDialog onImageSelect={field.onChange} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                            <Input {...field} placeholder="Ingresar D.N.I..." />
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
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Fecha de Nacimiento
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              lang="es"
                              {...field}
                              onChange={(e) => {
                                const selectedDate = e.target.value;
                                field.onChange(selectedDate);
                              }}
                              value={
                                field.value
                                  ? new Date(field.value)
                                      .toISOString()
                                      .split("T")[0]
                                  : ""
                              }
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
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">Teléfono</FormLabel>
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
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black">Sexo</FormLabel>
                          <FormControl>
                            <GenderSelect control={control} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="idCompany"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-black">Empresa</FormLabel>
                          <FormControl>
                            <CompanySelect control={control} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <FormField
                      control={form.control}
                      name="positionJob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-black">
                            Puesto de Trabajo
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Ingresar puesto..."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
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
                    name="address.city.name"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">Ciudad</FormLabel>
                        <FormControl>
                          <CitySelect
                            control={control}
                            idState={
                              selectedState ? Number(selectedState.id) : 0
                            }
                            onCityChange={handleCityChange}
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
                          <Input {...field} placeholder="Ingresar calle" />
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
                          <Input {...field} placeholder="Ingresar número" />
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
                          <Input {...field} placeholder="Ingresar número" />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={goBack}>
                Cancelar
              </Button>
              <Button
                className="bg-greenPrimary hover:bg-greenSecondary text-white px-4 py-2 rounded-lg"
                type="submit"
                disabled={addCollaboratorMutation.isPending}
              >
                Confirmar
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  );
}
