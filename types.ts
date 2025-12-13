export interface Teacher {
  id: string;
  name: string;
  initial: string;
  email: string;
  offDay?: string;
  counselingHour?: string;
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
  name: string; // e.g., "A", "B", or "" for whole batch
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

export interface AppSettings {
  semesterName: string; // e.g., "Fall 2025"
  isPublished: boolean;
}

// Data structure for the entire application state
export interface AppData {
  settings: AppSettings;
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
  "14:30 - 16:00"
];

// Helper for pastel colors based on batch number
export const getBatchColor = (batch: number) => {
  const colors = [
    'bg-blue-100 text-blue-800 border-blue-200',
    'bg-green-100 text-green-800 border-green-200',
    'bg-purple-100 text-purple-800 border-purple-200',
    'bg-orange-100 text-orange-800 border-orange-200',
    'bg-pink-100 text-pink-800 border-pink-200',
    'bg-teal-100 text-teal-800 border-teal-200',
    'bg-indigo-100 text-indigo-800 border-indigo-200',
    'bg-cyan-100 text-cyan-800 border-cyan-200',
  ];
  return colors[batch % colors.length];
};