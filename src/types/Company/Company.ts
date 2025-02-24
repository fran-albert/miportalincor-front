import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";

export interface Company extends Base {
    name: string
    taxId: string;
    address: string;
    phone: number;
    email?: string
    collaborator: Collaborator[]
}