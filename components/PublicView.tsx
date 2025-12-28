import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppData, getBatchColor, Section, DayOfWeek, TIME_SLOTS, ClassSession, Teacher } from '../types';
import ScheduleTable from './ScheduleTable';
import { 
  Search, User, Users, Calendar, ShieldCheck, ChevronDown, 
  Download, AlertTriangle, Clock, MapPin, CheckCircle2, 
  LayoutGrid, Mail, Info, ArrowLeft, Filter, GraduationCap, Layers, Globe, Printer
} from 'lucide-react';

interface PublicViewProps {
  data: AppData;
  onAdminClick: () => void;
}

const PublicView: React.FC<PublicViewProps> = ({ data, onAdminClick }) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [selectedId, setSelectedId] = useState<string>('');
  const [utilityTab, setUtilityTab] = useState<'none' | 'today' | 'filter' | 'master'>('today');
  const [showFreeRooms, setShowFreeRooms] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    return days[new Date().getDay()];
  });
  
  const routineRef = useRef<HTMLDivElement>(null);

  const DAYS_ORDER = [
    DayOfWeek.Saturday, DayOfWeek.Sunday, DayOfWeek.Monday, 
    DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday
  ];

  const fullCurrentDate = useMemo(() => {
    const date = new Date();
    const dayName = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday][date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    return `${dayName}, ${day}-${month}-${year}`.toUpperCase();
  }, []);

  const today = useMemo(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    return days[new Date().getDay()];
  }, []);

  useEffect(() => {
    if (selectedId && routineRef.current) {
      const offset = 100;
      const elementPosition = routineRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;
      window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
    }
  }, [selectedId]);

  const handleExportPDF = () => {
    window.print();
  };

  const sectionsByBatch = useMemo(() => data.sections.reduce((acc, section) => {
    if (!acc[section.batch]) acc[section.batch] = [];
    acc[section.batch].push(section);
    return acc;
  }, {} as Record<number, Section[]>), [data.sections]);

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
      displayTitle = `Batch ${filterValue}`;
    } else {
      filterType = 'section';
      const s = data.sections.find(s => s.id === selectedId);
      if (s) displayTitle = `Batch ${s.batch} - ${s.name ? `Sec ${s.name}` : 'Entire Batch'}`;
    }
  }

  const UtilityContent = () => {
    if (utilityTab === 'none') return null;
    
    const isMaster = utilityTab === 'master';
    const activeViewDay = isMaster ? undefined : (utilityTab === 'today' ? (today as DayOfWeek) : selectedDay);

    return (
      <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-12 bg-white rounded-[32px] border border-gray-200 p-6 md:p-8 no-print shadow-none">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
               <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${utilityTab === 'today' ? 'bg-blue-600 text-white' : utilityTab === 'master' ? 'bg-gray-900 text-white' : 'bg-purple-600 text-white'}`}>
                        {utilityTab === 'today' ? <Clock className="w-5 h-5" /> : utilityTab === 'master' ? <LayoutGrid className="w-5 h-5" /> : <Filter className="w-5 h-5" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 tracking-tight">
                          {utilityTab === 'today' ? "Today's Live Feed" : utilityTab === 'master' ? "Department Master Routine" : `Search by Day: ${activeViewDay}`}
                        </h3>
                        <div className="flex items-center gap-3 mt-1">
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{isMaster ? "Academic Master Distribution" : activeViewDay}</p>
                        </div>
                    </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-3">
                    {utilityTab === 'filter' && (
                        <div className="flex flex-wrap items-center gap-1 bg-gray-100 p-1 rounded-full border border-gray-200">
                            {DAYS_ORDER.map(d => (
                                <button 
                                    key={d} 
                                    onClick={() => setSelectedDay(d)}
                                    className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${selectedDay === d ? 'bg-white text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                                >
                                    {d.substring(0,3)}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
                        <button 
                            onClick={() => setShowFreeRooms(false)}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold transition-all ${!showFreeRooms ? 'bg-white text-blue-600' : 'text-gray-400'}`}
                        >
                            Routine
                        </button>
                        <button 
                            onClick={() => setShowFreeRooms(true)}
                            className={`px-6 py-2 rounded-full text-[10px] font-bold transition-all ${showFreeRooms ? 'bg-emerald-600 text-white' : 'text-gray-400'}`}
                        >
                            Free Rooms
                        </button>
                    </div>
               </div>
            </div>
            
            <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 bg-gray-50 border-b border-gray-200">
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Info className="w-3.5 h-3.5" /> DIU Academic Board
                   </span>
                   {isMaster && (
                     <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-full text-[10px] font-bold hover:bg-black transition-all">
                        <Printer className="w-3.5 h-3.5" /> EXPORT PROFESSIONAL TABLE
                     </button>
                   )}
                </div>
                <div className="overflow-x-auto custom-scrollbar">
                  <ScheduleTable 
                      data={data} 
                      filterType="all" 
                      specificDay={activeViewDay} 
                      showFreeRooms={showFreeRooms}
                  />
                </div>
            </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#fcfdfe] bg-grid text-gray-900 font-sans selection:bg-blue-100 relative overflow-hidden pb-24">
      
      {/* --- Animated Background Blueprint Design --- */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] pointer-events-none no-print opacity-[0.08] translate-x-1/4 -translate-y-1/4">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-rotate-slow">
            <circle cx="50" cy="50" r="48" fill="none" stroke="#2563eb" strokeWidth="0.1" strokeDasharray="2,2" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="#2563eb" strokeWidth="0.05" />
            <circle cx="50" cy="50" r="30" fill="none" stroke="#2563eb" strokeWidth="0.1" strokeDasharray="1,1" />
            <line x1="50" y1="0" x2="50" y2="100" stroke="#2563eb" strokeWidth="0.05" />
            <line x1="0" y1="50" x2="100" y2="50" stroke="#2563eb" strokeWidth="0.05" />
            <path d="M50 50 L85 15" stroke="#2563eb" strokeWidth="0.1" />
            <circle cx="85" cy="15" r="1.5" fill="#2563eb" />
        </svg>
      </div>

      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-lg font-bold text-[#1e293b] tracking-tight">Routine Master</span>
          </div>
          <div className="flex items-center gap-4">
              <button 
                onClick={() => setUtilityTab(utilityTab === 'master' ? 'today' : 'master')} 
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-full transition-all border ${utilityTab === 'master' ? 'bg-gray-900 text-white border-gray-900' : 'text-gray-600 border-transparent hover:border-gray-200'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                <span className="hidden sm:inline">Master Routine</span>
              </button>
              <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-500 hover:text-blue-600 transition-all">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Access</span>
              </button>
          </div>
        </div>
      </header>

      {!data.settings.isPublished ? (
          <main className="max-w-7xl mx-auto px-4 py-32 text-center relative z-10">
               <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-50 text-yellow-600 border border-yellow-100 rounded-[32px] mb-8">
                   <AlertTriangle className="w-10 h-10" />
               </div>
               <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">System Updating</h1>
               <p className="text-gray-500 max-w-lg mx-auto text-lg leading-relaxed">Syncing latest {data.settings.semesterName} distribution...</p>
          </main>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        
        <div className="text-center mb-16 animate-in slide-in-from-bottom-8 fade-in duration-1000 no-print">
          <div className="inline-block mb-6 px-5 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold tracking-widest uppercase border border-blue-100">
            {data.settings.semesterName.toUpperCase()}
          </div>
          
          <h1 className="text-[56px] md:text-[84px] font-bold text-[#1e293b] mb-4 tracking-tighter leading-tight">
            CIS <span className="text-blue-600 italic">Schedule</span>
          </h1>
          
          <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10 font-medium">
            Academic resource distribution and class schedule mapping.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-blue-500" /> {fullCurrentDate}
              </div>
              <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-full text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                  <Info className="w-4 h-4 text-gray-300" /> LAST SYNC: {data.lastModified?.toUpperCase() || 'LIVE'}
              </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 px-4">
              <button 
                  onClick={() => setUtilityTab('today')}
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-[24px] text-base font-bold transition-all border-2 ${utilityTab === 'today' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-[#1e293b] border-gray-200 hover:border-blue-400'}`}
              >
                  <Clock className="w-5 h-5" /> Quick Today
              </button>
              <button 
                  onClick={() => setUtilityTab('filter')}
                  className={`w-full sm:w-auto flex items-center justify-center gap-3 px-12 py-5 rounded-[24px] text-base font-bold transition-all border-2 ${utilityTab === 'filter' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white text-[#1e293b] border-gray-200 hover:border-purple-400'}`}
              >
                  <Filter className="w-5 h-5" /> Search By Day
              </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mb-16 no-print">
            <UtilityContent />
        </div>

        {/* --- Profile Selector UI --- */}
        <div className="no-print border-t border-gray-100 pt-16">
          <div className="flex justify-center mb-10">
            <div className="bg-gray-100 p-1.5 rounded-full inline-flex border border-gray-200">
              <button
                onClick={() => { setViewMode('student'); setSelectedId(''); }}
                className={`px-10 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-3 ${viewMode === 'student' ? 'text-gray-900 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Users className="w-4 h-4" /> Student Portal
              </button>
              <button
                onClick={() => { setViewMode('teacher'); setSelectedId(''); }}
                className={`px-10 py-3 rounded-full text-xs font-bold transition-all flex items-center gap-3 ${viewMode === 'teacher' ? 'text-gray-900 bg-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <GraduationCap className="w-4 h-4" /> Faculty Portal
              </button>
            </div>
          </div>

          <div className="max-w-xl mx-auto mb-24 relative px-4">
            <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-blue-500 transition-colors pointer-events-none">
                    {viewMode === 'student' ? <Layers className="w-5 h-5" /> : <User className="w-5 h-5" />}
                </div>
                <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="block w-full h-16 pl-14 pr-12 text-lg font-bold bg-white/90 border border-gray-200 rounded-[24px] appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer hover:border-gray-300"
                >
                <option value="" disabled hidden>Select {viewMode === 'student' ? 'Batch / Section' : 'Faculty Name'}</option>
                {viewMode === 'student' ? (
                    Object.entries(sectionsByBatch).map(([batch, sections]) => (
                    <optgroup key={batch} label={`Batch ${batch}`}>
                        <option value={`batch-${batch}`}>👥 Batch {batch} (Full)</option>
                        {(sections as Section[]).map(s => <option key={s.id} value={s.id}>📍 Section {s.name ? s.name : 'Core'} (Batch {s.batch})</option>)}
                    </optgroup>
                    ))
                ) : (
                    data.teachers.map(t => <option key={t.id} value={t.id}>🎓 {t.name} ({t.initial})</option>)
                )}
                </select>
                <div className="absolute right-6 top-5 flex items-center pointer-events-none text-gray-400">
                    <ChevronDown className="w-6 h-6" />
                </div>
            </div>
          </div>
        </div>

        {/* --- Result Table --- */}
        <div id="print-area" ref={routineRef} className="scroll-mt-24 px-2 md:px-0">
          {selectedId ? (
            <div className="bg-white border border-gray-100 rounded-[40px] p-6 md:p-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-blue-600 rounded-sm"></div>
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-[0.4em]">Official CIS Schedule</p>
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter leading-none">{displayTitle}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-4 no-print">
                   <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-10 py-3.5 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all">
                        <Printer className="w-4 h-4" /> EXPORT PRINT-READY TABLE
                   </button>
                </div>
              </div>
              
              <div className="rounded-[24px] border border-gray-100 overflow-hidden bg-gray-50/50 overflow-x-auto custom-scrollbar">
                <ScheduleTable data={data} filterType={filterType} filterId={filterValue} />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 animate-in fade-in duration-1000 no-print">
              <div className="w-24 h-24 bg-white border border-gray-100 rounded-full flex items-center justify-center mb-8">
                <Search className="w-8 h-8 text-gray-100" />
              </div>
              <h3 className="text-[10px] font-bold text-gray-200 text-center uppercase tracking-[0.5em]">Awaiting Selection</h3>
            </div>
          )}
        </div>
      </main>
      )}

      <footer className="mt-auto py-20 text-center border-t border-gray-100 bg-white/30 backdrop-blur-sm no-print relative z-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.5em] mb-4">
            DAFFODIL INTERNATIONAL UNIVERSITY &bull; CIS DEPARTMENT
        </p>
        <p className="text-[9px] text-gray-300 uppercase tracking-[0.2em]">
            &copy; {new Date().getFullYear()} DIU Routine Board v3.0 Flat Design
        </p>
      </footer>
    </div>
  );
};

export default PublicView;