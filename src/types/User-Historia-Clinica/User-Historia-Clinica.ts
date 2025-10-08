import { Base } from "../Base/Base";
import { DataValue } from "../Data-Value/Data-Value";

export interface UserHistoriaClinica extends Base {
    idUser: string | number;
    idDoctor: string | number;
    dataValues?: DataValue[]
}