export interface NutritionData {
    id: number;
    date: string;
    weight: number;
    difference: number;
    fatPercentage: number;
    musclePercentage: number;
    visceralFat: number;
    imc: number;
    targetWeight: number;
    observations: string;
}

export interface CreateNutritionDataDto {
    userId: number;
    date: string;
    weight?: number;
    difference?: number;
    fatPercentage?: number;
    musclePercentage?: number;
    visceralFat?: number;
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
    visceralFat?: number;
    imc?: number;
    targetWeight?: number;
    observations?: string;
}