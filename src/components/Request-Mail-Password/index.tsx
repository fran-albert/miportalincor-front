import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm, SubmitHandler } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { RequestEmailPasswordSchema } from "@/validators/user.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUserMutations } from "@/hooks/User/useUserMutations";
import { useToastContext } from "@/hooks/Toast/toast-context";
import { Mail, Shield, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
type FormValues = z.infer<typeof RequestEmailPasswordSchema>;

function RequestEmailPassword() {
  const form = useForm<FormValues>({
    resolver: zodResolver(RequestEmailPasswordSchema),
  });
  const { forgotPasswordMutation } = useUserMutations();
  const { promiseToast } = useToastContext();
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const promise = forgotPasswordMutation.mutateAsync(data);

      await promiseToast(promise, {
        loading: {
          title: "Enviando correo electrónico...",
          description: "Por favor espera mientras procesamos tu solicitud",
        },
        success: {
          title: "¡Correo enviado!",
          description: "Revisa tu bandeja de entrada para restablecer tu contraseña",
        },
        error: (error: unknown) => ({
          title: "Error al enviar correo",
          description:
            (error as { response?: { data?: { message?: string } } }).response?.data?.message || "Ha ocurrido un error inesperado",
        }),
      });
    } catch (error) {
      console.error("Error al enviar el enlace. Inténtalo de nuevo.", error);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Column - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-greenPrimary to-teal-600 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <img
              src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
              alt="Incor Centro Médico"
              className="h-16 w-16 rounded-full bg-white p-2"
            />
            <div className="text-white">
              <h2 className="text-2xl font-bold">Incor Centro Médico</h2>
              <p className="text-white/80 text-sm">Mi Portal</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h3 className="text-3xl font-bold text-white leading-tight">
            ¿Olvidaste tu contraseña?
          </h3>
          <p className="text-white/90 text-lg leading-relaxed">
            No te preocupes. Ingresa tu correo electrónico y te enviaremos un enlace seguro para restablecer tu contraseña.
          </p>
          <div className="flex items-center gap-3 text-white/80">
            <Shield className="h-5 w-5" />
            <span className="text-sm">Proceso seguro y verificado</span>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2025 Incor Centro Médico. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="https://res.cloudinary.com/dfoqki8kt/image/upload/v1748058948/bligwub9dzzcxzm4ovgv.png"
              alt="Incor Centro Médico"
              className="h-20 w-20 rounded-full"
            />
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
            <div className="space-y-2 text-center">
              <div className="flex justify-center mb-4">
                <div className="h-12 w-12 rounded-full bg-greenPrimary/10 flex items-center justify-center">
                  <Mail className="h-6 w-6 text-greenPrimary" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-greenPrimary">
                Restablecer Contraseña
              </h1>
              <p className="text-gray-600">
                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            {...field}
                            type="email"
                            className="pl-10 h-11 border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
                            placeholder="ejemplo@correo.com"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-medium"
                  variant="incor"
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending ? "Enviando..." : "Enviar enlace"}
                </Button>

                <div className="text-center pt-4">
                  <Link
                    to="/iniciar-sesion"
                    className="inline-flex items-center gap-2 text-sm text-greenPrimary hover:text-teal-700 font-medium"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Volver a iniciar sesión
                  </Link>
                </div>
              </form>
            </Form>

            <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
              <p>Mi Portal - Incor Centro Médico</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RequestEmailPassword;
