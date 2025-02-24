import { Base } from "../Base/Base";
import { DataValue } from "../Data-Value/Data-Value";
export type DataCategory = 'GENERAL' | 'HISTORIA_MEDICA' | 'EXAMEN_CLINICO' | 'EXAMEN_FISICO' | 'APTITUDES' | 'ESTUDIOS';
export type DataTypeEnum = 'STRING' | 'NUMBER' | 'BOOLEAN' | 'DATE';

export interface DataType extends Base {
    name: string
    category: DataCategory;
    dataType: DataTypeEnum,
    dataValues?: DataValue[]
}