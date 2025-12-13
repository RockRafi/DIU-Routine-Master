import React, { useState } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room, Teacher, Course, Section } from '../types';
import { checkConflict } from '../services/dbService';
import ScheduleTable from './ScheduleTable';
import { Trash2, Plus, AlertCircle, Save, Database, LogOut, Calendar, GraduationCap, BookOpen, MapPin, Layers, LayoutDashboard } from 'lucide-react';

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

  // Teacher Form State
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherInitial, setNewTeacherInitial] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');

  // Course Form State
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');

  // Section Form State
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionBatch, setNewSectionBatch] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
    onUpdateData({ ...data, rooms: [...data.rooms, newRoom] });
    setNewRoomNumber('');
    setNewRoomCapacity('');
    setNewRoomType('Theory');
  };

  const handleAddTeacher = () => {
    setErrorMsg(null);
    if (!newTeacherName || !newTeacherInitial || !newTeacherEmail) {
      setErrorMsg("All teacher fields are required.");
      return;
    }
    if (data.teachers.some(t => t.initial.toLowerCase() === newTeacherInitial.trim().toLowerCase())) {
      setErrorMsg("A teacher with this initial already exists.");
      return;
    }
    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name: newTeacherName.trim(),
      initial: newTeacherInitial.trim().toUpperCase(),
      email: newTeacherEmail.trim()
    };
    onUpdateData({ ...data, teachers: [...data.teachers, newTeacher] });
    setNewTeacherName('');
    setNewTeacherInitial('');
    setNewTeacherEmail('');
  };

  const handleAddCourse = () => {
    setErrorMsg(null);
    if (!newCourseCode || !newCourseName || !newCourseCredits) {
      setErrorMsg("All course fields are required.");
      return;
    }
    if (data.courses.some(c => c.code.toLowerCase() === newCourseCode.trim().toLowerCase())) {
      setErrorMsg("A course with this code already exists.");
      return;
    }
    const newCourse: Course = {
      id: crypto.randomUUID(),
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      credits: parseInt(newCourseCredits)
    };
    onUpdateData({ ...data, courses: [...data.courses, newCourse] });
    setNewCourseCode('');
    setNewCourseName('');
    setNewCourseCredits('');
  };

  const handleAddSection = () => {
    setErrorMsg(null);
    if (!newSectionName || !newSectionBatch) {
      setErrorMsg("All section fields are required.");
      return;
    }
    // Check for duplicate (same name + same batch)
    if (data.sections.some(s => s.name === newSectionName.trim() && s.batch === parseInt(newSectionBatch))) {
       setErrorMsg("This section already exists.");
       return;
    }
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: newSectionName.trim(),
      batch: parseInt(newSectionBatch)
    };
    onUpdateData({ ...data, sections: [...data.sections, newSection] });
    setNewSectionName('');
    setNewSectionBatch('');
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Are you sure you want to remove this class?")) {
      const newData = { ...data, schedule: data.schedule.filter(s => s.id !== id) };
      onUpdateData(newData);
    }
  };

  // -- Components --

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
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
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
          <SelectField label="Day of Week" value={selectedDay} onChange={(e: any) => setSelectedDay(e.target.value)} options={Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)} />
          <SelectField label="Time Slot" value={selectedTime} onChange={(e: any) => setSelectedTime(e.target.value)} options={TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)} />
          <SelectField label="Section / Batch" value={selectedSection} onChange={(e: any) => setSelectedSection(e.target.value)} options={data.sections.map(s => <option key={s.id} value={s.id}>{s.name} ({s.batch})</option>)} />
          <SelectField label="Instructor" value={selectedTeacher} onChange={(e: any) => setSelectedTeacher(e.target.value)} options={data.teachers.map(t => <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>)} />
          <SelectField label="Course" value={selectedCourse} onChange={(e: any) => setSelectedCourse(e.target.value)} options={data.courses.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)} />
          <SelectField label="Room" value={selectedRoom} onChange={(e: any) => setSelectedRoom(e.target.value)} options={data.rooms.map(r => <option key={r.id} value={r.id}>{r.roomNumber} ({r.type})</option>)} />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddClass} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150">
            <Save className="w-4 h-4" /> Save Allocation
          </button>
        </div>
      </div>
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 p-6 md:p-8">
        <h3 className="text-xl font-medium text-gray-800 mb-6 px-2">Master Schedule View</h3>
        <ScheduleTable data={data} filterType="all" isAdmin onDeleteSession={handleDeleteSession} />
      </div>
    </div>
  );

  const renderRoomManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
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
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Room Number" value={newRoomNumber} onChange={(e: any) => setNewRoomNumber(e.target.value)} placeholder="e.g. AB4-601" />
          <InputField label="Capacity" value={newRoomCapacity} onChange={(e: any) => setNewRoomCapacity(e.target.value)} type="number" placeholder="40" />
           <SelectField label="Type" value={newRoomType} onChange={(e: any) => setNewRoomType(e.target.value as any)} options={<><option value="Theory">Theory</option><option value="Lab">Lab</option></>} />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddRoom} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150">
            <Save className="w-4 h-4" /> Save Room
          </button>
        </div>
      </div>
      {renderTable(data.rooms, [{key:'roomNumber', label:'Room Number'}, {key:'capacity', label:'Capacity'}, {key:'type', label:'Type'}], (id) => onUpdateData({...data, rooms: data.rooms.filter(r => r.id !== id)}))}
    </div>
  );

  const renderTeacherManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-green-600 text-white p-2.5 rounded-xl shadow-md shadow-green-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Teacher</h3>
              <p className="text-gray-500 text-sm">Register a new faculty member</p>
            </div>
        </div>
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Full Name" value={newTeacherName} onChange={(e: any) => setNewTeacherName(e.target.value)} placeholder="e.g. John Doe" />
          <InputField label="Initial" value={newTeacherInitial} onChange={(e: any) => setNewTeacherInitial(e.target.value)} placeholder="JD" />
          <InputField label="Email" value={newTeacherEmail} onChange={(e: any) => setNewTeacherEmail(e.target.value)} type="email" placeholder="john@diu.edu.bd" />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddTeacher} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150">
            <Save className="w-4 h-4" /> Save Teacher
          </button>
        </div>
      </div>
      {renderTable(data.teachers, [{key:'name', label:'Name'}, {key:'initial', label:'Initial'}, {key:'email', label:'Email'}], (id) => onUpdateData({...data, teachers: data.teachers.filter(x => x.id !== id)}))}
    </div>
  );

  const renderCourseManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-md shadow-purple-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Course</h3>
              <p className="text-gray-500 text-sm">Register a new course into curriculum</p>
            </div>
        </div>
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Course Code" value={newCourseCode} onChange={(e: any) => setNewCourseCode(e.target.value)} placeholder="CSE101" />
          <InputField label="Course Title" value={newCourseName} onChange={(e: any) => setNewCourseName(e.target.value)} placeholder="Structured Programming" />
          <InputField label="Credits" value={newCourseCredits} onChange={(e: any) => setNewCourseCredits(e.target.value)} type="number" placeholder="3" />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddCourse} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150">
            <Save className="w-4 h-4" /> Save Course
          </button>
        </div>
      </div>
      {renderTable(data.courses, [{key:'code', label:'Code'}, {key:'name', label:'Title'}, {key:'credits', label:'Credits'}], (id) => onUpdateData({...data, courses: data.courses.filter(x => x.id !== id)}))}
    </div>
  );

  const renderSectionManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-60 pointer-events-none"></div>
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-pink-600 text-white p-2.5 rounded-xl shadow-md shadow-pink-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Section</h3>
              <p className="text-gray-500 text-sm">Create a new student batch section</p>
            </div>
        </div>
        {errorMsg && (
          <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" /> <span>{errorMsg}</span>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <InputField label="Section Name" value={newSectionName} onChange={(e: any) => setNewSectionName(e.target.value)} placeholder="Section A" />
          <InputField label="Batch Number" value={newSectionBatch} onChange={(e: any) => setNewSectionBatch(e.target.value)} type="number" placeholder="56" />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddSection} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 hover:shadow-xl transition-all flex items-center gap-2 font-medium active:scale-95 duration-150">
            <Save className="w-4 h-4" /> Save Section
          </button>
        </div>
      </div>
      {renderTable(data.sections, [{key:'name', label:'Name'}, {key:'batch', label:'Batch'}], (id) => onUpdateData({...data, sections: data.sections.filter(x => x.id !== id)}))}
    </div>
  );

  const renderTable = (items: any[], fields: { key: string, label: string }[], onDelete: (id: string) => void) => (
    <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-xl font-medium text-gray-800">Directory Listing</h3>
            </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                {fields.map(f => (
                  <th key={f.key} className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</th>
                ))}
                <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-50">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                  {fields.map(f => (
                    <td key={f.key} className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">{item[f.key]}</td>
                  ))}
                  <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td colSpan={fields.length + 1} className="px-6 py-24 text-center">
                      <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                          <Database className="w-6 h-6 text-gray-300" />
                      </div>
                      <p className="text-gray-500">No records found.</p>
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
        {activeTab === 'teachers' && renderTeacherManager()}
        {activeTab === 'courses' && renderCourseManager()}
        {activeTab === 'rooms' && renderRoomManager()}
        {activeTab === 'sections' && renderSectionManager()}
      </main>
    </div>
  );
};

export default AdminDashboard;