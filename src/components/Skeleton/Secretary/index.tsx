import React from "react";

/**
 * Skeleton para el perfil completo de secretaria/administrador
 */
export const SecretaryProfileSkeleton: React.FC = () => {
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
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>

      {/* 5 Sectional Cards skeletons */}
      {[...Array(5)].fill(0).map((_, i) => (
        <div key={i} className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-4 border-b animate-pulse">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-gray-200"></div>
              <div className="h-6 bg-gray-200 rounded w-48"></div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6">
              {[...Array(4)].fill(0).map((_, j) => (
                <div key={j} className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
