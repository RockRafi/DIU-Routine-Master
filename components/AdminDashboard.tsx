import React, { useState, useRef, useEffect } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room, Teacher, Course, Section } from '../types';
import ScheduleGrid from './ScheduleGrid';
import ClassModal from './ClassModal';
import { formatDate, checkConflict } from '../services/dbService';
import { Trash2, Plus, AlertCircle, Save, Database, LogOut, Calendar, GraduationCap, BookOpen, MapPin, Layers, LayoutDashboard, Settings, ToggleLeft, ToggleRight, Printer, ChevronDown, Check, X, Edit3, Clock, Menu as MenuIcon } from 'lucide-react';

// --- Sub-Components ---

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
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

const MultiSelectField = ({ label, selectedValues, onChange, options }: { label: string, selectedValues: string[], onChange: (value: string) => void, options: string[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative group" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="block w-full h-14 pl-4 pr-10 text-left bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-sm hover:border-gray-300 relative"
      >
        <span className={`block truncate pt-1 ${selectedValues.length === 0 ? 'text-transparent' : 'text-gray-900'}`}>
           {selectedValues.length > 0 ? selectedValues.join(', ') : 'Select...'}
        </span>
        <label className={`absolute left-4 px-1 bg-white text-gray-500 transition-all duration-200 pointer-events-none rounded-sm ${selectedValues.length > 0 || isOpen ? '-top-2.5 text-xs text-blue-600 font-medium' : 'top-4 text-base'}`}>
            {label}
        </label>
        <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
          {options.map((option) => {
             const isSelected = selectedValues.includes(option);
             return (
               <div 
                 key={option} 
                 onClick={() => onChange(option)}
                 className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
               >
                 <span className={`text-sm ${isSelected ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
                   {option}
                 </span>
                 {isSelected && <Check className="w-4 h-4 text-blue-600" />}
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

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

const NavItem = ({ id, label, icon: Icon, activeTab, setActiveTab, setErrorMsg, onClose }: any) => (
  <button
    onClick={() => { setActiveTab(id); setErrorMsg(null); if(onClose) onClose(); }}
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

const DataTable = ({ items, fields, onDelete, onEdit, emptyMessage = "No records found." }: any) => (
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
              {fields.map((f: any) => (
                <th key={f.key} className="px-8 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{f.label}</th>
              ))}
              <th className="px-8 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-50">
            {items.map((item: any) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                {fields.map((f: any) => (
                  <td key={f.key} className="px-8 py-5 whitespace-nowrap text-sm text-gray-700">
                    {Array.isArray(item[f.key]) 
                        ? (item[f.key].length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                                {item[f.key].map((d: string) => (
                                    <span key={d} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                        {d.substring(0, 3)}
                                    </span>
                                ))}
                            </div>
                          ) : <span className="text-gray-300">-</span>)
                        : (item[f.key] || <span className="text-gray-300">-</span>)
                    }
                  </td>
                ))}
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => onEdit(item)} className="p-2 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDelete(item.id)} className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={fields.length + 1} className="px-6 py-24 text-center">
                    <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                        <Database className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500">{emptyMessage}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
  </div>
);

// --- Main Component ---

interface AdminDashboardProps {
  data: AppData;
  onUpdateData: (newData: AppData) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ data, onUpdateData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'teachers' | 'courses' | 'rooms' | 'sections' | 'settings'>('schedule');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sessionToEdit, setSessionToEdit] = useState<ClassSession | undefined>(undefined);
  const [modalInitialDay, setModalInitialDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [modalInitialTime, setModalInitialTime] = useState<string>(TIME_SLOTS[0]);

  // Editing IDs
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editingRoomId, setEditingRoomId] = useState<string | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);

  // Form States
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Theory' | 'Lab'>('Theory');
  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherInitial, setNewTeacherInitial] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherPhone, setNewTeacherPhone] = useState('');
  const [newTeacherOffDays, setNewTeacherOffDays] = useState<string[]>([]);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseShortName, setNewCourseShortName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionBatch, setNewSectionBatch] = useState('');
  const [newSectionStudents, setNewSectionStudents] = useState('');
  
  // Settings local state
  const [semesterName, setSemesterName] = useState(data.settings.semesterName);
  const [localIsPublished, setLocalIsPublished] = useState(data.settings.isPublished);

  const handleOpenModal = (day?: DayOfWeek, time?: string) => {
    setSessionToEdit(undefined); 
    if (day) setModalInitialDay(day);
    if (time) setModalInitialTime(time);
    else setModalInitialTime(TIME_SLOTS[0]);
    setIsModalOpen(true);
  };

  const handleEditSession = (session: ClassSession) => {
    setSessionToEdit(session);
    setModalInitialDay(session.day);
    const timeSlot = `${session.startTime} - ${session.endTime}`;
    setModalInitialTime(timeSlot);
    setIsModalOpen(true);
  };

  const handleSaveSession = (newSession: ClassSession) => {
    let newSchedule;
    if (data.schedule.find(s => s.id === newSession.id)) {
        newSchedule = data.schedule.map(s => s.id === newSession.id ? newSession : s);
    } else {
        newSchedule = [...data.schedule, newSession];
    }
    onUpdateData({ ...data, schedule: newSchedule, lastModified: formatDate(new Date()) });
  };

  const handleMoveSession = (sessionId: string, newDay: DayOfWeek, newTimeSlot: string) => {
      const sessionToMove = data.schedule.find(s => s.id === sessionId);
      if (!sessionToMove) return;
      const [start, end] = newTimeSlot.split(' - ');
      const movedSession: ClassSession = { ...sessionToMove, day: newDay, startTime: start, endTime: end };
      const conflict = checkConflict(movedSession, data);
      if (conflict.hasConflict) {
          alert(`Conflict: ${conflict.message}`);
          return;
      }
      onUpdateData({ ...data, schedule: data.schedule.map(s => s.id === sessionId ? movedSession : s), lastModified: formatDate(new Date()) });
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Remove this class?")) {
      onUpdateData({ ...data, schedule: data.schedule.filter(s => s.id !== id), lastModified: formatDate(new Date()) });
    }
  };

  const handleSaveSettings = () => {
    onUpdateData({ 
      ...data, 
      settings: { 
        ...data.settings, 
        semesterName, 
        isPublished: localIsPublished
      }, 
      lastModified: formatDate(new Date()) 
    });
    alert("Settings saved successfully!");
  };

  const toggleOffDay = (day: string) => {
      setNewTeacherOffDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  };

  // --- CRUD Handlers ---

  const handleSaveTeacher = () => {
    setErrorMsg(null);
    if (!newTeacherName || !newTeacherInitial || !newTeacherEmail) { setErrorMsg("Required fields missing."); return; }
    
    const teacherData: Teacher = {
      id: editingTeacherId || crypto.randomUUID(),
      name: newTeacherName.trim(),
      initial: newTeacherInitial.trim().toUpperCase(),
      email: newTeacherEmail.trim(),
      phone: newTeacherPhone.trim() || undefined,
      offDays: newTeacherOffDays
    };

    let updatedTeachers;
    if (editingTeacherId) {
      updatedTeachers = data.teachers.map(t => t.id === editingTeacherId ? teacherData : t);
    } else {
      if (data.teachers.some(t => t.initial === teacherData.initial)) { setErrorMsg("Initial already exists."); return; }
      updatedTeachers = [...data.teachers, teacherData];
    }

    onUpdateData({ ...data, teachers: updatedTeachers, lastModified: formatDate(new Date()) });
    resetTeacherForm();
  };

  const resetTeacherForm = () => {
    setNewTeacherName(''); setNewTeacherInitial(''); setNewTeacherEmail(''); setNewTeacherPhone(''); setNewTeacherOffDays([]); setEditingTeacherId(null);
  };

  const handleEditTeacher = (t: Teacher) => {
    setNewTeacherName(t.name); setNewTeacherInitial(t.initial); setNewTeacherEmail(t.email); setNewTeacherPhone(t.phone || ''); setNewTeacherOffDays(t.offDays); setEditingTeacherId(t.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveCourse = () => {
    setErrorMsg(null);
    if (!newCourseCode || !newCourseName || !newCourseShortName || !newCourseCredits) { setErrorMsg("Required fields missing."); return; }
    
    const courseData: Course = {
      id: editingCourseId || crypto.randomUUID(),
      code: newCourseCode.trim().toUpperCase(),
      name: newCourseName.trim(),
      shortName: newCourseShortName.trim().toUpperCase(),
      credits: parseInt(newCourseCredits)
    };

    let updatedCourses;
    if (editingCourseId) {
      updatedCourses = data.courses.map(c => c.id === editingCourseId ? courseData : c);
    } else {
      updatedCourses = [...data.courses, courseData];
    }

    onUpdateData({ ...data, courses: updatedCourses, lastModified: formatDate(new Date()) });
    resetCourseForm();
  };

  const resetCourseForm = () => {
    setNewCourseCode(''); setNewCourseName(''); setNewCourseShortName(''); setNewCourseCredits(''); setEditingCourseId(null);
  };

  const handleEditCourse = (c: Course) => {
    setNewCourseCode(c.code); setNewCourseName(c.name); setNewCourseShortName(c.shortName); setNewCourseCredits(c.credits.toString()); setEditingCourseId(c.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveRoom = () => {
    setErrorMsg(null);
    if (!newRoomNumber) { setErrorMsg("Room Number required."); return; }
    
    const roomData: Room = {
      id: editingRoomId || crypto.randomUUID(),
      roomNumber: newRoomNumber.trim(),
      type: newRoomType
    };

    let updatedRooms;
    if (editingRoomId) {
      updatedRooms = data.rooms.map(r => r.id === editingRoomId ? roomData : r);
    } else {
      updatedRooms = [...data.rooms, roomData];
    }

    onUpdateData({ ...data, rooms: updatedRooms, lastModified: formatDate(new Date()) });
    resetRoomForm();
  };

  const resetRoomForm = () => {
    setNewRoomNumber(''); setNewRoomType('Theory'); setEditingRoomId(null);
  };

  const handleEditRoom = (r: Room) => {
    setNewRoomNumber(r.roomNumber); setNewRoomType(r.type); setEditingRoomId(r.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSection = () => {
    setErrorMsg(null);
    if (!newSectionBatch || !newSectionStudents) { setErrorMsg("Required fields missing."); return; }
    
    const sectionData: Section = {
      id: editingSectionId || crypto.randomUUID(),
      name: newSectionName.trim(),
      batch: parseInt(newSectionBatch),
      studentCount: parseInt(newSectionStudents)
    };

    let updatedSections;
    if (editingSectionId) {
      updatedSections = data.sections.map(s => s.id === editingSectionId ? sectionData : s);
    } else {
      updatedSections = [...data.sections, sectionData];
    }

    onUpdateData({ ...data, sections: updatedSections, lastModified: formatDate(new Date()) });
    resetSectionForm();
  };

  const resetSectionForm = () => {
    setNewSectionName(''); setNewSectionBatch(''); setNewSectionStudents(''); setEditingSectionId(null);
  };

  const handleEditSection = (s: Section) => {
    setNewSectionName(s.name); setNewSectionBatch(s.batch.toString()); setNewSectionStudents(s.studentCount.toString()); setEditingSectionId(s.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Render Functions ---

  const renderScheduler = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800">Master Routine Board</h3>
                    <p className="text-gray-500 text-sm flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> 
                      Standard Weekly Schedule
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap w-full md:w-auto">
               <button onClick={() => window.print()} className="flex-1 md:flex-none bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors">
                 <Printer className="w-4 h-4" /> Print View
               </button>
               <button onClick={() => handleOpenModal()} className="flex-1 md:flex-none bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-200">
                 <Plus className="w-4 h-4" /> New Session
               </button>
            </div>
        </div>
        <div className="print:block overflow-hidden">
            <ScheduleGrid data={data} onSlotClick={handleOpenModal} onDeleteSession={handleDeleteSession} onMoveSession={handleMoveSession} onEditSession={handleEditSession} />
        </div>
    </div>
  );

  const renderTeacherManager = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className={`bg-white p-6 md:p-8 rounded-[32px] shadow-sm border transition-all ${editingTeacherId ? 'border-blue-400 bg-blue-50/10' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingTeacherId ? 'Update Faculty Member' : 'Register New Faculty'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Full Name" value={newTeacherName} onChange={(e: any) => setNewTeacherName(e.target.value)} />
                <InputField label="Initial (e.g. JD)" value={newTeacherInitial} onChange={(e: any) => setNewTeacherInitial(e.target.value)} />
                <InputField label="DIU Email" value={newTeacherEmail} onChange={(e: any) => setNewTeacherEmail(e.target.value)} type="email" />
                <InputField label="Contact Number" value={newTeacherPhone} onChange={(e: any) => setNewTeacherPhone(e.target.value)} type="tel" />
                <MultiSelectField label="Off Days" selectedValues={newTeacherOffDays} onChange={toggleOffDay} options={Object.values(DayOfWeek)} />
            </div>
            {errorMsg && activeTab === 'teachers' && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
            <div className="mt-8 flex justify-end gap-3">
                {editingTeacherId && <button onClick={resetTeacherForm} className="px-6 py-3 rounded-full text-gray-500 font-medium hover:bg-gray-100">Cancel</button>}
                <button onClick={handleSaveTeacher} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{editingTeacherId ? 'Update Record' : 'Add Teacher'}</button>
            </div>
        </div>
        <DataTable items={data.teachers} fields={[{ key: 'name', label: 'Name' }, { key: 'initial', label: 'Initial' }, { key: 'email', label: 'Email' }, { key: 'phone', label: 'Phone' }, { key: 'offDays', label: 'Off Days' }]} onEdit={handleEditTeacher} onDelete={(id: string) => onUpdateData({ ...data, teachers: data.teachers.filter(t => t.id !== id), schedule: data.schedule.filter(s => s.teacherId !== id), lastModified: formatDate(new Date()) })} />
    </div>
  );

  const renderCourseManager = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className={`bg-white p-6 md:p-8 rounded-[32px] shadow-sm border transition-all ${editingCourseId ? 'border-blue-400 bg-blue-50/10' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingCourseId ? 'Update Course Details' : 'Course Cataloging'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <InputField label="Course Code" value={newCourseCode} onChange={(e: any) => setNewCourseCode(e.target.value)} placeholder="CSE101" />
                <InputField label="Short Form" value={newCourseShortName} onChange={(e: any) => setNewCourseShortName(e.target.value)} placeholder="SP" />
                <InputField label="Course Title" value={newCourseName} onChange={(e: any) => setNewCourseName(e.target.value)} />
                <InputField label="Credits" value={newCourseCredits} onChange={(e: any) => setNewCourseCredits(e.target.value)} type="number" />
            </div>
            {errorMsg && activeTab === 'courses' && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
            <div className="mt-8 flex justify-end gap-3">
                {editingCourseId && <button onClick={resetCourseForm} className="px-6 py-3 rounded-full text-gray-500 font-medium hover:bg-gray-100">Cancel</button>}
                <button onClick={handleSaveCourse} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{editingCourseId ? 'Update Catalog' : 'Register Course'}</button>
            </div>
        </div>
        <DataTable items={data.courses} fields={[{ key: 'shortName', label: 'Short Form' }, { key: 'code', label: 'Code' }, { key: 'name', label: 'Title' }, { key: 'credits', label: 'Credits' }]} onEdit={handleEditCourse} onDelete={(id: string) => onUpdateData({ ...data, courses: data.courses.filter(c => c.id !== id), schedule: data.schedule.filter(s => s.courseId !== id), lastModified: formatDate(new Date()) })} />
    </div>
  );

  const renderRoomManager = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className={`bg-white p-6 md:p-8 rounded-[32px] shadow-sm border transition-all ${editingRoomId ? 'border-blue-400 bg-blue-50/10' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingRoomId ? 'Update Room Allocation' : 'Resource Management'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField label="Room Number" value={newRoomNumber} onChange={(e: any) => setNewRoomNumber(e.target.value)} placeholder="AB4-601" />
                <SelectField label="Resource Type" value={newRoomType} onChange={(e: any) => setNewRoomType(e.target.value)} options={<><option value="Theory">Theory Room</option><option value="Lab">Lab Facility</option></>} />
            </div>
            {errorMsg && activeTab === 'rooms' && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
            <div className="mt-8 flex justify-end gap-3">
                {editingRoomId && <button onClick={resetRoomForm} className="px-6 py-3 rounded-full text-gray-500 font-medium hover:bg-gray-100">Cancel</button>}
                <button onClick={handleSaveRoom} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{editingRoomId ? 'Update Resource' : 'Add Room'}</button>
            </div>
        </div>
        <DataTable items={data.rooms} fields={[{ key: 'roomNumber', label: 'Room' }, { key: 'type', label: 'Type' }]} onEdit={handleEditRoom} onDelete={(id: string) => onUpdateData({ ...data, rooms: data.rooms.filter(r => r.id !== id), schedule: data.schedule.filter(s => s.roomId !== id), lastModified: formatDate(new Date()) })} />
    </div>
  );

  const renderSectionManager = () => (
    <div className="space-y-10 animate-in fade-in duration-500">
        <div className={`bg-white p-6 md:p-8 rounded-[32px] shadow-sm border transition-all ${editingSectionId ? 'border-blue-400 bg-blue-50/10' : 'border-gray-100'}`}>
            <h3 className="text-xl font-bold text-gray-800 mb-6">{editingSectionId ? 'Update Batch Configuration' : 'Student Batching'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <InputField label="Batch (e.g. 56)" value={newSectionBatch} onChange={(e: any) => setNewSectionBatch(e.target.value)} type="number" />
                <InputField label="Section Name (Optional)" value={newSectionName} onChange={(e: any) => setNewSectionName(e.target.value)} placeholder="e.g. A" />
                <InputField label="Expected Students" value={newSectionStudents} onChange={(e: any) => setNewSectionStudents(e.target.value)} type="number" />
            </div>
            {errorMsg && activeTab === 'sections' && <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2 text-sm border border-red-100"><AlertCircle className="w-4 h-4" /> {errorMsg}</div>}
            <div className="mt-8 flex justify-end gap-3">
                {editingSectionId && <button onClick={resetSectionForm} className="px-6 py-3 rounded-full text-gray-500 font-medium hover:bg-gray-100">Cancel</button>}
                <button onClick={handleSaveSection} className="bg-blue-600 text-white px-8 py-3 rounded-full font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">{editingSectionId ? 'Update Batch' : 'Create Section'}</button>
            </div>
        </div>
        <DataTable items={data.sections} fields={[{ key: 'batch', label: 'Batch' }, { key: 'name', label: 'Section' }, { key: 'studentCount', label: 'Students' }]} onEdit={handleEditSection} onDelete={(id: string) => onUpdateData({ ...data, sections: data.sections.filter(s => s.id !== id), schedule: data.schedule.filter(s => s.sectionId !== id), lastModified: formatDate(new Date()) })} />
    </div>
  );

  const renderSettings = () => (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-gray-400" /> Routine Configuration
              </h3>
              <div className="space-y-8">
                  <div className="space-y-1.5">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Semester Title</label>
                      <InputField value={semesterName} onChange={(e: any) => setSemesterName(e.target.value)} />
                  </div>

                  <div className="pt-4 border-t border-gray-50">
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="font-bold text-gray-800">Visibility</h4>
                              <p className="text-sm text-gray-500">Student access status.</p>
                          </div>
                          <button 
                              onClick={() => setLocalIsPublished(!localIsPublished)} 
                              className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${localIsPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}
                          >
                              {localIsPublished ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              {localIsPublished ? 'Live' : 'Hidden'}
                          </button>
                      </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                      <p className="text-xs text-gray-400 italic font-medium">Changes apply only after clicking Save.</p>
                      <button onClick={handleSaveSettings} className="w-full sm:w-auto bg-gray-900 text-white px-10 py-3.5 rounded-full font-bold hover:bg-black transition-colors shadow-xl shadow-gray-200 flex items-center justify-center gap-2">
                          <Save className="w-4 h-4" /> Save Settings
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF6] flex flex-col md:flex-row font-sans relative overflow-x-hidden">
      <ClassModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveSession} data={data} initialDay={modalInitialDay} initialTime={modalInitialTime} sessionToEdit={sessionToEdit} />
      
      {/* Mobile Menu Toggle */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-100 no-print sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold text-gray-900">Admin</h1>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation Overlay (Mobile) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed md:sticky top-0 inset-y-0 left-0 w-72 bg-white z-50 p-6 border-r border-gray-100 flex flex-col transition-transform duration-300 ease-in-out no-print
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 mb-10 pl-2">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                <LayoutDashboard className="w-5 h-5" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Console</h1>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">CIS Workspace</p>
            </div>
        </div>

        <nav className="flex-1 space-y-1">
          <NavItem id="schedule" label="Board" icon={Calendar} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
          <NavItem id="teachers" label="Teachers" icon={GraduationCap} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
          <NavItem id="courses" label="Courses" icon={BookOpen} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
          <NavItem id="rooms" label="Rooms" icon={MapPin} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
          <NavItem id="sections" label="Sections" icon={Layers} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
          <NavItem id="settings" label="Settings" icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} onClose={() => setIsMobileMenuOpen(false)} />
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-100">
            <button 
                onClick={onLogout} 
                className="w-full flex items-center gap-3 px-6 py-3 text-sm font-medium text-gray-400 hover:text-red-700 hover:bg-red-50 rounded-full transition-colors"
            >
                <LogOut className="w-4 h-4" /> Logout
            </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8 relative">
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-full h-96 -z-10 opacity-30 pointer-events-none no-print">
                <svg className="w-full h-full text-blue-100" viewBox="0 0 1000 400" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0 50C150 20 300 80 450 50C600 20 750 80 900 50V400H0V50Z" fill="currentColor" fillOpacity="0.3"/>
                    <path d="M0 150C200 120 400 180 600 150C800 120 1000 180 1200 150V400H0V150Z" fill="currentColor" fillOpacity="0.2"/>
                    <circle cx="850" cy="100" r="150" stroke="currentColor" strokeOpacity="0.1" strokeWidth="1" strokeDasharray="10 10"/>
                    <line x1="0" y1="200" x2="1000" y2="200" stroke="currentColor" strokeOpacity="0.05" strokeWidth="0.5"/>
                </svg>
            </div>

            {activeTab === 'schedule' && renderScheduler()}
            {activeTab === 'teachers' && renderTeacherManager()}
            {activeTab === 'courses' && renderCourseManager()}
            {activeTab === 'rooms' && renderRoomManager()}
            {activeTab === 'sections' && renderSectionManager()}
            {activeTab === 'settings' && renderSettings()}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;