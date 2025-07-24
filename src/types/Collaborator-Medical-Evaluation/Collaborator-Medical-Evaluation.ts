import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";
import { MedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface CollaboratorMedicalEvaluation extends Base {
    collaborator: Collaborator
    medicalEvaluation: MedicalEvaluation
}

export interface CollaboratorMedicalEvaluationDto {
    collaboratorId: number;
    evaluationTypeId: number;
    doctorId: number;
}