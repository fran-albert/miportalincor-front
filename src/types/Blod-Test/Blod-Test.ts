import { Unit } from "../Unit/Unit";

export interface BloodTest {
    id?: number;
    parsedName?: string;
    originalName: string;
    unit?: Unit;
    unitId?: number;
    referenceValue?: string;
}

export interface BloodTestMutationPayload {
    originalName: string;
    parsedName: string;
    unitId: number;
    referenceValue?: string;
}


export const units = {
    globulosRojos: "millones/mm³",
    globulosBlancos: "miles/mm³",
    hemoglobina: "g/dL",
    hematocrito: "%",
    vcm: "um³",
    hcm: "pg",
    chcm: "g/dL",
    neutrofilosCayados: "%",
    neutrofilosSegmentados: "%",
    eosinofilos: "%",
    basofilos: "%",
    linfocitos: "%",
    monocitos: "%",
    eritrosedimentacion1: "mm/hora",
    eritrosedimentacion2: "mm/hora",
    plaquetas: "/mm³",
    glucemia: "g/L",
    uremia: "g/L",
    creatininemia: "mg/L",
    creatinfosfoquinasa: "U/L",
    colesterolTotal: "mg/dL",
    colesterolHdl: "mg/dL",
    colesterolLdl: "mg/dL",
    trigliceridos: "mg/dL",
    uricemia: "mg/L",
    bilirrubinaDirecta: "mg/L",
    bilirrubinaIndirecta: "mg/L",
    bilirrubinaTotal: "mg/L",
    amilasemia: "U/L",
    glutamilTranspeptidasa: "U/L",
    nucleotidasa: "U/L",
    transaminasaGlutamicoOxalac: "U/L",
    transaminasaGlutamicoPiruvic: "U/L",
    fosfatasaAlcalina: "U/L",
    tirotrofinaPlamatica: "uUI/mL",
    sodio: "meq/L",
    potasio: "meq/L",
    cloroPlasmatico: "meq/L",
    calcemiaTotal: "mg/dL",
    magnesioSangre: "mg/dL",
    proteinasTotales: "g/L",
    albumina: "g/dL",
    pseudocolinesterasa: "U/L",
    ferremia: "ug/dL",
    ferritina: "ng/mL",
    transferrina: "ug/dL",
    saturacionTransferrina: "%",
    tiroxinaEfectiva: "ng/dL",
    tiroxinaTotal: "ug/dL",
    hemoglobinaGlicosilada: "%",
    antigenoProstaticoEspecifico: "ng/mL",
    psaLibre: "ng/mL",
    relacionPsaLibre: "%",
    vitaminaD3: "ng/mL",
    cocienteAlbumina: "mg/g",
    tiempoCoagulacion: "minutos",
    tiempoSangria: "minutos",
    tiempoProtrombina: "segundos",
    tiempoTromboplastina: "segundos",
};
