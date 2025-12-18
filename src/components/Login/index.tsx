import { useState } from "react";
import { loginSchema } from "@/validators/login.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { PasswordInput } from "../ui/password-input";
import { Checkbox } from "@/components/ui/checkbox";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, setTwoFactorRequired } from "@/store/authSlice";
import { RootState } from "@/store/store";
import LoadingAnimation from "../Loading/loading";
import { Mail, Lock, Stethoscope } from "lucide-react";
import { apiIncorHC } from "@/services/axiosConfig";
import TwoFactorForm from "./TwoFactorForm";

const LoginComponent = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const dispatch = useDispatch();
  const { twoFactor } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiIncorHC.post("/auth/login", {
        userName: values.userName,
        password: values.password,
      });

      const data = response.data;

      // Check if 2FA is required
      if (data.requires2FA) {
        dispatch(setTwoFactorRequired({
          twoFactorToken: data.twoFactorToken,
          maskedPhone: data.maskedPhone,
          expiresIn: data.expiresIn,
        }));
        return;
      }

      // Normal login flow
      const { token } = data;
      if (token) {
        localStorage.setItem("authToken", token);
        dispatch(loginSuccess({ token }));
        navigate("/inicio");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError(error.response?.data?.message || "Credenciales Incorrectas");
      } else {
        setError("Error al conectar con el servidor");
      }
      console.error("Error during login:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const handleBackFromTwoFactor = () => {
    form.reset();
    setError(null);
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
            Bienvenido a Mi Portal
          </h3>
          <p className="text-white/90 text-lg leading-relaxed">
            Accede a tu portal para gestionar pacientes, citas médicas, historias clínicas y más.
          </p>
          <div className="flex items-center gap-3 text-white/80">
            <Stethoscope className="h-5 w-5" />
            <span className="text-sm">Gestión profesional de salud</span>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">
          © 2025 Incor Centro Médico. Todos los derechos reservados.
        </div>
      </div>

      {/* Right Column - Login Form */}
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
            {twoFactor.requires2FA ? (
              <TwoFactorForm onBack={handleBackFromTwoFactor} />
            ) : isLoading ? (
              <div className="flex justify-center items-center h-96">
                <LoadingAnimation />
              </div>
            ) : (
              <>
                <div className="space-y-2 text-center">
                  <h1 className="text-3xl font-bold text-greenPrimary">Iniciar Sesion</h1>
                  <p className="text-gray-600">
                    Ingresa tus credenciales para acceder al sistema
                  </p>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="userName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Correo Electrónico o D.N.I.
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                              <Input
                                {...field}
                                className="pl-10 h-11 border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
                                placeholder="ejemplo@correo.com o DNI"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-gray-700 font-medium">
                            Contraseña
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                              <PasswordInput
                                {...field}
                                className="pl-10 h-11 border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
                                placeholder="Ingresa tu contraseña"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <label
                          htmlFor="remember"
                          className="text-sm text-gray-600 cursor-pointer"
                        >
                          Recordarme
                        </label>
                      </div>
                      <Link
                        to="/restablecer-contrase%C3%B1a"
                        className="text-sm text-greenPrimary hover:text-teal-700 font-medium"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 text-base font-medium"
                      variant="incor"
                      disabled={isLoading}
                    >
                      Iniciar sesión
                    </Button>
                  </form>
                </Form>

                <div className="text-center text-sm text-gray-500 pt-4 border-t border-gray-200">
                  <p>Mi Portal - Incor Centro Médico</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
