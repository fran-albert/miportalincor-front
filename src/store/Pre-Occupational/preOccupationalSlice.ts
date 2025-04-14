import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface ExamResults {
  clinico: string;
  "electrocardiograma-result": string;
  laboratorio: string;
  "rx-torax": string;
  electroencefalograma: string;
  psicotecnico: string;
  audiometria: string;
}

export interface OccupationalHistoryItem {
  id: string;
  description: string;
}

interface WorkerInformation {
  lugarNacimiento: string;
  nacionalidad: string;
  gradoInstruccion: string;
  domicilio: string;
  seguro: string;
  nroAfiliacion: string;
  estadoCivil: string;
  nroHijos: number;
  nroDependientes: number;
}

export interface ExamenClinico {
  talla: string;
  peso: string;
  imc: string;
  perimetroAbdominal: string,
  frecuenciaCardiaca: string,
  frecuenciaRespiratoria: string,
  presionSistolica: string,
  presionDiastolica: string,
}

interface ExamenFisicoItem {
  selected: "si" | "no" | "";
  observaciones: string;
}

export interface IMedicalEvaluation {
  aspectoGeneral: string;
  tiempoLibre: string;
  examenClinico: ExamenClinico;
  examenFisico: Record<string, ExamenFisicoItem>;
}

interface InstitutionInformation {
  institucion: string;
  direccion: string;
  provincia: string;
  ciudad: string;
}

interface FormData {
  puesto: string;
  area: string;
  antiguedad: string;
  tiempo: string;
  evaluationType: string;
  testsPerformed: {
    examenFisico: boolean;
    glucemia: boolean;
    tuberculosis: boolean;
    espirometria: boolean;
    capacidadFisica: boolean;
    examenVisual: boolean;
    radiografia: boolean;
    otros: boolean;
    audiometria: boolean;
    hemograma: boolean;
    historiaClinica: boolean;
    examenOrina: boolean;
    electrocardiograma: boolean;
    panelDrogas: boolean;
    hepaticas: boolean;
    psicotecnico: boolean;
  };
  otrasPruebas: string;
  examResults: ExamResults;
  conclusion: string;
  recomendaciones: string;
  institutionInformation: InstitutionInformation;
  workerInformation: WorkerInformation;
  occupationalHistory: OccupationalHistoryItem[];
  medicalEvaluation: IMedicalEvaluation;
  [key: string]: any;
}

interface PreOccupationalState {
  collaborator: any;
  formData: FormData;
}

const initialState: PreOccupationalState = {
  collaborator: null,
  formData: {
    puesto: "",
    area: "",
    antiguedad: "",
    tiempo: "",
    evaluationType: "preocupacional",
    testsPerformed: {
      examenFisico: false,
      glucemia: false,
      tuberculosis: false,
      espirometria: false,
      capacidadFisica: false,
      examenVisual: false,
      radiografia: false,
      otros: false,
      audiometria: false,
      hemograma: false,
      historiaClinica: false,
      examenOrina: false,
      electrocardiograma: false,
      panelDrogas: false,
      hepaticas: false,
      psicotecnico: false,
    },
    otrasPruebas: "",
    examResults: {
      clinico: "",
      "electrocardiograma-result": "",
      laboratorio: "",
      "rx-torax": "",
      electroencefalograma: "",
      psicotecnico: "",
      audiometria: "",
    },
    conclusion: "",
    recomendaciones: "",
    institutionInformation: {
      institucion: "",
      direccion: "",
      provincia: "",
      ciudad: "",
    },
    workerInformation: {
      lugarNacimiento: "",
      nacionalidad: "",
      gradoInstruccion: "",
      domicilio: "",
      seguro: "",
      nroAfiliacion: "",
      estadoCivil: "",
      nroHijos: 0,
      nroDependientes: 0,
    },
    occupationalHistory: [],
    medicalEvaluation: {
      aspectoGeneral: "",
      tiempoLibre: "",
      examenClinico: {
        talla: "",
        peso: "",
        imc: "",
        frecuenciaCardiaca: "",
        frecuenciaRespiratoria: "",
        perimetroAbdominal: "",
        presionDiastolica: "",
        presionSistolica: ""
      },
      examenFisico: {},
    },
  },
};

const preOccupationalSlice = createSlice({
  name: "preOccupational",
  initialState,
  reducers: {
    setCollaborator(state, action: PayloadAction<any>) {
      state.collaborator = action.payload;
    },
    setFormData(state, action: PayloadAction<Partial<FormData>>) {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm(state) {
      state.formData = initialState.formData;
    },
    addOccupationalHistory(
      state,
      action: PayloadAction<OccupationalHistoryItem>
    ) {
      state.formData.occupationalHistory.push(action.payload);
    },
  },
});

export const {
  setCollaborator,
  setFormData,
  resetForm,
  addOccupationalHistory,
} = preOccupationalSlice.actions;

export default preOccupationalSlice.reducer;
