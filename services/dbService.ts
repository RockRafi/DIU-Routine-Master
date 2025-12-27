import { AppData, ClassSession, DayOfWeek, Teacher, Course, Room, Section } from '../types';

// Formatting helper for 01-January-2025
export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const month = monthNames[date.getMonth()];
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Initial Mock Data
const INITIAL_DATA: AppData = {
  settings: {
    semesterName: 'Spring 2026',
    isPublished: true,
  },
  lastModified: formatDate(new Date()),
  teachers: [
    { id: 't1', name: 'Mr. John Doe', initial: 'JD', email: 'john@diu.edu.bd', phone: '+8801700000001', offDays: ['Friday', 'Saturday'], counselingHour: 'Sunday 10:00 AM - 11:30 AM' },
    { id: 't2', name: 'Ms. Jane Smith', initial: 'JS', email: 'jane@diu.edu.bd', phone: '+8801700000002', offDays: ['Saturday'], counselingHour: 'Monday 11:30 AM - 01:00 PM' },
    { id: 't3', name: 'Dr. Robert Brown', initial: 'RB', email: 'robert@diu.edu.bd', phone: '+8801700000003', offDays: ['Thursday'], counselingHour: 'None' },
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
    if (!parsed.settings) parsed.settings = INITIAL_DATA.settings;
    if (!parsed.lastModified) parsed.lastModified = INITIAL_DATA.lastModified;
    
    parsed.sections = parsed.sections.map((s: any) => ({
        ...s,
        studentCount: s.studentCount || 0
    }));

    parsed.teachers = parsed.teachers.map((t: any) => {
        let offDays = t.offDays;
        if (!offDays) {
            if (t.offDay) offDays = [t.offDay];
            else offDays = [];
        }
        return { ...t, offDays: offDays };
    });

    return parsed;
  }
  return INITIAL_DATA;
};

export const saveData = (data: AppData) => {
  const dataWithTimestamp = {
    ...data,
    lastModified: formatDate(new Date())
  };
  localStorage.setItem('diu_routine_data', JSON.stringify(dataWithTimestamp));
};

export interface ConflictError {
  hasConflict: boolean;
  message?: string;
}

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
  const overlappingSessions = data.schedule.filter(s => 
    s.day === newSession.day &&
    s.startTime === newSession.startTime && 
    s.id !== newSession.id
  );

  for (const session of overlappingSessions) {
    // Teacher conflict is always checked
    if (session.teacherId === newSession.teacherId) {
      return { 
        hasConflict: true, 
        message: `${getNameById(session.teacherId, 'teachers', data)} is already busy with a ${session.counselingHour ? 'Counseling Hour' : 'Class'}.` 
      };
    }

    // Only check room and section conflicts if the new session is NOT a counseling hour
    if (!newSession.counselingHour) {
      if (session.roomId && session.roomId === newSession.roomId) {
        return { 
          hasConflict: true, 
          message: `Room ${getNameById(session.roomId, 'rooms', data)} is already occupied.` 
        };
      }
      if (session.sectionId && session.sectionId === newSession.sectionId) {
        return { 
          hasConflict: true, 
          message: `Section ${getNameById(session.sectionId, 'sections', data)} already has a class.` 
        };
      }
    }
  }

  const teacher = data.teachers.find(t => t.id === newSession.teacherId);
  if (teacher && teacher.offDays && teacher.offDays.includes(newSession.day)) {
      return {
          hasConflict: true,
          message: `${teacher.name} has an off-day on ${newSession.day}.`
      };
  }

  return { hasConflict: false };
};