export const PatientCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg p-4 animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        {/* Avatar skeleton */}
        <div className="rounded-full bg-gray-200 h-16 w-16"></div>

        {/* Nombre y datos básicos */}
        <div className="space-y-2 flex-1">
          <div className="h-5 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>

      {/* Información de contacto */}
      <div className="space-y-3 mt-4">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>

      {/* Datos adicionales */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

/**
 * Skeleton para la tabla de estudios
 */
export const StudiesTableSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse">
      {/* Filtros */}
      <div className="flex gap-2 mb-4">
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
        <div className="h-10 bg-gray-200 rounded w-1/3"></div>
      </div>

      {/* Encabezado de la tabla */}
      <div className="h-12 bg-gray-200 rounded w-full mb-2"></div>

      {/* Filas de la tabla */}
      {Array(5)
        .fill(0)
        .map((_, index) => (
          <div
            key={index}
            className="h-16 bg-gray-200 rounded w-full mb-2"
            style={{ opacity: 1 - index * 0.15 }} // Degradado para efecto visual
          ></div>
        ))}

      {/* Paginación */}
      <div className="flex justify-between mt-4">
        <div className="h-5 bg-gray-200 rounded w-1/4"></div>
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
      </div>
    </div>
  );
};

/**
 * Skeleton para la tarjeta completa de estudios (incluye encabezado y tabla)
 */
export const StudiesCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Encabezado de la tarjeta */}
      <div className="p-4 border-b animate-pulse">
        <div className="flex items-center">
          <div className="h-5 w-5 bg-gray-200 rounded mr-2"></div>
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        <StudiesTableSkeleton />
      </div>
    </div>
  );
};

/**
 * Componente de Row Skeleton para usar dentro de la tabla real
 */
export const StudyRowSkeleton: React.FC = () => {
  return (
    <tr className="animate-pulse">
      <td className="py-3 px-4">
        <div className="h-5 w-5 bg-gray-200 rounded mx-auto"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-5 w-5 bg-gray-200 rounded mx-auto"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-5 bg-gray-200 rounded w-full"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-5 bg-gray-200 rounded w-full"></div>
      </td>
      <td className="py-3 px-4">
        <div className="h-5 bg-gray-200 rounded w-2/3"></div>
      </td>
      <td className="py-3 px-4">
        <div className="flex justify-center gap-2">
          <div className="h-8 bg-gray-200 rounded w-6"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </td>
    </tr>
  );
};
