import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';
import { Plus } from 'lucide-react';

interface ScheduleGridProps {
  data: AppData;
  onSlotClick: (day: DayOfWeek, timeSlot: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onMoveSession?: (sessionId: string, newDay: DayOfWeek, newTimeSlot: string) => void;
  onEditSession?: (session: ClassSession) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({ 
  data, 
  onSlotClick, 
  onDeleteSession, 
  onMoveSession,
  onEditSession
}) => {
  // ACADEMIC WEEK ORDER: Saturday to Friday
  const DAYS_ORDER = [
    DayOfWeek.Saturday,
    DayOfWeek.Sunday, 
    DayOfWeek.Monday, 
    DayOfWeek.Tuesday, 
    DayOfWeek.Wednesday, 
    DayOfWeek.Thursday, 
    DayOfWeek.Friday
  ];

  const getSessionsForSlot = (day: DayOfWeek, slot: string) => {
    const startTime = slot.split(' - ')[0];
    return data.schedule.filter(s => s.day === day && s.startTime === startTime);
  };

  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    e.dataTransfer.setData("sessionId", sessionId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek, slot: string) => {
    e.preventDefault();
    const sessionId = e.dataTransfer.getData("sessionId");
    if (sessionId && onMoveSession) {
      onMoveSession(sessionId, day, slot);
    }
  };

  return (
    <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-left font-semibold text-gray-500 w-32 sticky left-0 bg-gray-50 z-10">Day / Time</th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-4 text-center font-semibold text-gray-500 min-w-[160px] border-l border-gray-200 text-xs">
                  {slot}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {DAYS_ORDER.map(day => (
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
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, day, slot)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none print:hidden">
                        <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg">
                          <Plus className="w-4 h-4" />
                        </div>
                      </div>

                      <div className="space-y-2 relative z-10">
                        {sessions.map(session => {
                          const course = session.courseId ? data.courses.find(c => c.id === session.courseId) : null;
                          const teacher = data.teachers.find(t => t.id === session.teacherId);
                          const room = session.roomId ? data.rooms.find(r => r.id === session.roomId) : null;
                          const section = session.sectionId ? data.sections.find(s => s.id === session.sectionId) : null;
                          const batchColor = section ? getBatchColor(section.batch) : 'bg-blue-100 text-blue-800';

                          return (
                            <div 
                              key={session.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, session.id)}
                              onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  if (onEditSession) onEditSession(session);
                              }}
                              className={`p-2 rounded-lg border text-xs shadow-sm hover:shadow-md transition-all relative group/card ${batchColor} bg-opacity-90 cursor-grab active:cursor-grabbing hover:scale-[1.02]`}
                              onClick={(e) => e.stopPropagation()} 
                              title="Double click to edit, Drag to move"
                            >
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity shadow-sm print:hidden z-20"
                              >
                                <Plus className="w-3 h-3 rotate-45" />
                              </button>
                              <div className="font-bold flex justify-between pointer-events-none">
                                <span>{course?.code || (session.counselingHour ? 'COUNSEL' : 'N/A')}</span>
                                <span>{room?.roomNumber || ''}</span>
                              </div>
                              <div className="truncate my-0.5 opacity-90 pointer-events-none">
                                {teacher?.initial} {session.counselingHour ? '🤝' : ''}
                              </div>
                              <div className="font-medium mt-1 inline-block px-1.5 py-0.5 bg-white/50 rounded shadow-sm pointer-events-none">
                                {section?.name ? `B-${section.batch} (${section.name})` : (section ? `Batch ${section.batch}` : 'Counseling')}
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