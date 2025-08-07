import { ReactNode } from 'react';
import { HistoryProvider, UserType, UserData } from '@/contexts/HistoryContext';
import { AntecedentesResponse, EvolucionesResponse } from '@/types/Antecedentes/Antecedentes';
import HistoryBase from '../Base';
import BreadcrumbComponent from '@/components/Breadcrumb';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface HistoryWrapperProps {
  userType: UserType;
  userData: UserData;
  antecedentes?: AntecedentesResponse;
  evoluciones?: EvolucionesResponse;
  breadcrumbItems?: BreadcrumbItem[];
  actions?: {
    onEditEvolution?: (id: number) => void;
    onDeleteEvolution?: (id: number) => void;
    onAddEvolution?: () => void;
    onEditAntecedentes?: () => void;
  };
  children?: ReactNode;
}

export default function HistoryWrapper({
  userType,
  userData,
  antecedentes,
  evoluciones,
  breadcrumbItems,
  actions,
  children,
}: HistoryWrapperProps) {
  return (
    <HistoryProvider
      userType={userType}
      userData={userData}
      antecedentes={antecedentes}
      evoluciones={evoluciones}
      actions={actions}
    >
      <div className="container space-y-2 mt-2">
        {breadcrumbItems && <BreadcrumbComponent items={breadcrumbItems} />}
        
        <div className="gap-6">
          {children || <HistoryBase />}
        </div>
      </div>
    </HistoryProvider>
  );
}

// Componentes específicos para diferentes tipos de usuario
export function PatientHistoryWrapper({
  userData,
  antecedentes,
  evoluciones,
  breadcrumbItems,
}: Omit<HistoryWrapperProps, 'userType' | 'actions'>) {
  return (
    <HistoryWrapper
      userType="patient"
      userData={userData}
      antecedentes={antecedentes}
      evoluciones={evoluciones}
      breadcrumbItems={breadcrumbItems}
    />
  );
}

export function DoctorHistoryWrapper({
  userData,
  antecedentes,
  evoluciones,
  breadcrumbItems,
  actions,
}: Omit<HistoryWrapperProps, 'userType'>) {
  return (
    <HistoryWrapper
      userType="doctor"
      userData={userData}
      antecedentes={antecedentes}
      evoluciones={evoluciones}
      breadcrumbItems={breadcrumbItems}
      actions={actions}
    />
  );
}