export interface Lab {
  id?: number;
  date?: string;
  idStudy?: number;
  globulosRojos: string;
  globulosBlancos: string;
  hemoglobina: string;
  hematocrito: string;
  vcm: string;
  hcm: string;
  chcm: string;
  neutrofilosCayados: string;
  neutrofilosSegmentados: string;
  eosinofilos: string;
  basofilos: string;
  linfocitos: string;
  monocitos: string;
  eritrosedimentacion2: string;
  eritrosedimentacion1: string;
  plaquetas: string;
  glucemia: string;
  uremia: string;
  creatininemia: string;
  creatinfosfoquinasa: string;
  colesterolTotal: string;
  colesterolHdl: string;
  colesterolLdl: string;
  trigliceridos: string;
  uricemia: string;
  bilirrubinaDirecta: string;
  bilirrubinaIndirecta: string;
  bilirrubinaTotal: string;
  amilasemia: string;
  glutamilTranspeptidasa: string;
  nucleotidasa: string;
  transaminasaGlutamicoOxalac: string;
  transaminasaGlutamicoPiruvic: string;
  fosfatasaAlcalina: string;
  tirotrofinaPlamatica: string;
  sodio: string;
  potasio: string;
  cloroPlasmatico: string;
  calcemiaTotal: string;
  magnesioSangre: string;
  proteinasTotales: string;
  albumina: string;
  pseudocolinesterasa: string;
  ferritina: string;
  transferrina: string;
  saturacionTransferrina: string;
  ferremia: string;
  tiroxinaEfectiva: string;
  tiroxinaTotal: string;
  hemoglobinaGlicosilada: string;
  antigenoProstaticoEspecifico: string;
  psaLibre: string;
  relacionPsaLibre: string;
  vitaminaD3: string;
  cocienteAlbumina: string;
  tiempoCoagulacion: string;
  tiempoSangria: string;
  tiempoProtrombina: string;
  tiempoTromboplastina: string;
}

export const columNames: Lab = {
  globulosRojos: "Glóbulos Rojos",
  globulosBlancos: "Glóbulos Blancos",
  hemoglobina: "Hemoglobina",
  hematocrito: "Hematocrito",
  vcm: "V.C.M.",
  hcm: "H.C.M.",
  chcm: "C.H.C.M.",
  neutrofilosCayados: "Neutrófilos Cayados",
  neutrofilosSegmentados: "Neutrófilos Segmentados",
  eosinofilos: "Eosinófilos",
  basofilos: "Basófilos",
  linfocitos: "Linfocitos",
  monocitos: "Monocitos",
  eritrosedimentacion1: "Eritrosedimentación 1",
  eritrosedimentacion2: "Eritrosedimentación 2",
  plaquetas: "Plaquetas",
  glucemia: "Glucemia",
  uremia: "Uremia",
  creatininemia: "Creatininemia",
  creatinfosfoquinasa: "Creatinfosfoquinasa",
  colesterolTotal: "Colesterol Total",
  colesterolHdl: "Colesterol HDL",
  colesterolLdl: "Colesterol LDL",
  trigliceridos: "Triglicéridos",
  uricemia: "Uricemia",
  bilirrubinaDirecta: "Bilirrubina Directa",
  bilirrubinaIndirecta: "Bilirrubina Indirecta",
  bilirrubinaTotal: "Bilirrubina Total",
  amilasemia: "Amilasemia",
  glutamilTranspeptidasa: "Glutamil Transpeptidasa",
  nucleotidasa: "Nucleotidasa",
  transaminasaGlutamicoOxalac: "Transaminasa Glutámico Oxalacética",
  transaminasaGlutamicoPiruvic: "Transaminasa Glutámico Pirúvica",
  fosfatasaAlcalina: "Fosfatasa Alcalina",
  tirotrofinaPlamatica: "Tirotrofina Plasmática",
  sodio: "Sodio",
  potasio: "Potasio",
  cloroPlasmatico: "Cloro Plasmático",
  calcemiaTotal: "Calcemia Total",
  magnesioSangre: "Magnesio en Sangre",
  proteinasTotales: "Proteínas Totales",
  albumina: "Albumina",
  pseudocolinesterasa: "Pseudocolinesterasa",
  ferremia: "Ferremia",
  ferritina: "Ferritina",
  transferrina: "Transferrina",
  saturacionTransferrina: "Saturación de Transferrina",
  tiroxinaEfectiva: "Tiroxina Efectiva - T4 Libre",
  tiroxinaTotal: "Tiroxina Total",
  hemoglobinaGlicosilada: "Hemoglobina Glicosilada",
  antigenoProstaticoEspecifico: "Antígeno Prostático Específico - PSA",
  psaLibre: "PSA Libre",
  relacionPsaLibre: "Relación PSA Libre",
  vitaminaD3: "Vitamina D3",
  cocienteAlbumina: "Cociente Albumina",
  tiempoCoagulacion: "Tiempo de Coagulación",
  tiempoSangria: "Tiempo de Sangría",
  tiempoProtrombina: "Tiempo de Protrombina",
  tiempoTromboplastina: "Tiempo de Tromboplastina",
};

export const units: Lab = {
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

export const referenceValues: Lab = {
  globulosRojos: "4.3 - 5.5",
  globulosBlancos: "4.0 - 9.0",
  hemoglobina: "11.5 - 16.0",
  hematocrito: "36 - 54",
  vcm: "No especificado",
  hcm: "No especificado",
  chcm: "No especificado",
  neutrofilosCayados: "0 - 5%",
  neutrofilosSegmentados: "45 - 75%",
  eosinofilos: "0 - 7%",
  basofilos: "0 - 2%",
  linfocitos: "20 - 45%",
  monocitos: "0 - 10%",
  eritrosedimentacion1: "0 - 20 mm/hora",
  eritrosedimentacion2: "No especificado",
  plaquetas: "150,000 - 400,000",
  glucemia: "0.7 - 1.1",
  uremia: "0.15 - 0.55",
  creatininemia: "7 - 13",
  creatinfosfoquinasa: "Hombres: < 195 U/l\nMujeres: < 170 U/l",
  colesterolTotal: "Deseable hasta 200",
  colesterolHdl: "> 40 (Recomendable)\n> 60 (Protectivo)",
  colesterolLdl:
    "< 129 (Riesgo bajo)\n130 - 189 (Riesgo moderado)\n> 190 (Riesgo elevado)",
  trigliceridos:
    "< 150 (Deseable)\n150 - 499 (Moderadamente elevado)\n> 500 (Elevado)",
  uricemia: "Hombre: 25 - 60\nMujer: 20 - 50",
  bilirrubinaDirecta: "Menor de 2.5",
  bilirrubinaIndirecta: "Menor de 7.5",
  bilirrubinaTotal: "Menor de 10.0",
  amilasemia: "Suero: Hasta 125\nOrina: Hasta 680",
  glutamilTranspeptidasa: "Mujer: < 32\nHombre: < 60",
  nucleotidasa: "Hasta 10 U/l",
  transaminasaGlutamicoOxalac: "Mujer: < 32\nHombre: < 40",
  transaminasaGlutamicoPiruvic: "Mujer: < 33\nHombre: < 41",
  fosfatasaAlcalina: "Mujeres: 65 - 300\nHombres: 65 - 300\nNiños: Hasta 645",
  tirotrofinaPlamatica: "Adultos: 0.27 - 4.20",
  sodio: "135 - 145",
  potasio: "3.5 - 5.0",
  cloroPlasmatico: "95.0 - 105.0",
  calcemiaTotal: "8.6 - 10.5",
  magnesioSangre: "1.90 - 2.50",
  proteinasTotales: "6.1 - 7.9",
  albumina: "3.5 - 4.8",
  ferritina: "Hombres: 30 - 400\nMujeres: 10 - 150",
  transferrina: "200 - 360 ug/dl",
  saturacionTransferrina: "20 - 25%",
  ferremia: "Masculino: 59 - 158 ug/dl\nFemenino: 37 - 145 ug/dl",
  tiroxinaEfectiva: "0.93 - 1.70",
  tiroxinaTotal: "Adultos: 5.3 - 11.5",
  hemoglobinaGlicosilada: "4.8 - 5.9",
  antigenoProstaticoEspecifico:
    "Menor de 40 años: Hasta 1.4\n40-49 años: Hasta 2.00\n50-59 años: Hasta 3.1\n60-69 años: Hasta 4.1\nMayores de 70 años: Hasta 4.4",
  psaLibre: "No especificado",
  relacionPsaLibre: "> 0.15",
  vitaminaD3:
    "< 15 (Deficiente)\n15-30 (Insuficiente)\n30-100 (Suficiente)\n> 100 (Toxicidad)",
  pseudocolinesterasa: "4970 - 13977",
  cocienteAlbumina: "< 20 mg/g",
  tiempoCoagulacion: "Hasta 17 min",
  tiempoSangria: "Hasta 4 min",
  tiempoProtrombina: "No especificado",
  tiempoTromboplastina: "33 - 48",
};
