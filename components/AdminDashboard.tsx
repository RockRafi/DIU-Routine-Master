import React, { useState } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room, Teacher, Course, Section } from '../types';
import ScheduleGrid from './ScheduleGrid';
import ClassModal from './ClassModal';
import { Trash2, Plus, AlertCircle, Save, Database, LogOut, Calendar, GraduationCap, BookOpen, MapPin, Layers, LayoutDashboard, Settings, ToggleLeft, ToggleRight, Printer, Download } from 'lucide-react';

// --- Sub-Components Defined Outside ---

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

const NavItem = ({ id, label, icon: Icon, activeTab, setActiveTab, setErrorMsg }: any) => (
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

const DataTable = ({ items, fields, onDelete, emptyMessage = "No records found." }: any) => (
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
                    {item[f.key] || <span className="text-gray-300">-</span>}
                  </td>
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

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialDay, setModalInitialDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [modalInitialTime, setModalInitialTime] = useState<string>(TIME_SLOTS[0]);

  // Form States
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState<'Theory' | 'Lab'>('Theory');

  const [newTeacherName, setNewTeacherName] = useState('');
  const [newTeacherInitial, setNewTeacherInitial] = useState('');
  const [newTeacherEmail, setNewTeacherEmail] = useState('');
  const [newTeacherOffDay, setNewTeacherOffDay] = useState('');
  // Counseling form state
  const [newTeacherCounselingDay, setNewTeacherCounselingDay] = useState('');
  const [newTeacherCounselingTime, setNewTeacherCounselingTime] = useState('');
  const [newTeacherCounselingNone, setNewTeacherCounselingNone] = useState(false);

  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState('');

  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionBatch, setNewSectionBatch] = useState('');
  const [newSectionStudents, setNewSectionStudents] = useState('');

  // Settings State
  const [semesterName, setSemesterName] = useState(data.settings.semesterName);

  // -- Actions --

  const handleOpenModal = (day?: DayOfWeek, time?: string) => {
    if (day) setModalInitialDay(day);
    if (time) setModalInitialTime(time);
    setIsModalOpen(true);
  };

  const handleSaveSession = (newSession: ClassSession) => {
    const newData = { ...data, schedule: [...data.schedule, newSession] };
    onUpdateData(newData);
  };

  const handleDeleteSession = (id: string) => {
    if (confirm("Are you sure you want to remove this class?")) {
      const newData = { ...data, schedule: data.schedule.filter(s => s.id !== id) };
      onUpdateData(newData);
    }
  };

  const handleSaveSettings = () => {
    onUpdateData({
        ...data,
        settings: {
            ...data.settings,
            semesterName: semesterName
        }
    });
    alert("Settings saved!");
  };

  const togglePublish = () => {
      onUpdateData({
          ...data,
          settings: {
              ...data.settings,
              isPublished: !data.settings.isPublished
          }
      });
  };

  const handleAddRoom = () => {
    setErrorMsg(null);
    if (!newRoomNumber) {
      setErrorMsg("Room Number is required.");
      return;
    }
    if (data.rooms.some(r => r.roomNumber.toLowerCase() === newRoomNumber.trim().toLowerCase())) {
        setErrorMsg("A room with this number already exists.");
        return;
    }
    const newRoom: Room = {
      id: crypto.randomUUID(),
      roomNumber: newRoomNumber.trim(),
      type: newRoomType
    };
    onUpdateData({ ...data, rooms: [...data.rooms, newRoom] });
    setNewRoomNumber('');
    setNewRoomType('Theory');
  };

  const handleAddTeacher = () => {
    setErrorMsg(null);
    if (!newTeacherName || !newTeacherInitial || !newTeacherEmail) {
      setErrorMsg("All teacher fields (Name, Initial, Email) are required.");
      return;
    }
    if (data.teachers.some(t => t.initial.toLowerCase() === newTeacherInitial.trim().toLowerCase())) {
      setErrorMsg("A teacher with this initial already exists.");
      return;
    }

    let counselingString = 'None';
    if (!newTeacherCounselingNone) {
        if (!newTeacherCounselingDay || !newTeacherCounselingTime) {
             setErrorMsg("Please select Counseling Day and Time, or check 'None'.");
             return;
        }
        counselingString = `${newTeacherCounselingDay} ${newTeacherCounselingTime}`;
    }

    const newTeacher: Teacher = {
      id: crypto.randomUUID(),
      name: newTeacherName.trim(),
      initial: newTeacherInitial.trim().toUpperCase(),
      email: newTeacherEmail.trim(),
      offDay: newTeacherOffDay,
      counselingHour: counselingString
    };
    onUpdateData({ ...data, teachers: [...data.teachers, newTeacher] });
    setNewTeacherName('');
    setNewTeacherInitial('');
    setNewTeacherEmail('');
    setNewTeacherOffDay('');
    setNewTeacherCounselingDay('');
    setNewTeacherCounselingTime('');
    setNewTeacherCounselingNone(false);
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
    if (!newSectionBatch || !newSectionStudents) {
      setErrorMsg("Batch number and Student count are required.");
      return;
    }
    // Check for duplicate
    if (data.sections.some(s => s.name === newSectionName.trim() && s.batch === parseInt(newSectionBatch))) {
       setErrorMsg("This section already exists.");
       return;
    }
    const newSection: Section = {
      id: crypto.randomUUID(),
      name: newSectionName.trim(),
      batch: parseInt(newSectionBatch),
      studentCount: parseInt(newSectionStudents)
    };
    onUpdateData({ ...data, sections: [...data.sections, newSection] });
    setNewSectionName('');
    setNewSectionBatch('');
    setNewSectionStudents('');
  };


  // -- Render Tab Content --

  const renderScheduler = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-[24px] shadow-sm border border-gray-100 gap-4">
            <div>
                <h3 className="text-xl font-bold text-gray-800">Master Schedule</h3>
                <p className="text-gray-500 text-sm">Click on any cell to assign a class.</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
               {!data.settings.isPublished && (
                   <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-200">
                       DRAFT MODE
                   </span>
               )}
               <button 
                onClick={() => window.print()} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-colors"
               >
                 <Printer className="w-4 h-4" /> Print Master
               </button>
               <button 
                onClick={() => handleOpenModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 text-sm font-medium transition-colors shadow-lg shadow-blue-200"
               >
                 <Plus className="w-4 h-4" /> Add Class
               </button>
            </div>
        </div>
        <div className="print:block">
            <ScheduleGrid 
                data={data} 
                onSlotClick={handleOpenModal} 
                onDeleteSession={handleDeleteSession} 
            />
        </div>
    </div>
  );

  const renderSettings = () => (
      <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
          <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">System Configuration</h3>
              
              <div className="space-y-6">
                  <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Current Semester Name</label>
                      <InputField 
                        value={semesterName} 
                        onChange={(e: any) => setSemesterName(e.target.value)} 
                        placeholder="e.g. Spring 2026" 
                      />
                      <p className="text-xs text-gray-500 mt-2">This will be displayed on the public homepage and all exports.</p>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between">
                          <div>
                              <h4 className="font-medium text-gray-900">Public Visibility</h4>
                              <p className="text-sm text-gray-500">Control if students can see the routine.</p>
                          </div>
                          <button 
                            onClick={togglePublish}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-medium transition-all ${
                                data.settings.isPublished 
                                ? 'bg-green-100 text-green-700 border border-green-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                              {data.settings.isPublished ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                              {data.settings.isPublished ? 'Published' : 'Unpublished'}
                          </button>
                      </div>
                  </div>

                  <div className="pt-6 flex justify-end">
                      <button 
                        onClick={handleSaveSettings}
                        className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-black transition-colors"
                      >
                          Save Changes
                      </button>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderRoomManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-orange-600 text-white p-2.5 rounded-xl shadow-md shadow-orange-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Room</h3>
            </div>
        </div>
        {errorMsg && <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">{errorMsg}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
          <InputField label="Room Number" value={newRoomNumber} onChange={(e: any) => setNewRoomNumber(e.target.value)} placeholder="e.g. AB4-601" />
           <SelectField label="Type" value={newRoomType} onChange={(e: any) => setNewRoomType(e.target.value as any)} options={<><option value="Theory">Theory</option><option value="Lab">Lab</option></>} />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddRoom} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" /> Save Room
          </button>
        </div>
      </div>
      <DataTable 
        items={data.rooms} 
        fields={[{key:'roomNumber', label:'Room Number'}, {key:'type', label:'Type'}]} 
        onDelete={(id: string) => onUpdateData({...data, rooms: data.rooms.filter(r => r.id !== id)})} 
      />
    </div>
  );

  const renderTeacherManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-green-600 text-white p-2.5 rounded-xl shadow-md shadow-green-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Teacher</h3>
            </div>
        </div>
        {errorMsg && <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">{errorMsg}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Full Name" value={newTeacherName} onChange={(e: any) => setNewTeacherName(e.target.value)} placeholder="e.g. John Doe" />
          <InputField label="Initial" value={newTeacherInitial} onChange={(e: any) => setNewTeacherInitial(e.target.value)} placeholder="JD" />
          <InputField label="Email" value={newTeacherEmail} onChange={(e: any) => setNewTeacherEmail(e.target.value)} type="email" placeholder="john@diu.edu.bd" />
          
          <SelectField label="Off Day" value={newTeacherOffDay} onChange={(e: any) => setNewTeacherOffDay(e.target.value)} options={Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)} />
          
          {/* Counseling Hour Split Input */}
          <div className="md:col-span-2 space-y-2">
             <label className="text-sm font-medium text-gray-600 block">Counseling Hour</label>
             <div className="flex items-center gap-3">
                 <div className="flex-1">
                     <SelectField 
                        label="Day" 
                        value={newTeacherCounselingDay} 
                        onChange={(e: any) => { setNewTeacherCounselingDay(e.target.value); setNewTeacherCounselingNone(false); }} 
                        options={Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)} 
                     />
                 </div>
                 <div className="flex-1">
                     <SelectField 
                        label="Time" 
                        value={newTeacherCounselingTime} 
                        onChange={(e: any) => { setNewTeacherCounselingTime(e.target.value); setNewTeacherCounselingNone(false); }} 
                        options={TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)} 
                     />
                 </div>
                 <div className="flex items-center gap-2 px-2">
                     <input 
                       type="checkbox" 
                       id="cNone"
                       checked={newTeacherCounselingNone} 
                       onChange={(e) => { 
                           setNewTeacherCounselingNone(e.target.checked); 
                           if(e.target.checked) {
                               setNewTeacherCounselingDay('');
                               setNewTeacherCounselingTime('');
                           }
                       }}
                       className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500"
                     />
                     <label htmlFor="cNone" className="text-sm text-gray-600">None</label>
                 </div>
             </div>
          </div>

        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddTeacher} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" /> Save Teacher
          </button>
        </div>
      </div>
      <DataTable 
        items={data.teachers} 
        fields={[{key:'name', label:'Name'}, {key:'initial', label:'Initial'}, {key:'email', label:'Email'}, {key:'offDay', label:'Off Day'}, {key:'counselingHour', label:'Counseling'}]} 
        onDelete={(id: string) => onUpdateData({...data, teachers: data.teachers.filter(x => x.id !== id)})} 
      />
    </div>
  );

  const renderCourseManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-purple-600 text-white p-2.5 rounded-xl shadow-md shadow-purple-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Course</h3>
            </div>
        </div>
        {errorMsg && <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">{errorMsg}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Course Code" value={newCourseCode} onChange={(e: any) => setNewCourseCode(e.target.value)} placeholder="CSE101" />
          <InputField label="Course Title" value={newCourseName} onChange={(e: any) => setNewCourseName(e.target.value)} placeholder="Structured Programming" />
          <InputField label="Credits" value={newCourseCredits} onChange={(e: any) => setNewCourseCredits(e.target.value)} type="number" placeholder="3" />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddCourse} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" /> Save Course
          </button>
        </div>
      </div>
      <DataTable 
        items={data.courses} 
        fields={[{key:'code', label:'Code'}, {key:'name', label:'Title'}, {key:'credits', label:'Credits'}]} 
        onDelete={(id: string) => onUpdateData({...data, courses: data.courses.filter(x => x.id !== id)})} 
      />
    </div>
  );

  const renderSectionManager = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="flex items-center gap-3 mb-8 relative">
            <div className="bg-pink-600 text-white p-2.5 rounded-xl shadow-md shadow-pink-200">
                <Plus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-800">Add New Section</h3>
              <p className="text-gray-500 text-sm">Leave name empty if the Batch has no sections.</p>
            </div>
        </div>
        {errorMsg && <div className="mb-8 p-4 bg-red-50 text-red-700 rounded-2xl text-sm">{errorMsg}</div>}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          <InputField label="Batch Number" value={newSectionBatch} onChange={(e: any) => setNewSectionBatch(e.target.value)} type="number" placeholder="56" />
          <InputField label="Section Name (Optional)" value={newSectionName} onChange={(e: any) => setNewSectionName(e.target.value)} placeholder="A" />
          <InputField label="Total Students" value={newSectionStudents} onChange={(e: any) => setNewSectionStudents(e.target.value)} type="number" placeholder="40" />
        </div>
        <div className="mt-8 flex justify-end">
          <button onClick={handleAddSection} className="bg-gray-900 hover:bg-black text-white px-8 py-3.5 rounded-full shadow-lg shadow-gray-200 flex items-center gap-2 font-medium">
            <Save className="w-4 h-4" /> Save Section
          </button>
        </div>
      </div>
      <DataTable 
        items={data.sections} 
        fields={[{key:'batch', label:'Batch'}, {key:'name', label:'Name'}, {key:'studentCount', label:'Students'}]} 
        onDelete={(id: string) => onUpdateData({...data, sections: data.sections.filter(x => x.id !== id)})} 
      />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDF6] flex flex-col md:flex-row font-sans selection:bg-blue-100">
      <ClassModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSaveSession}
        data={data}
        initialDay={modalInitialDay}
        initialTime={modalInitialTime}
      />

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
          <NavItem id="schedule" label="Master Schedule" icon={Calendar} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
          <NavItem id="teachers" label="Teachers" icon={GraduationCap} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
          <NavItem id="courses" label="Courses" icon={BookOpen} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
          <NavItem id="rooms" label="Rooms" icon={MapPin} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
          <NavItem id="sections" label="Sections" icon={Layers} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
          <NavItem id="settings" label="Settings" icon={Settings} activeTab={activeTab} setActiveTab={setActiveTab} setErrorMsg={setErrorMsg} />
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

      <main className="flex-1 p-4 md:p-8 lg:p-10 overflow-y-auto">
        <header className="mb-8 md:hidden">
            <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        </header>

        {activeTab === 'schedule' && renderScheduler()}
        {activeTab === 'teachers' && renderTeacherManager()}
        {activeTab === 'courses' && renderCourseManager()}
        {activeTab === 'rooms' && renderRoomManager()}
        {activeTab === 'sections' && renderSectionManager()}
        {activeTab === 'settings' && renderSettings()}
      </main>
    </div>
  );
};

export default AdminDashboard;