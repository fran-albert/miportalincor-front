import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { ChangePasswordSchema } from "@/validators/user.schema";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { toast } from "sonner";
import { PasswordInput } from "@/components/ui/password-input";
import { Lock } from "lucide-react";
import LoadingToast from "@/components/Toast/Loading";
import SuccessToast from "@/components/Toast/Success";
import ErrorToast from "@/components/Toast/Error";

interface ChangePasswordDialogProps {
  idUser: number;
}

export default function ChangePasswordDialog({
  idUser,
}: ChangePasswordDialogProps) {
  const form = useForm<z.infer<typeof ChangePasswordSchema>>({
    resolver: zodResolver(ChangePasswordSchema),
  });
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { changePasswordMutation } = useUserMutations();

  const toggleDialog = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      form.reset();
      setErrorMessage(null);
    }
  };

  async function onSubmit(data: z.infer<typeof ChangePasswordSchema>) {
    const dataToSend: any = {
      userId: String(idUser),
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
      confirmPassword: data.confirmPassword,
    };

    try {
      await toast.promise(changePasswordMutation.mutateAsync(dataToSend), {
        loading: <LoadingToast message="Cambiando Contraseña..." />,
        success: () => {
          form.reset();
          toggleDialog();
          return <SuccessToast message="Contraseña cambiada exitosamente!" />;
        },
        error: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            "Error al cambiar la contraseña. Verifica los datos ingresados.";

          setErrorMessage(errorMessage); 
          return <ErrorToast message={errorMessage} />; 
        },
      });
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        "Error desconocido al cambiar la contraseña.";
      setErrorMessage(errorMessage);
    }
  }

  const handleSave = async () => {
    const isValid = await form.trigger(); // Valida el formulario antes de enviar
    if (!isValid) return;

    const data = form.getValues();
    await onSubmit(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={toggleDialog}>
      <DialogTrigger asChild>
        <Button
          className="bg-greenPrimary hover:shadow-xl hover:bg-teal-800"
          onClick={toggleDialog}
          type="button"
        >
          <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] max-w-[325px] rounded-xl border bg-card text-card-foreground shadow">
        <CardHeader>
          <DialogTitle>Cambiar contraseña</DialogTitle>
          <CardDescription>
            Ingresa tu contraseña actual y la nueva contraseña para actualizar
            tus credenciales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && <div className="text-red-600">{errorMessage}</div>}
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="passwordForm"
              className="space-y-4"
            >
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">
                        Contraseña Actual
                      </FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">
                        Nueva Contraseña
                      </FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid gap-2">
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-black">
                        Confirmar Nueva Contraseña
                      </FormLabel>
                      <FormControl>
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <CardFooter className="flex justify-end gap-2">
                <div>
                  <Button
                    variant="outline"
                    type="button"
                    form="passwordForm"
                    onClick={toggleDialog}
                  >
                    Cancelar
                  </Button>
                </div>
                <Button variant={"incor"} type="button" onClick={handleSave}>
                  Guardar
                </Button>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </DialogContent>
    </Dialog>
  );
}
