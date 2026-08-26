import React, { useState } from 'react';
import { X, Video, User, FileText, CheckCircle2, Mic, MicOff, Camera, PhoneOff, AlertCircle } from 'lucide-react';

export default function StartConsultationModal({ appointment, patient, onClose, onComplete }) {
  const [activeTab, setActiveTab] = useState('video');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  if (!appointment) return null;

  const handleFinish = () => {
    onComplete({
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      diagnosis,
      notes
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold">
              <Video className="w-5 h-5 text-sky-400" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                <span>Clinical Consultation: {appointment.patientName}</span>
                <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-sky-900 text-sky-200 border border-sky-700">
                  {appointment.mode}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Patient ID: {appointment.patientId} • Age: {appointment.age} ({appointment.gender})</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 min-h-[480px]">
          
          {/* Main Video / Telehealth Window */}
          <div className="md:col-span-7 bg-slate-950 relative flex flex-col items-center justify-center p-6 text-white">
            {appointment.mode === 'Online' ? (
              <div className="w-full h-full min-h-[320px] rounded-xl overflow-hidden relative bg-slate-900 flex items-center justify-center border border-slate-800">
                {/* Simulated Patient Video Stream */}
                {patient?.photo ? (
                  <img
                    src={patient.photo}
                    alt={appointment.patientName}
                    className={`w-full h-full object-cover ${isVideoOff ? 'filter blur-md opacity-30' : ''}`}
                  />
                ) : (
                  <User className="w-24 h-24 text-slate-700" />
                )}

                {/* Patient Live Pill */}
                <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2 text-xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>{appointment.patientName} (Live)</span>
                </div>

                {/* Self View Floating Box */}
                <div className="absolute bottom-4 right-4 w-28 h-20 rounded-lg overflow-hidden border-2 border-sky-500 bg-slate-800 shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80"
                    alt="Dr. Vance"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 left-1 text-[9px] bg-black/70 px-1 rounded text-white">Dr. Vance</div>
                </div>

                {/* Telehealth Call Controls Bar */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2.5 rounded-full transition-colors ${isMuted ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => setIsVideoOff(!isVideoOff)}
                    className={`p-2.5 rounded-full transition-colors ${isVideoOff ? 'bg-rose-600 text-white' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'}`}
                    title={isVideoOff ? 'Turn Video On' : 'Turn Video Off'}
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <button
                    onClick={onClose}
                    className="p-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white transition-colors"
                    title="End Call"
                  >
                    <PhoneOff className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full h-full min-h-[320px] rounded-xl bg-slate-900 p-6 flex flex-col items-center justify-center text-center border border-slate-800">
                <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                  <User className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-lg text-white">In-Clinic Face-to-Face Visit</h4>
                <p className="text-sm text-slate-400 max-w-sm mt-1">
                  Patient is present in Consultation Room 4. Record clinical notes and diagnosis below.
                </p>
                <div className="mt-4 px-3 py-1.5 bg-emerald-950/80 text-emerald-300 border border-emerald-800 rounded-lg text-xs font-semibold">
                  Vitals Verified: BP 120/80 • HR 78 • SpO2 98%
                </div>
              </div>
            )}
          </div>

          {/* Clinical Intake & Notes Panel */}
          <div className="md:col-span-5 p-6 bg-slate-50 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="border-b border-slate-200 pb-3">
                <h4 className="font-bold text-sm text-slate-900">Reason for Visit</h4>
                <p className="text-xs text-slate-600 mt-1 bg-white p-2.5 rounded-lg border border-slate-200">
                  {appointment.reason}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary Clinical Diagnosis
                </label>
                <input
                  type="text"
                  placeholder="e.g. Essential Hypertension / Post-stent Follow-up"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Consultation Notes & Observations
                </label>
                <textarea
                  rows={5}
                  placeholder="Enter detailed consultation notes, symptoms, and examination findings..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:outline-hidden"
                ></textarea>
              </div>
            </div>

            {/* Complete Consultation Button */}
            <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white rounded-xl shadow-sm transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Complete Consultation</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
