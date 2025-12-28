import React, { useState, useEffect, useMemo } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room } from '../types';
import { checkConflict } from '../services/dbService';
// Added ChevronDown to the lucide-react imports
import { X, Save, AlertCircle, AlertTriangle, Clock, MapPin, Check, Calendar, Users, BookOpen, ChevronDown } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: ClassSession) => void;
  data: AppData;
  initialDay?: DayOfWeek;
  initialTime?: string;
  sessionToEdit?: ClassSession;
}

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, data, initialDay, initialTime, sessionToEdit }) => {
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [teacherId, setTeacherId] = useState<string>('');
  const [isCounseling, setIsCounseling] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (sessionToEdit) {
          setDay(sessionToEdit.day);
          setTimeSlot(`${sessionToEdit.startTime} - ${sessionToEdit.endTime}`);
          setTeacherId(sessionToEdit.teacherId);
          setIsCounseling(!!sessionToEdit.counselingHour);
          setCourseId(sessionToEdit.courseId || '');
          setRoomId(sessionToEdit.roomId || '');
          setSelectedSectionId(sessionToEdit.sectionId || '');
          
          if (sessionToEdit.sectionId) {
            const section = data.sections.find(s => s.id === sessionToEdit.sectionId);
            if (section) setSelectedBatch(section.batch);
          } else {
            setSelectedBatch('');
          }
      } else {
          setDay(initialDay || DayOfWeek.Sunday);
          const validInitialTime = TIME_SLOTS.includes(initialTime || '') ? (initialTime || TIME_SLOTS[0]) : TIME_SLOTS[0];
          setTimeSlot(validInitialTime);
          setTeacherId('');
          setIsCounseling(false);
          setCourseId('');
          setRoomId('');
          setSelectedBatch('');
          setSelectedSectionId('');
      }
      setError(null);
    }
  }, [isOpen, initialDay, initialTime, sessionToEdit, data.sections]);

  const availableRooms = useMemo(() => {
    const [start] = timeSlot.split(' - ');
    return data.rooms.filter(room => {
      const isOccupied = data.schedule.some(session => 
        session.day === day && 
        session.startTime === start && 
        session.roomId === room.id &&
        session.id !== sessionToEdit?.id
      );
      return !isOccupied;
    }).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [day, timeSlot, data.rooms, data.schedule, sessionToEdit]);

  const filteredSections = useMemo(() => {
    if (selectedBatch === '') return [];
    return data.sections.filter(s => s.batch === Number(selectedBatch));
  }, [selectedBatch, data.sections]);

  useEffect(() => {
    if (roomId && !isCounseling && !availableRooms.find(r => r.id === roomId)) {
      setRoomId('');
    }
  }, [availableRooms, roomId, isCounseling]);

  const teacherRef = useMemo(() => {
    return data.teachers.find(t => t.id === teacherId);
  }, [teacherId, data.teachers]);

  const offDayWarning = useMemo(() => {
    if (teacherRef && teacherRef.offDays.includes(day)) {
        return `${teacherRef.name} is on a scheduled off-day (${day}).`;
    }
    return null;
  }, [teacherRef, day]);

  if (!isOpen) return null;

  const uniqueBatches = Array.from(new Set(data.sections.map(s => s.batch))).sort((a: number, b: number) => a - b);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError("Please select the faculty member in charge.");
      return;
    }

    if (!isCounseling && (!courseId || !roomId || !selectedSectionId)) {
      setError("Academic classes require a course, room, and target section.");
      return;
    }

    const [start, end] = timeSlot.split(' - ');
    const newSession: ClassSession = {
      id: sessionToEdit ? sessionToEdit.id : crypto.randomUUID(),
      day,
      startTime: start,
      endTime: end,
      teacherId,
      courseId: isCounseling ? undefined : courseId,
      roomId: isCounseling ? undefined : roomId,
      sectionId: isCounseling ? undefined : selectedSectionId,
      counselingHour: isCounseling ? timeSlot : undefined
    };

    const conflict = checkConflict(newSession, data);
    if (conflict.hasConflict) {
      setError(conflict.message);
      return;
    }

    onSave(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 sm:px-10 py-5 sm:py-6 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {sessionToEdit ? 'Adjust Schedule' : 'Schedule New Session'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-all text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Body */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-10 overflow-y-auto space-y-6 sm:space-y-8 custom-scrollbar">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-2xl flex items-start gap-3 text-sm border border-red-100 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
            {/* Day of Week */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Day of Week</label>
              <div className="relative">
                <select 
                  value={day} 
                  onChange={e => setDay(e.target.value as DayOfWeek)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-800 transition-all appearance-none"
                >
                  {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Time Slot */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Time Slot</label>
              <div className="relative">
                <select 
                  value={timeSlot} 
                  onChange={e => setTimeSlot(e.target.value)}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-800 transition-all appearance-none"
                >
                  {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Faculty */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Faculty In-Charge</label>
              <div className="relative">
                <select 
                  value={teacherId} 
                  onChange={e => setTeacherId(e.target.value)}
                  className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:ring-4 outline-none transition-all font-bold appearance-none ${
                      offDayWarning ? 'border-amber-200 bg-amber-50/30' : 'border-gray-100'
                  }`}
                >
                  <option value="" disabled>Search Faculty</option>
                  {data.teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.initial}) {t.offDays.includes(day) ? '• OFF' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {offDayWarning && (
                <p className="text-[10px] text-amber-600 font-bold uppercase mt-1.5 flex items-center gap-1.5 px-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> {offDayWarning}
                </p>
              )}
            </div>

            {/* Counseling Toggle */}
            <div className="flex flex-col justify-center">
                <label className="flex items-center gap-3 cursor-pointer group p-3 rounded-2xl hover:bg-blue-50/50 transition-all border border-transparent hover:border-blue-100/50">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isCounseling} 
                      onChange={e => setIsCounseling(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-lg peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center">
                      <Check className={`w-4 h-4 text-white transition-transform ${isCounseling ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">Mark as Counseling Hour</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-tight">Disables room & section requirements</span>
                  </div>
                </label>
            </div>

            {/* Academic Batch */}
            <div className={`space-y-2 transition-all ${isCounseling ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Academic Batch</label>
              <div className="relative">
                <select 
                  value={selectedBatch} 
                  onChange={e => {
                    setSelectedBatch(Number(e.target.value));
                    setSelectedSectionId('');
                  }}
                  disabled={isCounseling}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-800 appearance-none"
                >
                  <option value="" disabled>Select Batch</option>
                  {uniqueBatches.map(b => <option key={b} value={b}>Batch {b}</option>)}
                </select>
                <Users className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Target Section */}
            <div className={`space-y-2 transition-all ${isCounseling ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Target Section</label>
              <div className="relative">
                <select 
                  value={selectedSectionId} 
                  onChange={e => setSelectedSectionId(e.target.value)}
                  disabled={!selectedBatch || isCounseling}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-800 disabled:bg-gray-100 appearance-none"
                >
                  <option value="" disabled>Select Section</option>
                  {filteredSections.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name ? `Section ${s.name}` : `Core (Batch ${s.batch})`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Course Assignment */}
            <div className={`space-y-2 transition-all ${isCounseling ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Assign Course</label>
              <div className="relative">
                <select 
                  value={courseId} 
                  onChange={e => setCourseId(e.target.value)}
                  disabled={isCounseling}
                  className="w-full p-3.5 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none font-bold text-gray-800 disabled:bg-gray-100 appearance-none"
                >
                  <option value="" disabled>Search Catalog</option>
                  {data.courses.map(c => (
                    <option key={c.id} value={c.id}>{c.code}: {c.shortName}</option>
                  ))}
                </select>
                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Room Allocation */}
            <div className={`space-y-2 transition-all ${isCounseling ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Classroom / Lab</label>
              <div className="relative">
                <select 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)}
                  disabled={isCounseling || availableRooms.length === 0}
                  className={`w-full p-3.5 bg-gray-50 border rounded-2xl focus:ring-4 outline-none transition-all font-bold appearance-none ${
                    !isCounseling && availableRooms.length === 0 
                      ? 'border-red-200 text-red-700 bg-red-50/50' 
                      : 'border-gray-100 text-gray-800'
                  } disabled:bg-gray-100`}
                >
                  {availableRooms.length > 0 ? (
                    <>
                      <option value="" disabled>Select Vacant Room</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>{r.roomNumber} ({r.type})</option>
                      ))}
                    </>
                  ) : (
                    <option value="">No rooms available for this time slot</option>
                  )}
                </select>
                <MapPin className={`absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 ${!isCounseling && availableRooms.length === 0 ? 'text-red-400' : 'text-gray-400'} pointer-events-none`} />
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 sm:px-10 py-6 border-t border-gray-100 bg-gray-50/50 flex flex-col-reverse sm:flex-row justify-end gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onClose}
            className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold text-gray-500 hover:text-gray-900 transition-all rounded-full"
          >
            Discard Changes
          </button>
          <button 
            type="submit"
            onClick={handleSubmit}
            disabled={!isCounseling && availableRooms.length === 0}
            className="w-full sm:w-auto px-10 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> 
            {sessionToEdit ? 'Confirm Update' : 'Confirm Schedule'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassModal;