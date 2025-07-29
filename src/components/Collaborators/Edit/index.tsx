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
import { useForm, useWatch } from "react-hook-form";
import { IoMdArrowRoundBack } from "react-icons/io";
import { goBack } from "@/common/helpers/helpers";
import { GenderSelect } from "@/components/Select/Gender/select";
import { z } from "zod";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { collaboratorSchema } from "@/validators/Colaborator/collaborator.schema";
import { useCollaboratorMutations } from "@/hooks/Collaborator/useCollaboratorMutation";
import { CompanySelect } from "@/components/Select/Company/select";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import { useEffect, useState } from "react";
import { StateSelect } from "@/components/Select/State/select";
import { CitySelect } from "@/components/Select/City/select";
// import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import { State } from "@/types/State/State";
import { City } from "@/types/City/City";
// import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { useState as useStatesHook } from "@/hooks/State/useState";

const getValidDateString = (date: string | undefined | null): string => {
  if (!date) return "";
  const ddmmyyyyMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [_, day, month, year] = ddmmyyyyMatch;
    const formattedDate = `${year}-${month}-${day}`;
    const parsedDate = new Date(formattedDate);
    return !isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().split("T")[0]
      : "";
  }
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime())
    ? parsedDate.toISOString().split("T")[0]
    : "";
};

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

interface Props {
  collaborator: Collaborator;
}

type FormValues = z.infer<typeof collaboratorSchema>;

export function EditCollaboratorComponent({ collaborator }: Props) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<State | undefined>(
    collaborator.addressData?.city?.state
  );
  const { updateCollaboratorMutation } = useCollaboratorMutations();
  const { promiseToast } = useToastContext();
  const { states } = useStatesHook();
  const safeEmail =
    collaborator.email && collaborator.email !== "undefined"
      ? collaborator.email
      : "";
  const form = useForm<any>({
    defaultValues: {
      firstName: collaborator.firstName || "",
      lastName: collaborator.lastName || "",
      userName: collaborator.userName || "",
      birthDate: getValidDateString(String(collaborator.birthDate)) || "",
      phone: collaborator.phone || "",
      positionJob: collaborator.positionJob || "",
      gender: collaborator.gender || "",
      email: safeEmail,
      idCompany: collaborator.company?.id || 0,
      // healthInsuranceId: collaborator.healthInsuranceId || 0,
      // affiliationNumber: collaborator.affiliationNumber || "",
      address: {
        id: collaborator.addressData?.id,
        street: collaborator.addressData?.street || "",
        number: collaborator.addressData?.number || "",
        description: collaborator.addressData?.description || "",
        phoneNumber: collaborator.addressData?.phoneNumber || "",
        city: {
          id: collaborator.addressData?.city?.id || 0,
          name: collaborator.addressData?.city?.name || "",
          state: collaborator.addressData?.city?.state?.id
            ? String(collaborator.addressData.city.state.id)
            : "",
        },
      },
      file: collaborator.photoUrl || undefined,
    },
  });

  const { control, setValue } = form;

  const fileField = useWatch({ control, name: "file" });
  useEffect(() => {
    if (fileField) {
      if (typeof fileField === "string") {
        setPreview(fileField);
      } else if (fileField instanceof File) {
        const objectUrl = URL.createObjectURL(fileField);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setPreview(null);
    }
  }, [fileField]);

  const imageSrc = preview || collaborator.photoUrl || "";
  const hasImageToShow = !!imageSrc && imageSrc.trim() !== "";

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setValue("address.city.state", String(state.id));
    setValue("address.city.id", 0);
    setValue("address.city.name", "");
  };

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setValue("address.city", cityWithState);
    }
  };

  // const handleHealthInsuranceChange = (healthInsurance: HealthInsurance) => {
  //   if (healthInsurance.id !== undefined) {
  //     setValue("healthInsuranceId", healthInsurance.id);
  //   }
  // };

  async function onSubmit(data: FormValues) {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("userName", data.userName);
      formData.append("birthDate", data.birthDate);
      formData.append("phone", data.phone);
      formData.append("positionJob", data.positionJob);
      formData.append("gender", data.gender);
      formData.append("email", data.email);
      formData.append("idCompany", String(data.idCompany));
      // formData.append("healthInsuranceId", String(data.healthInsuranceId));
      // if (data.affiliationNumber) {
      //   formData.append("affiliationNumber", data.affiliationNumber);
      // }

      const selectedStateData = states.find(
        (state) => state.id === data.address.city.state.id
      );

      const addressData = {
        id: data.address.id,
        street: data.address.street || "",
        number: data.address.number || "",
        description: data.address.description || "",
        phoneNumber: data.address.phoneNumber || "",
        city: {
          id: data.address.city.id,
          name: data.address.city.name,
          state: selectedStateData || {
            id: Number(data.address.city.state),
            name:
              states.find((s) => s.id === data.address.city.state.id)?.name ||
              "",
            country: { id: 1, name: "Argentina" },
          },
        },
      };
      formData.append("addressData", JSON.stringify(addressData));

      if (data.file) {
        let fileToSend: File;
        if (typeof data.file === "string") {
          fileToSend = dataURLtoFile(data.file, "profile.jpg");
        } else {
          fileToSend = data.file;
        }
        formData.append("file", fileToSend);
      }

      const promise = updateCollaboratorMutation.mutateAsync({
        id: collaborator.id,
        collaborator: formData,
      });

      await promiseToast(promise, {
        loading: {
          title: "Actualizando colaborador...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Colaborador actualizado!",
          description: "El colaborador se ha actualizado exitosamente",
        },
        error: (error: any) => ({
          title: "Error al actualizar colaborador",
          description:
            error.response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });

      goBack();
    } catch (error) {
      console.error("Error al actualizar el Colaborador", error);
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
                  Editar Colaborador
                </button>
              </CardTitle>
              <CardDescription>
                Completa los campos para actualizar el colaborador.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6">
              {/* Imagen */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative flex flex-col items-center mb-2">
                  {hasImageToShow && !imageLoaded && (
                    <Skeleton className="w-[100px] h-[20px] rounded-full" />
                  )}
                  {hasImageToShow ? (
                    <img
                      src={imageSrc}
                      alt={`${collaborator.firstName} ${collaborator.lastName}`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => setImageLoaded(false)}
                      className={`h-32 w-32 object-cover border-2 border-greenPrimary shadow-md ${
                        imageLoaded ? "block" : "hidden"
                      }`}
                    />
                  ) : (
                    <div className="h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 shadow-md">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        <ImagePickerDialog onImageSelect={field.onChange} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Datos Personales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar nombre..." />
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
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar correo..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                            {...field}
                            value={field.value || ""}
                            onChange={(e) => field.onChange(e.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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

              {/* Datos Empresariales y Obra Social */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="idCompany"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-black">Empresa</FormLabel>
                        <FormControl>
                          <CompanySelect
                            control={control}
                            defaultValue={collaborator.company}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                            placeholder="Ingresar puesto de trabajo..."
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {/* <FormField
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
                          placeholder="Ingresar número de afiliado..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>

              {/* Datos de Dirección */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="address.city.state" // Contiene solo el ID como string
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-black">Provincia</FormLabel>
                      <FormControl>
                        <StateSelect
                          control={control}
                          name="address.city.state"
                          defaultValue={collaborator.addressData?.city?.state}
                          onStateChange={handleStateChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address.city.id"
                  render={() => (
                    <FormItem>
                      <FormLabel className="text-black">Ciudad</FormLabel>
                      <FormControl>
                        <CitySelect
                          control={control}
                          idState={
                            selectedState?.id ??
                            collaborator.addressData?.city?.state?.id ??
                            0
                          }
                          defaultValue={collaborator.addressData?.city}
                          onCityChange={handleCityChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-4 gap-6">
                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">Calle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar calle..." />
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
                      <FormLabel className="text-black">N°</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar número..." />
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
                        <Input {...field} placeholder="Ingresar piso..." />
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
                      <FormLabel className="text-black">Departamento</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ingresar departamento..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" type="button" onClick={goBack}>
                Cancelar
              </Button>
              <Button
                className="bg-greenPrimary hover:bg-greenSecondary text-white px-4 py-2 rounded-lg"
                type="submit"
                disabled={updateCollaboratorMutation.isPending}
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
