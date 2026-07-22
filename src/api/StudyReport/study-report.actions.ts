import { apiIncorHC } from "@/services/axiosConfig";
import type { StudyReport, StudyReportListItem, StudyReportTemplate, StudyReportViewerSession } from "@/types/StudyReport/StudyReport.types";

export interface StudyReportAccessResponse {
  enabled: boolean;
}

export const getMyStudyReports = async (): Promise<StudyReportListItem[]> => (await apiIncorHC.get("/study-reports/mine")).data;
export const getStudyReportTemplates = async (): Promise<StudyReportTemplate[]> => (await apiIncorHC.get("/study-reports/templates")).data;
export const getStudyReportAccess = async (): Promise<StudyReportAccessResponse> => (await apiIncorHC.get<StudyReportAccessResponse>("/study-reports/access")).data;
export const saveStudyReportDraft = async (sourceInboxItemId: string, templateKey: string, content: Record<string, unknown>): Promise<StudyReport> => (await apiIncorHC.post(`/study-reports/drafts/${sourceInboxItemId}`, { templateKey, content })).data;
export const getStudyReportViewer = async (reportId: string): Promise<StudyReportViewerSession> => (await apiIncorHC.post(`/study-reports/${reportId}/viewer-session`)).data;
export const previewStudyReport = async (reportId: string): Promise<Blob> => (await apiIncorHC.post(`/study-reports/${reportId}/preview`, undefined, { responseType: "blob" })).data;
export const signStudyReport = async (reportId: string): Promise<StudyReport> => (await apiIncorHC.post(`/study-reports/${reportId}/sign`)).data;
export const addStudyReportAddendum = async (reportId: string, text: string): Promise<void> => { await apiIncorHC.post(`/study-reports/${reportId}/addendums`, { text }); };
