import React, { useState, useEffect } from 'react';
import { AppData, ClassSession, DayOfWeek, TIME_SLOTS } from '../types';
import { checkConflict } from '../services/dbService';
import { X, Save, AlertCircle } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (session: ClassSession) => void;
  data: AppData;
  initialDay?: DayOfWeek;
  initialTime?: string;
}

const ClassModal: React.FC<ClassModalProps> = ({ isOpen, onClose, onSave, data, initialDay, initialTime }) => {
  const [day, setDay] = useState<DayOfWeek>(DayOfWeek.Sunday);
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[0]);
  const [selectedBatch, setSelectedBatch] = useState<number | ''>('');
  const [selectedSectionId, setSelectedSectionId] = useState<string>('');
  const [teacherId, setTeacherId] = useState<string>('');
  const [courseId, setCourseId] = useState<string>('');
  const [roomId, setRoomId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Sync props to state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDay) setDay(initialDay);
      if (initialTime) setTimeSlot(initialTime);
      setError(null);
      // Reset fields
      setTeacherId('');
      setCourseId('');
      setRoomId('');
      setSelectedBatch('');
      setSelectedSectionId('');
    }
  }, [isOpen, initialDay, initialTime]);

  if (!isOpen) return null;

  // Get unique batches
  const uniqueBatches = Array.from(new Set(data.sections.map(s => s.batch))).sort((a, b) => a - b);
  
  // Filter sections based on selected batch
  const availableSections = data.sections.filter(s => s.batch === Number(selectedBatch));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teacherId || !courseId || !roomId || !selectedSectionId) {
      setError("Please fill in all fields.");
      return;
    }

    const [start, end] = timeSlot.split(' - ');
    const newSession: ClassSession = {
      id: crypto.randomUUID(),
      day,
      startTime: start,
      endTime: end,
      teacherId,
      courseId,
      roomId,
      sectionId: selectedSectionId
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
          <h2 className="text-xl font-semibold text-gray-800">Schedule Class</h2>
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
              <label className="text-sm font-medium text-gray-700 ml-1">Day</label>
              <select 
                value={day} 
                onChange={e => setDay(e.target.value as DayOfWeek)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {Object.values(DayOfWeek).map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Time Slot</label>
              <select 
                value={timeSlot} 
                onChange={e => setTimeSlot(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Batch</label>
              <select 
                value={selectedBatch} 
                onChange={e => {
                  setSelectedBatch(Number(e.target.value));
                  setSelectedSectionId(''); // Reset section when batch changes
                }}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="" disabled>Select Batch</option>
                {uniqueBatches.map(b => <option key={b} value={b}>Batch {b}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Section</label>
              <select 
                value={selectedSectionId} 
                onChange={e => setSelectedSectionId(e.target.value)}
                disabled={!selectedBatch}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none disabled:opacity-50"
              >
                <option value="" disabled>Select Section</option>
                {availableSections.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name ? `Section ${s.name}` : `Batch ${s.batch} (Entire)`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Teacher</label>
              <select 
                value={teacherId} 
                onChange={e => setTeacherId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="" disabled>Select Teacher</option>
                {data.teachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} ({t.initial})</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 ml-1">Course</label>
              <select 
                value={courseId} 
                onChange={e => setCourseId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="" disabled>Select Course</option>
                {data.courses.map(c => (
                  <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-medium text-gray-700 ml-1">Room</label>
              <select 
                value={roomId} 
                onChange={e => setRoomId(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
              >
                <option value="" disabled>Select Room</option>
                {data.rooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomNumber} (Cap: {r.capacity}) - {r.type}</option>
                ))}
              </select>
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
              className="px-8 py-2.5 bg-gray-900 hover:bg-black text-white rounded-full font-medium shadow-lg shadow-gray-200 transition-all flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Class
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClassModal;