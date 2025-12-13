import { AppData, ClassSession, DayOfWeek, Teacher, Course, Room, Section } from '../types';

// Initial Mock Data
const INITIAL_DATA: AppData = {
  teachers: [
    { id: 't1', name: 'Mr. John Doe', initial: 'JD', email: 'john@diu.edu.bd' },
    { id: 't2', name: 'Ms. Jane Smith', initial: 'JS', email: 'jane@diu.edu.bd' },
    { id: 't3', name: 'Dr. Robert Brown', initial: 'RB', email: 'robert@diu.edu.bd' },
  ],
  courses: [
    { id: 'c1', code: 'CSE101', name: 'Structured Programming', credits: 3 },
    { id: 'c2', code: 'CSE102', name: 'Discrete Mathematics', credits: 3 },
    { id: 'c3', code: 'ENG101', name: 'English I', credits: 3 },
    { id: 'c4', code: 'CSE201', name: 'Data Structures', credits: 3 },
    { id: 'c5', code: 'CSE202', name: 'OOP', credits: 3 },
  ],
  rooms: [
    { id: 'r1', roomNumber: 'AB4-601', capacity: 40, type: 'Theory' },
    { id: 'r2', roomNumber: 'AB4-602', capacity: 40, type: 'Theory' },
    { id: 'r3', roomNumber: 'AB4-Lab1', capacity: 30, type: 'Lab' },
    { id: 'r4', roomNumber: 'AB4-Lab2', capacity: 30, type: 'Lab' },
  ],
  sections: [
    { id: 's1', name: 'Section A', batch: 56 },
    { id: 's2', name: 'Section B', batch: 56 },
    { id: 's3', name: 'Section A', batch: 57 },
  ],
  schedule: []
};

// --- Utilities ---

export const getInitialData = (): AppData => {
  const stored = localStorage.getItem('diu_routine_data');
  return stored ? JSON.parse(stored) : INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  localStorage.setItem('diu_routine_data', JSON.stringify(data));
};

export interface ConflictError {
  hasConflict: boolean;
  message?: string;
}

// Helper to get names for error messages
const getNameById = (id: string, type: 'teachers' | 'rooms' | 'sections', data: AppData): string => {
  if (type === 'teachers') return data.teachers.find(t => t.id === id)?.initial || id;
  if (type === 'rooms') return data.rooms.find(r => r.id === id)?.roomNumber || id;
  if (type === 'sections') return data.sections.find(s => s.id === id)?.name || id;
  return id;
};

export const checkConflict = (
  newSession: ClassSession,
  data: AppData
): ConflictError => {
  const currentSchedule = data.schedule;
  
  // Filter sessions that overlap in time and day (excluding the session itself if we were editing)
  const overlappingSessions = currentSchedule.filter(s => 
    s.day === newSession.day &&
    s.startTime === newSession.startTime && // Simplified time slot check
    s.id !== newSession.id
  );

  for (const session of overlappingSessions) {
    // 1. Teacher Conflict
    if (session.teacherId === newSession.teacherId) {
      return { hasConflict: true, message: `Teacher is already booked in Room ${getNameById(session.roomId, 'rooms', data)}` };
    }
    // 2. Room Conflict
    if (session.roomId === newSession.roomId) {
      return { hasConflict: true, message: `Room is already occupied by Section ${getNameById(session.sectionId, 'sections', data)}` };
    }
    // 3. Section Conflict
    if (session.sectionId === newSession.sectionId) {
      return { hasConflict: true, message: `Section already has a class with ${getNameById(session.teacherId, 'teachers', data)}` };
    }
  }

  return { hasConflict: false };
};
