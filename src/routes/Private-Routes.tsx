import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import LoadingAnimation from "@/components/Loading/loading";
import { hasPermission } from "@/common/constants/permissions";
import axios from "axios";
import { environment } from "@/config/environment";

interface DecodedToken {
  id: string;
  email: string;
  roles: string | string[];
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
    const checkAuth = async () => {
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
          console.warn("Token expirado, intentando refresh...");

          try {
            const baseUrl = environment.API_INCOR_HC_URL?.replace(/\/$/, '');
            const response = await axios.post(
              `${baseUrl}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${stateUser}` } }
            );

            const { token: newToken } = response.data;
            const newDecodedToken = jwtDecode<{ exp: number }>(newToken);
            const newExpirationTime = newDecodedToken.exp * 1000;

            localStorage.setItem("authToken", newToken);
            localStorage.setItem("tokenExpiration", newExpirationTime.toString());

            // Token renovado exitosamente - continuar con la verificación de roles
            const refreshedDecodedToken: DecodedToken = jwtDecode(newToken);

            if (allowedRoles && allowedRoles.length > 0) {
              const userRoles = refreshedDecodedToken.roles;
              const rolesArray = Array.isArray(userRoles) ? userRoles : (userRoles ? [userRoles] : []);
              const hasAccess = hasPermission(rolesArray, allowedRoles);

              if (!hasAccess) {
                setRedirectPath("/acceso-denegado");
                setAuthChecked(true);
                return;
              }
            }

            setAuthChecked(true);
            return;
          } catch (refreshError) {
            console.error("Error al renovar token:", refreshError);
            localStorage.removeItem("authToken");
            localStorage.removeItem("tokenExpiration");
            setRedirectPath("/iniciar-sesion");
            setAuthChecked(true);
            return;
          }
        }

        // Token válido - verificar roles si se especificaron
        if (allowedRoles && allowedRoles.length > 0) {
          const userRoles = decodedToken.roles;
          const rolesArray = Array.isArray(userRoles) ? userRoles : (userRoles ? [userRoles] : []);
          const hasAccess = hasPermission(rolesArray, allowedRoles);

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
    };

    checkAuth();
  }, [allowedRoles]);

  if (!authChecked) {
    return <LoadingAnimation message="Verificando permisos..." />;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return <>{children}</>;
};
