export interface NutritionData {
    id: number;
    date: string | Date;
    weight: number;
    difference: number;
    fatPercentage: number;
    musclePercentage: number;
    visceralFat: number;
    imc: number;
    height: number
    targetWeight: number;
    observations: string;
}

export interface CreateNutritionDataDto {
    userId: number;
    date: string;
    weight: number;
    difference?: number;
    fatPercentage?: number;
    musclePercentage?: number;
    visceralFat?: number;
    height: number
    imc?: number;
    targetWeight?: number;
    observations?: string;
}

export interface UpdateNutritionDataDto {
    id?: number;
    userId: number;
    date: string;
    weight?: number;
    difference?: number;
    fatPercentage?: number;
    musclePercentage?: number;
    height?: number
    visceralFat?: number;
    imc?: number;
    targetWeight?: number;
    observations?: string;
}