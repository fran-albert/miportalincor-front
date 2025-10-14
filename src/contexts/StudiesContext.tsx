/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, ReactNode } from 'react';
import { Patient } from '@/types/Patient/Patient';
import { Doctor } from '@/types/Doctor/Doctor';
import { StudiesWithURL } from '@/types/Study/Study';
import { StudyType } from '@/types/Study-Type/Study-Type';

export type StudiesUserType = 'patient' | 'doctor' | 'personal';
export type StudiesUserData = Patient | Doctor;

export interface StudiesPermissions {
  canUploadStudies: boolean;
  canDeleteStudies: boolean;
  canEditStudies: boolean;
  canViewAllStudies: boolean;
  readOnlyMode: boolean;
}

export interface StudiesConfig {
  viewMode: 'table' | 'card';
  showUploadSection: boolean;
  showEditActions: boolean;
  enableFiltering: boolean;
  showPagination: boolean;
  compactView: boolean;
  showUltrasoundExpansion: boolean;
}

export interface StudiesFilters {
  studyTypeId?: number;
  year?: number;
  searchText?: string;
}

export interface StudiesContextType {
  userType: StudiesUserType;
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes: StudyType[];
  filters: StudiesFilters;
  permissions: StudiesPermissions;
  config: StudiesConfig;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalItems: number;
  };
  loading: {
    studies: boolean;
    upload: boolean;
    delete: boolean;
  };
  actions: {
    onUploadStudy?: (files: FileList, studyTypeId: number, note?: string) => Promise<void>;
    onDeleteStudy?: (studyId: number) => Promise<void>;
    onViewStudy?: (study: StudiesWithURL) => void;
    onFilterChange?: (filters: StudiesFilters) => void;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
  };
}

const StudiesContext = createContext<StudiesContextType | undefined>(undefined);

export const useStudiesContext = () => {
  const context = useContext(StudiesContext);
  if (!context) {
    throw new Error('useStudiesContext must be used within a StudiesProvider');
  }
  return context;
};

const getPermissionsByUserType = (userType: StudiesUserType): StudiesPermissions => {
  const basePermissions = {
    canUploadStudies: false,
    canDeleteStudies: false,
    canEditStudies: false,
    canViewAllStudies: true,
    readOnlyMode: true,
  };

  switch (userType) {
    case 'doctor':
      return {
        ...basePermissions,
        canUploadStudies: true,
        canDeleteStudies: true,
        canEditStudies: true,
        readOnlyMode: false,
      };
    case 'patient':
      return {
        ...basePermissions,
        canViewAllStudies: false, // Only their own studies
      };
    case 'personal':
      return {
        ...basePermissions,
        canViewAllStudies: false, // Only their own studies
      };
    default:
      return basePermissions;
  }
};

const getConfigByUserType = (userType: StudiesUserType): StudiesConfig => {
  const baseConfig = {
    viewMode: 'table' as const,
    showUploadSection: false,
    showEditActions: false,
    enableFiltering: true,
    showPagination: true,
    compactView: false,
    showUltrasoundExpansion: true,
  };

  switch (userType) {
    case 'doctor':
      return {
        ...baseConfig,
        showUploadSection: true,
        showEditActions: true,
        viewMode: 'table' as const,
      };
    case 'patient':
      return {
        ...baseConfig,
        viewMode: 'table' as const,
        compactView: true,
      };
    case 'personal':
      return {
        ...baseConfig,
        viewMode: 'card' as const,
        compactView: true,
      };
    default:
      return baseConfig;
  }
};

interface StudiesProviderProps {
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
    onUploadStudy?: (files: FileList, studyTypeId: number, note?: string) => Promise<void>;
    onDeleteStudy?: (studyId: number) => Promise<void>;
    onViewStudy?: (study: StudiesWithURL) => void;
    onFilterChange?: (filters: StudiesFilters) => void;
    onPageChange?: (page: number) => void;
    onRefresh?: () => void;
  };
}

export const StudiesProvider: React.FC<StudiesProviderProps> = ({
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
}) => {
  const permissions = getPermissionsByUserType(userType);
  const config = getConfigByUserType(userType);

  const contextValue: StudiesContextType = {
    userType,
    userData,
    studies,
    studyTypes,
    filters: initialFilters,
    permissions,
    config,
    pagination: {
      currentPage: initialPage,
      pageSize,
      totalItems: studies.length,
    },
    loading: {
      studies: loading.studies || false,
      upload: loading.upload || false,
      delete: loading.delete || false,
    },
    actions,
  };

  return (
    <StudiesContext.Provider value={contextValue}>
      {children}
    </StudiesContext.Provider>
  );
};