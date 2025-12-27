import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';

interface ScheduleTableProps {
  data: AppData;
  filterType: 'section' | 'teacher' | 'room' | 'batch' | 'all';
  filterId?: string;
  onDeleteSession?: (sessionId: string) => void;
  isAdmin?: boolean;
  specificDay?: DayOfWeek;
  showFreeRooms?: boolean;
}

const ScheduleTable: React.FC<ScheduleTableProps> = ({ 
  data, 
  filterType, 
  filterId,
  onDeleteSession,
  isAdmin = false,
  specificDay,
  showFreeRooms = false
}) => {
  const activeDays = specificDay ? [specificDay] : [
    DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, 
    DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday
  ];

  const getSessions = (day: DayOfWeek, timeSlot: string) => {
    const startTime = timeSlot.split(' - ')[0];
    
    const classes = data.schedule.filter(s => {
      if (s.day !== day || s.startTime !== startTime) return false;
      
      if (filterType === 'section') return s.sectionId === filterId;
      if (filterType === 'teacher') return s.teacherId === filterId;
      if (filterType === 'room') return s.roomId === filterId;
      if (filterType === 'batch') {
          const section = data.sections.find(sec => sec.id === s.sectionId);
          return section && section.batch.toString() === filterId;
      }
      return true;
    });

    return classes;
  };

  const getCellContent = (day: DayOfWeek, slot: string) => {
    const sessions = getSessions(day, slot);
    
    if (showFreeRooms && sessions.length === 0) {
      return (
        <div className="animate-in fade-in zoom-in-95 duration-500 h-full">
          <div className="h-full flex flex-col items-center justify-center border border-emerald-200 bg-emerald-50 rounded-xl p-2 cursor-default shadow-sm ring-1 ring-emerald-100/50">
            <span className="text-[11px] font-black text-emerald-700 tracking-tighter uppercase text-center">Free Room</span>
            <div className="mt-1 w-8 h-0.5 bg-emerald-200 rounded-full"></div>
          </div>
        </div>
      );
    }

    if (sessions.length === 0) return null;

    return (
        <div className="flex flex-col gap-2 h-full animate-in fade-in slide-in-from-top-1 duration-300">
            {sessions.map(session => {
                const course = session.courseId ? data.courses.find(c => c.id === session.courseId) : null;
                const teacher = data.teachers.find(t => t.id === session.teacherId);
                const room = session.roomId ? data.rooms.find(r => r.id === session.roomId) : null;
                const section = session.sectionId ? data.sections.find(s => s.id === session.sectionId) : null;
                
                const batchColorClass = section ? getBatchColor(section.batch) : 'bg-blue-100 border-blue-200 text-blue-900';

                return (
                    <div key={session.id} className={`relative p-3 rounded-xl border text-[11px] leading-tight flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${batchColorClass} bg-opacity-95 group/cell`}>
                        {isAdmin && onDeleteSession && (
                        <button 
                            onClick={() => onDeleteSession(session.id)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-100 shadow-sm opacity-0 group-hover/cell:opacity-100 transition-all z-10"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        )}
                        
                        <div className="font-black mb-1.5 flex justify-between items-center text-[12px] tracking-tight text-gray-900">
                            <span className="truncate mr-1">{course?.code || (session.counselingHour ? 'COUNSELING' : 'N/A')}</span>
                            <span className="bg-white/60 px-1.5 py-0.5 rounded text-[10px] font-black text-blue-700 border border-blue-200/50">{room?.roomNumber || ''}</span>
                        </div>
                        <div className="font-bold line-clamp-2 mb-1.5 text-gray-800 leading-[1.3]" title={course?.name}>
                            {course?.name || (session.counselingHour ? 'Consultation' : '')}
                        </div>
                        <div className="flex justify-between items-end font-black uppercase tracking-tighter mt-auto">
                            <span className="text-gray-600 bg-white/40 px-1 rounded">{teacher?.initial}</span>
                            {section && (
                                <span className="text-blue-800 opacity-80 text-[9px] whitespace-nowrap">
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
    <div className="overflow-x-auto bg-white/40 rounded-2xl shadow-sm border border-gray-100">
      <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse">
        <thead className="bg-gray-50/80">
          <tr>
            <th className="px-4 py-4 text-left text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] sticky left-0 bg-gray-50 z-20 w-24 md:w-32 border-r border-gray-200">
              DAY
            </th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-2 py-4 text-center text-[10px] font-black text-gray-500 uppercase tracking-[0.1em] w-[150px] md:w-[200px] border-l border-gray-100">
                {slot}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {activeDays.map(day => (
            <tr key={day} className="group hover:bg-blue-50/20 transition-colors">
              <td className="px-4 py-5 whitespace-nowrap text-[11px] font-black text-gray-900 sticky left-0 bg-white group-hover:bg-blue-50/30 z-10 border-r border-gray-200 uppercase tracking-[0.2em]">
                {day}
              </td>
              {TIME_SLOTS.map(slot => (
                <td key={`${day}-${slot}`} className="px-2 py-2 align-top h-32 md:h-36 border-r border-gray-50 last:border-r-0">
                  {getCellContent(day, slot)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScheduleTable;