import { useLogout } from "@/hooks/useLogout";
import LoadingAnimation from "@/components/Loading/loading";

const LogoutButton = () => {
  const { handleLogout, isLoggingOut } = useLogout();

  return (
    <div className="flex justify-center items-center">
      {isLoggingOut ? (
        <LoadingAnimation />
      ) : (
        <button
          onClick={handleLogout}
          className={`
            group flex w-full items-center justify-center py-2 text-lg font-semibold text-black
            md:inline-flex md:h-9 md:w-max md:rounded-md md:px-4 md:py-2 md:text-sm md:font-bold md:text-white
            transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none
            disabled:pointer-events-none disabled:opacity-50
          `}
        >
          Salir
        </button>
      )}
    </div>
  );
};

export default LogoutButton;
