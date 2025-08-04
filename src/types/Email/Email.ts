export interface SendEmailDto {
    to: string;
    subject: string;
    evaluationType: string
    collaboratorName: string;
    fileData: string
}

export interface SendCompanyTextEmailDto {
    to: string;
    subject: string;
    text: string;
}