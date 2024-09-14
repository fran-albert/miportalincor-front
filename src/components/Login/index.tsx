import { useState, useTransition } from "react";
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
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "@/store/authSlice";

const LoginComponent = () => {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });
  const dispatch = useDispatch();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  // @ts-ignore
  const [isRedirecting, setIsRedirecting] = useState(false);
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setError(null);

    startTransition(() => {
      (async () => {
        try {
          const response = await axios.post(
            `${import.meta.env.VITE_BACKEND_API}Account/login`,
            {
              userName: values.userName,
              password: values.password,
            }
          );

          const { token } = response.data;
          if (token) {
            // const decodedToken = jwtDecode(token) as {
            //   Id: string;
            //   Email: string;
            //   "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
            //   exp: number;
            //   iss: string;
            // };

            // const user = {
            //   id: decodedToken.Id,
            //   email: decodedToken.Email,
            //   role: decodedToken[
            //     "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
            //   ],
            // };

            localStorage.setItem("authToken", token);
            dispatch(loginSuccess({ token }));

            setIsRedirecting(true);
            navigate("/inicio");
          }
        } catch (error) {
          setError("Credenciales Incorrectas");
          console.error("Error during login:", error);
        }
      })();
    });
  }

  return (
    <div className="mt-2 mx-auto max-w-sm space-y-6 p-4">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-greenPrimary">Bienvenido</h1>
        <p className="text-muted-foreground">
          Ingresa tu correo electrónico o D.N.I. para acceder a tu cuenta.
        </p>
      </div>
      <div className="space-y-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="userName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-black">
                    Correo Electrónico o D.N.I.
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
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
                  <FormLabel className="text-black">Contraseña</FormLabel>
                  <FormControl>
                    <PasswordInput {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-red-500 text-sm font-medium">{error}</p>
            )}
            <div className="flex items-center justify-between">
              <Button
                type="submit"
                className="w-full"
                variant="incor"
                disabled={isPending}
              >
                {isPending ? "Iniciando..." : "Iniciar sesión"}
              </Button>
            </div>
          </form>
        </Form>
        <div className="text-center text-muted-foreground">
          <Link to="/restablecer-contrase%C3%B1a">
            ¿Has olvidado tu contraseña?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginComponent;
