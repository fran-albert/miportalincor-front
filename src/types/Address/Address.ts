import { City } from "../City/City";

export interface Address {
  id: number;
  street: string;
  number: string;
  description: string;
  phoneNumber: string;
  city: City;
}
