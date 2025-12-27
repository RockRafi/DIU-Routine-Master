import React, { useState, useEffect, useRef, useMemo } from 'react';
import { AppData, getBatchColor, Section, DayOfWeek, TIME_SLOTS, ClassSession, Teacher } from '../types';
import ScheduleTable from './ScheduleTable';
import { 
  Search, User, Users, Calendar, ShieldCheck, ChevronDown, 
  Download, AlertTriangle, Clock, MapPin, CheckCircle2, 
  Minimize2, Maximize2, LayoutGrid, Mail, Phone, Copy, Check, Info, ArrowLeft, Filter, GraduationCap, Layers
} from 'lucide-react';

interface PublicViewProps {
  data: AppData;
  onAdminClick: () => void;
}

const PublicView: React.FC<PublicViewProps> = ({ data, onAdminClick }) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [selectedId, setSelectedId] = useState<string>('');
  const [utilityTab, setUtilityTab] = useState<'none' | 'today' | 'filter'>('today');
  const [showFreeRooms, setShowFreeRooms] = useState(false);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(() => {
    const days = [DayOfWeek.Sunday, DayOfWeek.Monday, DayOfWeek.Tuesday, DayOfWeek.Wednesday, DayOfWeek.Thursday, DayOfWeek.Friday, DayOfWeek.Saturday];
    return days[new Date().getDay()];
  });
  const [isFullScreen, setIsFullScreen] = useState(false);
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
      displayTitle = `Batch ${filterValue} (All Sections)`;
    } else {
      filterType = 'section';
      const s = data.sections.find(s => s.id === selectedId);
      if (s) displayTitle = `Batch ${s.batch} - ${s.name ? `Section ${s.name}` : 'Entire Batch'}`;
    }
  }

  const UtilityContent = () => {
    if (utilityTab === 'none') return null;
    const activeViewDay = utilityTab === 'today' ? (today as DayOfWeek) : selectedDay;

    return (
      <div className="animate-in slide-in-from-top-4 fade-in duration-500 mb-8 p-1 bg-white/40 rounded-[40px] border border-gray-100 shadow-inner no-print backdrop-blur-sm">
          <div className="bg-white/80 rounded-[38px] p-4 md:p-8 shadow-sm">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-6">
               <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${utilityTab === 'today' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                        {utilityTab === 'today' ? <Clock className="w-6 h-6" /> : <Filter className="w-6 h-6" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{utilityTab === 'today' ? "Today's Status" : `Filtering ${activeViewDay}`}</h3>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{activeViewDay}</p>
                    </div>
               </div>
               
               <div className="flex flex-wrap items-center gap-3">
                    {utilityTab === 'filter' && (
                        <div className="flex flex-wrap items-center gap-1 bg-gray-50/80 p-1 rounded-full border border-gray-200 backdrop-blur-sm">
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

                    <div className="flex bg-gray-100/80 p-1 rounded-full border border-gray-200 backdrop-blur-sm">
                        <button 
                            onClick={() => setShowFreeRooms(false)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${!showFreeRooms ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400'}`}
                        >
                            Class View
                        </button>
                        <button 
                            onClick={() => setShowFreeRooms(true)}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-bold transition-all ${showFreeRooms ? 'bg-emerald-600 text-white shadow-sm' : 'text-gray-400'}`}
                        >
                            Free Room
                        </button>
                    </div>
               </div>
            </div>
            
            <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white/90 relative">
                <div className="flex justify-between items-center px-4 py-3 bg-gray-50/50 border-b border-gray-100">
                   <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <LayoutGrid className="w-3 h-3" /> Live Feed
                   </span>
                   <div className="flex gap-2">
                        <button onClick={() => setIsFullScreen(true)} className="p-2 bg-white border border-gray-200 rounded-full text-gray-500 hover:text-blue-600 transition-all shadow-sm" title="Master View">
                            <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={handleExportPDF} className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-full text-[10px] font-bold hover:bg-black transition-all">
                            <Download className="w-3 h-3" /> <span className="hidden sm:inline">Export</span>
                        </button>
                   </div>
                </div>
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

  const FullScreenMaster = () => (
      <div className={`fixed inset-0 z-[100] bg-[#FDFDF6] p-4 md:p-10 flex flex-col animate-in fade-in duration-300 ${isFullScreen ? 'block' : 'hidden'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => setIsFullScreen(false)} className="p-3 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-blue-600 transition-all shadow-sm">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">Master Routine</h2>
                    <p className="text-xs text-gray-500 uppercase font-black tracking-widest">{data.settings.semesterName}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                  <button onClick={handleExportPDF} className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-full text-sm font-bold shadow-lg hover:bg-black transition-all">
                      <Download className="w-4 h-4" /> <span className="hidden sm:inline">Export Master PDF</span>
                  </button>
                  <button onClick={() => setIsFullScreen(false)} className="hidden md:flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all">
                      <Minimize2 className="w-4 h-4" /> Close
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
      
      {/* --- Advanced Line Art Background --- */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)', backgroundSize: '60px 60px', opacity: 0.15 }}></div>
        <div className="absolute top-0 right-0 w-full h-full">
            <svg className="absolute -top-10 -right-10 w-[600px] h-[600px] text-blue-500/10 animate-[float_20s_ease-in-out_infinite]" viewBox="0 0 200 200" fill="none" stroke="currentColor">
                <circle cx="100" cy="100" r="80" strokeWidth="0.5" />
                <circle cx="100" cy="100" r="50" strokeWidth="0.5" strokeDasharray="5 5" />
                <path d="M100 20 L100 180" strokeWidth="0.25" />
                <path d="M20 100 L180 100" strokeWidth="0.25" />
                <circle cx="100" cy="20" r="3" fill="currentColor" fillOpacity="0.2" />
                <circle cx="100" cy="180" r="3" fill="currentColor" fillOpacity="0.2" />
                <circle cx="20" cy="100" r="3" fill="currentColor" fillOpacity="0.2" />
                <circle cx="180" cy="100" r="3" fill="currentColor" fillOpacity="0.2" />
                <path d="M43 43 L157 157" strokeWidth="0.25" />
                <path d="M157 43 L43 157" strokeWidth="0.25" />
            </svg>
            <svg className="absolute -bottom-20 -left-20 w-[800px] h-[400px] text-indigo-500/5" viewBox="0 0 400 200" fill="none" stroke="currentColor">
                <path d="M0 150 Q 100 50 200 150 T 400 150" strokeWidth="1" />
                <path d="M0 160 Q 100 60 200 160 T 400 160" strokeWidth="0.5" />
                <path d="M0 170 Q 100 70 200 170 T 400 170" strokeWidth="0.25" />
                <line x1="50" y1="0" x2="50" y2="200" strokeWidth="0.1" />
                <line x1="150" y1="0" x2="150" y2="200" strokeWidth="0.1" />
                <line x1="250" y1="0" x2="250" y2="200" strokeWidth="0.1" />
                <line x1="350" y1="0" x2="350" y2="200" strokeWidth="0.1" />
            </svg>
            <div className="absolute top-[20%] left-[10%] w-32 h-32 rounded-full border border-blue-200/20 animate-[pulse_10s_infinite]"></div>
            <div className="absolute top-[60%] right-[15%] w-48 h-48 rounded-full border border-indigo-200/20 animate-[pulse_15s_infinite]"></div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(20px, -20px) rotate(2deg); }
          66% { transform: translate(-10px, 10px) rotate(-1deg); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.3; transform: scale(1.1); }
        }
      `}</style>

      <header className="sticky top-0 z-30 bg-[#FDFDF6]/70 backdrop-blur-lg border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-xl font-medium text-gray-800 tracking-tight hidden sm:inline">Routine Master</span>
          </div>
          <div className="flex items-center gap-3">
              <button onClick={() => setIsFullScreen(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all">
                <LayoutGrid className="w-4 h-4" />
                Master Routine
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1 hidden sm:block"></div>
              <button onClick={onAdminClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Access</span>
              </button>
          </div>
        </div>
      </header>

      {!data.settings.isPublished ? (
          <main className="max-w-7xl mx-auto px-4 py-20 text-center relative z-10">
               <div className="inline-flex items-center justify-center w-24 h-24 bg-yellow-100 text-yellow-600 rounded-full mb-6 animate-bounce">
                   <AlertTriangle className="w-10 h-10" />
               </div>
               <h1 className="text-3xl font-bold text-gray-900 mb-4">Routine System Updating</h1>
               <p className="text-gray-500 max-w-md mx-auto">Please check back later for the finalized schedule for the {data.settings.semesterName} semester.</p>
          </main>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        
        <div className="text-center mb-12 animate-in slide-in-from-bottom-4 fade-in duration-700 no-print">
          <div className="inline-block mb-4 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-600 text-[10px] font-black tracking-[0.2em] uppercase shadow-sm">
            {data.settings.semesterName} Schedule
          </div>
          <h1 className="text-4xl md:text-7xl font-light text-gray-900 mb-6 tracking-tight">
            CIS <span className="text-blue-600 font-medium italic relative">
              Schedule
              <span className="absolute -bottom-2 left-0 w-full h-1.5 bg-blue-500/10 rounded-full"></span>
            </span>
          </h1>
          <div className="flex flex-col items-center gap-4">
            <p className="text-gray-500 text-sm md:text-lg max-w-2xl mx-auto leading-relaxed px-4">
              Academic resource distribution and weekly scheduling for DIU CIS Department.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
                <div className="flex items-center gap-2 px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[10px] font-bold text-gray-500 uppercase tracking-widest border border-gray-200 shadow-sm">
                    <Clock className="w-3.5 h-3.5 text-blue-500" /> {fullCurrentDate}
                </div>
                <div className="flex items-center gap-2 px-5 py-2 bg-white/50 backdrop-blur-sm rounded-full text-[10px] font-bold text-gray-400 uppercase tracking-widest border border-gray-100 shadow-sm">
                    <Info className="w-3.5 h-3.5 text-gray-400" /> Last Updated: {data.lastModified || 'Just now'}
                </div>
            </div>
          </div>
        </div>

        {/* --- Utility Dashboard --- */}
        <div className="max-w-5xl mx-auto mb-16 no-print">
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-8 px-4">
                <button 
                    onClick={() => setUtilityTab('today')}
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all border ${utilityTab === 'today' ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-500/20 scale-105' : 'bg-white/70 backdrop-blur-sm text-gray-600 border-gray-200 hover:border-blue-400'}`}
                >
                    <Clock className="w-4 h-4" /> Quick Today
                </button>
                <button 
                    onClick={() => setUtilityTab('filter')}
                    className={`w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all border ${utilityTab === 'filter' ? 'bg-purple-600 text-white border-purple-600 shadow-xl shadow-purple-500/20 scale-105' : 'bg-white/70 backdrop-blur-sm text-gray-600 border-gray-200 hover:border-purple-400'}`}
                >
                    <Filter className="w-4 h-4" /> Search By Day
                </button>
            </div>
            <UtilityContent />
        </div>

        {/* --- Selection Logic --- */}
        <div className="no-print border-t border-gray-100/50 pt-16">
          <div className="flex justify-center mb-10">
            <div className="bg-white/40 backdrop-blur-md p-1.5 rounded-[22px] inline-flex relative shadow-sm border border-gray-100">
              <button
                onClick={() => { setViewMode('student'); setSelectedId(''); }}
                className={`px-8 py-3 rounded-[18px] text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'student' ? 'text-gray-900 bg-white shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Users className="w-4 h-4" /> Student
              </button>
              <button
                onClick={() => { setViewMode('teacher'); setSelectedId(''); }}
                className={`px-8 py-3 rounded-[18px] text-sm font-bold transition-all flex items-center gap-2 ${viewMode === 'teacher' ? 'text-gray-900 bg-white shadow-sm ring-1 ring-gray-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <GraduationCap className="w-4 h-4" /> Teacher
              </button>
            </div>
          </div>

          <div className="max-w-xl mx-auto mb-24 relative px-4">
            <div className="relative group">
                <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-hover:text-blue-500 transition-colors pointer-events-none">
                    {viewMode === 'student' ? <Layers className="w-6 h-6" /> : <User className="w-6 h-6" />}
                </div>
                <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="block w-full h-20 pl-16 pr-16 text-lg bg-white/60 backdrop-blur-md border border-gray-200 rounded-[30px] appearance-none focus:outline-none focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-blue-300 hover:bg-white/80"
                >
                <option value="" disabled hidden>Select your {viewMode === 'student' ? 'Section' : 'Faculty Member'} Profile</option>
                {viewMode === 'student' ? (
                    Object.entries(sectionsByBatch).map(([batch, sections]) => (
                    <optgroup key={batch} label={`📅 Batch ${batch}`}>
                        <option value={`batch-${batch}`}>All Sections (Batch {batch})</option>
                        {(sections as Section[]).map(s => <option key={s.id} value={s.id}>{s.name ? `Section ${s.name}` : `Full Batch ${s.batch}`}</option>)}
                    </optgroup>
                    ))
                ) : (
                    data.teachers.map(t => <option key={t.id} value={t.id}>🎓 {t.name} ({t.initial})</option>)
                )}
                </select>
                <div className="absolute right-8 top-7 flex items-center pointer-events-none text-gray-400 group-hover:text-blue-500 transition-colors">
                    <ChevronDown className="w-6 h-6" />
                </div>
            </div>
          </div>
        </div>

        {/* --- Result Display --- */}
        <div ref={routineRef} className="scroll-mt-24 px-2 md:px-0">
          {selectedId ? (
            <div className="bg-white/80 backdrop-blur-md rounded-[48px] shadow-2xl shadow-blue-900/5 border border-white p-6 md:p-14 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-8">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <p className="text-[10px] text-blue-600 font-black uppercase tracking-[0.3em]">Official CIS Routine</p>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 tracking-tight leading-tight">{displayTitle}</h2>
                </div>
                <div className="flex flex-wrap items-center gap-3 no-print">
                   <button onClick={() => setIsFullScreen(true)} className="flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-full text-sm font-bold shadow-sm hover:bg-gray-50 transition-all">
                        <LayoutGrid className="w-4 h-4" /> Master View
                   </button>
                   <button onClick={handleExportPDF} className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 text-white rounded-full text-sm font-bold shadow-xl hover:bg-black transition-all hover:-translate-y-1">
                        <Download className="w-4 h-4" /> Export Schedule
                   </button>
                </div>
              </div>
              
              <div className="overflow-hidden rounded-[32px] border border-gray-100 shadow-inner bg-white/50 backdrop-blur-sm">
                <ScheduleTable data={data} filterType={filterType} filterId={filterValue} />
              </div>

              {viewMode === 'teacher' && (
                  <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                       {(() => {
                           const t = data.teachers.find(tr => tr.id === selectedId);
                           if(!t) return null;
                           return (
                               <>
                                  <div className="p-8 bg-white/60 backdrop-blur-sm rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white transition-all">
                                    <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                                      <Calendar className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Weekly Off-Days</p>
                                    <p className="text-lg font-bold text-gray-800">{t.offDays?.length ? t.offDays.join(', ') : 'None'}</p>
                                  </div>
                                  <div className="p-8 bg-white/60 backdrop-blur-sm rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white transition-all">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                                      <Clock className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Counseling</p>
                                    <p className="text-lg font-bold text-gray-800">{t.counselingHour || 'Schedule Pending'}</p>
                                  </div>
                                  <div className="p-8 bg-white/60 backdrop-blur-sm rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:bg-white transition-all lg:col-span-2">
                                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-5 shadow-inner">
                                      <Mail className="w-6 h-6" />
                                    </div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Faculty Email</p>
                                    <p className="text-lg font-bold text-emerald-700 break-all">{t.email}</p>
                                  </div>
                               </>
                           )
                       })()}
                  </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-28 animate-in fade-in duration-1000 no-print">
              <div className="relative mb-8">
                  <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-3xl scale-150"></div>
                  <div className="relative w-32 h-32 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white shadow-xl">
                    <Search className="w-10 h-10 text-gray-200" />
                  </div>
              </div>
              <h3 className="text-sm font-bold text-gray-400 text-center uppercase tracking-[0.4em] opacity-80">Make a Selection to View Schedule</h3>
            </div>
          )}
        </div>
      </main>
      )}

      <footer className="mt-auto py-16 text-center border-t border-gray-100/30 bg-white/10 backdrop-blur-md no-print relative z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>
        <div className="flex justify-center gap-6 mb-8">
             <div className="h-1.5 w-12 bg-blue-500/40 rounded-full"></div>
             <div className="h-1.5 w-12 bg-purple-500/40 rounded-full"></div>
             <div className="h-1.5 w-12 bg-emerald-500/40 rounded-full"></div>
        </div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.4em]">
            DIU CIS Department &copy; {new Date().getFullYear()} • Dynamic Scheduling System
        </p>
      </footer>
    </div>
  );
};

export default PublicView;