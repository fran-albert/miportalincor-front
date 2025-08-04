import { apiLaboral } from "@/services/axiosConfig";
import { SendCompanyTextEmailDto, SendEmailDto } from "@/types/Email/Email";

export const sendEmail = async (values: SendEmailDto) => {
    const { data } = await apiLaboral.post<string>(`email/send`, values);
    return data;
}

export const sendEmailNoteToCompany = async (values: SendCompanyTextEmailDto) => {
    const { data } = await apiLaboral.post<string>(`email/send-text-to-company`, values);
    return data;
}
