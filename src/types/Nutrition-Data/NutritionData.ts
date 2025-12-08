export interface NutritionData {
    id: string;
    userId: string;
    date: string | Date;
    weight: number;
    difference: number;
    fatPercentage: number;
    musclePercentage: number;
    visceralFat: number;
    imc: number;
    height: number;
    targetWeight: number;
    observations: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateNutritionDataDto {
    userId: string;
    date: string;
    weight?: number;
    height?: number;
    difference?: number;
    fatPercentage?: number;
    musclePercentage?: number;
    visceralFat?: number;
    imc?: number;
    targetWeight?: number;
    observations?: string;
}

export interface UpdateNutritionDataDto {
    date?: string;
    weight?: number;
    height?: number;
    difference?: number;
    fatPercentage?: number;
    musclePercentage?: number;
    visceralFat?: number;
    imc?: number;
    targetWeight?: number;
    observations?: string;
}