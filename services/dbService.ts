import { AppData, ClassSession, DayOfWeek, Teacher, Course, Room, Section } from '../types';

// Initial Mock Data
const INITIAL_DATA: AppData = {
  settings: {
    semesterName: 'Spring 2026',
    isPublished: true,
  },
  teachers: [
    { id: 't1', name: 'Mr. John Doe', initial: 'JD', email: 'john@diu.edu.bd', offDay: 'Friday', counselingHour: 'Sunday 10:00 AM - 11:30 AM' },
    { id: 't2', name: 'Ms. Jane Smith', initial: 'JS', email: 'jane@diu.edu.bd', offDay: 'Saturday', counselingHour: 'Monday 11:30 AM - 01:00 PM' },
    { id: 't3', name: 'Dr. Robert Brown', initial: 'RB', email: 'robert@diu.edu.bd', offDay: 'Thursday', counselingHour: 'None' },
  ],
  courses: [
    { id: 'c1', code: 'CSE101', name: 'Structured Programming', credits: 3 },
    { id: 'c2', code: 'CSE102', name: 'Discrete Mathematics', credits: 3 },
    { id: 'c3', code: 'ENG101', name: 'English I', credits: 3 },
    { id: 'c4', code: 'CSE201', name: 'Data Structures', credits: 3 },
    { id: 'c5', code: 'CSE202', name: 'OOP', credits: 3 },
  ],
  rooms: [
    { id: 'r1', roomNumber: 'AB4-601', type: 'Theory' },
    { id: 'r2', roomNumber: 'AB4-602', type: 'Theory' },
    { id: 'r3', roomNumber: 'AB4-Lab1', type: 'Lab' },
    { id: 'r4', roomNumber: 'AB4-Lab2', type: 'Lab' },
  ],
  sections: [
    { id: 's1', name: 'A', batch: 56, studentCount: 45 },
    { id: 's2', name: 'B', batch: 56, studentCount: 42 },
    { id: 's3', name: '', batch: 57, studentCount: 50 }, 
  ],
  schedule: []
};

// --- Utilities ---

export const getInitialData = (): AppData => {
  const stored = localStorage.getItem('diu_routine_data');
  if (stored) {
    const parsed = JSON.parse(stored);
    // Backward compatibility check for settings
    if (!parsed.settings) {
      parsed.settings = INITIAL_DATA.settings;
    }
    // Migration: ensure sections have studentCount if missing
    parsed.sections = parsed.sections.map((s: any) => ({
        ...s,
        studentCount: s.studentCount || 0
    }));
    return parsed;
  }
  return INITIAL_DATA;
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
  if (type === 'teachers') return data.teachers.find(t => t.id === id)?.name || id;
  if (type === 'rooms') return data.rooms.find(r => r.id === id)?.roomNumber || id;
  if (type === 'sections') {
    const s = data.sections.find(s => s.id === id);
    return s ? (s.name ? `Batch ${s.batch} (${s.name})` : `Batch ${s.batch}`) : id;
  }
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
      const roomName = getNameById(session.roomId, 'rooms', data);
      return { 
        hasConflict: true, 
        message: `${getNameById(session.teacherId, 'teachers', data)} is already assigned to ${roomName} at this time.` 
      };
    }
    // 2. Room Conflict
    if (session.roomId === newSession.roomId) {
      const teacherName = getNameById(session.teacherId, 'teachers', data);
      return { 
        hasConflict: true, 
        message: `Room ${getNameById(session.roomId, 'rooms', data)} is already booked by ${teacherName}. Please contact them.` 
      };
    }
    // 3. Section Conflict
    if (session.sectionId === newSession.sectionId) {
      const teacherName = getNameById(session.teacherId, 'teachers', data);
      return { 
        hasConflict: true, 
        message: `Section ${getNameById(session.sectionId, 'sections', data)} already has a class with ${teacherName}.` 
      };
    }
  }

  return { hasConflict: false };
};