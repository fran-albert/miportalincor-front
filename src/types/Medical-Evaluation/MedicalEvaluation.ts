import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";
import { DataValue } from "../Data-Value/Data-Value";
import { EvaluationType } from "../Evaluation-Type/Evaluation-Type";

export interface MedicalEvaluation extends Base {
    collaborator: Collaborator;
    evaluationType: EvaluationType;
    dataValues?: DataValue[];
    completed: boolean
}