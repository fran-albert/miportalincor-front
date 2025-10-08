import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";

interface DecodedToken {
  Id: string;
  Email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role":
    | string
    | string[];
  exp: number;
  iss: string;
}

export const Private_Routes = ({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: string[];
}) => {
  const [authChecked, setAuthChecked] = useState(false);
  const [redirectPath, setRedirectPath] = useState<string | null>(null);

  useEffect(() => {
    const stateUser = localStorage.getItem("authToken");

    if (!stateUser) {
      setRedirectPath("/iniciar-sesion");
      setAuthChecked(true);
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(stateUser);

      // Verificar si el token ha expirado
      const currentTime = Date.now() / 1000; // Convertir a segundos
      if (decodedToken.exp < currentTime) {
        console.warn("Token expirado, redirigiendo a login...");
        localStorage.removeItem("authToken");
        localStorage.removeItem("tokenExpiration");
        setRedirectPath("/iniciar-sesion");
        setAuthChecked(true);
        return;
      }

      // Verificar roles si se especificaron
      if (allowedRoles && allowedRoles.length > 0) {
        const userRoles =
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];
        const hasAccess = rolesArray.some((role) =>
          allowedRoles.includes(role)
        );

        if (!hasAccess) {
          setRedirectPath("/acceso-denegado");
          setAuthChecked(true);
          return;
        }
      }

      setAuthChecked(true);
    } catch (error) {
      console.error("Error al decodificar el token:", error);
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiration");
      setRedirectPath("/iniciar-sesion");
      setAuthChecked(true);
    }
  }, [allowedRoles]);

  if (!authChecked) {
    return <LoadingAnimation message="Verificando permisos..." />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return <>{children}</>;
};
