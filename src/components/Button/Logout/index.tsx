import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "@/store/authSlice";
import LoadingAnimation from "@/components/Loading/loading";

const LogoutButton = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = () => {
    setIsLoggingOut(true);

    setTimeout(() => {
      localStorage.removeItem("authToken");
      dispatch(logout());
      setIsLoggingOut(false);
      navigate("/iniciar-sesion");
    }, 2000);
  };

  return (
    <div className="flex justify-center items-center">
      {isLoggingOut ? (
        <LoadingAnimation />
      ) : (
        <button
          onClick={handleLogout}
          className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition-colors text-white hover:bg-red-200 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50`}
        >
          Salir
        </button>
      )}
    </div>
  );
};

export default LogoutButton;
