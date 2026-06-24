import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";
import { DataValue } from "../Data-Value/Data-Value";
import { EvaluationType } from "../Evaluation-Type/Evaluation-Type";
import { ReportVisibilityOverrides } from "@/common/helpers/report-visibility";

export interface MedicalEvaluation extends Base {
    collaborator: Collaborator;
    evaluationType: EvaluationType;
    dataValues?: DataValue[];
    completed: boolean
    doctorId: number;
    reportVisibilityOverrides?: ReportVisibilityOverrides | null;
}

export interface ResponseMedicalEvaluation extends Base {
    evaluationType: EvaluationType;
    dataValues: DataValue[];
    completed: boolean
    doctorId: number;
    reportVisibilityOverrides?: ReportVisibilityOverrides | null;
}
