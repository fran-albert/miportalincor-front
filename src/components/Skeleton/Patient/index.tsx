import { Card, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-8"></div>
        </div>
      </td>
    </tr>
  );
};
export const PatientProfileSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-48"></div>
          <div className="h-6 bg-gray-200 rounded w-96"></div>
        </div>
        {/* Avatar Card skeleton */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
          <div className="p-6 pt-20 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
            <div className="h-5 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="flex gap-2">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
              <div className="h-6 bg-gray-200 rounded w-40"></div>
            </div>
          </div>
        </div>
        {/* 5 Sectional Cards skeletons */}
        {[...Array(5)].fill(0).map((_, i) => (
          <div
            key={i}
            className="bg-white shadow-md rounded-lg overflow-hidden"
          >
            <div className="p-4 border-b animate-pulse">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="h-6 bg-gray-200 rounded w-48"></div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                {[...Array(4)].fill(0).map((_, j) => (
                  <div
                    key={j}
                    className="h-10 bg-gray-200 rounded w-full animate-pulse"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };


export function PatientCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-xl">
      <CardHeader>
        {/* Hero Background con Gradiente */}
        <div className="relative bg-gradient-to-r from-greenPrimary to-teal-600 p-8 pb-20">
          {/* Decorative Blob */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        </div>


        {/* Card Principal Elevada */}
        <div className="relative px-8 -mt-12 pb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar con Gradiente */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-greenPrimary to-teal-600 flex items-center justify-center border-4 border-white shadow-xl flex-shrink-0">
                <Skeleton className="h-12 w-12 rounded-full" />
              </div>

              {/* Información del Usuario */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Nombre */}
                <Skeleton className="h-8 w-48" />
                
                {/* Información Específica */}
                <div className="space-y-3">
                  {/* DNI */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-32 rounded" />
                  </div>
                  
                  {/* Badges de Género y Edad */}   
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-6 w-20 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                  </div>

                  {/* Obra Social */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-48 rounded" />
                  </div>

                  {/* Contacto */}
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-5 w-48 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}