import React, { createContext, useContext, ReactNode } from 'react';
import { Patient } from '@/types/Patient/Patient';
import { Doctor } from '@/types/Doctor/Doctor';
import { AntecedentesResponse, EvolucionesResponse } from '@/types/Antecedentes/Antecedentes';

export type UserType = 'patient' | 'doctor';
export type UserData = Patient | Doctor;

export interface HistoryPermissions {
  canEditEvolutions: boolean;
  canViewMedication: boolean;
  canEditAntecedentes: boolean;
  canDeleteEvolutions: boolean;
  readOnlyMode: boolean;
}

export interface HistoryConfig {
  showMedicationSection: boolean;
  showEditActions: boolean;
  allowNewEvolutions: boolean;
  compactView: boolean;
}

export interface HistoryContextType {
  userType: UserType;
  userData: UserData;
  antecedentes?: AntecedentesResponse;
  evoluciones?: EvolucionesResponse;
  permissions: HistoryPermissions;
  config: HistoryConfig;
  actions: {
    onEditEvolution?: (id: number) => void;
    onDeleteEvolution?: (id: number) => void;
    onAddEvolution?: () => void;
    onEditAntecedentes?: () => void;
  };
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const useHistoryContext = () => {
  const context = useContext(HistoryContext);
  if (!context) {
    throw new Error('useHistoryContext must be used within a HistoryProvider');
  }
  return context;
};

const getPermissionsByUserType = (userType: UserType): HistoryPermissions => {
  const noAccessPermissions = {
    canEditEvolutions: false,
    canViewMedication: false,
    canEditAntecedentes: false,
    canDeleteEvolutions: false,
    readOnlyMode: true,
  };

  switch (userType) {
    case 'doctor':
      return {
        canEditEvolutions: true,
        canViewMedication: true,
        canEditAntecedentes: true,
        canDeleteEvolutions: true,
        readOnlyMode: false,
      };
    case 'patient':
      // Los pacientes NO tienen acceso a historias clínicas
      return noAccessPermissions;
    default:
      return noAccessPermissions;
  }
};

const getConfigByUserType = (userType: UserType): HistoryConfig => {
  const noAccessConfig = {
    showMedicationSection: false,
    showEditActions: false,
    allowNewEvolutions: false,
    compactView: false,
  };

  switch (userType) {
    case 'doctor':
      return {
        showMedicationSection: true,
        showEditActions: true,
        allowNewEvolutions: true,
        compactView: false,
      };
    case 'patient':
      // Los pacientes NO tienen acceso a historias clínicas
      return noAccessConfig;
    default:
      return noAccessConfig;
  }
};

interface HistoryProviderProps {
  children: ReactNode;
  userType: UserType;
  userData: UserData;
  antecedentes?: AntecedentesResponse;
  evoluciones?: EvolucionesResponse;
  actions?: {
    onEditEvolution?: (id: number) => void;
    onDeleteEvolution?: (id: number) => void;
    onAddEvolution?: () => void;
    onEditAntecedentes?: () => void;
  };
}

export const HistoryProvider: React.FC<HistoryProviderProps> = ({
  children,
  userType,
  userData,
  antecedentes,
  evoluciones,
  actions = {},
}) => {
  const permissions = getPermissionsByUserType(userType);
  const config = getConfigByUserType(userType);

  const contextValue: HistoryContextType = {
    userType,
    userData,
    antecedentes,
    evoluciones,
    permissions,
    config,
    actions,
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
};