import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS } from '../types';

interface ScheduleTableProps {
  data: AppData;
  filterType: 'section' | 'teacher' | 'room' | 'all';
  filterId?: string;
  onDeleteSession?: (sessionId: string) => void;
  isAdmin?: boolean;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  data, 
  filterType, 
  filterId,
  onDeleteSession,
  isAdmin = false
}) => {
  const activeDays = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Saturday];

  const getSession = (day: DayOfWeek, timeSlot: string) => {
    const startTime = timeSlot.split(' - ')[0];
    return data.schedule.find(s => {
      if (s.day !== day || s.startTime !== startTime) return false;
      if (filterType === 'section') return s.sectionId === filterId;
      if (filterType === 'teacher') return s.teacherId === filterId;
      if (filterType === 'room') return s.roomId === filterId;
      return true;
    });
  };

  const getCellContent = (session?: ClassSession) => {
    if (!session) return null;

    const course = data.courses.find(c => c.id === session.courseId);
    const teacher = data.teachers.find(t => t.id === session.teacherId);
    const room = data.rooms.find(r => r.id === session.roomId);
    const section = data.sections.find(s => s.id === session.sectionId);

    // M3 Card-like cell style
    return (
      <div className="relative p-3 bg-blue-50/80 hover:bg-blue-100 rounded-xl border border-blue-100/50 text-xs sm:text-sm h-full min-h-[100px] flex flex-col justify-between transition-all duration-200 group shadow-sm hover:shadow-md">
        {isAdmin && onDeleteSession && (
          <button 
            onClick={() => onDeleteSession(session.id)}
            className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white text-red-400 hover:text-red-600 hover:bg-red-50 shadow-md opacity-0 group-hover:opacity-100 transition-all z-10 scale-90 group-hover:scale-100"
            title="Remove Class"
          >
             <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        )}
        
        <div>
            <div className="flex items-start justify-between mb-1">
                <span className="font-bold text-blue-900 bg-blue-100/50 px-1.5 py-0.5 rounded text-[11px]">{course?.code}</span>
            </div>
            <div className="text-gray-800 font-medium leading-snug line-clamp-2 mb-2" title={course?.name}>
                {course?.name}
            </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            <span className="font-medium">{teacher?.name.split(' ')[0]} ({teacher?.initial})</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            <span>{room?.roomNumber}</span>
          </div>
          {filterType !== 'section' && (
            <div className="flex items-center gap-1 text-[11px] text-orange-700">
               <svg className="w-3 h-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
               <span className="bg-orange-50 px-1.5 rounded border border-orange-100">{section?.name}</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-[20px] border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-[#FDFDF6]">
          <tr>
            <th className="px-4 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-[#FDFDF6] z-10 w-28 border-r border-gray-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
              Day / Time
            </th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-4 py-5 text-center text-xs font-bold text-gray-400 uppercase tracking-wider min-w-[180px]">
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {activeDays.map(day => (
            <tr key={day} className="group hover:bg-gray-50/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-sm font-semibold text-gray-700 sticky left-0 bg-white group-hover:bg-gray-50/30 z-10 border-r border-gray-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
                {day}
              </td>
              {TIME_SLOTS.map(slot => {
                const session = getSession(day, slot);
                return (
                  <td key={`${day}-${slot}`} className="px-2 py-2 align-top h-36 border-r border-gray-50 last:border-r-0">
                    {getCellContent(session)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;