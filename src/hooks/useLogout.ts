import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "@/store/authSlice";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);

    setTimeout(() => {
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiration");
      dispatch(logout());
      setIsLoggingOut(false);
      navigate("/iniciar-sesion");
    }, 1000);
  };

  return { handleLogout, isLoggingOut };
};
