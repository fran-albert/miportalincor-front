import { StudyType } from "../Study-Type/Study-Type";
import { UltraSoundImages } from "../Ultra-Sound/Ultra-Sound";

export interface Study {
  id: number;
  locationS3?: string;
  name?: string;
  date: string;
  studyType?: StudyType;
  note?: string;
  ultrasoundImages?: UltraSoundImages[];
  isOptimistic?: boolean;
  isUpdating?: boolean;
  created?: Date | null
}

export interface UploadedFile {
  name: string;
  url: string;
}

export interface StudySection {
  id: string;
  title: string;
  files: UploadedFile[];
}