import React from 'react';
import { StudiesUserType, StudiesUserData } from '@/contexts/StudiesContext';
import { StudiesWithURL } from '@/types/Study/Study';
import { StudyType } from '@/types/Study-Type/Study-Type';
import { BreadcrumbItem } from '../Wrapper';
import { 
  StudiesWrapper, 
  PatientStudiesWrapper, 
  DoctorStudiesWrapper, 
  PersonalStudiesWrapper 
} from '../Wrapper';
import StudiesBase from '../Base';

interface StudiesPageProps {
  userType: StudiesUserType;
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  title?: string;
  role?: string;
  slug?: string;
  idUser?: number;
  showUserInfo?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  onUploadStudy?: (files: FileList, studyTypeId: number, note?: string) => Promise<void>;
  onDeleteStudy?: (studyId: number) => Promise<void>;
  onEditStudy?: (studyId: number) => void;
  onRefresh?: () => void;
}

const StudiesPage: React.FC<StudiesPageProps> = ({
  userType,
  userData,
  studies,
  studyTypes = [],
  loading = false,
  title,
  role,
  slug,
  idUser,
  showUserInfo = false,
  breadcrumbItems,
  onUploadStudy,
  onDeleteStudy,
  onEditStudy,
  onRefresh,
}) => {
  const commonProps = {
    userData,
    studies,
    studyTypes,
    loading,
    breadcrumbItems,
    onUploadStudy,
    onDeleteStudy,
    onRefresh,
  };

  const renderContent = () => (
    <StudiesBase
      title={title}
      role={role}
      slug={slug}
      idUser={idUser}
      showUserInfo={showUserInfo}
    />
  );

  switch (userType) {
    case 'doctor':
      return (
        <DoctorStudiesWrapper
          {...commonProps}
          userData={userData!}
          role={role}
          slug={slug}
          idUser={idUser}
          onEditStudy={onEditStudy}
        >
          {renderContent()}
        </DoctorStudiesWrapper>
      );

    case 'patient':
      return (
        <PatientStudiesWrapper
          {...commonProps}
          role={role}
          slug={slug}
          idUser={idUser}
        >
          {renderContent()}
        </PatientStudiesWrapper>
      );

    case 'personal':
      return (
        <PersonalStudiesWrapper
          {...commonProps}
          breadcrumbItems={breadcrumbItems}
        >
          {renderContent()}
        </PersonalStudiesWrapper>
      );

    default:
      return (
        <StudiesWrapper
          userType={userType}
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
          {renderContent()}
        </StudiesWrapper>
      );
  }
};

// Convenience components for specific use cases
interface PatientStudiesPageProps {
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  title?: string;
  role?: string;
  slug?: string;
  idUser?: number;
  showUserInfo?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  onUploadStudy?: (files: FileList, studyTypeId: number, note?: string) => Promise<void>;
  onDeleteStudy?: (studyId: number) => Promise<void>;
  onRefresh?: () => void;
}

export const PatientStudiesPage: React.FC<PatientStudiesPageProps> = (props) => (
  <StudiesPage {...props} userType="patient" />
);

interface DoctorStudiesPageProps {
  userData: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  title?: string;
  role?: string;
  slug?: string;
  idUser?: number;
  showUserInfo?: boolean;
  breadcrumbItems: BreadcrumbItem[];
  onUploadStudy?: (files: FileList, studyTypeId: number, note?: string) => Promise<void>;
  onDeleteStudy?: (studyId: number) => Promise<void>;
  onEditStudy?: (studyId: number) => void;
  onRefresh?: () => void;
}

export const DoctorStudiesPage: React.FC<DoctorStudiesPageProps> = (props) => (
  <StudiesPage {...props} userType="doctor" />
);

interface PersonalStudiesPageProps {
  userData?: StudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  title?: string;
  breadcrumbItems?: BreadcrumbItem[];
}

export const PersonalStudiesPage: React.FC<PersonalStudiesPageProps> = (props) => (
  <StudiesPage {...props} userType="personal" breadcrumbItems={props.breadcrumbItems || []} />
);

export default StudiesPage;