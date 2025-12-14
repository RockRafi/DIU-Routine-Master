import React, { useState } from 'react';
import { AppData, getBatchColor, Section } from '../types';
import ScheduleTable from './ScheduleTable';
import { Search, User, Users, Calendar, ShieldCheck, ChevronDown, Download, AlertTriangle, Layers } from 'lucide-react';

interface PublicViewProps {
  data: AppData;
  onAdminClick: () => void;
}

const PublicView: React.FC<PublicViewProps> = ({ data, onAdminClick }) => {
  const [viewMode, setViewMode] = useState<'student' | 'teacher'>('student');
  const [selectedId, setSelectedId] = useState<string>('');

  const handleExportPDF = () => {
    window.print();
  };

  const isMaintenance = !data.settings.isPublished;

  // Group sections by batch for clearer display
  const sectionsByBatch = data.sections.reduce((acc, section) => {
      if (!acc[section.batch]) acc[section.batch] = [];
      acc[section.batch].push(section);
      return acc;
  }, {} as Record<number, Section[]>);

  // Determine filter type based on selection
  let filterType: 'section' | 'batch' | 'teacher' = 'section';
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

  return (
    <div className="min-h-screen bg-[#FDFDF6] text-gray-900 font-sans selection:bg-blue-100 relative overflow-hidden">
      
      {/* --- Creative Background Design --- */}
      <div className="fixed inset-0 z-0 pointer-events-none no-print">
         {/* Subtle Technical Dot Grid */}
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.15 }}></div>
         
         {/* Top Right: Abstract Geometric Compass/Target */}
         <svg className="absolute -top-24 -right-24 w-[600px] h-[600px] text-blue-100 opacity-60 animate-in fade-in duration-1000 slide-in-from-top-10" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <circle cx="100" cy="100" r="90" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="70" strokeWidth="0.5" strokeDasharray="4 4" />
            <path d="M100 0 L100 200 M0 100 L200 100" strokeWidth="0.5" />
            <rect x="100" y="100" width="60" height="60" strokeWidth="0.5" transform="translate(-30, -30) rotate(45 100 100)" />
         </svg>

         {/* Bottom Left: Architectural Lines */}
         <svg className="absolute -bottom-32 -left-32 w-[800px] h-[800px] text-gray-200 opacity-60 animate-in fade-in duration-1000 slide-in-from-bottom-10" viewBox="0 0 200 200" fill="none" stroke="currentColor">
            <path d="M0 200 L200 0" strokeWidth="1" />
            <path d="M20 200 L200 20" strokeWidth="0.5" />
            <path d="M40 200 L200 40" strokeWidth="0.5" />
            <path d="M60 200 L200 60" strokeWidth="0.5" />
            <circle cx="0" cy="200" r="120" strokeWidth="0.5" strokeDasharray="2 2" />
         </svg>

         {/* Soft Gradient Blob for Depth */}
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
         <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-100/30 rounded-full blur-3xl mix-blend-multiply filter"></div>
      </div>

      {/* M3 Top App Bar */}
      <header className="sticky top-0 z-30 bg-[#FDFDF6]/80 backdrop-blur-md border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-200">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-xl font-medium text-gray-800 tracking-tight hidden sm:inline">DIU Routine Master</span>
             <span className="text-xl font-medium text-gray-800 tracking-tight sm:hidden">Routine Master</span>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
              <button 
                onClick={() => { setSelectedId(''); setTimeout(() => window.print(), 100); }}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
                title="Print Full Semester Routine"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Full Schedule</span>
              </button>
              <button 
                onClick={onAdminClick}
                className="flex items-center gap-2 px-3 md:px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
              >
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
               <p className="text-gray-500 max-w-md mx-auto">The schedule for {data.settings.semesterName} is currently being finalized by the administration. Please check back later.</p>
          </main>
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        
        {/* Hero Section */}
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
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            The official centralized scheduling system for the Computing and Information System department.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-12 no-print">
          <div className="bg-white/50 backdrop-blur-md p-1.5 rounded-full inline-flex relative shadow-sm border border-gray-100">
             <div 
                className={`absolute inset-y-1.5 transition-all duration-300 ease-out bg-white rounded-full shadow-sm ${viewMode === 'student' ? 'left-1.5 w-[calc(50%-6px)]' : 'left-[50%] w-[calc(50%-6px)]'}`}
             ></div>
            <button
              onClick={() => { setViewMode('student'); setSelectedId(''); }}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'student' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="w-4 h-4" /> Student
            </button>
            <button
              onClick={() => { setViewMode('teacher'); setSelectedId(''); }}
              className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${
                viewMode === 'teacher' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="w-4 h-4" /> Teacher
            </button>
          </div>
        </div>

        {/* Search/Select Field */}
        <div className="max-w-lg mx-auto mb-16 no-print">
          <div className="relative group">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="block w-full h-16 pl-6 pr-12 text-lg bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-gray-300 hover:shadow-md"
            >
              <option value="" disabled hidden></option>
              {viewMode === 'student' ? (
                // Group sections by Batch in dropdown
                Object.entries(sectionsByBatch).map(([batch, sections]) => (
                   <optgroup key={batch} label={`Batch ${batch}`}>
                       <option value={`batch-${batch}`} className="font-semibold text-blue-600">
                           All Sections (Batch {batch})
                       </option>
                       {(sections as Section[]).map(s => (
                           <option key={s.id} value={s.id}>
                               {s.name ? `Section ${s.name}` : `Batch ${s.batch} (Only)`}
                           </option>
                       ))}
                   </optgroup>
                ))
              ) : (
                data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>)
              )}
            </select>
            <label className={`absolute left-6 text-gray-400 pointer-events-none transition-all duration-200 ${selectedId ? '-top-3 bg-white px-2 text-xs text-blue-600 font-medium' : 'top-5 text-lg'}`}>
              Select {viewMode === 'student' ? 'Section' : 'Teacher'}...
            </label>
            <div className="absolute inset-y-0 right-5 flex items-center pointer-events-none text-gray-400">
              <ChevronDown className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Content Area */}
        {selectedId ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-[32px] shadow-xl shadow-gray-200/50 border border-white/50 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700 ring-1 ring-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-medium text-gray-900 tracking-tight flex items-center gap-3">
                  {viewMode === 'student' && filterType === 'section' && (
                       (() => {
                            const s = data.sections.find(s => s.id === selectedId);
                            if (!s) return null;
                            const colorClass = getBatchColor(s.batch);
                            return <span className={`text-base px-3 py-1 rounded-full border ${colorClass} opacity-80`}>Batch {s.batch}</span>;
                       })()
                  )}
                  {viewMode === 'student' && filterType === 'batch' && (
                        <span className={`text-base px-3 py-1 rounded-full border bg-gray-100 text-gray-800 border-gray-200`}>Batch {filterValue}</span>
                  )}
                  <span>{displayTitle}</span>
                </h2>
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> {data.settings.semesterName} Weekly Routine
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleExportPDF}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all no-print"
                 >
                   <Download className="w-4 h-4" /> Export This View
                 </button>
                 <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-400">Semester</div>
                    <div className="font-medium text-gray-700">{data.settings.semesterName}</div>
                 </div>
              </div>
            </div>
            
            <ScheduleTable 
              data={data} 
              filterType={filterType} 
              filterId={filterValue} 
            />
            
            {/* Teacher Details Footer */}
            {viewMode === 'teacher' && (
                <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                     {(() => {
                         const t = data.teachers.find(tr => tr.id === selectedId);
                         if(!t) return null;
                         return (
                             <>
                                <div><span className="font-semibold">Counseling Hour:</span> {t.counselingHour || 'Not set'}</div>
                                {/* Updated to handle multiple off days */}
                                <div>
                                  <span className="font-semibold">Off Days:</span>{' '}
                                  {t.offDays && t.offDays.length > 0 ? t.offDays.join(', ') : 'None'}
                                </div>
                             </>
                         )
                     })()}
                </div>
            )}

            <div className="mt-8 text-center md:hidden no-print">
                 <button 
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                 >
                   <Download className="w-4 h-4" /> Download PDF
                 </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700 no-print relative">
            {/* If no ID selected, show Master Schedule ONLY if Print was clicked (handled by CSS, but good to have fallback in view) */}
            <div className="w-40 h-40 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
              <Search className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Schedule Selected</h3>
            <p className="text-gray-500 max-w-xs text-center">
              Please select a {viewMode === 'student' ? 'section' : 'teacher'} from the dropdown above to view the routine.
            </p>
          </div>
        )}

        {/* Hidden Master Table for Print-All */}
        <div className="hidden print:block mt-8">
            <h2 className="text-2xl font-bold text-center mb-4">Complete Master Schedule - {data.settings.semesterName}</h2>
            <ScheduleTable data={data} filterType="all" />
        </div>

      </main>
      )}

      <footer className="mt-auto py-12 text-center border-t border-gray-100 bg-white/50 backdrop-blur-sm no-print relative z-10">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DIU CIS Department. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicView;