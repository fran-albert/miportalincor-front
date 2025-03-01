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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useForm } from "react-hook-form";
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

type FormValues = z.infer<typeof collaboratorSchema>;
export function CreateCollaboratorComponent() {
  const { addCollaboratorMutation } = useCollaboratorMutations();
  const form = useForm<FormValues>({
    resolver: zodResolver(collaboratorSchema),
  });
  const { control } = form;

  async function onSubmit(data: z.infer<typeof collaboratorSchema>) {
    try {
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName);
      formData.append("userName", data.userName);
      formData.append("birthDate", data.birthDate);
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

      const promise = addCollaboratorMutation.mutateAsync(formData);

      toast.promise(promise, {
        loading: <LoadingToast message="Creando Colaborador..." />,
        success: <SuccessToast message="Colaborador creado con éxito" />,
        error: (error) => {
          const errorMessage =
            error.response?.data?.message || "Error al crear el Colaborador";
          return <ErrorToast message={errorMessage} />;
        },
      });

      await promise;
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
                            {field.value ? (
                              <Avatar className="w-24 h-24">
                                <AvatarImage
                                  src={
                                    typeof field.value === "string"
                                      ? field.value
                                      : ""
                                  }
                                  alt="Avatar"
                                />
                                <AvatarFallback>AV</AvatarFallback>
                              </Avatar>
                            ) : (
                              <Avatar className="w-24 h-24">
                                <AvatarFallback>AV</AvatarFallback>
                              </Avatar>
                            )}
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
                      render={({}) => (
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
