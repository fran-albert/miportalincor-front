import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "@/store/authSlice";
import { apiIncorHC } from "@/services/axiosConfig";

export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);

    try {
      // Call backend to invalidate session
      await apiIncorHC.post("/auth/logout");
    } catch (error) {
      // Continue with logout even if backend call fails
      console.error("Error during logout:", error);
    } finally {
      // Always clear local state
      localStorage.removeItem("authToken");
      localStorage.removeItem("tokenExpiration");
      dispatch(logout());
      setIsLoggingOut(false);
      navigate("/iniciar-sesion");
    }
  };

  return { handleLogout, isLoggingOut };
};
