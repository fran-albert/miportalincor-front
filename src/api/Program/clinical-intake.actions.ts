import { apiIncorHC } from "@/services/axiosConfig";
import {
  CreateMeasurementDto,
  MeasurementResponse,
  MeasurementSeries,
  MedicalEvaluationDetail,
  MedicalEvaluationResponse,
  UpsertMedicalEvaluationDto,
} from "@/types/Program/ProgramClinicalIntake";

export const getMedicalEvaluation = async (
  enrollmentId: string
): Promise<MedicalEvaluationDetail> => {
  const { data } = await apiIncorHC.get<MedicalEvaluationDetail>(
    `/enrollments/${enrollmentId}/medical-evaluation`
  );
  return data;
};

export const createMedicalEvaluation = async (
  enrollmentId: string,
  dto: UpsertMedicalEvaluationDto
): Promise<MedicalEvaluationResponse> => {
  const { data } = await apiIncorHC.post<MedicalEvaluationResponse>(
    `/enrollments/${enrollmentId}/medical-evaluation`,
    dto
  );
  return data;
};

export const updateMedicalEvaluation = async (
  enrollmentId: string,
  dto: UpsertMedicalEvaluationDto
): Promise<MedicalEvaluationResponse> => {
  const { data } = await apiIncorHC.put<MedicalEvaluationResponse>(
    `/enrollments/${enrollmentId}/medical-evaluation`,
    dto
  );
  return data;
};

export const getMeasurements = async (
  enrollmentId: string
): Promise<MeasurementSeries> => {
  const { data } = await apiIncorHC.get<MeasurementSeries>(
    `/enrollments/${enrollmentId}/measurements`
  );
  return data;
};

export const createMeasurement = async (
  enrollmentId: string,
  dto: CreateMeasurementDto
): Promise<MeasurementResponse> => {
  const { data } = await apiIncorHC.post<MeasurementResponse>(
    `/enrollments/${enrollmentId}/measurements`,
    dto
  );
  return data;
};
