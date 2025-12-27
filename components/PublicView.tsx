import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppData, getBatchColor, Section, DayOfWeek, TIME_SLOTS, ClassSession } from '../types';
import ScheduleTable from './ScheduleTable';
import { 
  Search, User, Users, Calendar, ShieldCheck, ChevronDown, 
  Download, AlertTriangle, Clock, MapPin, CheckCircle2, 
  Maximize2, Minimize2, LayoutGrid, Mail, Phone, Copy, Check, Info
} from 'lucide-react';

interface PublicViewProps {
  data: AppData;
  onAdminClick: () => void;
}

const PublicView: React.FC<PublicViewProps> = ({ data, onAdminClick }) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [selectedId, setSelectedId] = useState<string>('');
  const [utilityTab, setUtilityTab] = useState<'none' | 'today' | 'daySelector' | 'rooms'>('today');
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    return days[new Date().getDay()];
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const routineRef = useRef<HTMLDivElement>(null);

  const DAYS_ORDER = [
    DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, 
    DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday
  ];

  // Full current date formatting: Sunday, 27-January-2025
  const fullCurrentDate = useMemo(() => {
    const date = new Date();
    const dayName = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday][date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day}-${month}-${year}`;
  }, []);

  const today = useMemo(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    return days[new Date().getDay()];
  }, []);

  useEffect(() => {
    if (selectedId && routineRef.current && !isFullScreen) {
      const offset = 100;
      const elementPosition = routineRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [selectedId, isFullScreen]);

  const handleExportPDF = () => {
    window.print();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isMaintenance = !data.settings.isPublished;

  const sectionsByBatch = useMemo(() => data.sections.reduce((acc, section) => {
    if (!acc[section.batch]) acc[section.batch] = [];
    acc[section.batch].push(section);
    return acc;
  }, {} as Record<number, Section[]>), [data.sections]);

  const freeRoomsToday = useMemo(() => {
    const results: Record<string, string[]> = {};
    data.rooms.forEach(room => {
      const freeSlots: string[] = [];
      TIME_SLOTS.forEach(slot => {
        const startTime = slot.split(' - ')[0];
        const isOccupied = data.schedule.some(s => 
          s.day === today && s.startTime === startTime && s.roomId === room.id
        );
        if (!isOccupied) freeSlots.push(slot);
      });
      if (freeSlots.length > 0) results[room.roomNumber] = freeSlots;
    });
    return results;
  }, [data.rooms, data.schedule, today]);

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

  const UtilityContent = () => {
    if (utilityTab === 'none') return null;

    if (utilityTab === 'rooms') {
      return (
        <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-8 bg-white/80 backdrop-blur-md rounded-[32px] border border-emerald-100 p-6 md:p-8 shadow-xl shadow-emerald-50">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3 mb-6">
                <MapPin className="w-5 h-5 text-emerald-600" /> Free Rooms Today ({today})
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {(Object.entries(freeRoomsToday) as [string, string[]][]).length > 0 ? (Object.entries(freeRoomsToday) as [string, string[]][]).map(([roomNum, slots]) => (
                <div key={roomNum} className="group bg-emerald-50/30 hover:bg-white p-4 rounded-2xl border border-emerald-100 hover:border-emerald-400 transition-all">
                    <div className="text-sm font-bold text-emerald-800 mb-2">{roomNum}</div>
                    <div className="space-y-1">
                    {slots.slice(0, 3).map(slot => (
                        <div key={slot} className="text-[10px] text-emerald-600/70 truncate flex items-center gap-1">
                            <CheckCircle2 className="w-2.5 h-2.5" /> {slot}
                        </div>
                    ))}
                    </div>
                </div>
            )) : <p className="text-gray-400 text-sm col-span-full text-center py-4">No rooms currently available.</p>}
            </div>
        </div>
      );
    }

    const activeViewDay = utilityTab === 'today' ? today : selectedDay;

    return (
      <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-8 p-1 bg-white/40 rounded-[40px] border border-gray-100 shadow-inner">
          <div className="bg-white rounded-[38px] p-4 md:p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
               <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${utilityTab === 'today' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{utilityTab === 'today' ? "Today's Quick Routine" : `Schedule for ${selectedDay}`}</h3>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-widest">{activeViewDay}</p>
                    </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-2">
                    {utilityTab === 'daySelector' && (
                        <div className="flex flex-wrap items-center gap-1 bg-gray-50 p-1 rounded-full border border-gray-100">
                            {DAYS_ORDER.map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setSelectedDay(d)}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all ${selectedDay === d ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {d.substring(0,3)}
                                </button>
                            ))}
                        </div>
                    )}
                    <button 
                      onClick={() => setIsFullScreen(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold hover:bg-blue-100 transition-all border border-blue-200"
                    >
                      <LayoutGrid className="w-4 h-4" /> <span className="inline">Master View</span>
                    </button>
                    <button onClick={handleExportPDF} className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-full text-sm font-medium hover:shadow-lg transition-all">
                        <Download className="w-4 h-4" /> <span className="inline">Download Day</span>
                    </button>
               </div>
            </div>
            
            <div className="overflow-hidden rounded-3xl border border-gray-100">
                <ScheduleTable 
                    data={data} 
                    filterType="all" 
                    specificDay={activeViewDay} 
                />
            </div>
          </div>
      </div>
    );
  };

  const FullScreenMaster = () => (
      <div className={`fixed inset-0 z-[100] bg-[#FDFDF6] p-4 md:p-10 flex flex-col animate-in fade-in duration-300 ${isFullScreen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-200">
                    <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Master Routine Overview</h2>
                    <p className="text-sm text-gray-500">{data.settings.semesterName} • CIS Department</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                  <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:border-blue-400 transition-all shadow-sm">
                      <Download className="w-4 h-4" /> Print Master
                  </button>
                  <button onClick={() => setIsFullScreen(false)} className="p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-all">
                      <Minimize2 className="w-6 h-6" />
                  </button>
              </div>
          </div>
          <div className="flex-1 overflow-auto rounded-[40px] border border-gray-100 bg-white shadow-2xl p-4 md:p-6">
             <ScheduleTable data={data} filterType="all" />
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF6] text-gray-900 font-sans selection:bg-blue-100 relative overflow-hidden pb-20">
      <FullScreenMaster />
      
      {/* Background Decor */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.1 }}></div>
         <svg className="absolute -top-24 -right-24 w-[600px] h-[600px] text-blue-100 opacity-60" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="90" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="70" strokeWidth="0.5" strokeDasharray="4 4" />
            <rect x="100" y="100" width="60" height="60" strokeWidth="0.5" transform="translate(-30, -30) rotate(45 100 100)" />
         </svg>
      </div>

      <header className="sticky top-0 z-30 bg-[#FDFDF6]/80 backdrop-blur-md border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-xl font-medium text-gray-800 tracking-tight hidden sm:inline">Routine Master</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => { setSelectedId(''); setUtilityTab('none'); setTimeout(() => window.print(), 200); }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-full transition-all hover:bg-gray-50 shadow-sm"
                title="Download Master Routine"
              >
                <Download className="w-4 h-4 text-blue-600" />
                <span className="inline">Master Schedule</span>
              </button>
              <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        
        {/* --- Hero Section --- */}
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 no-print">
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
          <div className="flex flex-col items-center gap-2 mb-8">
            <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
              Official centralized scheduling system for the Computing and Information System department.
            </p>
            <div className="flex flex-col md:flex-row items-center gap-3">
              {data.lastModified && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                      <Info className="w-3 h-3" /> Last Modified: {data.lastModified}
                  </div>
              )}
            </div>
          </div>
        </div>

        {/* --- Unified Tools --- */}
        <div className="max-w-4xl mx-auto mb-16 no-print px-2">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
                <div className="flex flex-wrap justify-center gap-2">
                    <button 
                        onClick={() => setUtilityTab(prev => prev === 'today' ? 'none' : 'today')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all border ${utilityTab === 'today' ? 'bg-blue-600 text-white border-blue-600 shadow-xl' : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'}`}
                    >
                        <Clock className="w-4 h-4" /> Today
                    </button>
                    <button 
                        onClick={() => setUtilityTab(prev => prev === 'daySelector' ? 'none' : 'daySelector')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all border ${utilityTab === 'daySelector' ? 'bg-purple-600 text-white border-purple-600 shadow-xl' : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400'}`}
                    >
                        <Calendar className="w-4 h-4" /> Filter
                    </button>
                    <button 
                        onClick={() => setUtilityTab(prev => prev === 'rooms' ? 'none' : 'rooms')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all border ${utilityTab === 'rooms' ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'}`}
                    >
                        <MapPin className="w-4 h-4" /> Rooms
                    </button>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-full border border-blue-100 whitespace-nowrap shadow-sm">
                   <Clock className="w-3.5 h-3.5" /> {fullCurrentDate}
                </div>
            </div>

            <UtilityContent />
        </div>

        {/* --- Main Selection --- */}
        <div className="no-print border-t border-gray-100 pt-12">
          <div className="flex justify-center mb-10">
            <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full inline-flex relative shadow-sm border border-gray-100">
              <button
                onClick={() => { setViewMode('student'); setSelectedId(''); }}
                className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'student' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Users className="w-4 h-4 inline mr-2" /> Student
              </button>
              <button
                onClick={() => { setViewMode('teacher'); setSelectedId(''); }}
                className={`relative z-10 px-6 md:px-8 py-2.5 rounded-full text-sm font-medium transition-all ${viewMode === 'teacher' ? 'text-gray-900 bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <User className="w-4 h-4 inline mr-2" /> Teacher
              </button>
            </div>
          </div>

          <div className="max-w-lg mx-auto mb-20 relative px-4">
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
            <div className="absolute inset-y-0 right-8 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* --- Routine Display Area --- */}
        <div ref={routineRef} className="scroll-mt-24 px-2 md:px-0">
          {selectedId ? (
            <div className="bg-white/95 backdrop-blur-sm rounded-[40px] shadow-2xl shadow-gray-200/50 border border-white p-6 md:p-12 animate-in fade-in slide-in-from-bottom-10 duration-700 ring-1 ring-gray-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                <div>
                  <div className="flex items-center gap-2 text-blue-600 font-bold text-xs mb-2 uppercase tracking-widest">
                    <Calendar className="w-4 h-4" /> Full Weekly Routine
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 tracking-tight">{displayTitle}</h2>
                  <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
                    {data.settings.semesterName} • Standard Saturday-Friday Week
                  </p>
                </div>
                <div className="flex items-center gap-3 no-print">
                   <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-bold shadow-lg hover:shadow-gray-300 transition-all">
                        <Download className="w-4 h-4" /> <span className="inline">Download PDF</span>
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
                  <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                       {(() => {
                           const t = data.teachers.find(tr => tr.id === selectedId);
                           if(!t) return null;
                           const isOffToday = t.offDays.includes(today);
                           
                           return (
                               <>
                                  <div className={`p-8 bg-white rounded-3xl border shadow-sm transition-all ${isOffToday ? 'md:col-span-2 border-orange-200 bg-orange-50/30' : 'border-gray-100'}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${isOffToday ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'}`}>
                                        <AlertTriangle className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Weekly Off-Days</div>
                                        <div className={`text-xl font-bold ${isOffToday ? 'text-orange-900' : 'text-gray-800'}`}>
                                          {t.offDays?.length ? t.offDays.join(', ') : 'No Fixed Off-Days'}
                                          {isOffToday && <span className="ml-3 inline-block px-3 py-1 bg-orange-600 text-white rounded-full text-[10px] animate-pulse">OFF TODAY</span>}
                                        </div>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-500">Scheduled faculty non-working days for this session.</p>
                                  </div>

                                  <div className={`p-8 bg-white rounded-3xl border border-gray-100 shadow-sm ${isOffToday ? 'md:col-span-2' : ''}`}>
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Clock className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Counseling Slot</div>
                                        <div className="text-xl font-bold text-gray-800">{t.counselingHour || 'None Scheduled'}</div>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-500">Students may visit during this hour for academic discussion.</p>
                                  </div>

                                  <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Mail className="w-6 h-6" />
                                      </div>
                                      <div>
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Email Address</div>
                                        <a href={`mailto:${t.email}`} className="text-lg font-bold text-emerald-700 hover:underline break-all">{t.email}</a>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="p-8 bg-white rounded-3xl border border-gray-100 shadow-sm">
                                    <div className="flex items-center gap-4 mb-4">
                                      <div className="w-14 h-14 bg-cyan-100 text-cyan-600 rounded-2xl flex items-center justify-center shadow-sm">
                                        <Phone className="w-6 h-6" />
                                      </div>
                                      <div className="flex-1">
                                        <div className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Contact Number</div>
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <span className="text-lg font-bold text-gray-800">{t.phone || 'N/A'}</span>
                                          {t.phone && (
                                            <button 
                                              onClick={() => copyToClipboard(t.phone!)} 
                                              className="p-1.5 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-gray-400 hover:text-cyan-600 transition-all flex items-center gap-1.5 no-print"
                                            >
                                              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                              <span className="text-[10px] font-bold uppercase tracking-tight">{copied ? 'Copied' : 'Copy'}</span>
                                            </button>
                                          )}
                                        </div>
                                      </div>
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
              <h3 className="text-lg font-bold text-gray-400 text-center">Select a profile to view their full schedule</h3>
            </div>
          )}
        </div>

        {/* Print Layout */}
        <div className="hidden print:block mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">{data.settings.semesterName} - Master Schedule</h2>
            <div className="flex justify-center gap-6 text-sm text-gray-500 mb-8 font-medium">
              <span>{fullCurrentDate}</span>
              {data.lastModified && <span>Last Modified: {data.lastModified}</span>}
            </div>
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