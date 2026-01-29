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
import { useForm } from "react-hook-form";
import { goBack } from "@/common/helpers/helpers";
import { useNavigate } from "react-router-dom";
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
import { CitySelect } from "@/components/Select/City/select";
import CollaboratorAvatar from "../Avatar";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Briefcase,
  MapPin,
} from "lucide-react";
import CustomDatePicker from "@/components/Date-Picker";
import { zodResolver } from "@hookform/resolvers/zod";
import moment from "moment-timezone";

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

interface CreateCollaboratorComponentProps {
  preselectedCompanyId?: string | null;
}

export function CreateCollaboratorComponent({
  preselectedCompanyId,
}: CreateCollaboratorComponentProps) {
  const { addCollaboratorMutation } = useCollaboratorMutations();
  const { promiseToast } = useToastContext();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof collaboratorSchema>>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: preselectedCompanyId
      ? {
          idCompany: preselectedCompanyId,
        }
      : undefined,
  });
  const { setValue, control } = form;
  const [selectedState, setSelectedState] = useState<State | undefined>(
    undefined
  );
  const [selectedCity, setSelectedCity] = useState<City | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);

  const handleCityChange = (city: City) => {
    if (selectedState) {
      const cityWithState = { ...city, state: selectedState };
      setSelectedCity(cityWithState);
      setValue("address.city", cityWithState, { shouldValidate: true });
    }
  };

  const handleStateChange = (state: State) => {
    setSelectedState(state);
    setSelectedCity(undefined);
    // Don't reset address.city.state here as it causes the select to reset
    // The StateSelect component already handles updating this value
  };

  async function onSubmit(data: z.infer<typeof collaboratorSchema>) {
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
      if (data.email && data.email.trim() !== "") {
        formData.append("email", data.email);
      }
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

      const collaborator = await promiseToast(promise, {
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

      // Navegar al colaborador recién creado en lugar de goBack()
      // Esto evita el bug donde goBack() llevaba a un colaborador diferente
      const slug = `${collaborator.firstName.toLowerCase()}-${collaborator.lastName.toLowerCase()}-${collaborator.id}`;
      navigate(`/incor-laboral/colaboradores/${slug}`);
    } catch (error) {
      console.error("Error al crear el Colaborador", error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                  <User className="h-6 w-6 text-white" />
                </div>
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center mb-6">
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
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
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

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
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
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
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

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
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
            </CardContent>
          </Card>
        </motion.div>

        {/* Card 3: Información Laboral (Teal) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="shadow-md border-0">
            <CardHeader className="bg-gradient-to-r from-teal-50 to-teal-100 border-border-teal-200">
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
                          disabled={!!preselectedCompanyId}
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
                          placeholder="Ingresar puesto..."
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
                          onStateChange={handleStateChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.city.name"
                  render={() => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <CitySelect
                          control={control}
                          idState={selectedState ? Number(selectedState.id) : 0}
                          onCityChange={handleCityChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calle</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar calle" />
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
                      <FormLabel>Número</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar número" />
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
                      <FormLabel>Piso (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar piso" />
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
                      <FormLabel>Departamento (Opcional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Ingresar departamento" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Botones de Acción */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={goBack}
              className="px-6"
              disabled={addCollaboratorMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white shadow-md"
              type="submit"
              disabled={addCollaboratorMutation.isPending}
            >
              Confirmar
            </Button>
          </div>
        </motion.div>
      </form>
    </Form>
  );
}
