import { usePatient } from "@/hooks/Patient/usePatient";
import { useDoctor } from "@/hooks/Doctor/useDoctor";
import { useStudy } from "@/hooks/Study/useStudy";
import { useLab } from "@/hooks/Labs/useLab";

export const useCommonLaboratoryData = ({ id, role }: { id: number, role: "paciente" | "medico" }) => {
  const { patient, isLoading: isLoadingPatient, error: patientError } = role === "paciente"
    ? usePatient({ auth: true, id })
    : { patient: null, isLoading: false, error: null };

  const { doctor, isLoading: isLoadingDoctor, error: doctorError } = role === "medico"
    ? useDoctor({ auth: true, id })
    : { doctor: null, isLoading: false, error: null };

  const { studiesByUserId = [], isLoadingStudiesByUserId: isLoadingStudies } = useStudy({
    idUser: id,
    fetchStudiesByUserId: true,
  });

  const studyIds = studiesByUserId.map((study) => study.id);

  const { labsDetails, isLoadingLabsDetails: isLoadingLabs } = useLab({
    fetchLabsDetails: true,
    idStudy: studyIds,
  });

  const isLoading = isLoadingPatient || isLoadingDoctor || isLoadingStudies || isLoadingLabs;
  const error = patientError || doctorError;

  return {
    patient,
    doctor,
    studiesByUserId,
    labsDetails,
    isLoading,
    error
  };
};
