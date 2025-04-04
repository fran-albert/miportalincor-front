import { apiIncor } from "@/services/axiosConfig";
import { StudyType } from "@/types/Study-Type/Study-Type";
import { UltraSoundImages } from "@/types/Ultra-Sound/Ultra-Sound";

export const getAllStudyWithUrl = async (userId: number) => {
  const { data } = await apiIncor.get<string>(`Study/byUserWithUrls/${userId}`);
  return data;
};

export interface StudiesWithURL {
  id: number;
  locationS3: string;
  studyTypeId: number;
  studyType: StudyType;
  date: Date;
  note: string;
  created: Date;
  signedUrl: string;
  ultrasoundImages: UltraSoundImages[];
}
