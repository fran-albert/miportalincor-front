import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";
import { DataValue } from "../Data-Value/Data-Value";
import { EvaluationType } from "../Evaluation-Type/Evaluation-Type";
import { MedicalAptitude } from "../Medical-Aptitude/Medical-Aptitude";
import { MedicalStudy } from "../Medical-Study/Medical-Study";
import { MedicalTest } from "../Medical-Test/Medical-Test";

export interface MedicalEvaluation extends Base {
    collaborator: Collaborator;
    generalConclusion?: string;
    recommendations?: string;
    evaluationType: EvaluationType;
    dataValues?: DataValue[];
    tests?: MedicalTest[];
    aptitudes?: MedicalAptitude[];
    studies?: MedicalStudy[];
}