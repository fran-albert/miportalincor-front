import { apiIncorHC } from "@/services/axiosConfig";
import { parseCents } from "@/common/helpers/programMoney";
import {
  ProgramActivityCoverage,
  UpsertProgramActivityCoverageDto,
} from "@/types/Program/ProgramActivityCoverage";

const validateCoverageMoney = (
  coverage: ProgramActivityCoverage
): ProgramActivityCoverage => {
  parseCents(
    coverage.coveredUnitPriceCents,
    `Precio con cobertura de ${coverage.activityName}`
  );
  return coverage;
};

export const getProgramActivityCoverages = async (
  programId: string
): Promise<ProgramActivityCoverage[]> => {
  const { data } = await apiIncorHC.get<ProgramActivityCoverage[]>(
    `/programs/${programId}/coverages`
  );
  return data.map(validateCoverageMoney);
};

export const upsertProgramActivityCoverage = async (
  programId: string,
  activityId: string,
  healthInsuranceId: number,
  dto: UpsertProgramActivityCoverageDto
): Promise<ProgramActivityCoverage> => {
  const { data } = await apiIncorHC.put<ProgramActivityCoverage>(
    `/programs/${programId}/coverages/${activityId}/${healthInsuranceId}`,
    dto
  );
  return validateCoverageMoney(data);
};

export const deleteProgramActivityCoverage = async (
  programId: string,
  activityId: string,
  healthInsuranceId: number
): Promise<void> => {
  await apiIncorHC.delete(
    `/programs/${programId}/coverages/${activityId}/${healthInsuranceId}`
  );
};
