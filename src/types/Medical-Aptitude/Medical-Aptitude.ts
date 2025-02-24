import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { MedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface MedicalAptitude extends Base {
    medicalEvaluation: MedicalEvaluation;
    aptitudeType: DataType;
    value: string;
}