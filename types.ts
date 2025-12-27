export interface Teacher {
  id: string;
  name: string;
  initial: string;
  email: string;
  phone?: string; 
  offDays: string[]; 
  counselingHour?: string;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  shortName: string; // Added short name for compact display
  credits: number;
}

export interface Room {
  id: string;
  roomNumber: string;
  type: 'Lab' | 'Theory';
}

export interface Section {
  id: string;
  name: string; 
  batch: number;
  studentCount: number; 
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
  courseId?: string; 
  teacherId: string;
  roomId?: string;   
  sectionId?: string; 
  day: DayOfWeek;
  startTime: string; 
  endTime: string;   
  counselingHour?: string; 
}

export interface AppSettings {
  semesterName: string; 
  isPublished: boolean;
}

export interface AppData {
  settings: AppSettings;
  teachers: Teacher[];
  courses: Course[];
  rooms: Room[];
  sections: Section[];
  schedule: ClassSession[];
  lastModified?: string; 
}

export const TIME_SLOTS = [
  "08:30 AM - 10:00 AM",
  "10:00 AM - 11:30 AM",
  "11:30 AM - 01:00 PM",
  "01:00 PM - 02:30 PM",
  "02:30 PM - 04:00 PM",
  "04:00 PM - 05:30 PM"
];

export const getBatchColor = (batch: number) => {
  const colors = [
    'bg-blue-50 text-blue-900 border-blue-200',
    'bg-emerald-50 text-emerald-900 border-emerald-200',
    'bg-violet-50 text-violet-900 border-violet-200',
    'bg-amber-50 text-amber-900 border-amber-200',
    'bg-rose-50 text-rose-900 border-rose-200',
    'bg-cyan-50 text-cyan-900 border-cyan-200',
    'bg-fuchsia-50 text-fuchsia-900 border-fuchsia-200',
    'bg-lime-50 text-lime-900 border-lime-200',
    'bg-indigo-50 text-indigo-900 border-indigo-200',
    'bg-orange-50 text-orange-900 border-orange-200',
  ];
  return colors[batch % colors.length];
};