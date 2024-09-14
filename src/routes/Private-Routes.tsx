import { jwtDecode } from "jwt-decode";
import { Navigate } from "react-router-dom";

interface DecodedToken {
  Id: string;
  Email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
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
      const userRole =
        decodedToken[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ];
      if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/acceso-denegado" />;
      }
    }

    return children;
  } catch (error) {
    console.error("Error al decodificar el token:", error);
    return <Navigate to="/iniciar-sesion" />;
  }
};
