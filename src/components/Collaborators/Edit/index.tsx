import {
  CardTitle,
  CardHeader,
  CardContent,
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
import { goBack } from "@/common/helpers/helpers";
import { GenderSelect } from "@/components/Select/Gender/select";
import { z } from "zod";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { collaboratorSchema } from "@/validators/Colaborator/collaborator.schema";
import { useCollaboratorMutations } from "@/hooks/Collaborator/useCollaboratorMutation";
import { ApiError } from "@/types/Error/ApiError";
import { CompanySelect } from "@/components/Select/Company/select";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Phone, Briefcase, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import { StateSelect } from "@/components/Select/State/select";
import { CitySelect } from "@/components/Select/City/select";
// import { HealthInsuranceSelect } from "@/components/Select/HealthInsurace/select";
import { State } from "@/types/State/State";
import { City } from "@/types/City/City";
// import { HealthInsurance } from "@/types/Health-Insurance/Health-Insurance";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { useState as useStatesHook } from "@/hooks/State/useState";
import { motion } from "framer-motion";
import CustomDatePicker from "@/components/Date-Picker";
import moment from "moment-timezone";

const getValidDateString = (date: string | undefined | null): string => {
  if (!date) return "";
  const ddmmyyyyMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [, day, month, year] = ddmmyyyyMatch;
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
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const { updateCollaboratorMutation } = useCollaboratorMutations();
  const { promiseToast } = useToastContext();
  const { states } = useStatesHook();
  const safeEmail =
    collaborator.email && collaborator.email !== "undefined"
      ? collaborator.email
      : "";
  const form = useForm<FormValues>({
    defaultValues: {
      firstName: collaborator.firstName || "",
      lastName: collaborator.lastName || "",
      userName: collaborator.userName || "",
      birthDate: getValidDateString(String(collaborator.birthDate)) || "",
      phone: collaborator.phone || "",
      positionJob: collaborator.positionJob || "",
      gender: collaborator.gender || "",
      email: safeEmail,
      idCompany: collaborator.company?.id?.toString() || "",
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
          state: {
            id: collaborator.addressData?.city?.state?.id || 0,
            name: collaborator.addressData?.city?.state?.name || "",
            country: collaborator.addressData?.city?.state?.country,
          },
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
    setValue("address.city.state", {
      id: state.id,
      name: state.name,
      country: state.country,
    });
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
      const dateInArgentina = moment(data.birthDate).tz(
        "America/Argentina/Buenos_Aires"
      );

      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("userName", data.userName);
      formData.append("birthDate", dateInArgentina.format("YYYY-MM-DD"));
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
        id: Number(collaborator.id),
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
        error: (error: ApiError) => ({
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Card 1: Información Personal (AZUL) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="p-2 bg-blue-600 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Avatar */}
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
                        className={`h-32 w-32 object-cover border-4 border-blue-600 rounded-full shadow-md ${
                          imageLoaded ? "block" : "hidden"
                        }`}
                      />
                    ) : (
                      <div className="h-32 w-32 flex items-center justify-center bg-blue-100 rounded-full border-4 border-blue-600 shadow-md">
                        <User className="h-16 w-16 text-blue-600" />
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

                {/* Campos Personales */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
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
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ingresar apellido..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="userName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>D.N.I.</FormLabel>
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
                    render={() => (
                      <FormItem>
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <CustomDatePicker
                            setStartDate={setStartDate}
                            setValue={setValue}
                            fieldName="birthDate"
                            initialDate={startDate}
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
                        <FormLabel>Sexo</FormLabel>
                        <FormControl>
                          <GenderSelect control={control} />
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

        {/* Card 2: Información de Contacto (MORADO) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200 rounded-t-lg">
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
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar correo..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar teléfono..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Información Laboral (TEAL) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-b border-teal-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-teal-900">
                <div className="p-2 bg-teal-600 rounded-full">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                Información Laboral
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="idCompany"
                  render={() => (
                    <FormItem>
                      <FormLabel>Empresa</FormLabel>
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
                      <FormLabel>Puesto de Trabajo</FormLabel>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 4: Dirección (NARANJA) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200 rounded-t-lg">
              <CardTitle className="flex items-center gap-3 text-orange-900">
                <div className="p-2 bg-orange-600 rounded-full">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                Dirección
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address.city.state"
                    render={() => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
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
                        <FormLabel>Ciudad</FormLabel>
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
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <FormField
                    control={form.control}
                    name="address.street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Calle</FormLabel>
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
                        <FormLabel>N°</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Número..." />
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
                        <FormLabel>Piso</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Piso..." />
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
                        <FormLabel>Depto.</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Depto..." />
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

        {/* Botones */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          className="flex justify-end gap-3"
        >
          <Button variant="outline" type="button" onClick={goBack}>
            Cancelar
          </Button>
          <Button
            className="bg-greenPrimary hover:bg-teal-600 text-white px-6"
            type="submit"
            disabled={updateCollaboratorMutation.isPending}
          >
            {updateCollaboratorMutation.isPending ? "Actualizando..." : "Confirmar"}
          </Button>
        </motion.div>
      </form>
    </Form>
  );
}
