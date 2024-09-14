import { UltraSoundImages } from "../Ultra-Sound/Ultra-Sound";

export interface Study {
  id: number;
  locationS3?: string;
  name?: string;
  date?: Date | string | undefined;
  studyType?: {
    id: number | string;
    name: string;
  };
  note?: string;
  ultrasoundImages?: UltraSoundImages[];
  isOptimistic?: boolean;
  isUpdating?: boolean;
}