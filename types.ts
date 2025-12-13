export interface Teacher {
  id: string;
  name: string;
  initial: string;
  email: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  capacity: number;
  type: 'Lab' | 'Theory';
}

export interface Section {
  id: string;
  name: string; // e.g., "56_A"
  batch: number;
}

export enum DayOfWeek {
  Sunday = 'Sunday',
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Saturday = 'Saturday',
}

export interface ClassSession {
  id: string;
  courseId: string;
  teacherId: string;
  roomId: string;
  sectionId: string;
  day: DayOfWeek;
  startTime: string; // "08:30"
  endTime: string;   // "10:00"
}

// Data structure for the entire application state
export interface AppData {
  teachers: Teacher[];
  courses: Course[];
  rooms: Room[];
  sections: Section[];
  schedule: ClassSession[];
}

export const TIME_SLOTS = [
  "08:30 - 10:00",
  "10:00 - 11:30",
  "11:30 - 13:00",
  "13:00 - 14:30",
  "14:30 - 16:00",
  "16:00 - 17:30"
];