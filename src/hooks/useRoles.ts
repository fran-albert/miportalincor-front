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

const useUserRole = () => {
  const dispatch = useDispatch();
  const token = useSelector((state: any) => state.auth.token) || localStorage.getItem('authToken');

  if (!token) {
    return {
      isPatient: false,
      isDoctor: false,
      isSecretary: false,
      session: null,
    };
  }

  const decodedToken = jwtDecode(token) as DecodedToken;
  const currentTime = Date.now() / 1000;

  if (decodedToken.exp < currentTime) {
    dispatch(logout()); 
    return {
      isPatient: false,
      isDoctor: false,
      isSecretary: false,
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
    isPatient: userRole === "Paciente",
    isDoctor: userRole === "Medico",
    isSecretary: userRole === "Secretaria",
    session,
  };
};

export default useUserRole;
