import { useState, useEffect, useRef } from "react";
import { twoFactorSchema, TwoFactorFormData } from "@/validators/two-factor.schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess, clearTwoFactor } from "@/store/authSlice";
import { RootState } from "@/store/store";
import LoadingAnimation from "../Loading/loading";
import { Smartphone, ArrowLeft, RefreshCw } from "lucide-react";
import { apiIncorHC } from "@/services/axiosConfig";
import { useNavigate } from "react-router-dom";

interface TwoFactorFormProps {
  onBack: () => void;
}

const TwoFactorForm = ({ onBack }: TwoFactorFormProps) => {
  const form = useForm<TwoFactorFormData>({
    resolver: zodResolver(twoFactorSchema),
    defaultValues: {
      code: "",
    },
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { twoFactor } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleBack = () => {
    dispatch(clearTwoFactor());
    onBack();
  };

  async function onSubmit(values: TwoFactorFormData) {
    setError(null);
    setIsLoading(true);

    try {
      const response = await apiIncorHC.post("/auth/verify-2fa", {
        twoFactorToken: twoFactor.twoFactorToken,
        code: values.code,
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("authToken", token);
        dispatch(loginSuccess({ token }));
        dispatch(clearTwoFactor());
        navigate("/inicio");
      }
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError(error.response?.data?.message || "Codigo invalido o expirado");
      } else if (error.response?.status === 401) {
        setError("Codigo incorrecto. Intentelo nuevamente.");
      } else {
        setError("Error al verificar el codigo");
      }
      form.reset();
    } finally {
      setIsLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0 || isResending) return;

    setIsResending(true);
    setError(null);

    try {
      await apiIncorHC.post("/auth/resend-2fa", {
        twoFactorToken: twoFactor.twoFactorToken,
      });
      setResendCooldown(60);
    } catch (error: any) {
      if (error.response?.status === 400) {
        setError(error.response?.data?.message || "Debe esperar antes de reenviar");
      } else {
        setError("Error al reenviar el codigo");
      }
    } finally {
      setIsResending(false);
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (value: string) => void) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    onChange(value);
  };

  return (
    <div className="space-y-6">
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          <div className="space-y-2 text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-greenPrimary/10 p-4 rounded-full">
                <Smartphone className="h-8 w-8 text-greenPrimary" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-greenPrimary">Verificacion en dos pasos</h1>
            <p className="text-gray-600 text-sm">
              Ingresa el codigo de 6 digitos que enviamos a tu WhatsApp
            </p>
            {twoFactor.maskedPhone && (
              <p className="text-gray-500 text-sm font-medium">
                {twoFactor.maskedPhone}
              </p>
            )}
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Codigo de verificacion
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        ref={inputRef}
                        onChange={(e) => handleCodeChange(e, field.onChange)}
                        className="h-14 text-center text-2xl tracking-[0.5em] font-mono border-gray-300 focus:border-greenPrimary focus:ring-greenPrimary"
                        placeholder="000000"
                        maxLength={6}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 text-base font-medium"
                variant="incor"
                disabled={isLoading || form.watch("code").length !== 6}
              >
                Verificar codigo
              </Button>
            </form>
          </Form>

          <div className="flex flex-col gap-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="w-full text-greenPrimary hover:text-teal-700 hover:bg-greenPrimary/5"
              onClick={handleResend}
              disabled={resendCooldown > 0 || isResending}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isResending ? 'animate-spin' : ''}`} />
              {resendCooldown > 0
                ? `Reenviar codigo (${resendCooldown}s)`
                : isResending
                ? "Reenviando..."
                : "Reenviar codigo"}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="w-full text-gray-500 hover:text-gray-700"
              onClick={handleBack}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al inicio de sesion
            </Button>
          </div>

          <div className="text-center text-xs text-gray-400 pt-2">
            El codigo expira en 5 minutos
          </div>
        </>
      )}
    </div>
  );
};

export default TwoFactorForm;
