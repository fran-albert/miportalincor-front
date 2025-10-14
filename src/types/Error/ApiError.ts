import { AxiosError } from "axios";

export interface ApiErrorData {
  message?: string;
}

export type ApiError = AxiosError<ApiErrorData>;
