import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { logout } from '@/store/authSlice';

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
  const token = useSelector((state: any) => state.auth.token) || (typeof window !== 'undefined' ? localStorage.getItem('authToken') : null);

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
  }

  if (!decodedToken) {
    return {
      isPatient: false,
      isDoctor: false,
      isSecretary: false,
      isAdmin: false,
      session: null,
    };
  }

  const currentTime = Math.floor(Date.now() / 1000);

  if (decodedToken.exp < currentTime) {
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