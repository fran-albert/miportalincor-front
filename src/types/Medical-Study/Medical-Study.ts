import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { MedicalEvaluation } from "../Medical-Evaluation/MedicalEvaluation";

export interface MedicalStudy extends Base {
    medicalEvaluation: MedicalEvaluation;
    studyType: DataType;
    result: string;
  }
  