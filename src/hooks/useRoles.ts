import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { logout, updateTokens } from '@/store/authSlice';
import { useEffect } from 'react';
import { RootState } from '@/store/store';
import axios from 'axios';
import { environment } from '@/config/environment';

interface DecodedToken {
  id: string;
  email: string;
  roles: string | string[];
  exp: number;
  iss: string;
  firstName: string;
  lastName: string;
}

const ROLES = {
  PATIENT: "Paciente",
  DOCTOR: "Medico",
  SECRETARY: "Secretaria",
  ADMIN: "Administrador"
};

const useUserRole = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: RootState) => state.auth.token);
  const tokenExpiration = useSelector((state: RootState) => state.auth.tokenExpiration);

  useEffect(() => {
    if (!token || !tokenExpiration) return;

    const REFRESH_BUFFER_MS = 5 * 60 * 1000; // 5 minutos antes de expirar
    const expirationTime = parseInt(tokenExpiration);

    const attemptRefresh = async () => {
      try {
        const currentToken = localStorage.getItem("authToken");
        if (!currentToken) {
          dispatch(logout());
          return;
        }

        const baseUrl = environment.API_INCOR_HC_URL?.replace(/\/$/, '');
        const response = await axios.post(
          `${baseUrl}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } }
        );

        const { token: newToken } = response.data;
        const decodedToken = jwtDecode<{ exp: number }>(newToken);
        const newExpirationTime = decodedToken.exp * 1000;

        localStorage.setItem("authToken", newToken);
        localStorage.setItem("tokenExpiration", newExpirationTime.toString());
        dispatch(updateTokens({ token: newToken }));
      } catch (error) {
        console.error("Error refreshing token:", error);
        dispatch(logout());
      }
    };

    // Verificar si ya expiró o está por expirar
    const now = Date.now();
    if (now >= expirationTime) {
      // Ya expirado - intentar refresh inmediato
      attemptRefresh();
      return;
    }

    const timeUntilRefresh = expirationTime - now - REFRESH_BUFFER_MS;

    if (timeUntilRefresh <= 0) {
      // Menos de 5 minutos - refresh ahora
      attemptRefresh();
      return;
    }

    // Programar refresh 5 minutos antes de expirar
    const refreshTimer = setTimeout(() => {
      attemptRefresh();
    }, timeUntilRefresh);

    return () => clearTimeout(refreshTimer);
  }, [token, tokenExpiration, dispatch]);

  if (!token) {
    return {
      isPatient: false,
      isDoctor: false,
      isSecretary: false,
      isAdmin: false,
      session: null,
    };
  }

  let decodedToken: DecodedToken | null = null;
  try {
    decodedToken = jwtDecode(token) as DecodedToken;
  } catch (error) {
    console.error('Error decodificando el token', error);
    dispatch(logout());
    return {
      isPatient: false,
      isDoctor: false,
      isSecretary: false,
      isAdmin: false,
      session: null,
    };
  }

  const rolesArray = Array.isArray(decodedToken.roles)
    ? decodedToken.roles
    : (decodedToken.roles ? [decodedToken.roles] : []);

  const session = {
    id: decodedToken.id,
    email: decodedToken.email,
    role: rolesArray,
    exp: decodedToken.exp,
    iss: decodedToken.iss,
    token: token,
    firstName: decodedToken.firstName,
    lastName: decodedToken.lastName,
  };

  return {
    isPatient: rolesArray.includes(ROLES.PATIENT),
    isDoctor: rolesArray.includes(ROLES.DOCTOR),
    isSecretary: rolesArray.includes(ROLES.SECRETARY),
    isAdmin: rolesArray.includes(ROLES.ADMIN),
    session,
  };
};

export default useUserRole;
