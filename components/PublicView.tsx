import React, { useState } from 'react';
import { AppData } from '../types';
import ScheduleTable from './ScheduleTable';
import { Search, User, Users, Calendar, ShieldCheck, ChevronDown, Download } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-[#FDFDF6] text-gray-900 font-sans selection:bg-blue-100">
      {/* M3 Top App Bar */}
      <header className="sticky top-0 z-30 bg-[#FDFDF6]/80 backdrop-blur-md border-b border-gray-100 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
               <Calendar className="w-5 h-5" />
             </div>
             <span className="text-xl font-medium text-gray-800 tracking-tight">DIU Routine Master</span>
          </div>
          <button 
            onClick={onAdminClick}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-full transition-all"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">Admin</span>
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in slide-in-from-bottom-4 fade-in duration-700 no-print">
          <div className="inline-block mb-4 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-600 text-xs font-semibold tracking-wide uppercase">
            Fall 2025 Schedule
          </div>
          <h1 className="text-4xl md:text-6xl font-normal text-gray-900 mb-6 tracking-tight">
            Find your <span className="text-blue-600 font-medium">Class Routine</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto leading-relaxed">
            The official centralized scheduling system for the Computing and Information System department.
          </p>
        </div>

        {/* View Switcher */}
        <div className="flex justify-center mb-12 no-print">
          <div className="bg-gray-100/50 p-1.5 rounded-full inline-flex relative">
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
              className="block w-full h-16 pl-6 pr-12 text-lg bg-white border border-gray-200 rounded-2xl appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-gray-300"
            >
              <option value="" disabled hidden></option>
              {viewMode === 'student' 
                ? data.sections.map(s => <option key={s.id} value={s.id}>{s.name} (Batch {s.batch})</option>)
                : data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>)
              }
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
          <div className="bg-white rounded-[32px] shadow-xl shadow-gray-200/50 border border-gray-100 p-6 md:p-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-medium text-gray-900 tracking-tight">
                  {viewMode === 'student' 
                    ? `Section ${data.sections.find(s => s.id === selectedId)?.name}` 
                    : data.teachers.find(t => t.id === selectedId)?.name
                  }
                </h2>
                <p className="text-gray-500 mt-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Fall 2025 Weekly Routine
                </p>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleExportPDF}
                  className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all no-print"
                 >
                   <Download className="w-4 h-4" /> Export Routine PDF
                 </button>
                 <div className="text-right hidden md:block">
                    <div className="text-sm text-gray-400">Semester</div>
                    <div className="font-medium text-gray-700">Fall 2025</div>
                 </div>
              </div>
            </div>
            
            <ScheduleTable 
              data={data} 
              filterType={viewMode === 'student' ? 'section' : 'teacher'} 
              filterId={selectedId} 
            />

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
          <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-700 no-print">
            <div className="w-40 h-40 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Search className="w-16 h-16 text-gray-300" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No Schedule Selected</h3>
            <p className="text-gray-500 max-w-xs text-center">
              Please select a {viewMode === 'student' ? 'section' : 'teacher'} from the dropdown above to view the routine.
            </p>
          </div>
        )}
      </main>

      <footer className="mt-auto py-12 text-center border-t border-gray-100 bg-white no-print">
        <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} DIU CIS Department. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PublicView;