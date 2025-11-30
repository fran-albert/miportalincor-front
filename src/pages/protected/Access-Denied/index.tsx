import { ShieldAlert, Home } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useUserRole from "@/hooks/useRoles";

const AccessDeniedPage = () => {
  const { session } = useUserRole();
  const userName = session?.firstName || "Usuario";
  const userRoles = session?.role || [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 text-center">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
              <ShieldAlert className="h-10 w-10 text-red-600" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">
              Acceso Denegado
            </h1>
            <p className="text-gray-600">
              Lo sentimos, <span className="font-semibold">{userName}</span>
            </p>
          </div>

          {/* Message */}
          <div className="space-y-3">
            <p className="text-gray-700">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            {userRoles.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Tu rol actual:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {userRoles.map((role: string) => (
                    <span
                      key={role}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-greenPrimary/10 text-greenPrimary"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-4 space-y-3">
            <Link to="/inicio">
              <Button
                variant="incor"
                className="w-full h-11 text-base font-medium"
              >
                <Home className="mr-2 h-5 w-5" />
                Volver al Inicio
              </Button>
            </Link>
            <p className="text-sm text-gray-500">
              Si crees que deberías tener acceso, contacta al administrador
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessDeniedPage;
