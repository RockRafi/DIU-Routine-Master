import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';
// Added missing Users and GraduationCap icons to the import list
import { Plus, Info, Clock, MapPin, Users, GraduationCap, AlertCircle } from 'lucide-react';

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

  const isSlotFull = (day: DayOfWeek, slot: string) => {
    const sessions = getSessionsForSlot(day, slot);
    return sessions.length >= data.rooms.length;
  };

  const handleDragStart = (e: React.DragEvent, sessionId: string) => {
    e.dataTransfer.setData("sessionId", sessionId);
    e.dataTransfer.effectAllowed = "move";
    // Add visual feedback to target cells
    document.querySelectorAll('.drop-target-cell').forEach(el => el.classList.add('bg-blue-50/50', 'border-blue-200'));
  };

  const handleDragEnd = () => {
    document.querySelectorAll('.drop-target-cell').forEach(el => el.classList.remove('bg-blue-50/50', 'border-blue-200', 'bg-blue-100'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const target = e.currentTarget as HTMLElement;
    target.classList.add('bg-blue-100');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-blue-100');
  };

  const handleDrop = (e: React.DragEvent, day: DayOfWeek, slot: string) => {
    e.preventDefault();
    handleDragEnd();
    const sessionId = e.dataTransfer.getData("sessionId");
    if (sessionId && onMoveSession) {
      onMoveSession(sessionId, day, slot);
    }
  };

  return (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full min-w-[1300px] border-collapse">
          <thead>
            <tr className="bg-gray-50/90 border-b border-gray-200">
              <th className="p-6 text-left font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] w-36 sticky left-0 bg-gray-50/95 backdrop-blur-md z-20 border-r border-gray-200">
                Day / Slot
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-5 text-center font-black text-slate-400 uppercase tracking-[0.2em] min-w-[200px] border-l border-gray-100 text-[10px]">
                  <div className="flex flex-col items-center gap-2">
                    <Clock className="w-4 h-4 opacity-30" />
                    {slot.replace(' - ', ' \u2192 ')}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DAYS_ORDER.map(day => (
              <tr key={day} className="hover:bg-gray-50/10 transition-colors">
                <td className="p-6 font-black text-[13px] text-slate-950 bg-white sticky left-0 z-10 border-r border-gray-200 uppercase tracking-[0.2em] flex items-center gap-4">
                  <div className="w-2 h-7 bg-blue-600 rounded-full shadow-sm"></div>
                  {day.substring(0, 3)}
                </td>
                {TIME_SLOTS.map(slot => {
                  const sessions = getSessionsForSlot(day, slot);
                  const full = isSlotFull(day, slot);
                  
                  return (
                    <td 
                      key={slot} 
                      className={`p-3 border-l border-gray-50 align-top h-44 relative group cursor-pointer transition-all drop-target-cell ${full ? 'bg-red-50/30' : 'hover:bg-blue-50/30'}`}
                      onClick={() => onSlotClick(day, slot)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, slot)}
                    >
                      {/* Interactive Plus icon on hover */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none print:hidden z-0">
                        <div className="bg-blue-600 text-white p-3 rounded-full shadow-2xl transform group-hover:scale-110 transition-transform">
                          <Plus className="w-6 h-6" />
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10">
                        {full && sessions.length === 0 && (
                          <div className="flex flex-col items-center justify-center h-32 opacity-20 text-red-600">
                            <AlertCircle className="w-6 h-6 mb-2" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Full Occupancy</span>
                          </div>
                        )}
                        
                        {sessions.map(session => {
                          const course = session.courseId ? data.courses.find(c => c.id === session.courseId) : null;
                          const teacher = data.teachers.find(t => t.id === session.teacherId);
                          const room = session.roomId ? data.rooms.find(r => r.id === session.roomId) : null;
                          const section = session.sectionId ? data.sections.find(s => s.id === session.sectionId) : null;
                          const batchColor = section ? getBatchColor(section.batch) : 'bg-gray-100 text-slate-800 border-gray-300';

                          return (
                            <div 
                              key={session.id} 
                              draggable
                              onDragStart={(e) => handleDragStart(e, session.id)}
                              onDragEnd={handleDragEnd}
                              onDoubleClick={(e) => {
                                  e.stopPropagation();
                                  if (onEditSession) onEditSession(session);
                              }}
                              className={`p-3.5 rounded-2xl border-2 text-[11px] shadow-sm transition-all relative group/card ${batchColor} bg-opacity-95 cursor-grab active:cursor-grabbing hover:scale-[1.04] active:scale-95 hover:shadow-xl ring-1 ring-black/5 session-card`}
                              onClick={(e) => e.stopPropagation()} 
                              title="Double click to Edit • Drag to Move"
                            >
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                className="absolute -top-2.5 -right-2.5 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover/card:opacity-100 transition-all shadow-xl print:hidden z-20 hover:scale-110 active:scale-90"
                              >
                                <Plus className="w-3.5 h-3.5 rotate-45" strokeWidth={4} />
                              </button>
                              
                              <div className="font-black flex justify-between pointer-events-none text-[14px] leading-tight mb-2 text-contrast-high">
                                <span className="uppercase tracking-tight truncate mr-2">{course?.shortName || (session.counselingHour ? 'CONS' : 'N/A')}</span>
                                <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/70 rounded-md border border-black/5">
                                  <MapPin className="w-3 h-3 opacity-60" />
                                  <span className="font-black text-[10px]">{room?.roomNumber || 'TBA'}</span>
                                </div>
                              </div>
                              
                              <div className="font-black text-[10px] text-inherit opacity-90 pointer-events-none flex items-center gap-2 uppercase tracking-tight mb-2.5">
                                <Users className="w-3.5 h-3.5 opacity-50" />
                                {section ? (section.name ? `B${section.batch}-${section.name}` : `B${section.batch}`) : 'Counseling'}
                              </div>

                              <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-tight opacity-70 border-t border-black/5 pt-2 pointer-events-none">
                                <span className="flex items-center gap-1.5">
                                  <GraduationCap className="w-3.5 h-3.5" /> {teacher?.initial}
                                </span>
                                <span className="font-black opacity-50 italic">{course?.code}</span>
                              </div>
                            </div>
                          );
                        })}
                        
                        {sessions.length === 0 && !full && (
                          <div className="h-full flex flex-col items-center justify-center py-10 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none">
                            <Plus className="w-10 h-10 text-slate-400" />
                          </div>
                        )}
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