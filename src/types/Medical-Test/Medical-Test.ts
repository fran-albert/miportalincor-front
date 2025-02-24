import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { MedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface MedicalTest extends Base {
    medicalEvaluation: MedicalEvaluation;
    testType: DataType;
    result: string;
}