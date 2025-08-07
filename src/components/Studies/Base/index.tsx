import React from 'react';
import { useStudiesContext } from '@/contexts/StudiesContext';
import GenericStudies from '../Generic';

interface StudiesBaseProps {
  title?: string;
  role?: string;
  slug?: string;
  idUser?: number;
  showUserInfo?: boolean;
}

const StudiesBase: React.FC<StudiesBaseProps> = ({
  title,
  role,
  slug,
  idUser,
  showUserInfo = false,
}) => {
  const {
    userType,
    userData,
    studies,
    studyTypes,
    loading,
    actions,
  } = useStudiesContext();

  return (
    <div className="w-full">
      {/* User Information Section - Only show if requested and userData exists */}
      {showUserInfo && userData && (
        <div className="mb-6 p-4 bg-white rounded-lg border shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-greenPrimary">
                Información del {userType === 'doctor' ? 'Médico' : 'Paciente'}
              </h3>
              <div className="mt-2 space-y-1">
                {'name' in userData && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Nombre:</span> {userData.firstName} {userData.lastName}
                  </p>
                )}
                {'dni' in userData && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">DNI:</span> {userData.dni}
                  </p>
                )}
                {'matricula' in userData && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Matrícula:</span> {userData.matricula || 'N/A'}
                  </p>
                )}
                {'email' in userData && userData.email && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Email:</span> {userData.email}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Studies Component */}
      <GenericStudies
        userType={userType}
        userData={userData}
        studies={studies}
        studyTypes={studyTypes}
        loading={loading.studies}
        title={title}
        role={role}
        slug={slug}
        idUser={idUser}
        onUploadStudy={actions.onUploadStudy}
        onViewStudy={actions.onViewStudy}
      />
    </div>
  );
};

export default StudiesBase;