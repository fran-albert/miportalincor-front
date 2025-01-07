import { XCircle } from "lucide-react";

const AccessDeniedPage = () => {
  return (
    <div className="flex flex-col items-center justify-center mt-20">
      <div className="text-red-600 mb-4">
        <XCircle size={64} />
      </div>
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Acceso Denegado</h1>
      <p className="text-xl text-gray-600">
        Lo sentimos, no tienes permiso para acceder a esta página.
      </p>
    </div>
  );
};

export default AccessDeniedPage;
