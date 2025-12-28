import React from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, getBatchColor } from '../types';
import { Plus, Info, Clock, MapPin, Users, GraduationCap, AlertCircle, Edit2 } from 'lucide-react';

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
    document.querySelectorAll('.drop-target-cell').forEach(el => el.classList.add('bg-blue-50/20', 'border-blue-200/50'));
  };

  const handleDragEnd = () => {
    document.querySelectorAll('.drop-target-cell').forEach(el => el.classList.remove('bg-blue-50/20', 'border-blue-200/50', 'bg-blue-100/50'));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const target = e.currentTarget as HTMLElement;
    target.classList.add('bg-blue-100/50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('bg-blue-100/50');
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
    <div className="bg-white rounded-[32px] border border-gray-200 overflow-hidden shadow-none">
      {/* Container with horizontal scroll for responsiveness */}
      <div className="overflow-x-auto custom-scrollbar scroll-smooth">
        <table className="w-full min-w-[1200px] border-collapse table-fixed">
          <thead>
            <tr className="bg-gray-50/80 border-b border-gray-200">
              {/* Sticky day column */}
              <th className="p-6 text-left font-black text-[10px] text-slate-400 uppercase tracking-[0.3em] w-32 sticky left-0 bg-gray-50/95 backdrop-blur-md z-30 border-r border-gray-200">
                DAY
              </th>
              {TIME_SLOTS.map(slot => (
                <th key={slot} className="p-4 text-center font-black text-slate-400 uppercase tracking-[0.2em] border-l border-gray-100 text-[10px]">
                  <div className="flex flex-col items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 opacity-20" />
                    {slot.split(' - ')[0]}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {DAYS_ORDER.map(day => (
              <tr key={day} className="transition-colors">
                <td className="p-6 font-black text-[12px] text-slate-950 bg-white sticky left-0 z-20 border-r border-gray-200 uppercase tracking-[0.2em] shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                  {day.substring(0, 3)}
                </td>
                {TIME_SLOTS.map(slot => {
                  const sessions = getSessionsForSlot(day, slot);
                  const full = isSlotFull(day, slot);
                  
                  return (
                    <td 
                      key={slot} 
                      className={`p-2.5 border-l border-gray-50 align-top h-48 relative group cursor-pointer drop-target-cell transition-all ${full ? 'bg-red-50/20' : 'hover:bg-blue-50/20'}`}
                      onClick={() => onSlotClick(day, slot)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, day, slot)}
                    >
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-0">
                        <Plus className="w-8 h-8 text-blue-200" />
                      </div>

                      <div className="space-y-2.5 relative z-10">
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
                              className={`p-3 rounded-xl border-2 text-[10px] leading-tight transition-all relative group/card ${batchColor} bg-opacity-95 cursor-grab active:cursor-grabbing hover:scale-[1.02] active:scale-95 shadow-none ring-1 ring-black/5`}
                              onClick={(e) => e.stopPropagation()} 
                              title="Double click to Edit • Drag to Move"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-black text-[13px] uppercase tracking-tight truncate mr-2">{course?.shortName || (session.counselingHour ? 'CONS' : '???')}</span>
                                <span className="bg-white/80 px-1.5 py-0.5 rounded border border-black/5 font-black text-[9px]">{room?.roomNumber || 'TBA'}</span>
                              </div>
                              
                              <div className="flex items-center gap-2 mb-2 font-bold opacity-80">
                                <Users className="w-3 h-3" />
                                <span className="truncate">{section ? (section.name ? `B${section.batch}-${section.name}` : `B${section.batch}`) : 'Counseling'}</span>
                              </div>

                              <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-tight opacity-60 border-t border-black/5 pt-1.5">
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" /> {teacher?.initial}
                                </span>
                                <span className="italic">{course?.code}</span>
                              </div>

                              {/* Action Buttons for Admin Grid */}
                              <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity no-print">
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); if(onEditSession) onEditSession(session); }}
                                      className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                                  >
                                      <Edit2 className="w-3 h-3" />
                                  </button>
                                  <button 
                                      onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                                      className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                                  >
                                      <Plus className="w-3 h-3 rotate-45" />
                                  </button>
                              </div>
                            </div>
                          );
                        })}
                        
                        {sessions.length === 0 && full && (
                          <div className="h-full flex items-center justify-center py-6 opacity-30">
                            <AlertCircle className="w-5 h-5 text-red-400" />
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
