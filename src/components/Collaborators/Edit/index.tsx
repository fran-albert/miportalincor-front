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
import { toast } from "sonner";
import { goBack } from "@/common/helpers/helpers";
import { GenderSelect } from "@/components/Select/Gender/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import SuccessToast from "@/components/Toast/Success";
import LoadingToast from "@/components/Toast/Loading";
import ErrorToast from "@/components/Toast/Error";
import { collaboratorSchema } from "@/validators/Colaborator/collaborator.schema";
import { useCollaboratorMutations } from "@/hooks/Collaborator/useCollaboratorMutation";
import { CompanySelect } from "@/components/Select/Company/select";
import ImagePickerDialog from "@/components/Image-Picker/Dialog";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";

const getValidDateString = (date: string | undefined | null): string => {
  if (!date) return "";

  const ddmmyyyyMatch = date.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (ddmmyyyyMatch) {
    const [_, day, month, year] = ddmmyyyyMatch;
    const formattedDate = `${year}-${month}-${day}`; 
    const parsedDate = new Date(formattedDate);
    const result = !isNaN(parsedDate.getTime())
      ? parsedDate.toISOString().split("T")[0]
      : "";
    return result;
  }

  const parsedDate = new Date(date);
  const result = !isNaN(parsedDate.getTime())
    ? parsedDate.toISOString().split("T")[0]
    : "";
  return result;
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
  console.log(collaborator);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const { updateCollaboratorMutation } = useCollaboratorMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(collaboratorSchema),
    defaultValues: {
      firstName: collaborator.firstName,
      lastName: collaborator.lastName,
      userName: collaborator.userName,
      birthDate: getValidDateString(String(collaborator.birthDate)),
      phone: collaborator.phone,
      gender: collaborator.gender,
      address: String(collaborator.address),
      email: collaborator.email,
      idCompany: String(collaborator.company.id),
      file: "",
    },
  });
  const { control } = form;
  const fileField = useWatch({ control, name: "file" });
  useEffect(() => {
    if (fileField) {
      if (typeof fileField === "string") {
        // Si ya es un string (por ejemplo, base64) lo usamos directamente.
        setPreview(fileField);
      } else if (fileField instanceof File) {
        // Si es un objeto File, creamos una URL temporal.
        const objectUrl = URL.createObjectURL(fileField);
        setPreview(objectUrl);
        return () => URL.revokeObjectURL(objectUrl);
      }
    } else {
      setPreview(null);
    }
  }, [fileField]);
  const imageSrc = preview ? preview : collaborator.photoUrl;
  const hasImageToShow = !!imageSrc && imageSrc.trim() !== "";
  async function onSubmit(data: FormValues) {
    console.log("Datos del formulario:", data);
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("userName", data.userName);
      const formattedBirthDate = new Date(data.birthDate)
        .toISOString()
        .split("T")[0];
      formData.append("birthDate", formattedBirthDate);
      formData.append("phone", data.phone);
      formData.append("gender", data.gender);
      formData.append("address", data.address);
      formData.append("email", data.email);
      formData.append("idCompany", data.idCompany.toString());

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

      for (let [key, value] of formData.entries()) {
        console.log("FormData entry:", key, value);
      }

      const promise = updateCollaboratorMutation.mutateAsync({
        id: collaborator.id,
        collaborator: formData,
      });

      toast.promise(promise, {
        loading: <LoadingToast message="Actualizando Colaborador..." />,
        success: <SuccessToast message="Colaborador actualizado con éxito" />,
        error: (error) => {
          const errorMessage =
            error.response?.data?.message ||
            "Error al actualizar el Colaborador";
          return <ErrorToast message={errorMessage} />;
        },
      });

      await promise;
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
                  ) : null}
                  {(!hasImageToShow || !imageLoaded) && (
                    <div className="h-24 w-24 flex items-center justify-center bg-gray-200 rounded-full border-2 border-gray-300 shadow-md">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
                {/* FormField para seleccionar nueva imagen */}
                <FormField
                  control={form.control}
                  name="file"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-center">
                      <FormControl>
                        {/* El ImagePickerDialog actualiza el campo "file".
                            Al cambiar, se actualizará la previsualización en la parte superior */}
                        <ImagePickerDialog onImageSelect={field.onChange} />
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
                              {...field}
                              value={field.value || ""} // Asegúrate de que siempre sea una cadena válida
                              onChange={(e) => {
                                field.onChange(e.target.value); // Actualiza el valor directamente
                              }}
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
              <div className="grid grid-cols-4 gap-6">
                <div className="space-y-2">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-black">Dirección</FormLabel>
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
