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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ChangePasswordSchema } from "@/validators/user.schema";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { PasswordInput } from "@/components/ui/password-input";
import {
  Lock,
  AlertCircle,
  Check,
  Loader2,
  KeyRound,
  ShieldCheck,
} from "lucide-react";
import { useToastContext } from "@/hooks/Toast/toast-context";

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
  const { promiseToast } = useToastContext();

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
      const promise = changePasswordMutation.mutateAsync(dataToSend);

      await promiseToast(promise, {
        loading: {
          title: "Cambiando contraseña...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Contraseña cambiada!",
          description: "La contraseña se ha cambiado exitosamente",
        },
        error: (error: any) => {
          const errorMessage =
            error.response?.data?.message ||
            "Error al cambiar la contraseña. Verifica los datos ingresados.";
          setErrorMessage(errorMessage);
          return {
            title: "Error al cambiar contraseña",
            description: errorMessage,
          };
        },
      });

      form.reset();
      toggleDialog();
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
          className="bg-greenPrimary hover:bg-greenPrimary/90 hover:shadow-xl shadow-md text-white"
          onClick={toggleDialog}
          type="button"
        >
          <Lock className="mr-2 h-4 w-4" /> Cambiar Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-w-[350px] max-h-[90vh] overflow-hidden p-0">
        {/* Gradient Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-greenPrimary to-teal-600 text-white  p-6 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30 shadow-lg flex-shrink-0">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold text-white">
                Cambiar Contraseña
              </DialogTitle>
              <p className="text-sm text-white/80 mt-1">
                Actualiza tu contraseña para mantener tu cuenta segura
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Alert de Error */}
          {errorMessage && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error al cambiar la contraseña</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              id="passwordForm"
              className="space-y-4"
            >
              {/* Contraseña Actual */}
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 flex items-center gap-2">
                      <KeyRound className="h-4 w-4 text-gray-600" />
                      Contraseña Actual
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nueva Contraseña */}
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 flex items-center gap-2">
                      <Lock className="h-4 w-4 text-gray-600" />
                      Nueva Contraseña
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Ingresa tu nueva contraseña"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Confirmar Nueva Contraseña */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-gray-600" />
                      Confirmar Nueva Contraseña
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Confirma tu nueva contraseña"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 bg-white border-t p-4 rounded-b-lg">
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={toggleDialog}
              className="px-6"
              disabled={changePasswordMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={changePasswordMutation.isPending}
              className="px-6 bg-greenPrimary hover:bg-greenPrimary/90 text-white"
            >
              {changePasswordMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
