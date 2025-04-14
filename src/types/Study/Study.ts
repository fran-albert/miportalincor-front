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
  id: number;
  name: string;
  url: string;
}

export interface StudySection {
  id: string;
  title: string;
  files: UploadedFile[];
}
export interface StudiesWithURL {
  id: number;
  locationS3: string;
  studyTypeId: number;
  studyType: StudyType;
  date: Date;
  note: string;
  created: Date;
  signedUrl: string;
  ultrasoundImages: {
    id: number,
    locationS3: string,
    signedUrl: string,
  }[]
}
