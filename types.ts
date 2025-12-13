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
  // capacity removed as requested
  type: 'Lab' | 'Theory';
}

export interface Section {
  id: string;
  name: string; // e.g., "A", "B", or "" for whole batch
  batch: number;
  studentCount: number; // Added
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
  startTime: string; // "08:30 AM"
  endTime: string;   // "10:00 AM"
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
  "08:30 AM - 10:00 AM",
  "10:00 AM - 11:30 AM",
  "11:30 AM - 01:00 PM",
  "01:00 PM - 02:30 PM",
  "02:30 PM - 04:00 PM",
  "04:00 PM - 05:30 PM"
];

// Enhanced pastel colors for batches
export const getBatchColor = (batch: number) => {
  const colors = [
    'bg-blue-100 text-blue-900 border-blue-200',
    'bg-emerald-100 text-emerald-900 border-emerald-200',
    'bg-violet-100 text-violet-900 border-violet-200',
    'bg-amber-100 text-amber-900 border-amber-200',
    'bg-rose-100 text-rose-900 border-rose-200',
    'bg-cyan-100 text-cyan-900 border-cyan-200',
    'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200',
    'bg-lime-100 text-lime-900 border-lime-200',
    'bg-indigo-100 text-indigo-900 border-indigo-200',
    'bg-orange-100 text-orange-900 border-orange-200',
  ];
  return colors[batch % colors.length];
};