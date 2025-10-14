import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { logout } from '@/store/authSlice';
import { useEffect } from 'react';
import { RootState } from '@/store/store';

interface DecodedToken {
  id: string;
  email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
  exp: number;
  iss: string;
  firstName: string;
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

    const checkAndHandleExpiration = () => {
      const currentTime = Date.now();
      const expirationTime = parseInt(tokenExpiration);

      if (currentTime >= expirationTime) {
        dispatch(logout());
      }
    };

    checkAndHandleExpiration();

    const timeUntilExpiration = parseInt(tokenExpiration) - Date.now();
    if (timeUntilExpiration <= 0) return;

    const logoutTimer = setTimeout(() => {
      dispatch(logout());
    }, timeUntilExpiration);

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

  const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const rolesArray = Array.isArray(userRoles) ? userRoles : [userRoles];

  const session = {
    id: decodedToken.id,
    email: decodedToken.email,
    role: rolesArray,
    exp: decodedToken.exp,
    iss: decodedToken.iss,
    token: token,
    firstName: decodedToken.firstName,
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
