import { Base } from "../Base/Base";
import { DataType } from "../Data-Type/Data-Type";

export interface DataValue extends Base {
    name: string
    dataType: DataType
    value: string
}