import { useParams, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  registerPublicQrAttendance,
  PublicQrAttendanceResponse,
} from "@/api/Program/register-public-qr-attendance.action";

// Página PÚBLICA (sin login): el paciente escanea el QR pegado en el
// consultorio, ingresa su DNI y confirma. Pensada para gente mayor:
// una sola acción por pantalla, texto grande y sin navegación del portal.
const QrAttendancePage = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [searchParams] = useSearchParams();
  const activityName = searchParams.get("actividad");
  const programName = searchParams.get("programa");
  const [dni, setDni] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [result, setResult] = useState<PublicQrAttendanceResponse | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");

  const canSubmit = dni.length >= 6 && status !== "loading";

  const handleRegister = async () => {
    if (!qrToken || !canSubmit) return;
    setStatus("loading");
    try {
      const response = await registerPublicQrAttendance(qrToken, dni);
      setResult(response);
      setStatus("success");
    } catch (error: unknown) {
      setStatus("error");
      const err = error as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (err?.response?.status === 429) {
        setErrorMessage(
          "Hiciste demasiados intentos. Esperá un minuto y volvé a probar."
        );
      } else {
        setErrorMessage(
          err?.response?.data?.message ||
            "No pudimos registrar tu asistencia. Acercate a recepción."
        );
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrar Asistencia</title>
      </Helmet>
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-greenPrimary px-6 py-4 text-center">
            <p className="text-white text-lg font-bold">INCOR Centro Médico</p>
          </div>
          <div className="p-6 text-center space-y-6">
            {(status === "idle" || status === "loading") && (
              <>
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    Registrar asistencia
                  </h1>
                  {activityName && (
                    <div className="rounded-lg bg-green-50 border border-green-200 px-4 py-3 mt-3">
                      <p className="text-xl font-bold text-gray-900">
                        {activityName}
                      </p>
                      {programName && (
                        <p className="text-base text-gray-600">{programName}</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-left">
                  <label
                    htmlFor="dni"
                    className="block text-lg font-semibold text-gray-800"
                  >
                    Ingresá tu DNI
                  </label>
                  <Input
                    id="dni"
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    placeholder="Ej: 12345678"
                    maxLength={9}
                    className="h-16 text-center text-3xl font-bold tracking-widest"
                    value={dni}
                    onChange={(e) =>
                      setDni(e.target.value.replace(/\D/g, ""))
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRegister();
                    }}
                    disabled={status === "loading"}
                  />
                  <p className="text-sm text-gray-500">
                    Solo números, sin puntos.
                  </p>
                </div>

                <Button
                  size="lg"
                  className="h-16 w-full text-xl font-semibold"
                  onClick={handleRegister}
                  disabled={!canSubmit}
                >
                  {status === "loading" ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      Registrando...
                    </span>
                  ) : (
                    "Confirmar asistencia"
                  )}
                </Button>
              </>
            )}

            {status === "success" && result && (
              <div className="flex flex-col items-center gap-4 py-4">
                <CheckCircle className="h-20 w-20 text-green-500" />
                <p className="text-2xl font-bold text-green-700">
                  ¡Listo, {result.firstName}!
                </p>
                <p className="text-lg text-gray-700">
                  {result.alreadyRegistered
                    ? `Tu asistencia de hoy a ${result.activityName} ya estaba registrada.`
                    : `Tu asistencia a ${result.activityName} quedó registrada.`}
                </p>
                <p className="text-base text-gray-500">
                  Ya podés cerrar esta pantalla.
                </p>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4 py-4">
                <XCircle className="h-20 w-20 text-red-500" />
                <p className="text-lg text-gray-700">{errorMessage}</p>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 w-full text-lg"
                  onClick={() => {
                    setStatus("idle");
                    setDni("");
                  }}
                >
                  Volver a intentar
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default QrAttendancePage;
