import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { logout } from '@/store/authSlice';
import { useEffect } from 'react';

interface DecodedToken {
  Id: string;
  Email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string;
  exp: number;
  iss: string;
  FirstName: string;
}

const ROLES = {
  PATIENT: "Paciente",
  DOCTOR: "Medico",
  SECRETARY: "Secretaria",
  ADMIN: "Administrador"
};

const useUserRole = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.token);
  const tokenExpiration = useSelector((state: any) => state.auth.tokenExpiration);

  useEffect(() => {
    if (!token || !tokenExpiration) return;

    const checkAndHandleExpiration = () => {
      const currentTime = Date.now();
      const expirationTime = parseInt(tokenExpiration);

      if (currentTime >= expirationTime) {
        dispatch(logout());
      }
    };

    // Verificar inmediatamente
    checkAndHandleExpiration();

    // Calcular el tiempo restante hasta la expiración
    const timeUntilExpiration = parseInt(tokenExpiration) - Date.now();
    if (timeUntilExpiration <= 0) return;

    // Configurar el temporizador para el logout
    const logoutTimer = setTimeout(() => {
      dispatch(logout());
    }, timeUntilExpiration);

    // Limpiar el temporizador cuando el componente se desmonte
    return () => clearTimeout(logoutTimer);
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

  const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const session = {
    id: decodedToken.Id,
    email: decodedToken.Email,
    role: userRole,
    exp: decodedToken.exp,
    iss: decodedToken.iss,
    token: token,
    FirstName: decodedToken.FirstName,
  };

  return {
    isPatient: userRole === ROLES.PATIENT,
    isDoctor: userRole === ROLES.DOCTOR,
    isSecretary: userRole === ROLES.SECRETARY,
    isAdmin: userRole === ROLES.ADMIN,
    session,
  };
};

export default useUserRole;