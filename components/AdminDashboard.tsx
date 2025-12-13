import React, { useState } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room } from '../types';
import { checkConflict, generateSQLScript } from '../services/dbService';
import ScheduleTable from './ScheduleTable';
import { Trash2, Plus, AlertCircle, Save, Database, Wand2, LogOut, Calendar, GraduationCap, BookOpen, MapPin, Layers, LayoutDashboard } from 'lucide-react';
import { generateSampleDataWithAI } from '../services/geminiService';

interface AdminDashboardProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdateData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'teachers' | 'courses' | 'rooms' | 'sections'>('schedule');
  
  // Schedule Form State
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [selectedTime, setSelectedTime] = useState<string>(TIME_SLOTS[0]);
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [selectedSection, setSelectedSection] = useState<string>('');
  
  // Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomCapacity, setNewRoomCapacity] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Theory' | 'Lab'>('Theory');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // -- Actions --
  const handleAddClass = () => {
    setErrorMsg(null);
    if (!selectedTeacher || !selectedCourse || !selectedRoom || !selectedSection) {
      setErrorMsg("Please complete all fields to schedule a class.");
      return;
    }
    const [start, end] = selectedTime.split(' - ');
    const newSession: ClassSession = {
      id: crypto.randomUUID(),
      day: selectedDay,
      startTime: start,
      endTime: end,
      teacherId: selectedTeacher,
      courseId: selectedCourse,
      roomId: selectedRoom,
      sectionId: selectedSection,
    };
    const conflict = checkConflict(newSession, data);
    if (conflict.hasConflict) {
      setErrorMsg(conflict.message || "Schedule Conflict Detected!");
      return;
    }
    const newData = { ...data, schedule: [...data.schedule, newSession] };
    onUpdateData(newData);
  };

  const handleAddRoom = () => {
    setErrorMsg(null);
    if (!newRoomNumber || !newRoomCapacity) {
      setErrorMsg("Please provide both Room Number and Capacity.");
      return;
    }
    
    if (data.rooms.some(r => r.roomNumber.toLowerCase() === newRoomNumber.trim().toLowerCase())) {
        setErrorMsg("A room with this number already exists.");
        return;
    }

    const newRoom: Room = {
      id: crypto.randomUUID(),
      roomNumber: newRoomNumber.trim(),
      capacity: parseInt(newRoomCapacity),
      type: newRoomType
    };

    onUpdateData({
      ...data,
      rooms: [...data.rooms, newRoom]
    });

    // Reset form
    setNewRoomNumber('');
    setNewRoomCapacity('');
    setNewRoomType('Theory');
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Are you sure you want to remove this class?")) {
      const newData = { ...data, schedule: data.schedule.filter(s => s.id !== id) };
      onUpdateData(newData);
    }
  };

  const handleDownloadSQL = () => {
    const sql = generateSQLScript(data);
    const blob = new Blob([sql], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'routine_db.sql';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAIPopulate = async () => {
    if (!confirm("Overwrite current data with AI generated sample data? This cannot be undone.")) return;
    setIsGenerating(true);
    const aiData = await generateSampleDataWithAI();
    setIsGenerating(false);
    if (aiData) {
      onUpdateData(aiData);
    } else {
      alert("Failed to generate data. Please check your API configuration.");
    }
  };

  // -- M3 Components --

  const SelectField = ({ label, value, onChange, options }: any) => (
    <div className="relative group">
      <select 
        value={value} 
        onChange={onChange}
        className="block w-full h-14 pl-4 pr-10 text-base bg-white border border-gray-200 rounded-xl appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-gray-300 pt-1"
      >
        <option value="" disabled hidden></option>
        {options}
      </select>
      <label className={`absolute left-4 px-1 bg-white text-gray-500 transition-all duration-200 pointer-events-none rounded-sm ${value ? '-top-2.5 text-xs text-blue-600 font-medium' : 'top-4 text-base'}`}>
        {label}
      </label>
      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
        <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
      </div>
    </div>
  );

  const InputField = ({ label, value, onChange, type = "text", placeholder = " " }: any) => (
    <div className="relative group">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="block w-full h-14 pl-4 pr-4 text-base bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm hover:border-gray-300 placeholder-transparent pt-1"
      />
      <label className={`absolute left-4 px-1 bg-white text-gray-500 transition-all duration-200 pointer-events-none rounded-sm ${value ? '-top-2.5 text-xs text-blue-600 font-medium' : 'top-4 text-base'}`}>
        {label}
      </label>
    </div>
  );

  const NavItem = ({ id, label, icon: Icon }: any) => (
    <button
      onClick={() => { setActiveTab(id); setErrorMsg(null); }}
      className={`w-full flex items-center gap-3 px-6 py-3.5 rounded-full font-medium transition-all duration-200 mb-1 ${
        activeTab === id 
          ? 'bg-blue-100/80 text-blue-900 shadow-sm' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <Icon className={`w-5 h-5 ${activeTab === id ? 'stroke-[2.5px]' : ''}`} />
      <span>{label}</span>
    </button>
  );

  const renderScheduler = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Creation Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Decorative background blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-blue-600 text-white p-2.5 rounded-xl shadow-md shadow-blue-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Assign Class</h3>
              <p className="text-gray-500 text-sm">Add a new session to the master routine</p>
            </div>
        </div>
        
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative">
          <SelectField 
            label="Day of Week" 
            value={selectedDay} 
            onChange={(e: any) => setSelectedDay(e.target.value)} 
            options={Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)} 
          />
          <SelectField 
            label="Time Slot" 
            value={selectedTime} 
            onChange={(e: any) => setSelectedTime(e.target.value)} 
            options={TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)} 
          />
          <SelectField 
            label="Section / Batch" 
            value={selectedSection} 
            onChange={(e: any) => setSelectedSection(e.target.value)} 
            options={data.sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>)} 
          />
          <SelectField 
            label="Instructor" 
            value={selectedTeacher} 
            onChange={(e: any) => setSelectedTeacher(e.target.value)} 
            options={data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>)} 
          />
          <SelectField 
            label="Course" 
            value={selectedCourse} 
            onChange={(e: any) => setSelectedCourse(e.target.value)} 
            options={data.courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)} 
          />
          <SelectField 
            label="Room" 
            value={selectedRoom} 
            onChange={(e: any) => setSelectedRoom(e.target.value)} 
            options={data.rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.type})</option>)} 
          />
        </div>
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleAddClass}
            className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150"
          >
            <Save className="w-4 h-4" /> Save Allocation
          </button>
        </div>
      </div>

      {/* Preview Grid */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="text-xl font-medium text-gray-800 mb-6 px-2">Master Schedule View</h3>
        <ScheduleTable data={data} filterType="all" isAdmin onDeleteSession={handleDeleteSession} />
      </div>
    </div>
  );

  const renderRoomManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Creation Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md shadow-orange-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Room</h3>
              <p className="text-gray-500 text-sm">Register a new classroom or lab</p>
            </div>
        </div>
        
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> 
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField
            label="Room Number"
            value={newRoomNumber}
            onChange={(e: any) => setNewRoomNumber(e.target.value)}
            placeholder="e.g. AB4-601"
          />
          <InputField
            label="Capacity"
            value={newRoomCapacity}
            onChange={(e: any) => setNewRoomCapacity(e.target.value)}
            type="number"
            placeholder="40"
          />
           <SelectField 
            label="Type" 
            value={newRoomType} 
            onChange={(e: any) => setNewRoomType(e.target.value as any)} 
            options={<><option value="Theory">Theory</option><option value="Lab">Lab</option></>} 
          />
        </div>
        <div className="mt-8 flex justify-end">
          <button 
            onClick={handleAddRoom}
            className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150"
          >
            <Save className="w-4 h-4" /> Save Room
          </button>
        </div>
      </div>

      {/* List View */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-medium text-gray-800">Rooms Directory</h3>
              <p className="text-sm text-gray-500 mt-1">Manage physical space records</p>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Room Number</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Capacity</th>
                <th className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {data.rooms.map((room) => (
                <tr key={room.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700 font-medium">{room.roomNumber}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">{room.capacity}</td>
                  <td className="px-8 py-5 whitespace-nowrap text-sm">
                    <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${room.type === 'Lab' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                      {room.type}
                    </span>
                  </td>
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button 
                      onClick={() => onUpdateData({...data, rooms: data.rooms.filter(r => r.id !== room.id)})} 
                      className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {data.rooms.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-24 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <MapPin className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-500">No rooms found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEntityManager = (
    title: string, 
    items: any[], 
    fields: { key: string, label: string }[],
    onDelete: (id: string) => void
  ) => (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500 flex flex-col h-[calc(100vh-8rem)]">
      <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center shrink-0">
        <div>
           <h3 className="text-xl font-medium text-gray-800">{title} Directory</h3>
           <p className="text-sm text-gray-500 mt-1">Manage {title.toLowerCase()} records</p>
        </div>
        <button className="p-2 bg-gray-50 text-gray-600 rounded-full hover:bg-gray-100 transition-colors">
            <Plus className="w-5 h-5" />
        </button>
      </div>
      <div className="overflow-auto flex-1 p-0">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80 sticky top-0 backdrop-blur-sm z-10">
            <tr>
              {fields.map(f => (
                <th key={f.key} className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</th>
              ))}
              <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50/30 transition-colors group">
                {fields.map(f => (
                  <td key={f.key} className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">{item[f.key]}</td>
                ))}
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                   <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-6 py-24 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Database className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500">No records found in the database.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF6] flex flex-col md:flex-row font-sans selection:bg-blue-100">
      
      {/* Navigation Rail / Drawer */}
      <aside className="w-full md:w-80 bg-[#F8F9FA]/80 backdrop-blur-xl md:h-screen md:sticky md:top-0 p-6 border-r border-gray-200 flex flex-col z-20">
        <div className="mb-10 pl-2 flex items-center gap-3">
             <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-200">
                <LayoutDashboard className="w-5 h-5" />
             </div>
             <div>
                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Routine Master</h1>
                <p className="text-xs text-gray-500 font-medium">Admin Workspace</p>
             </div>
        </div>

        <nav className="flex-1 space-y-2">
          <NavItem id="schedule" label="Schedule" icon={Calendar} />
          <NavItem id="teachers" label="Teachers" icon={GraduationCap} />
          <NavItem id="courses" label="Courses" icon={BookOpen} />
          <NavItem id="rooms" label="Rooms" icon={MapPin} />
          <NavItem id="sections" label="Sections" icon={Layers} />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 space-y-3">
            <button 
              onClick={handleAIPopulate} 
              disabled={isGenerating} 
              className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 rounded-full transition-colors disabled:opacity-50 group"
            >
              <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" /> 
              {isGenerating ? 'Generating...' : 'AI Populate'}
            </button>
            <button 
              onClick={handleDownloadSQL} 
              className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-full transition-colors"
            >
              <Database className="w-4 h-4" /> Export SQL
            </button>
            <button 
              onClick={onLogout} 
              className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-600 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors mt-4"
            >
              <LogOut className="w-4 h-4" /> Exit Dashboard
            </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <header className="mb-8 md:hidden">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        </header>

        {activeTab === 'schedule' && renderScheduler()}
        
        {activeTab === 'teachers' && renderEntityManager('Teachers', data.teachers, [{key:'name', label:'Name'}, {key:'initial', label:'Initial'}, {key:'email', label:'Email'}], (id) => {
            onUpdateData({...data, teachers: data.teachers.filter(x => x.id !== id)});
        })}
        
        {activeTab === 'courses' && renderEntityManager('Courses', data.courses, [{key:'code', label:'Code'}, {key:'name', label:'Title'}, {key:'credits', label:'Credits'}], (id) => {
            onUpdateData({...data, courses: data.courses.filter(x => x.id !== id)});
        })}
        
        {activeTab === 'rooms' && renderRoomManager()}
        
        {activeTab === 'sections' && renderEntityManager('Sections', data.sections, [{key:'name', label:'Name'}, {key:'batch', label:'Batch'}], (id) => {
            onUpdateData({...data, sections: data.sections.filter(x => x.id !== id)});
        })}
      </main>
    </div>
  );
};

export default AdminDashboard;