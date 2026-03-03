import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAttendanceMutations } from "@/hooks/Program/useAttendanceMutations";

const QrAttendancePage = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const navigate = useNavigate();
  const { registerQrMutation } = useAttendanceMutations();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleRegister = async () => {
    if (!qrToken) return;
    setStatus("loading");
    try {
      await registerQrMutation.mutateAsync(qrToken);
      setStatus("success");
    } catch (error: unknown) {
      setStatus("error");
      const err = error as { response?: { data?: { message?: string } } };
      setErrorMessage(
        err?.response?.data?.message || "No se pudo registrar la asistencia."
      );
    }
  };

  return (
    <>
      <Helmet>
        <title>Registrar Asistencia</title>
      </Helmet>
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Registrar Asistencia</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            {status === "idle" && (
              <>
                <p className="text-gray-600">
                  Tocá el botón para registrar tu asistencia.
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleRegister}
                >
                  Confirmar Asistencia
                </Button>
              </>
            )}

            {status === "loading" && (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-greenPrimary" />
                <p className="text-gray-600">Registrando asistencia...</p>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col items-center gap-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
                <p className="text-lg font-semibold text-green-700">
                  ¡Asistencia registrada!
                </p>
                <p className="text-gray-600">
                  Tu asistencia fue registrada correctamente.
                </p>
                <Button
                  variant="outline"
                  onClick={() => navigate("/mis-programas")}
                >
                  Ir a Mis Programas
                </Button>
              </div>
            )}

            {status === "error" && (
              <div className="flex flex-col items-center gap-4">
                <XCircle className="h-16 w-16 text-red-500" />
                <p className="text-lg font-semibold text-red-700">Error</p>
                <p className="text-gray-600">{errorMessage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setStatus("idle")}>
                    Reintentar
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/mis-programas")}
                  >
                    Ir a Mis Programas
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default QrAttendancePage;
