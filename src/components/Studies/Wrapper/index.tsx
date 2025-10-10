import React, { ReactNode } from "react";
import {
  StudiesProvider,
  StudiesUserType,
  StudiesUserData,
  StudiesFilters,
} from "@/contexts/StudiesContext";
import { StudiesWithURL } from "@/types/Study/Study";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { PageHeader } from "@/components/PageHeader";
import { FileText } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BaseStudiesWrapperProps {
  children: ReactNode;
  userType: StudiesUserType;
  userData?: StudiesUserData;
  studies?: StudiesWithURL[];
  studyTypes?: StudyType[];
  initialFilters?: StudiesFilters;
  initialPage?: number;
  pageSize?: number;
  loading?: {
    studies?: boolean;
    upload?: boolean;
    delete?: boolean;
  };
  actions?: {
    onUploadStudy?: (
      files: FileList,
      studyTypeId: number,
      note?: string
    ) => Promise<void>;
    onDeleteStudy?: (studyId: number) => Promise<void>;
    onViewStudy?: (study: StudiesWithURL) => void;
    onFilterChange?: (filters: StudiesFilters) => void;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
  };
  breadcrumbItems?: BreadcrumbItem[];
}

export const StudiesWrapper: React.FC<BaseStudiesWrapperProps> = ({
  children,
  userType,
  userData,
  studies = [],
  studyTypes = [],
  initialFilters = {},
  initialPage = 1,
  pageSize = 10,
  loading = {},
  actions = {},
  breadcrumbItems = [],
}) => {
  // Determinar el título basado en el tipo de usuario
  const getPageTitle = () => {
    if (userType === "personal") return "Mis Estudios";
    if (userType === "doctor") return "Estudios del Médico";
    if (userType === "patient") return "Estudios del Paciente";
    return "Estudios Médicos";
  };

  const getPageDescription = () => {
    if (userType === "personal")
      return "Visualiza y descarga todos tus estudios médicos, laboratorios e imágenes";
    return "Gestión y visualización de estudios médicos";
  };

  return (
    <div className="w-full min-h-screen bg-background">
      {breadcrumbItems.length > 0 && (
        <div className="bg-white border-b px-4 sm:px-6 py-4">
          <PageHeader
            breadcrumbItems={breadcrumbItems}
            title={getPageTitle()}
            description={getPageDescription()}
            icon={<FileText className="h-6 w-6" />}
            badge={studies.length}
          />
        </div>
      )}
      <div className="p-4 sm:p-6">
        <StudiesProvider
          userType={userType}
          userData={userData}
          studies={studies}
          studyTypes={studyTypes}
          initialFilters={initialFilters}
          initialPage={initialPage}
          pageSize={pageSize}
          loading={loading}
          actions={actions}
        >
          {children}
        </StudiesProvider>
      </div>
    </div>
  );
};

// Specific wrapper for patient studies (viewed by medical staff)
interface PatientStudiesWrapperProps {
  children: ReactNode;
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  role?: string;
  slug?: string;
  idUser?: number;
  onUploadStudy?: (
    files: FileList,
    studyTypeId: number,
    note?: string
  ) => Promise<void>;
  onDeleteStudy?: (studyId: number) => Promise<void>;
  onRefresh?: () => void;
}

export const PatientStudiesWrapper: React.FC<PatientStudiesWrapperProps> = ({
  children,
  userData,
  studies,
  studyTypes = [],
  loading = false,
  breadcrumbItems,
  onUploadStudy,
  onDeleteStudy,
  onRefresh,
}) => {
  return (
    <StudiesWrapper
      userType="patient"
      userData={userData}
      studies={studies}
      studyTypes={studyTypes}
      loading={{ studies: loading }}
      breadcrumbItems={breadcrumbItems}
      actions={{
        onUploadStudy,
        onDeleteStudy,
        onRefresh,
      }}
    >
      {children}
    </StudiesWrapper>
  );
};

// Specific wrapper for doctor studies management
interface DoctorStudiesWrapperProps {
  children: ReactNode;
  userData: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  role?: string;
  slug?: string;
  idUser?: number;
  onUploadStudy?: (
    files: FileList,
    studyTypeId: number,
    note?: string
  ) => Promise<void>;
  onDeleteStudy?: (studyId: number) => Promise<void>;
  onEditStudy?: (studyId: number) => void;
  onRefresh?: () => void;
}

export const DoctorStudiesWrapper: React.FC<DoctorStudiesWrapperProps> = ({
  children,
  userData,
  studies,
  studyTypes = [],
  loading = false,
  breadcrumbItems,
  onUploadStudy,
  onDeleteStudy,
  onRefresh,
}) => {
  return (
    <StudiesWrapper
      userType="doctor"
      userData={userData}
      studies={studies}
      studyTypes={studyTypes}
      loading={{ studies: loading }}
      breadcrumbItems={breadcrumbItems}
      actions={{
        onUploadStudy,
        onDeleteStudy,
        onRefresh,
      }}
    >
      {children}
    </StudiesWrapper>
  );
};

// Specific wrapper for personal studies ("Mis Estudios")
interface PersonalStudiesWrapperProps {
  children: ReactNode;
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  breadcrumbItems?: BreadcrumbItem[];
  searchEnabled?: boolean;
  pageSize?: number;
}

export const PersonalStudiesWrapper: React.FC<PersonalStudiesWrapperProps> = ({
  children,
  userData,
  studies,
  studyTypes = [],
  loading = false,
  breadcrumbItems = [],
  pageSize = 6,
}) => {
  return (
    <StudiesWrapper
      userType="personal"
      userData={userData}
      studies={studies}
      studyTypes={studyTypes}
      pageSize={pageSize}
      loading={{ studies: loading }}
      breadcrumbItems={breadcrumbItems}
    >
      {children}
    </StudiesWrapper>
  );
};

export default StudiesWrapper;
