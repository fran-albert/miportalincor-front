import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

interface DecodedToken {
  Id: string;
  Email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
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
  const stateUser = localStorage.getItem("authToken");

  if (!stateUser) {
    return <Navigate to="/iniciar-sesion" />;
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(stateUser);

    if (allowedRoles && allowedRoles.length > 0) {
      const userRoles =
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];

      const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

      const hasAccess = rolesArray.some((role) => allowedRoles.includes(role));

      if (!hasAccess) {
        return <Navigate to="/acceso-denegado" />;
      }
    }

    return children;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return <Navigate to="/iniciar-sesion" />;
  }
};
