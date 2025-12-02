import { BloodTest } from "../Blod-Test/Blod-Test";
import { Study } from "../Study/Study";

export interface BloodTestData {
    id?: number | string;
    value: string;
    bloodTest: BloodTest;
    study: Study;
}

export interface BloodTestDataRequest {
    userId: number;
    note: string;
    date: string;
    bloodTestDatas: {
        id: number;
        value: string;
        idBloodTest: number
    }[]
}

export interface BloodTestDataUpdateRequestItem {
    id: number;
    value: string;
    idBloodtest: number;
}

export type BloodTestDataUpdateRequest = BloodTestDataUpdateRequestItem[];

export interface BloodTestDatum {
    id: number;
    value: string;
    bloodTest: BloodTest;
}

export interface BloodTestDataResponse {
    study: Study;
    bloodTestData: BloodTestDatum[];
}
