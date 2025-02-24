import { Address } from "@/types/Address/Address";
import { Base } from "../Base/Base";
import { Company } from "../Company/Company";

export interface Collaborator extends Base {
    firstName: string;
    lastName: string;
    email: string;
    slug?: string;
    birthDate: Date | string
    phone: string;
    address: Address | string;
    userName: string;
    gender: string;
    company: Company
}
