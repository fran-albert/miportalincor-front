import { Base } from "../Base/Base";
import { ResponseMedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface Evolution extends Base {
  medicalEvaluation: ResponseMedicalEvaluation;
}

export interface EvolutionDataDto {
  fechaDiagnostico?: string;
  motivoConsulta?: string;
  notasEmpresa?: string;
  enfermedadActual?: string;
}

export interface CreateEvolutionDto {
  collaboratorId: number;
  doctorId: number;
  evolutionData: EvolutionDataDto;
}
