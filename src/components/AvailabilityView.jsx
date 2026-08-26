import React, { useState } from 'react';
import { Clock, Calendar, CheckCircle2, Save, Video, UserCheck } from 'lucide-react';

export default function AvailabilityView({ doctorProfile, onSaveAvailability }) {
  const [availability, setAvailability] = useState(
    doctorProfile.availability || {
      workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      startTime: "09:00 AM",
      endTime: "05:00 PM",
      breakTime: "01:00 PM - 02:00 PM",
      slotDuration: "30 Mins",
      onlineConsultation: true,
      inPersonConsultation: true
    }
  );

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const toggleDay = (day) => {
    const current = availability.workingDays || [];
    if (current.includes(day)) {
      setAvailability({ ...availability, workingDays: current.filter(d => d !== day) });
    } else {
      setAvailability({ ...availability, workingDays: [...current, day] });
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    onSaveAvailability(availability);
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      
      {/* Title Header */}
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <Clock className="w-6 h-6 text-sky-600" />
          <span>My Availability & Working Hours</span>
        </h1>
        <p className="text-xs text-slate-500">
          Configure your clinical schedule, slot duration, and consultation modes
        </p>
      </div>

      <form onSubmit={handleSave} className="medx-card p-6 bg-white space-y-6">
        
        {/* Working Days Selector */}
        <div className="space-y-3">
          <label className="block text-sm font-bold text-slate-900">
            Working Days
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {daysOfWeek.map((day) => {
              const isSelected = availability.workingDays?.includes(day);
              
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    isSelected
                      ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Operating Hours & Break Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Daily Start Time</label>
            <select
              value={availability.startTime}
              onChange={(e) => setAvailability({ ...availability, startTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-800"
            >
              <option value="08:00 AM">08:00 AM</option>
              <option value="09:00 AM">09:00 AM</option>
              <option value="10:00 AM">10:00 AM</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Daily End Time</label>
            <select
              value={availability.endTime}
              onChange={(e) => setAvailability({ ...availability, endTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-800"
            >
              <option value="04:00 PM">04:00 PM</option>
              <option value="05:00 PM">05:00 PM</option>
              <option value="06:00 PM">06:00 PM</option>
              <option value="07:00 PM">07:00 PM</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Lunch / Break Hours</label>
            <input
              type="text"
              value={availability.breakTime}
              onChange={(e) => setAvailability({ ...availability, breakTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl font-medium text-slate-800"
            />
          </div>
        </div>

        {/* Slot Duration & Modes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-2">Consultation Slot Duration</label>
            <div className="grid grid-cols-4 gap-2">
              {['15 Mins', '30 Mins', '45 Mins', '60 Mins'].map((dur) => (
                <button
                  type="button"
                  key={dur}
                  onClick={() => setAvailability({ ...availability, slotDuration: dur })}
                  className={`py-2 rounded-lg font-bold border text-center transition-all ${
                    availability.slotDuration === dur
                      ? 'bg-sky-600 text-white border-sky-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {dur}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-2">Consultation Channels Enabled</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={availability.inPersonConsultation}
                  onChange={(e) => setAvailability({ ...availability, inPersonConsultation: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <UserCheck className="w-4 h-4 text-sky-600" />
                <span>In-Person Clinic Visits</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800">
                <input
                  type="checkbox"
                  checked={availability.onlineConsultation}
                  onChange={(e) => setAvailability({ ...availability, onlineConsultation: e.target.checked })}
                  className="w-4 h-4 text-sky-600 rounded"
                />
                <Video className="w-4 h-4 text-indigo-600" />
                <span>Online Telehealth</span>
              </label>
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition-all text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Availability</span>
          </button>
        </div>

      </form>
    </div>
  );
}
