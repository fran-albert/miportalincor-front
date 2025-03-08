import { Base } from "../Base/Base";
import { MedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface EvaluationType extends Base {
    name: string
    evaluations?: MedicalEvaluation[];
}