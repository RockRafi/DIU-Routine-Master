import React, { useState, useEffect, useMemo } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS, Room } from '../types';
import { checkConflict } from '../services/dbService';
import { X, Save, AlertCircle, AlertTriangle, Clock, MapPin, Check, Calendar } from 'lucide-react';

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

  // Dynamically calculate truly available rooms for the chosen time slot
  const availableRooms = useMemo(() => {
    const [start] = timeSlot.split(' - ');
    return data.rooms.filter(room => {
      // Find if this room is already booked by any OTHER session at the same time
      const isOccupied = data.schedule.some(session => 
        session.day === day && 
        session.startTime === start && 
        session.roomId === room.id &&
        session.id !== sessionToEdit?.id
      );
      return !isOccupied;
    }).sort((a, b) => a.roomNumber.localeCompare(b.roomNumber));
  }, [day, timeSlot, data.rooms, data.schedule, sessionToEdit]);

  // Sections filtered by selected batch
  const filteredSections = useMemo(() => {
    if (selectedBatch === '') return [];
    return data.sections.filter(s => s.batch === Number(selectedBatch));
  }, [selectedBatch, data.sections]);

  // Reset roomId if the current selection becomes invalid due to day/slot change
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
        return `${teacherRef.name} is on a designated off-day (${day}).`;
    }
    return null;
  }, [teacherRef, day]);

  if (!isOpen) return null;

  const uniqueBatches = Array.from(new Set(data.sections.map(s => s.batch))).sort((a: number, b: number) => a - b);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError("Faculty member selection is required.");
      return;
    }

    if (!isCounseling && (!courseId || !roomId || !selectedSectionId)) {
      setError("Please ensure all academic fields (Course, Room, Section) are populated.");
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
      setError(conflict.message || "A scheduling conflict was detected.");
      return;
    }

    onSave(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[40px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-white/20">
        <div className="px-10 py-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-blue-100 text-blue-600 rounded-xl shadow-sm">
              <Calendar className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              {sessionToEdit ? 'Adjust Assignment' : 'New Academic Entry'}
            </h2>
          </div>
          <button onClick={onClose} className="p-2.5 hover:bg-red-50 hover:text-red-600 rounded-full transition-all text-gray-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-8">
          {error && (
            <div className="p-5 bg-red-50 text-red-700 rounded-2xl flex items-start gap-4 text-sm border border-red-200 animate-in slide-in-from-top-3 shadow-sm">
              <AlertCircle className="w-6 h-6 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="font-black uppercase text-[10px] tracking-widest text-red-400">Conflict Detected</span>
                <span className="font-bold">{error}</span>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Working Day</label>
              <select 
                value={day} 
                onChange={e => setDay(e.target.value as DayOfWeek)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all cursor-pointer"
              >
                {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Assigned Time Slot</label>
              <select 
                value={timeSlot} 
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-800 transition-all cursor-pointer"
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Faculty Member</label>
              <select 
                value={teacherId} 
                onChange={e => setTeacherId(e.target.value)}
                className={`w-full p-4 bg-gray-50 border-2 rounded-2xl focus:ring-8 outline-none transition-all font-bold cursor-pointer ${
                    offDayWarning ? 'border-orange-300 ring-orange-100 text-orange-950 bg-orange-50/40' : 'border-gray-100 focus:ring-blue-500/5 focus:border-blue-500 text-slate-800'
                }`}
              >
                <option value="" disabled>Select Faculty</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} [{t.initial}] {t.offDays.includes(day) ? '⚠️ OFF' : ''}
                  </option>
                ))}
              </select>
              {offDayWarning && (
                <p className="text-[10px] text-orange-600 font-black uppercase mt-2 ml-1 flex items-center gap-2 animate-pulse">
                  <AlertTriangle className="w-4 h-4" /> {offDayWarning}
                </p>
              )}
            </div>

            <div className="flex flex-col justify-end pb-3">
                <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-2xl hover:bg-blue-50 transition-all border-2 border-transparent hover:border-blue-100">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isCounseling} 
                      onChange={e => setIsCounseling(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-7 h-7 border-2 border-gray-300 rounded-xl group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all flex items-center justify-center shadow-sm">
                      <Check className={`w-5 h-5 text-white transition-transform ${isCounseling ? 'scale-100' : 'scale-0'}`} strokeWidth={4} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 group-hover:text-blue-700 transition-colors uppercase tracking-tighter">Counseling Slot</span>
                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Exclude room/batch requirements</span>
                  </div>
                </label>
            </div>

            <div className={`space-y-2 transition-all duration-300 ${isCounseling ? 'opacity-25 grayscale pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Target Batch</label>
              <select 
                value={selectedBatch} 
                onChange={e => {
                  setSelectedBatch(Number(e.target.value));
                  setSelectedSectionId('');
                }}
                disabled={isCounseling}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-800 cursor-pointer"
              >
                <option value="" disabled>Select Batch</option>
                {uniqueBatches.map(b => <option key={b} value={b}>Batch {b}</option>)}
              </select>
            </div>

            <div className={`space-y-2 transition-all duration-300 ${isCounseling ? 'opacity-25 grayscale pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Active Section</label>
              <select 
                value={selectedSectionId} 
                onChange={e => setSelectedSectionId(e.target.value)}
                disabled={!selectedBatch || isCounseling}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-800 disabled:bg-gray-100 disabled:opacity-50 cursor-pointer"
              >
                <option value="" disabled>Select Section</option>
                {filteredSections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name ? `Section ${s.name}` : `Entire Batch ${s.batch}`}
                  </option>
                ))}
              </select>
            </div>

            <div className={`space-y-2 transition-all duration-300 ${isCounseling ? 'opacity-25 grayscale pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Course Assignment</label>
              <select 
                value={courseId} 
                onChange={e => setCourseId(e.target.value)}
                disabled={isCounseling}
                className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-8 focus:ring-blue-500/5 focus:border-blue-500 outline-none font-bold text-slate-800 disabled:bg-gray-100 cursor-pointer"
              >
                <option value="" disabled>Select Catalog Course</option>
                {data.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code}: {c.name}</option>
                ))}
              </select>
            </div>

            <div className={`space-y-2 transition-all duration-300 ${isCounseling ? 'opacity-25 grayscale pointer-events-none' : 'opacity-100'}`}>
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Room Allocation</label>
              <div className="relative">
                <select 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)}
                  disabled={isCounseling || availableRooms.length === 0}
                  className={`w-full p-4 pl-12 border-2 rounded-2xl focus:ring-8 outline-none transition-all font-bold cursor-pointer ${
                    !isCounseling && availableRooms.length === 0 
                      ? 'bg-red-50 border-red-300 text-red-700 ring-red-100' 
                      : 'bg-gray-50 border-gray-100 focus:ring-blue-500/5 focus:border-blue-500 text-slate-800'
                  } disabled:bg-gray-100`}
                >
                  {availableRooms.length > 0 ? (
                    <>
                      <option value="" disabled>Choose Vacant Room</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>{r.roomNumber} ({r.type})</option>
                      ))}
                    </>
                  ) : (
                    <option value="">No rooms available for this time slot</option>
                  )}
                </select>
                <MapPin className={`absolute left-4.5 top-4.5 w-5 h-5 ${!isCounseling && availableRooms.length === 0 ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              {!isCounseling && availableRooms.length === 0 && (
                <p className="text-[10px] text-red-600 font-black uppercase mt-2 ml-1 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> Overbooked: No rooms available for this time slot
                </p>
              )}
            </div>
          </div>

          <div className="pt-8 flex justify-end gap-5 border-t border-gray-100">
            <button 
              type="button" 
              onClick={onClose}
              className="px-10 py-4 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isCounseling && availableRooms.length === 0}
              className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold shadow-2xl shadow-blue-500/30 transition-all flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 group"
            >
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" /> 
              {isCounseling ? 'Confirm Counseling' : (sessionToEdit ? 'Save Changes' : 'Finalize Assignment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;