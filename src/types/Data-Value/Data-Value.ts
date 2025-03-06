import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";

export interface DataValue extends Base {
    name: string
    dataType: DataType
    value: string
}

export interface CreateDataValueItemDto {
    id?: number;
    dataTypeId: number;
    value: string;
}

export interface CreateDataValuesDto {
    medicalEvaluationId: number;
    dataValues: CreateDataValueItemDto[];
}