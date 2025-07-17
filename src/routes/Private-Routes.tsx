import { jwtDecode } from "jwt-decode";
import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { AuthUtils } from "@/utils/auth";

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
    const stateUser = AuthUtils.getAuthToken();

    if (!stateUser) {
      setRedirectPath("/iniciar-sesion");
      setAuthChecked(true);
      return;
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(stateUser);

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
      // Token inválido, limpiar estado
      AuthUtils.removeAuthToken();
      setRedirectPath("/iniciar-sesion");
      setAuthChecked(true);
    }
  }, [allowedRoles]);

  if (!authChecked) {
    return <div>Cargando...</div>;
  }

  if (redirectPath) {
    return <Navigate to={redirectPath} />;
  }

  return <>{children}</>;
};
