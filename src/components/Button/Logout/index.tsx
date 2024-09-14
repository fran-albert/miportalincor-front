import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useState } from "react";
import { logout } from "@/store/authSlice";

const LogoutButton = () => {
  const dispatch = useDispatch(); // Usamos dispatch para invocar las acciones de Redux
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Función para manejar el logout
  const handleLogout = () => {
    setIsLoggingOut(true);

    localStorage.removeItem("authToken");
    dispatch(logout());
    setTimeout(() => {
      setIsLoggingOut(false);
      navigate("/iniciar-sesion"); // Redirigir al login
    }, 1000);
  };

  return (
    <button
      onClick={handleLogout} // Llamar a la función de logout
      className={`group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-bold transition-colors text-white hover:bg-red-200 hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 data-[active]:bg-accent/50 data-[state=open]:bg-accent/50 ${
        isLoggingOut ? "opacity-50 cursor-not-allowed" : "" // Deshabilitar el botón mientras está cerrando sesión
      }`}
      disabled={isLoggingOut} // Desactivar el botón mientras se cierra sesión
    >
      {isLoggingOut ? "Saliendo..." : "Salir"}
    </button>
  );
};

export default LogoutButton;
