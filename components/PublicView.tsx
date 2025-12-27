import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppData, getBatchColor, Section, DayOfWeek, TIME_SLOTS, ClassSession } from '../types';
import ScheduleTable from './ScheduleTable';
import { Search, User, Users, Calendar, ShieldCheck, ChevronDown, Download, AlertTriangle, Clock, MapPin, CheckCircle2 } from 'lucide-react';

interface PublicViewProps {
  data: AppData;
  onAdminClick: () => void;
}

const PublicView: React.FC<PublicViewProps> = ({ data, onAdminClick }) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [selectedId, setSelectedId] = useState<string>('');
  const [showFreeRooms, setShowFreeRooms] = useState(false);
  const [showTodayOnly, setShowTodayOnly] = useState(true);
  const routineRef = useRef<HTMLDivElement>(null);

  // Determine current day for Daily View
  const today = useMemo(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    const d = new Date().getDay();
    return days[d];
  }, []);

  // Auto-scroll to routine when selection changes
  useEffect(() => {
    if (selectedId && routineRef.current) {
      const offset = 100; // Offset for sticky header
      const elementPosition = routineRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }, [selectedId]);

  const handleExportPDF = () => {
    window.print();
  };

  const isMaintenance = !data.settings.isPublished;

  // Group sections by batch for clearer display
  const sectionsByBatch = useMemo(() => data.sections.reduce((acc, section) => {
    if (!acc[section.batch]) acc[section.batch] = [];
    acc[section.batch].push(section);
    return acc;
  }, {} as Record<number, Section[]>), [data.sections]);

  // Logic to find free rooms today
  const freeRoomsToday = useMemo(() => {
    const results: Record<string, string[]> = {};
    data.rooms.forEach(room => {
      const freeSlots: string[] = [];
      TIME_SLOTS.forEach(slot => {
        const startTime = slot.split(' - ')[0];
        const isOccupied = data.schedule.some(s => 
          s.day === today && 
          s.startTime === startTime && 
          s.roomId === room.id
        );
        if (!isOccupied) freeSlots.push(slot);
      });
      if (freeSlots.length > 0) results[room.roomNumber] = freeSlots;
    });
    return results;
  }, [data.rooms, data.schedule, today]);

  // Overall Today's Summary
  const todayAllClasses = useMemo(() => {
    return data.schedule
      .filter(s => s.day === today)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data.schedule, today]);

  // Filter logic for selected entity
  let filterType: 'section' | 'batch' | 'teacher' | 'all' = 'section';
  let filterValue = selectedId;
  let displayTitle = '';

  if (viewMode === 'teacher') {
    filterType = 'teacher';
    displayTitle = data.teachers.find(t => t.id === selectedId)?.name || '';
  } else {
    if (selectedId.startsWith('batch-')) {
      filterType = 'batch';
      filterValue = selectedId.replace('batch-', '');
      displayTitle = `Batch ${filterValue} (All Sections)`;
    } else {
      filterType = 'section';
      const s = data.sections.find(s => s.id === selectedId);
      if (s) displayTitle = `Batch ${s.batch} - ${s.name ? `Section ${s.name}` : 'Entire Batch'}`;
    }
  }

  const SessionCard = ({ session }: { session: ClassSession }) => {
    const course = data.courses.find(c => c.id === session.courseId);
    const teacher = data.teachers.find(t => t.id === session.teacherId);
    const room = data.rooms.find(r => r.id === session.roomId);
    const section = data.sections.find(s => s.id === session.sectionId);
    const colorClass = section ? getBatchColor(section.batch) : 'bg-gray-100 text-gray-800';

    return (
      <div className={`p-4 rounded-2xl border ${colorClass} bg-opacity-40 backdrop-blur-sm flex flex-col justify-between h-full hover:shadow-md transition-all cursor-default shadow-sm border-white/20`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{session.startTime}</span>
          <span className="bg-white/90 px-2 py-0.5 rounded-lg text-[9px] font-bold border border-white/40">{room?.roomNumber}</span>
        </div>
        <div className="font-bold text-xs mb-1 line-clamp-1">{course?.name}</div>
        <div className="flex justify-between items-center mt-2">
          <span className="text-[10px] font-medium opacity-80">{teacher?.initial}</span>
          <span className="text-[9px] font-bold bg-white/50 px-1.5 py-0.5 rounded">
            {section?.name ? `B${section.batch}-${section.name}` : `B${section?.batch}`}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FDFDF6] text-gray-900 font-sans selection:bg-blue-100 relative overflow-hidden pb-20">
      
      {/* --- Creative Background Design --- */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
         
         {/* Top Right: Abstract Geometric Compass */}
         <svg className="absolute -top-24 -right-24 w-[600px] h-[600px] text-blue-100 opacity-60" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="90" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="70" strokeWidth="0.5" strokeDasharray="4 4" />
            <path d="M100 0 L100 200 M0 100 L200 100" strokeWidth="0.5" />
            <rect x="100" y="100" width="60" height="60" strokeWidth="0.5" transform="translate(-30, -30) rotate(45 100 100)" />
         </svg>

         {/* Bottom Left: Architectural Lines */}
         <svg className="absolute -bottom-32 -left-32 w-[800px] h-[800px] text-gray-200 opacity-60" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <path d="M0 200 L200 0" strokeWidth="1" />
            <path d="M20 200 L200 20" strokeWidth="0.5" />
            <path d="M40 200 L200 40" strokeWidth="0.5" />
            <circle cx="0" cy="200" r="120" strokeWidth="0.5" strokeDasharray="2 2" />
         </svg>

         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
      </div>

      <header className="sticky top-0 z-30 bg-[#FDFDF6]/80 backdrop-blur-md border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-xl font-medium text-gray-800 tracking-tight hidden sm:inline">DIU Routine Master</span>
          </div>
          <div className="flex items-center gap-2">
              <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
          </div>
        </div>
      </header>

      {isMaintenance ? (
          <main className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
               <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full mb-6">
                   <AlertTriangle className="w-10 h-10" />
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-4">Routine System Updating</h1>
               <p className="text-gray-500 max-w-md mx-auto">The schedule for {data.settings.semesterName} is currently being finalized.</p>
          </main>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* --- Hero Section (RESTORED) --- */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 no-print">
          <div className="inline-block mb-4 px-3 py-1 bg-white/60 backdrop-blur-sm border border-blue-100 rounded-full text-blue-600 text-xs font-semibold tracking-wide uppercase shadow-sm">
            {data.settings.semesterName} Schedule
          </div>
          <h1 className="text-4xl md:text-6xl font-normal text-gray-900 mb-6 tracking-tight">
            Find your <span className="text-blue-600 font-medium relative inline-block">
              Class Routine
              <svg className="absolute w-full h-2 bottom-0 left-0 text-blue-200 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                 <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.6"/>
              </svg>
            </span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            The official centralized scheduling system for the Computing and Information System department at Daffodil International University.
          </p>

          {/* Daily Summary Button */}
          <div className="flex items-center justify-center gap-4">
             <button 
                onClick={() => setShowFreeRooms(!showFreeRooms)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all ${showFreeRooms ? 'bg-blue-600 text-white shadow-xl' : 'bg-white border border-gray-200 text-gray-700 hover:border-blue-400 shadow-sm'}`}
             >
               <MapPin className="w-4 h-4" /> {showFreeRooms ? 'Close Room List' : 'Off Rooms Today'}
             </button>
          </div>
        </div>

        {/* Free Rooms Finder */}
        {showFreeRooms && (
          <div className="max-w-4xl mx-auto mb-16 animate-in slide-in-from-top-4 fade-in duration-500 no-print">
             <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-blue-100 p-8 shadow-xl shadow-blue-50">
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                      <Clock className="w-5 h-5 text-blue-600" /> Free Rooms ({today})
                   </h3>
                   <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">Available Now</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                   {/* // FIX: Explicitly typed 'slots' as string[] using casting on Object.entries to resolve 'unknown' type error */}
                   {Object.entries(freeRoomsToday).length > 0 ? (Object.entries(freeRoomsToday) as [string, string[]][]).map(([roomNum, slots]) => (
                     <div key={roomNum} className="group bg-gray-50/50 hover:bg-white p-4 rounded-2xl border border-gray-100 hover:border-blue-200 transition-all">
                        <div className="text-sm font-bold text-gray-800 mb-2">{roomNum}</div>
                        <div className="space-y-1">
                           {slots.slice(0, 2).map(slot => (
                             <div key={slot} className="text-[10px] text-gray-500 truncate">
                                • {slot.split(' - ')[0]}
                             </div>
                           ))}
                        </div>
                     </div>
                   )) : <p className="text-gray-400 text-sm col-span-full text-center">No free rooms data available.</p>}
                </div>
             </div>
          </div>
        )}

        {/* Today's Horizontal Scroll Routine */}
        {!selectedId && !showFreeRooms && (
          <div className="mb-16 no-print">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">Daily Quick Look • {today}</h3>
            <div className="flex overflow-x-auto pb-6 gap-4 scrollbar-hide">
              {todayAllClasses.length > 0 ? todayAllClasses.map(session => (
                <div key={session.id} className="min-w-[200px] flex-shrink-0 animate-in fade-in zoom-in-95 duration-500">
                  <SessionCard session={session} />
                </div>
              )) : (
                <div className="w-full py-8 text-center text-gray-400 text-sm bg-white/40 rounded-3xl border border-dashed border-gray-200">
                  No classes scheduled for today.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Interface */}
        <div className="no-print">
          <div className="flex justify-center mb-10">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full inline-flex relative shadow-sm border border-gray-100">
              <button
                onClick={() => { setViewMode('student'); setSelectedId(''); }}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'student' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Users className="w-4 h-4 inline mr-2" /> Student
              </button>
              <button
                onClick={() => { setViewMode('teacher'); setSelectedId(''); }}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'teacher' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <User className="w-4 h-4 inline mr-2" /> Teacher
              </button>
            </div>
          </div>

          <div className="max-w-lg mx-auto mb-20 relative">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="block w-full h-16 pl-6 pr-12 text-lg bg-white/90 backdrop-blur-sm border border-gray-200 rounded-3xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md"
            >
              <option value="" disabled hidden>Select {viewMode === 'student' ? 'Section/Batch' : 'Teacher'}</option>
              {viewMode === 'student' ? (
                Object.entries(sectionsByBatch).map(([batch, sections]) => (
                   <optgroup key={batch} label={`Batch ${batch}`}>
                       <option value={`batch-${batch}`}>All of Batch {batch}</option>
                       {(sections as Section[]).map(s => <option key={s.id} value={s.id}>{s.name ? `Section ${s.name}` : `Batch ${s.batch}`}</option>)}
                   </optgroup>
                ))
              ) : (
                data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>)
              )}
            </select>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Selected View (Table) */}
        <div ref={routineRef} className="scroll-mt-24">
          {selectedId ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white p-6 md:p-12 animate-in fade-in slide-in-from-bottom-10 duration-700 ring-1 ring-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" /> Weekly Schedule
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{displayTitle}</h2>
                  <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                    {data.settings.semesterName} • {today}
                  </p>
                </div>
                <div className="flex items-center gap-3 no-print">
                   <button 
                    onClick={() => setShowTodayOnly(!showTodayOnly)}
                    className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all border ${showTodayOnly ? 'bg-gray-900 text-white shadow-lg' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                   >
                     {showTodayOnly ? "Full Week" : "Highlight Today"}
                   </button>
                   <button onClick={handleExportPDF} className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors shadow-sm" title="Print Routine">
                     <Download className="w-5 h-5" />
                   </button>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-3xl border border-gray-100">
                <ScheduleTable 
                  data={data} 
                  filterType={filterType} 
                  filterId={filterValue} 
                />
              </div>

              {viewMode === 'teacher' && (
                  <div className="mt-10 p-6 bg-gray-50/50 rounded-3xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                       {(() => {
                           const t = data.teachers.find(tr => tr.id === selectedId);
                           if(!t) return null;
                           return (
                               <>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center"><Clock className="w-5 h-5" /></div>
                                    <div>
                                      <div className="text-gray-400 text-[10px] font-bold uppercase">Counseling Hour</div>
                                      <div className="font-semibold text-gray-700">{t.counselingHour || 'None scheduled'}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center"><AlertTriangle className="w-5 h-5" /></div>
                                    <div>
                                      <div className="text-gray-400 text-[10px] font-bold uppercase">Weekly Off Days</div>
                                      <div className="font-semibold text-gray-700">{t.offDays?.length ? t.offDays.join(', ') : 'No fixed off-days'}</div>
                                    </div>
                                  </div>
                               </>
                           )
                       })()}
                  </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700 no-print">
              <div className="w-40 h-40 bg-white/60 rounded-full flex items-center justify-center mb-8 border border-gray-100 shadow-inner">
                <Search className="w-16 h-16 text-gray-200" />
              </div>
              <h3 className="text-lg font-bold text-gray-400">Select a section or teacher above</h3>
              <p className="text-gray-400 text-sm mt-2">to view their full academic schedule</p>
            </div>
          )}
        </div>

        {/* Print Layout */}
        <div className="hidden print:block mt-8">
            <h2 className="text-2xl font-bold text-center mb-6">{data.settings.semesterName} - Complete Schedule</h2>
            <ScheduleTable data={data} filterType="all" />
        </div>
      </main>
      )}

      <footer className="mt-auto py-10 text-center border-t border-gray-100 bg-white/50 backdrop-blur-sm no-print relative z-10">
        <p className="text-sm text-gray-400 font-medium">Developed for DIU Computing & Information System Department &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default PublicView;