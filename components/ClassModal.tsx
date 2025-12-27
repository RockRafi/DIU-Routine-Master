import React, { useState, useEffect, useMemo } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS } from '../types';
import { checkConflict } from '../services/dbService';
import { X, Save, AlertCircle, AlertTriangle, Clock, MapPin, Check } from 'lucide-react';

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
    });
  }, [day, timeSlot, data.rooms, data.schedule, sessionToEdit]);

  useEffect(() => {
    if (roomId && !availableRooms.find(r => r.id === roomId)) {
      setRoomId('');
    }
  }, [availableRooms, roomId]);

  const offDayWarning = useMemo(() => {
    if (!teacherId) return null;
    const teacher = data.teachers.find(t => t.id === teacherId);
    if (teacher && teacher.offDays && teacher.offDays.includes(day)) {
        return `${teacher.name} has an off-day on ${day}.`;
    }
    return null;
  }, [teacherId, day, data.teachers]);

  if (!isOpen) return null;

  const uniqueBatches = Array.from(new Set(data.sections.map(s => s.batch))).sort((a: number, b: number) => a - b);
  const availableSections = data.sections.filter(s => s.batch === Number(selectedBatch));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId) {
      setError("Please select a teacher.");
      return;
    }

    if (!isCounseling && (!courseId || !roomId || !selectedSectionId)) {
      setError("Please fill in all academic fields for a standard class.");
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
      setError(conflict.message || "Conflict detected.");
      return;
    }

    onSave(newSession);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-semibold text-gray-800">{sessionToEdit ? 'Edit Session' : 'Schedule New Session'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-start gap-3 text-sm border border-red-100">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Day</label>
              <select 
                value={day} 
                onChange={e => setDay(e.target.value as DayOfWeek)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Time Slot</label>
              <select 
                value={timeSlot} 
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Teacher</label>
              <select 
                value={teacherId} 
                onChange={e => setTeacherId(e.target.value)}
                className={`w-full p-3 bg-gray-50 border rounded-xl focus:ring-2 outline-none transition-all ${
                    offDayWarning ? 'border-orange-300 ring-4 ring-orange-100 text-orange-900' : 'border-gray-200 focus:ring-blue-500/20'
                }`}
              >
                <option value="" disabled>Select Teacher</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.initial}) {t.offDays.includes(day) ? '⚠️' : ''}
                  </option>
                ))}
              </select>
              {offDayWarning && <p className="text-[10px] text-orange-600 font-bold uppercase mt-1 ml-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {offDayWarning}</p>}
            </div>

            <div className="flex flex-col justify-end pb-1.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      checked={isCounseling} 
                      onChange={e => setIsCounseling(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 border-2 border-gray-300 rounded-lg group-hover:border-blue-400 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all"></div>
                    <Check className={`absolute inset-0 w-6 h-6 text-white p-1 transition-transform ${isCounseling ? 'scale-100' : 'scale-0'}`} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-blue-600 transition-colors">Mark as Counseling Hour</span>
                </label>
            </div>

            <div className={`space-y-1.5 transition-opacity ${isCounseling ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Batch</label>
              <select 
                value={selectedBatch} 
                onChange={e => {
                  setSelectedBatch(Number(e.target.value));
                  setSelectedSectionId('');
                }}
                disabled={isCounseling}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Batch</option>
                {uniqueBatches.map(b => <option key={b} value={b}>Batch {b}</option>)}
              </select>
            </div>

            <div className={`space-y-1.5 transition-opacity ${isCounseling ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Section</label>
              <select 
                value={selectedSectionId} 
                onChange={e => setSelectedSectionId(e.target.value)}
                disabled={!selectedBatch || isCounseling}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Section</option>
                {availableSections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name ? `Section ${s.name}` : `Batch ${s.batch} (Entire)`}
                  </option>
                ))}
              </select>
            </div>

            <div className={`space-y-1.5 transition-opacity ${isCounseling ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Course</label>
              <select 
                value={courseId} 
                onChange={e => setCourseId(e.target.value)}
                disabled={isCounseling}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:cursor-not-allowed"
              >
                <option value="" disabled>Select Course</option>
                {data.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className={`space-y-1.5 transition-opacity ${isCounseling ? 'opacity-30' : 'opacity-100'}`}>
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Room</label>
              <div className="relative">
                <select 
                  value={roomId} 
                  onChange={e => setRoomId(e.target.value)}
                  disabled={isCounseling || availableRooms.length === 0}
                  className={`w-full p-3 pl-10 border rounded-xl focus:ring-2 outline-none transition-all ${
                    !isCounseling && availableRooms.length === 0 
                      ? 'bg-red-50 border-red-200 text-red-600' 
                      : 'bg-gray-50 border-gray-200 focus:ring-blue-500/20 focus:border-blue-500'
                  } disabled:cursor-not-allowed`}
                >
                  {availableRooms.length > 0 ? (
                    <>
                      <option value="" disabled>Select Available Room</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>{r.roomNumber} ({r.type})</option>
                      ))}
                    </>
                  ) : (
                    <option value="">No rooms available for this time slot</option>
                  )}
                </select>
                <MapPin className={`absolute left-3 top-3.5 w-4 h-4 ${!isCounseling && availableRooms.length === 0 ? 'text-red-400' : 'text-gray-400'}`} />
              </div>
              {!isCounseling && availableRooms.length === 0 && (
                <p className="text-[10px] text-red-600 font-bold uppercase mt-1 ml-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> All {data.rooms.length} rooms are occupied.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 font-medium hover:bg-gray-100 rounded-full transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={!isCounseling && availableRooms.length === 0}
              className="px-8 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium shadow-lg shadow-gray-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> {isCounseling ? 'Save' : (sessionToEdit ? 'Update Class' : 'Schedule Class')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;