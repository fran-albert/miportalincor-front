import { AxiosError } from "axios";

export interface ApiErrorData {
  message?: string;
  code?: string;
  userName?: string;
}

export type ApiError = AxiosError<ApiErrorData>;
