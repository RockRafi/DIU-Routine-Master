import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';

interface ScheduleTableProps {
  data: AppData;
  filterType: 'section' | 'teacher' | 'room' | 'batch' | 'all';
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

  // Helper to find sessions
  const getSessions = (day: DayOfWeek, timeSlot: string) => {
    const startTime = timeSlot.split(' - ')[0];
    
    return data.schedule.filter(s => {
      if (s.day !== day || s.startTime !== startTime) return false;
      
      if (filterType === 'section') return s.sectionId === filterId;
      if (filterType === 'teacher') return s.teacherId === filterId;
      if (filterType === 'room') return s.roomId === filterId;
      if (filterType === 'batch') {
          // filterId is expected to be the batch number as a string
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
                
                // Color based on batch
                const batchColorClass = section ? getBatchColor(section.batch) : 'bg-gray-100 border-gray-200 text-gray-800';

                return (
                    <div key={session.id} className={`relative p-2 rounded-lg border text-xs flex flex-col justify-between shadow-sm hover:shadow-md transition-all ${batchColorClass} bg-opacity-70`}>
                        {isAdmin && onDeleteSession && (
                        <button 
                            onClick={() => onDeleteSession(session.id)}
                            className="absolute -top-2 -right-2 p-1 rounded-full bg-white text-red-500 hover:bg-red-50 border border-red-100 shadow-sm opacity-0 group-hover:opacity-100 transition-all z-10"
                            title="Remove Class"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        )}
                        
                        <div className="font-bold mb-1 flex justify-between items-center">
                            <span>{course?.code}</span>
                            <span className="opacity-75">{room?.roomNumber}</span>
                        </div>
                        <div className="font-medium line-clamp-2 mb-1 opacity-90" title={course?.name}>
                            {course?.name}
                        </div>
                        <div className="flex justify-between items-end text-[10px] opacity-80 font-medium">
                            <span>{teacher?.initial}</span>
                            {/* If viewing Batch, show Section Name to distinguish */}
                            {(filterType === 'batch' || filterType === 'all') && (
                                <span className="bg-white/60 px-1 rounded">
                                    {section?.name ? `Sec ${section.name}` : 'All'}
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
    <div className="overflow-x-auto rounded-[20px] border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 table-fixed">
        <thead className="bg-[#FDFDF6]">
          <tr>
            <th className="px-4 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 bg-[#FDFDF6] z-10 w-28 border-r border-gray-100 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.05)]">
              Day / Time
            </th>
            {TIME_SLOTS.map(slot => (
              <th key={slot} className="px-2 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider w-[180px]">
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
                const sessions = getSessions(day, slot);
                return (
                  <td key={`${day}-${slot}`} className="px-1 py-1 align-top h-32 border-r border-gray-50 last:border-r-0">
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