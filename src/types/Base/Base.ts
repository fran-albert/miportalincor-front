export interface Base {
    id: number; 
    createdAt: string;
    updatedAt: string;
    deletedAt: string;
  }

export interface SuccessOperationResponse {
    message: string;
    success: boolean;
}
  