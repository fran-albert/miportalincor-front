import { useState, useEffect, useCallback } from 'react';
import useUserRole from '@/hooks/useRoles';
import { ActiveHomeView, RoleViewConfig } from '@/types/Home/Home';

const STORAGE_KEY = 'activeHomeView';

export const useActiveHomeView = () => {
  const { isPatient, isDoctor, isSecretary, isAdmin } = useUserRole();

  const hasProfessionalRole = isDoctor || isSecretary || isAdmin;
  const hasPatientRole = isPatient;
  const hasDualRole = hasProfessionalRole && hasPatientRole;

  const getProfessionalRoleLabel = (): string => {
    if (isAdmin) return 'Administrador';
    if (isSecretary) return 'Secretaria';
    if (isDoctor) return 'Médico';
    return 'Profesional';
  };

  const getInitialView = (): ActiveHomeView => {
    if (!hasDualRole) {
      return hasProfessionalRole ? 'professional' : 'patient';
    }
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'professional' || stored === 'patient') {
      return stored;
    }
    return 'professional';
  };

  const [activeView, setActiveView] = useState<ActiveHomeView>(getInitialView);

  useEffect(() => {
    if (hasDualRole) {
      localStorage.setItem(STORAGE_KEY, activeView);
    }
  }, [activeView, hasDualRole]);

  const switchView = useCallback((view: ActiveHomeView) => {
    setActiveView(view);
  }, []);

  const config: RoleViewConfig = {
    hasProfessionalRole,
    hasPatientRole,
    hasDualRole,
    professionalRoleLabel: getProfessionalRoleLabel(),
  };

  return {
    activeView,
    switchView,
    config,
  };
};
