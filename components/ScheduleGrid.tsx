import React from 'react';
import { AppData, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';
import { Plus } from 'lucide-react';

interface ScheduleGridProps {
  data: AppData;
  onSlotClick: (day: DayOfWeek, timeSlot: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ data, onSlotClick, onDeleteSession }) => {
  const days = Object.values(DayOfWeek);

  const getSessionsForSlot = (day: DayOfWeek, slot: string) => {
    const startTime = slot.split(' - ')[0];
    return data.schedule.filter(s => s.day === day && s.startTime === startTime);
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left font-semibold text-gray-500 w-32 sticky left-0 bg-gray-50 z-10">Day / Time</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-4 text-center font-semibold text-gray-500 min-w-[200px] border-l border-gray-200">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {days.map(day => (
              <tr key={day} className="hover:bg-gray-50/30 transition-colors">
                <td className="p-4 font-medium text-gray-800 bg-white sticky left-0 z-10 border-r border-gray-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                  {day}
                </td>
                {TIME_SLOTS.map(slot => {
                  const sessions = getSessionsForSlot(day, slot);
                  return (
                    <td 
                      key={slot} 
                      className="p-2 border-l border-gray-100 align-top h-32 relative group cursor-pointer hover:bg-blue-50/30 transition-colors"
                      onClick={() => onSlotClick(day, slot)}
                    >
                      {/* Empty State / Add Button */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>

                      {/* Sessions List */}
                      <div className="space-y-2 relative z-10">
                        {sessions.map(session => {
                          const course = data.courses.find(c => c.id === session.courseId);
                          const teacher = data.teachers.find(t => t.id === session.teacherId);
                          const room = data.rooms.find(r => r.id === session.roomId);
                          const section = data.sections.find(s => s.id === session.sectionId);
                          const batchColor = section ? getBatchColor(section.batch) : 'bg-gray-100 text-gray-800';

                          return (
                            <div 
                              key={session.id} 
                              className={`p-2 rounded-lg border text-xs shadow-sm hover:shadow-md transition-shadow relative group/card ${batchColor} bg-opacity-50`}
                              onClick={(e) => e.stopPropagation()} 
                            >
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm"
                              >
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                              <div className="font-bold flex justify-between">
                                <span>{course?.code}</span>
                                <span>{room?.roomNumber}</span>
                              </div>
                              <div className="truncate my-0.5 opacity-80" title={teacher?.name}>{teacher?.initial}</div>
                              <div className="font-medium mt-1 inline-block px-1.5 py-0.5 bg-white/50 rounded">
                                {section?.name ? `Batch ${section.batch} (${section.name})` : `Batch ${section?.batch}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScheduleGrid;