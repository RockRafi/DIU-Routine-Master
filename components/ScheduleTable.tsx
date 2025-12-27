import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';

interface ScheduleTableProps {
  data: AppData;
  filterType: 'section' | 'teacher' | 'room' | 'batch' | 'all';
  filterId?: string;
  onDeleteSession?: (sessionId: string) => void;
  isAdmin?: boolean;
  specificDay?: DayOfWeek; // Added for filtering by specific day
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  data, 
  filterType, 
  filterId,
  onDeleteSession,
  isAdmin = false,
  specificDay
}) => {
  const activeDays = specificDay ? [specificDay] : [
    DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, 
    DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday
  ];

  const getSessions = (day: DayOfWeek, timeSlot: string) => {
    const startTime = timeSlot.split(' - ')[0];
    
    return data.schedule.filter(s => {
      if (s.day !== day || s.startTime !== startTime) return false;
      
      if (filterType === 'section') return s.sectionId === filterId;
      if (filterType === 'teacher') return s.teacherId === filterId;
      if (filterType === 'room') return s.roomId === filterId;
      if (filterType === 'batch') {
          const section = data.sections.find(sec => sec.id === s.sectionId);
          return section && section.batch.toString() === filterId;
      }
      return true; // 'all'
    });
  };

  const getCellContent = (sessions: ClassSession[]) => {
    if (sessions.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 h-full">
            {sessions.map(session => {
                const course = data.courses.find(c => c.id === session.courseId);
                const teacher = data.teachers.find(t => t.id === session.teacherId);
                const room = data.rooms.find(r => r.id === session.roomId);
                const section = data.sections.find(s => s.id === session.sectionId);
                
                const batchColorClass = section ? getBatchColor(section.batch) : 'bg-gray-100 border-gray-200 text-gray-800';

                return (
                    <div key={session.id} className={`relative p-2.5 rounded-xl border text-[10px] leading-tight flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${batchColorClass} bg-opacity-70 group/cell`}>
                        {isAdmin && onDeleteSession && (
                        <button 
                            onClick={() => onDeleteSession(session.id)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-100 shadow-sm opacity-0 group-hover/cell:opacity-100 transition-all z-10"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        )}
                        
                        <div className="font-black mb-1 flex justify-between items-center text-[11px]">
                            <span className="truncate mr-1">{course?.code}</span>
                            <span className="opacity-70 font-bold whitespace-nowrap">{room?.roomNumber}</span>
                        </div>
                        <div className="font-semibold line-clamp-1 mb-1 opacity-90" title={course?.name}>
                            {course?.name}
                        </div>
                        <div className="flex justify-between items-end opacity-70 font-bold uppercase tracking-tighter">
                            <span>{teacher?.initial}</span>
                            {(filterType === 'batch' || filterType === 'all') && section && (
                                <span className="bg-white/40 px-1 rounded text-[8px] whitespace-nowrap">
                                    {section.name ? `B${section.batch}-${section.name}` : `B${section.batch}`}
                                </span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 table-fixed border-collapse">
        <thead className="bg-[#FDFDF6]">
          <tr>
            <th className="px-4 py-6 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] sticky left-0 bg-[#FDFDF6] z-10 w-24 md:w-32 border-r border-gray-100">
              DAY
            </th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-2 py-6 text-center text-[10px] font-black text-gray-400 uppercase tracking-[0.1em] w-[180px] md:w-[200px]">
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-50">
          {activeDays.map(day => (
            <tr key={day} className="group hover:bg-gray-50/30 transition-colors">
              <td className="px-4 py-4 whitespace-nowrap text-xs font-black text-gray-900 sticky left-0 bg-white group-hover:bg-gray-50/30 z-10 border-r border-gray-100 uppercase tracking-widest shadow-[4px_0_15px_-5px_rgba(0,0,0,0.05)]">
                {day.substring(0, 3)}
              </td>
              {TIME_SLOTS.map(slot => {
                const sessions = getSessions(day, slot);
                return (
                  <td key={`${day}-${slot}`} className="px-1.5 py-1.5 align-top h-32 md:h-36 border-r border-gray-50 last:border-r-0">
                    {getCellContent(sessions)}
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