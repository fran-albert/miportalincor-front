import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";
import { UserHistoriaClinica } from "../User-Historia-Clinica/User-Historia-Clinica";

export interface DataValue extends Base {
    name: string
    dataType: DataType
    value: string
    observations?: string
}

// Incor HC DataValue interface
export interface DataValueHC extends Base {
    idUserHistoriaClinica: string;
    idDataType: string;
    value: string;
    observaciones?: string;
    dataType: DataType;
    userHistoriaClinica: UserHistoriaClinica;
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

// Incor HC DTOs
export interface CreateDataValueHCItemDto {
    idDataType: string;
    value: string;
    observaciones?: string;
}

export interface CreateDataValuesHCDto {
    idUser: string;
    idDoctor: string;
    dataValues: CreateDataValueHCItemDto[];
}

export interface UpdateDataValueHCDto {
    value?: string;
    observaciones?: string;
}