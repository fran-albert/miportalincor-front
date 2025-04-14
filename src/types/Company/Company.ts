import { Address } from "../Address/Address";
import { Base } from "../Base/Base";
import { Collaborator } from "../Collaborator/Collaborator";

export interface Company extends Base {
    name: string
    taxId: string;
    address: string;
    addressData: Address
    phone: string;
    email?: string
    collaborator: Collaborator[]
}

export interface CreateCompanyDto {
    name: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
}