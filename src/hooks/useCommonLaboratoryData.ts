import { usePatient } from "@/hooks/Patient/usePatient";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useStudy } from "@/hooks/Study/useStudy";
import { useBloodTestData } from "./Blod-Test-Data/useBlodTestData";

export const useCommonLaboratoryData = ({ id, role }: { id: number, role: "paciente" | "medico" }) => {
  // SIEMPRE llamar ambos hooks, pero habilitar solo el que corresponde
  const { patient, isLoading: isLoadingPatient, error: patientError } = usePatient({
    auth: true,
    id,
    enabled: role === "paciente"
  });

  const { doctor, isLoading: isLoadingDoctor, error: doctorError } = useDoctor({
    auth: true,
    id,
    enabled: role === "medico"
  });

  const { studiesByUserId = [], isLoading: isLoadingStudies } = useStudy({
    idUser: id,
    fetchStudiesByUserId: true,
  });

  const studyIds = studiesByUserId.map((study) => study.id);

  const { bloodTestsData, isLoadingBloodTestsData: isLoadingBloodTest } = useBloodTestData({
    auth: true,
    idStudies: studyIds,
  });

  const isLoading = isLoadingPatient || isLoadingDoctor || isLoadingStudies || isLoadingBloodTest;
  const error = patientError || doctorError;

  return {
    patient,
    doctor,
    studiesByUserId,
    bloodTestsData,
    isLoading,
    error
  };
};
