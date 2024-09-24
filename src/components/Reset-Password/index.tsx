import { toast } from "sonner";
import { useForm } from "react-hook-form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema } from "@/validators/user.schema";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "../ui/password-input";
import { useNavigate, useSearchParams } from "react-router-dom";
import LoadingToast from "../Toast/Loading";
import SuccessToast from "../Toast/Success";
import ErrorToast from "../Toast/Error";

type FormValues = z.infer<typeof ResetPasswordSchema>;
function ResetPasswordForm() {
  const form = useForm<FormValues>({
    resolver: zodResolver(ResetPasswordSchema),
  });
  const { resetPasswordMutation } = useUserMutations();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  async function onSubmit(data: z.infer<typeof ResetPasswordSchema>) {
    if (!token) {
      toast.error("Token de restablecimiento no proporcionado.");
      return;
    }

    const payload = {
      password: data.password,
      confirmPassword: data.confirmPassword,
      code: token,
    };

    try {
      toast.promise(resetPasswordMutation.mutateAsync(payload), {
        loading: <LoadingToast message="Cambiando contraseña..." />,
        success: <SuccessToast message="Contraseña actualizada con éxito!" />,
        error: <ErrorToast message="Error al actualizar la contraseña" />,
      });
      if (resetPasswordMutation.isSuccess) {
        navigate("/iniciar-sesion");
      }
    } catch (error) {
      console.error("Error al cambiar la contraseña", error);
    }
  }

  return (
    <Card className="w-full max-w-md mt-10">
      <CardHeader>
        <CardTitle>Nueva contraseña</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Form {...form}>
          <form
            className="flex flex-col gap-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">
                      Nueva contraseña
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Ingresar nueva contraseña..."
                      />
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
                      Confirmar nueva contraseña
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        {...field}
                        placeholder="Confirmar nueva contraseña..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <CardFooter className="flex justify-center gap-2">
              <Button type="submit" variant={"incor"}>
                Confirmar
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default ResetPasswordForm;
