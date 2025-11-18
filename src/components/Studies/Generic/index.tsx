import React from "react";
import { StudiesWithURL } from "@/types/Study/Study";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { Patient } from "@/types/Patient/Patient";
import { Doctor } from "@/types/Doctor/Doctor";
import { Collaborator } from "@/types/Collaborator/Collaborator";
import PatientStudies from "../index";
import useUserRole from "@/hooks/useRoles";
import LabCard from "@/components/Laboratories/Card/card";
import { useStudy } from "@/hooks/Study/useStudy";
import { useBloodTestData } from "@/hooks/Blod-Test-Data/useBlodTestData";
import { useBlodTest } from "@/hooks/Blod-Test/useBlodTest";

export type GenericStudiesUserType = "patient" | "doctor" | "personal" | "colaborador";
export type GenericStudiesUserData = Patient | Doctor | Collaborator;

interface GenericStudiesProps {
  userType: GenericStudiesUserType;
  userData?: GenericStudiesUserData;
  studies: StudiesWithURL[];
  studyTypes?: StudyType[];
  loading?: boolean;
  title?: string;
  role?: string;
  slug?: string;
  idUser?: number;
  onUploadStudy?: (
    files: FileList,
    studyTypeId: number,
    note?: string
  ) => Promise<void>;
  onViewStudy?: (study: StudiesWithURL) => void;
}

// Función para categorizar estudios de forma inteligente
const categorizeStudy = (studyTypeName?: string): string => {
  if (!studyTypeName) return "Otros";

  const studyType = studyTypeName.toLowerCase();

  // Imagenología - Solo estudios de imagen
  if (
    studyType.includes("ecograf") ||
    studyType.includes("radiograf") ||
    studyType.includes("tomograf") ||
    studyType.includes("resonancia") ||
    studyType.includes("rx ") ||
    studyType.includes("rx-")
  ) {
    return "Imagenología";
  }

  // Cardiología - Estudios del corazón
  if (
    studyType.includes("cardio") ||
    studyType.includes("electrocardiograma") ||
    studyType.includes("ecg") ||
    studyType.includes("ekg") ||
    studyType.includes("ergometr") ||
    studyType.includes("holter") ||
    studyType.includes("ecocardio")
  ) {
    return "Cardiología";
  }

  // Laboratorios - Análisis clínicos
  if (
    studyType.includes("laboratorio") ||
    studyType.includes("laboratorios") ||
    studyType.includes("análisis") ||
    studyType.includes("analisis") ||
    studyType.includes("hemograma") ||
    studyType.includes("sangre") ||
    studyType.includes("glucemia") ||
    studyType.includes("perfil") ||
    studyType.includes("orina") ||
    studyType.includes("hepatograma") ||
    studyType.includes("lipidograma")
  ) {
    return "Laboratorio";
  }

  // Neurología
  if (
    studyType.includes("neuro") ||
    studyType.includes("electroencefalograma") ||
    studyType.includes("eeg")
  ) {
    return "Neurología";
  }

  // Endocrinología
  if (
    studyType.includes("endocrin") ||
    studyType.includes("hormona") ||
    studyType.includes("tiroides") ||
    studyType.includes("tsh")
  ) {
    return "Endocrinología";
  }

  return "Otros";
};

// Transform StudiesWithURL to the format expected by PatientStudies
const transformStudiesToNewFormat = (studies: StudiesWithURL[]) => {
  return studies.map((study, index) => ({
    id: study.id || index,
    tipo: study.studyType?.name || "Estudio",
    categoria: categorizeStudy(study.studyType?.name),
    descripcion: study.note || "Sin descripción",
    fecha: new Date(study.date).toLocaleDateString("es-ES"),
    medico: "Dr. No especificado", // No viene del backend
    archivo: {
      nombre: study.locationS3?.split("/").pop() || "archivo.pdf",
      tipo: (study.locationS3?.includes(".pdf")
        ? "PDF"
        : study.locationS3?.includes(".jpg") ||
          study.locationS3?.includes(".png")
        ? "JPG"
        : "PDF") as "PDF" | "JPG" | "PNG" | "DICOM",
      tamaño: "1.0 MB",
      url: study.signedUrl || "#",
    },
    signedUrl: study.signedUrl,
    estado: "Completado" as const,
  }));
};

// Transform patient data to the format expected by PatientStudies
const transformPatientData = (userData?: GenericStudiesUserData) => {
  if (!userData) {
    return {
      name: "Usuario",
      age: 0,
      gender: "No especificado",
      id: "0",
      phone: "",
      address: "",
      birthDate: "",
      bloodType: "",
    };
  }

  // Helper function to calculate age from birthDate
  const calculateAge = (
    birthDate: Date | string | undefined | readonly string[]
  ): number => {
    if (!birthDate) return 0;
    let date: Date;

    if (typeof birthDate === "string") {
      date = new Date(birthDate);
    } else if (birthDate instanceof Date) {
      date = birthDate;
    } else {
      return 0;
    }

    const today = new Date();
    const age = today.getFullYear() - date.getFullYear();
    const monthDiff = today.getMonth() - date.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < date.getDate())
    ) {
      return age - 1;
    }
    return age;
  };

  // Check if it's a Patient
  if ("dni" in userData && "cuil" in userData) {
    const patient = userData as Patient;
    return {
      name: `${patient.firstName} ${patient.lastName}`,
      age: calculateAge(patient.birthDate),
      gender: patient.gender || "No especificado",
      id: patient.id?.toString() || "0",
      phone: patient.phoneNumber || "",
      address:
        typeof patient.address === "object"
          ? `${patient.address.street || ""} ${
              patient.address.number || ""
            }`.trim() || "Sin dirección"
          : "Sin dirección",
      birthDate:
        typeof patient.birthDate === "string"
          ? patient.birthDate
          : patient.birthDate instanceof Date
          ? patient.birthDate.toLocaleDateString("es-ES")
          : "",
      bloodType: patient.bloodType || "",
    };
  }

  // Check if it's a Doctor
  if ("matricula" in userData && "specialities" in userData) {
    const doctor = userData as Doctor;
    return {
      name: `${doctor.firstName} ${doctor.lastName}`,
      age: calculateAge(doctor.birthDate),
      gender: doctor.gender || "No especificado",
      id: doctor.id?.toString() || "0",
      phone: doctor.phoneNumber || "",
      address:
        typeof doctor.address === "object"
          ? `${doctor.address.street || ""} ${
              doctor.address.number || ""
            }`.trim() || "Sin dirección"
          : "Sin dirección",
      birthDate:
        typeof doctor.birthDate === "string"
          ? doctor.birthDate
          : doctor.birthDate instanceof Date
          ? doctor.birthDate.toLocaleDateString("es-ES")
          : "",
      bloodType: doctor.bloodType || "",
    };
  }

  // Check if it's a Collaborator
  if ("company" in userData && "positionJob" in userData) {
    const collaborator = userData as Collaborator;
    return {
      name: `${collaborator.firstName} ${collaborator.lastName}`,
      age: calculateAge(collaborator.birthDate),
      gender: collaborator.gender || "No especificado",
      id: collaborator.id?.toString() || "0",
      phone: collaborator.phone || "",
      address:
        typeof collaborator.addressData === "object"
          ? `${collaborator.addressData.street || ""} ${
              collaborator.addressData.number || ""
            }`.trim() || "Sin dirección"
          : "Sin dirección",
      birthDate:
        typeof collaborator.birthDate === "string"
          ? collaborator.birthDate
          : collaborator.birthDate instanceof Date
          ? collaborator.birthDate.toLocaleDateString("es-ES")
          : "",
      bloodType: "",
    };
  }

  return {
    name: "Usuario",
    age: 0,
    gender: "No especificado",
    id: "0",
    phone: "",
    address: "",
    birthDate: "",
    bloodType: "",
  };
};

const GenericStudies: React.FC<GenericStudiesProps> = ({
  userData,
  studies,
  role,
  idUser,
}) => {
  const { session, isDoctor } = useUserRole();

  // Get laboratory data for the third tab - ONLY if user is a doctor
  const { studiesByUserId = [], isLoading: isLoadingStudies } = useStudy({
    idUser: idUser || 0,
    fetchStudiesByUserId: !!idUser && isDoctor,
  });

  const studyIds = isDoctor ? studiesByUserId.map((study) => study.id) : [];

  const { bloodTestsData = [], isLoadingBloodTestsData } = useBloodTestData({
    auth: isDoctor,
    idStudies: studyIds,
  });

  const { blodTests = [], isLoading: isLoadingBloodTests } = useBlodTest({
    auth: isDoctor,
  });

  // Transform data to the new component format
  const transformedStudies = transformStudiesToNewFormat(studies);
  const transformedPatientData = transformPatientData(userData);

  // Simple back function - just refresh or go back in history
  const handleBack = () => {
    window.history.back();
  };

  // Create lab table component for the third tab
  const labTableComponent =
    idUser &&
    !isLoadingStudies &&
    !isLoadingBloodTestsData &&
    !isLoadingBloodTests ? (
      <LabCard
        studiesByUserId={studiesByUserId}
        bloodTestsData={bloodTestsData}
        bloodTests={blodTests}
        role={role || "pacientes"}
        idUser={idUser}
      />
    ) : idUser ? (
      <div className="flex justify-center items-center h-32">
        <div className="text-gray-500">Cargando datos de laboratorio...</div>
      </div>
    ) : null;

  return (
    <div className="w-full">
      <PatientStudies
        onBack={handleBack}
        patientData={transformedPatientData}
        initialStudies={transformedStudies.filter(
          (study) => study.categoria !== "Laboratorio"
        )}
        initialLaboratories={transformedStudies
          .filter((study) => study.categoria === "Laboratorio")
          .map((study) => ({
            id: study.id,
            tipo: study.tipo,
            fecha: study.fecha,
            laboratorio: study.medico,
            medico: study.medico,
            parametros: [],
            archivo: study.archivo,
            signedUrl: study.signedUrl,
            estado: study.estado,
          }))}
        userRole={session?.role || []}
        canDelete={true}
        labTableComponent={labTableComponent}
        studiesWithURL={studies}
        patient={
          userData && "dni" in userData ? (userData as Patient) : undefined
        }
      />
    </div>
  );
};

export default GenericStudies;
