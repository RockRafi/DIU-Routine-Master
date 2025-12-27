import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';
// Import X icon for deleting sessions
import { X } from 'lucide-react';

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
    return data.schedule.filter(s => {
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
  };

  const getFreeRoomsForSlot = (day: DayOfWeek, timeSlot: string) => {
    const startTime = timeSlot.split(' - ')[0];
    const occupiedRoomIds = data.schedule
      .filter(s => s.day === day && s.startTime === startTime)
      .map(s => s.roomId);
    
    return data.rooms.filter(room => !occupiedRoomIds.includes(room.id));
  };

  const getCellContent = (day: DayOfWeek, slot: string) => {
    if (showFreeRooms) {
      const freeRooms = getFreeRoomsForSlot(day, slot);
      return (
        <div className="h-full flex flex-col gap-2 p-2 animate-in fade-in duration-300">
          {freeRooms.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {freeRooms.map(room => (
                <div key={room.id} className="px-3 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-400/50 rounded-lg text-[11px] font-black uppercase tracking-tighter shadow-sm">
                  {room.roomNumber}
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center border-2 border-dashed border-red-200 bg-red-50 rounded-2xl p-4">
              <span className="text-[10px] font-black text-red-600 uppercase text-center leading-tight tracking-[0.2em] opacity-80">No rooms available for this time slot</span>
            </div>
          )}
        </div>
      );
    }

    const sessions = getSessions(day, slot);
    if (sessions.length === 0) return null;

    return (
        <div className="flex flex-col gap-2.5 h-full animate-in fade-in duration-200">
            {sessions.map(session => {
                const course = session.courseId ? data.courses.find(c => c.id === session.courseId) : null;
                const teacher = data.teachers.find(t => t.id === session.teacherId);
                const room = session.roomId ? data.rooms.find(r => r.id === session.roomId) : null;
                const section = session.sectionId ? data.sections.find(s => s.id === session.sectionId) : null;
                const batchColorClass = section ? getBatchColor(section.batch) : 'bg-gray-100 border-gray-300 text-gray-950';

                return (
                    <div key={session.id} className={`relative p-4 rounded-2xl border-2 leading-tight flex flex-col justify-between transition-all hover:scale-[1.03] shadow-md ${batchColorClass} group/cell ring-1 ring-black/5 session-card`}>
                        {isAdmin && onDeleteSession && (
                          <button 
                              onClick={() => onDeleteSession(session.id)}
                              className="absolute -top-2 -right-2 p-1.5 rounded-full bg-white text-red-600 border border-red-100 opacity-0 group-hover/cell:opacity-100 transition-all z-10 shadow-lg no-print flex items-center justify-center hover:bg-red-50"
                          >
                              <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                        
                        <div className="font-black flex justify-between items-start text-[16px] tracking-tight mb-3 text-contrast-high">
                            <span className="truncate mr-3 uppercase">{course?.shortName || course?.code}</span>
                            <span className="bg-white/95 px-2 py-0.5 rounded-lg text-[10px] font-black border border-black/20 shadow-sm text-black">{room?.roomNumber || 'TBA'}</span>
                        </div>
                        
                        <div className="flex flex-col gap-1.5">
                          <div className="text-[12px] font-black text-slate-900 tracking-tight uppercase">
                             {section ? (section.name ? `Batch ${section.batch} • Sec ${section.name}` : `Batch ${section.batch} (Core)`) : 'Counseling Hour'}
                          </div>
                          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-700 border-t border-black/10 pt-2 mt-1.5">
                              <span className="bg-white/40 px-2 py-0.5 rounded-md">{teacher?.initial}</span>
                              <span className="italic opacity-80 bg-white/20 px-1.5 py-0.5 rounded-md">{course?.code}</span>
                          </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
  };

  return (
    <div className="overflow-x-auto rounded-3xl">
      <table className="min-w-full divide-y divide-gray-200 table-fixed border-collapse bg-white">
        <thead>
          <tr className="bg-gray-50/70">
            <th className="px-6 py-5 text-left text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] sticky left-0 bg-gray-50 z-20 w-28 md:w-36 border-r border-gray-200 shadow-sm">
              DAY
            </th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-4 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] w-[210px] border-l border-gray-100">
                {slot.replace(' - ', '\n')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {activeDays.map(day => (
            <tr key={day} className="hover:bg-gray-50/40 transition-colors">
              <td className="px-6 py-8 whitespace-nowrap text-[13px] font-black text-slate-950 sticky left-0 bg-white z-10 border-r border-gray-200 uppercase tracking-[0.3em]">
                {day.substring(0, 3)}
              </td>
              {TIME_SLOTS.map(slot => (
                <td key={`${day}-${slot}`} className="px-2.5 py-3 align-top min-h-[160px] border-l border-gray-50/50">
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