export interface ProgramActivityCoverage {
  id: string;
  activityId: string;
  activityName: string;
  healthInsuranceId: number;
  healthInsuranceName?: string;
  coveredSessionsPerMonth: number;
  coveredUnitPriceCents: string;
}

export interface UpsertProgramActivityCoverageDto {
  coveredSessionsPerMonth: number;
  coveredUnitPriceCents: string;
}
