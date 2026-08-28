import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  MessageSquare,
  Search,
  CheckCircle2,
  Video,
  ChevronRight,
  User,
  Heart,
  Activity,
  FileText,
  Plus,
  ShieldAlert,
  Phone,
  Navigation,
  Send,
  CheckCheck,
  Stethoscope,
  Info,
  UserCheck,
  UserPlus,
  Sparkles,
  RefreshCw
} from 'lucide-react';

import { availableRespondersPool } from '../data/mockData';

export default function DoctorHome({
  doctorProfile,
  summaryStats,
  appointments,
  patients,
  emergencyAlerts,
  needsAttention,
  patientQueue,
  emergencyWorkflow,
  recentActivity,
  myDaySchedule,
  onNavigateTab,
  onViewPatient,
  onStartConsultation,
  onUpdateEmergencyWorkflow,
  searchQuery,
  setSearchQuery,
  onQuickAction,
  onCallResponder,
  onMessageResponder
}) {
  const [selectedEta, setSelectedEta] = useState(emergencyWorkflow?.doctorEta || '3–5 min');
  const [newInterventionText, setNewInterventionText] = useState('');
  const [showProtocolForm, setShowProtocolForm] = useState(false);

  // Dynamic time-of-day greeting & rotating clinical quotes
  const [currentTime, setCurrentTime] = useState(new Date());
  const [quoteIndex, setQuoteIndex] = useState(0);

  const clinicalQuotes = [
    { quote: "Wherever the art of Medicine is loved, there is also a love of Humanity.", author: "Hippocrates" },
    { quote: "The good physician treats the disease; the great physician treats the patient who has the disease.", author: "Sir William Osler" },
    { quote: "Medicine is a science of uncertainty and an art of probability.", author: "Sir William Osler" },
    { quote: "To cure sometimes, to relieve often, to comfort always.", author: "Edward Livingston Trudeau" },
    { quote: "The art of healing comes from nature, not from the physician.", author: "Paracelsus" },
    { quote: "Care more particularly for the individual patient than for the special features of the disease.", author: "Sir William Osler" },
    { quote: "Every patient is a story waiting to be understood and healed with clinical excellence.", author: "MedX Mindset" }
  ];

  useEffect(() => {
    const clockTimer = setInterval(() => setCurrentTime(new Date()), 1000);
    const quoteTimer = setInterval(() => {
      setQuoteIndex(prev => (prev + 1) % clinicalQuotes.length);
    }, 8000);

    return () => {
      clearInterval(clockTimer);
      clearInterval(quoteTimer);
    };
  }, []);

  const getGreetingInfo = (date) => {
    const hour = date.getHours();
    if (hour >= 5 && hour < 12) {
      return { title: 'Good Morning', icon: '🌅', subtitle: 'Start your clinical day with precision & care.' };
    } else if (hour >= 12 && hour < 17) {
      return { title: 'Good Afternoon', icon: '☀️', subtitle: 'Mid-day clinical overview & patient queue updates.' };
    } else if (hour >= 17 && hour < 22) {
      return { title: 'Good Evening', icon: '🌆', subtitle: 'Evening consultations & daily patient summary.' };
    } else {
      return { title: 'Good Night', icon: '🌙', subtitle: 'On-call telemetry & emergency response desk active.' };
    }
  };

  const greetingInfo = getGreetingInfo(currentTime);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  // Patient live search quick results with Clinical Flags
  const searchResults = searchQuery.trim()
    ? patients.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.phone.includes(searchQuery) ||
        p.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleNotifyNurse = () => {
    if (!onUpdateEmergencyWorkflow) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newTimelineEntry = {
      time: timeStr,
      event: `Doctor set ETA to "${selectedEta}" & sent emergency notification to ER Nursing Desk`,
      actor: doctorProfile.name
    };

    onUpdateEmergencyWorkflow({
      ...emergencyWorkflow,
      doctorEta: selectedEta,
      isDoctorOnWay: true,
      nurseNotified: true,
      timeline: [...emergencyWorkflow.timeline, newTimelineEntry]
    });
  };

  const handleSimulateResponderAccept = (poolResponder) => {
    if (!onUpdateEmergencyWorkflow) return;

    // Check if already accepted
    const alreadyResponded = emergencyWorkflow.responders?.some(r => r.id === poolResponder.id);
    if (alreadyResponded) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newResponderObj = {
      ...poolResponder,
      acceptedAt: timeStr,
      status: 'Responding — En Route to ER-2'
    };

    const timelineEntry = {
      time: timeStr,
      event: `Emergency Alert ACCEPTED by ${poolResponder.name} (${poolResponder.role} • ${poolResponder.department})`,
      actor: poolResponder.name
    };

    onUpdateEmergencyWorkflow({
      ...emergencyWorkflow,
      responders: [...(emergencyWorkflow.responders || []), newResponderObj],
      timeline: [...emergencyWorkflow.timeline, timelineEntry]
    });
  };

  const handleUpdateResponderStatus = (responderId, newStatus) => {
    if (!onUpdateEmergencyWorkflow) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const targetResp = emergencyWorkflow.responders?.find(r => r.id === responderId);
    const updatedResponders = emergencyWorkflow.responders?.map(r =>
      r.id === responderId ? { ...r, status: newStatus } : r
    );

    const timelineEntry = {
      time: timeStr,
      event: `Responder Status Update: ${targetResp?.name} updated status to "${newStatus}"`,
      actor: targetResp?.name || 'Emergency Team'
    };

    onUpdateEmergencyWorkflow({
      ...emergencyWorkflow,
      responders: updatedResponders,
      timeline: [...emergencyWorkflow.timeline, timelineEntry]
    });
  };

  const handleAddProtocolIntervention = (e) => {
    e.preventDefault();
    if (!newInterventionText.trim() || !onUpdateEmergencyWorkflow) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const leadResponder = emergencyWorkflow.responders?.[0]?.name || 'Nurse Priya Sharma';

    const newInt = {
      id: `INT-${Math.floor(100 + Math.random() * 900)}`,
      action: newInterventionText,
      authorizedBy: doctorProfile.name,
      performedBy: leadResponder,
      time: timeStr,
      status: 'Recorded'
    };

    const timelineEntry = {
      time: timeStr,
      event: `Emergency Intervention Authorized & Logged: ${newInterventionText}`,
      actor: doctorProfile.name
    };

    onUpdateEmergencyWorkflow({
      ...emergencyWorkflow,
      interventions: [...(emergencyWorkflow.interventions || []), newInt],
      timeline: [...emergencyWorkflow.timeline, timelineEntry]
    });

    setNewInterventionText('');
    setShowProtocolForm(false);
  };

  const handleEscalateAlert = () => {
    if (!onUpdateEmergencyWorkflow) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const timelineEntry = {
      time: timeStr,
      event: '🚨 ALERT ESCALATED: Emergency Response Team & Senior Registrar notified due to high ETA/delay',
      actor: doctorProfile.name
    };

    onUpdateEmergencyWorkflow({
      ...emergencyWorkflow,
      timeline: [...emergencyWorkflow.timeline, timelineEntry]
    });
  };

  // Responders available to simulate accepting
  const unacceptedResponders = availableRespondersPool.filter(
    poolR => !emergencyWorkflow?.responders?.some(r => r.id === poolR.id)
  );

  return (
    <div className="space-y-8 pb-12">
      
      {/* DYNAMIC TIME-OF-DAY GREETING & ROTATING CLINICAL QUOTE HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-gradient-to-r from-sky-950 via-slate-900 to-sky-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-sky-800/40">
        <div className="absolute -right-10 -top-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Left Column: Dynamic Greeting & Rotating Quote */}
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold text-sky-200 border border-white/15">
            <span>{greetingInfo.icon}</span>
            <span>{greetingInfo.title}</span>
            <span className="text-white/40">•</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              Clinical Station Active
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {greetingInfo.title}, {doctorProfile.name} 👋
          </h1>

          {/* Rotating Clinical & Motivational Quote */}
          <div className="pt-1 flex items-start gap-3 text-xs sm:text-sm text-sky-100/90 font-medium italic bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
            <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5 animate-pulse" />
            <div className="flex-1 space-y-0.5">
              <p className="leading-relaxed">"{clinicalQuotes[quoteIndex].quote}"</p>
              <p className="text-[11px] text-sky-300 font-extrabold not-italic">— {clinicalQuotes[quoteIndex].author}</p>
            </div>
            <button
              onClick={() => setQuoteIndex(prev => (prev + 1) % clinicalQuotes.length)}
              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-sky-300 hover:text-white"
              title="Next Clinical Thought"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column: Live Date & Time Display Badge */}
        <div className="relative z-10 flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-center gap-3 flex-shrink-0">
          <div className="px-5 py-3.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 text-left lg:text-right shadow-md space-y-1">
            <div className="flex items-center gap-1.5 justify-start lg:justify-end text-[11px] text-sky-300 font-bold uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
              <span>Live Command Clock</span>
            </div>
            <div className="font-mono text-xl sm:text-2xl font-black text-white tracking-wide">
              {formattedTime}
            </div>
            <div className="text-xs text-sky-200 font-medium">
              {formattedDate}
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH PATIENTS BAR & CLINICAL FLAGS PREVIEW */}
      <div className="medx-card p-5 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600" />
            <span>Search Patients</span>
          </h2>
          <span className="text-xs text-slate-500 font-medium">Lookup by Name, Patient ID, Phone, or Email</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by patient name, ID, phone or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-hidden text-slate-900 placeholder-slate-400"
          />
        </div>

        {/* Live Search Results Dropdown with Flags */}
        {searchQuery.trim() !== '' && (
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-2">
            <p className="text-xs font-bold text-slate-600">
              Matches ({searchResults.length}):
            </p>

            {searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {searchResults.map(p => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-sky-300 transition-all">
                    <div className="flex items-center gap-3">
                      <img src={p.photo} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <strong className="text-slate-900 font-bold block">{p.name}</strong>
                        <span className="text-slate-500 font-mono text-[11px]">{p.id} • {p.age} Yrs</span>
                        <p className="text-[10px] text-slate-500">Last visit: {p.lastVisit}</p>
                        {p.clinicalFlags && (
                          <div className="flex items-center gap-1 mt-1">
                            {p.clinicalFlags.map((flag, fIdx) => (
                              <span key={fIdx} className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 text-[9px] font-bold">
                                {flag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onViewPatient(p)}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors"
                    >
                      View Patient
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No matching patients found.</p>
            )}
          </div>
        )}
      </div>

      {/* 1. MAJOR FEATURE: EMERGENCY RESPONSE WORKFLOW (HIERARCHY #1) */}
      {emergencyWorkflow && (
        <section className="medx-card p-6 bg-gradient-to-r from-rose-50/90 via-white to-white border-2 border-rose-300 rounded-2xl shadow-md space-y-6">
          
          {/* Emergency Alert Title Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-rose-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black animate-pulse shadow-md">
                🚨
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-black text-lg text-rose-950">CRITICAL PATIENT — IMMEDIATE ATTENTION</h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-600 text-white animate-ping">
                    SOS ACTIVE
                  </span>
                </div>
                <p className="text-xs text-rose-800 font-medium mt-0.5">
                  SOS Triggered at {emergencyWorkflow.sosTriggerTime} • {emergencyWorkflow.location}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigateTab('emergency')}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                Open Emergency Desk
              </button>
            </div>
          </div>

          {/* Critical Patient Information & Live Vitals */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
            
            {/* Patient Header Box */}
            <div className="md:col-span-5 p-4 bg-white rounded-xl border border-rose-200 space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-lg">
                  {emergencyWorkflow.patientName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">{emergencyWorkflow.patientName}</h3>
                  <p className="text-xs text-slate-500 font-mono">Patient ID: {emergencyWorkflow.patientId}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Blood Group</span>
                  <strong className="text-rose-700 font-black text-sm">{emergencyWorkflow.bloodGroup}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Current Location</span>
                  <strong className="text-slate-800 font-bold">{emergencyWorkflow.location}</strong>
                </div>
              </div>
            </div>

            {/* Live Patient Vitals Box */}
            <div className="md:col-span-7 p-4 bg-white rounded-xl border border-rose-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-rose-600" />
                  <span>Real-time Vital Metrics (Telemetry)</span>
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-rose-100 text-rose-800 rounded">
                  Status: {emergencyWorkflow.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Heart Rate</span>
                  <span className="text-lg font-black text-rose-950">{emergencyWorkflow.vitals.hr} <span className="text-xs font-bold text-rose-700">BPM</span></span>
                </div>
                <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Blood Pressure</span>
                  <span className="text-lg font-black text-rose-950">{emergencyWorkflow.vitals.bp} <span className="text-xs font-bold text-rose-700">mmHg</span></span>
                </div>
                <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
                  <span className="text-[10px] text-slate-500 block font-medium">Oxygen (SpO2)</span>
                  <span className="text-lg font-black text-amber-950">{emergencyWorkflow.vitals.spo2}%</span>
                </div>
              </div>
            </div>

          </div>

          {/* DOCTOR ETA SELECTOR & NOTIFY NURSE ACTION */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-slate-900 uppercase tracking-wider">
                  1. Select Doctor ETA (Estimated Time of Arrival)
                </h4>
                <p className="text-[11px] text-slate-500">Coordinate response time with duty nursing staff</p>
              </div>

              {/* ETA Buttons */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                {['< 1 min', '1–3 min', '3–5 min', '> 5 min'].map((etaOption) => (
                  <button
                    key={etaOption}
                    onClick={() => setSelectedEta(etaOption)}
                    className={`px-3 py-1.5 rounded-lg transition-all ${
                      selectedEta === etaOption
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {etaOption}
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor On The Way Notification Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="text-xs">
                <span className="text-slate-600 font-semibold">Doctor Arrival Commitment: </span>
                <strong className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  ETA [{selectedEta}]
                </strong>
                {emergencyWorkflow.isDoctorOnWay && (
                  <span className="ml-2 text-emerald-600 font-bold">✓ Doctor is on the way.</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleNotifyNurse}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span>🚨 Notify Nurse & I'm Coming</span>
                </button>
              </div>
            </div>

            {/* ESCALATION WARNING IF >5 MIN */}
            {selectedEta === '> 5 min' && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-300 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span><strong>⚠️ Doctor arrival exceeds 5 minutes.</strong> Recommend notifying emergency nursing team & rapid response squad.</span>
                </div>
                <button
                  onClick={handleEscalateAlert}
                  className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition-colors flex-shrink-0"
                >
                  Escalate Alert
                </button>
              </div>
            )}
          </div>

          {/* REPLACED SECTION: REAL-TIME EMERGENCY RESPONSE ACCEPTED NOTIFICATION & ACTIVE RESPONDERS PANEL */}
          <div className="p-5 bg-white rounded-2xl border-2 border-emerald-300 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-emerald-600" />
                    <span>Emergency Response Accepted — Active Hospital Responders</span>
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    🟢 {emergencyWorkflow.responders?.length || 0} Responder{emergencyWorkflow.responders?.length === 1 ? '' : 's'} Active
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Real-time acceptance notifications & direct responder contacts for ER-2 emergency
                </p>
              </div>

              {/* Simulation button to add more responders */}
              {unacceptedResponders.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-slate-400 hidden lg:inline">Simulate Responder Accept:</span>
                  {unacceptedResponders.slice(0, 2).map((resp) => (
                    <button
                      key={resp.id}
                      onClick={() => handleSimulateResponderAccept(resp)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                    >
                      <UserPlus className="w-3 h-3" />
                      <span>+ {resp.name.split(' ')[0]} ({resp.role.split(' ')[0]})</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* List of Accepted Responders */}
            <div className="space-y-3">
              {emergencyWorkflow.responders?.length > 0 ? (
                emergencyWorkflow.responders.map((resp) => (
                  <div
                    key={resp.id}
                    className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-2xs"
                  >
                    
                    {/* Responder Avatar & Details */}
                    <div className="flex items-center gap-3">
                      <img
                        src={resp.avatar}
                        alt={resp.name}
                        className="w-12 h-12 rounded-xl object-cover ring-2 ring-emerald-500/30 border border-white shadow-xs"
                      />
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h5 className="font-extrabold text-sm text-slate-900">{resp.name}</h5>
                          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-[9px] uppercase">
                            Accepted at {resp.acceptedAt}
                          </span>
                        </div>
                        <p className="text-slate-600 font-semibold text-[11px]">
                          {resp.role} • <span className="text-slate-800">{resp.department}</span>
                        </p>
                        <p className="text-emerald-800 font-extrabold text-[11px] flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                          <span>Response Status: {resp.status}</span>
                        </p>
                      </div>
                    </div>

                    {/* Responder Action Controls */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      
                      {/* Status Update Quick Toggles */}
                      {resp.status !== 'At Patient Bedside' ? (
                        <button
                          onClick={() => handleUpdateResponderStatus(resp.id, 'At Patient Bedside')}
                          className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-800 font-bold text-[11px] border border-slate-300 rounded-lg transition-colors"
                        >
                          Mark At Bedside
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 bg-emerald-200 text-emerald-950 font-bold text-[11px] rounded-lg">
                          ✓ At Bedside
                        </span>
                      )}

                      {/* Mandated Direct Contact Buttons: Call & Message */}
                      <button
                        onClick={() => onCallResponder && onCallResponder(resp)}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call</span>
                      </button>

                      <button
                        onClick={() => onMessageResponder && onMessageResponder(resp)}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                        <span>Message</span>
                      </button>

                    </div>

                  </div>
                ))
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-xs">
                  Awaiting responder acceptance...
                </div>
              )}
            </div>

          </div>

          {/* EMERGENCY PROTOCOL & SAFE CLINICAL INTERVENTIONS LOG */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div>
                <h4 className="font-bold text-xs text-slate-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-sky-600" />
                  <span>Authorized Emergency Protocol & Audit Trail</span>
                </h4>
                <p className="text-[10px] text-slate-500">Record physician-authorized interventions & hospital emergency protocols</p>
              </div>

              <button
                onClick={() => setShowProtocolForm(!showProtocolForm)}
                className="px-3 py-1 bg-sky-100 hover:bg-sky-200 text-sky-900 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Log Intervention
              </button>
            </div>

            {showProtocolForm && (
              <form onSubmit={handleAddProtocolIntervention} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                <label className="block font-bold text-slate-700">Authorized Clinical Intervention / Order</label>
                <input
                  type="text"
                  placeholder="e.g. Administer IV Sublingual Nitroglycerin 0.4mg per ER Protocol"
                  value={newInterventionText}
                  onChange={(e) => setNewInterventionText(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                  required
                />
                <div className="flex justify-end gap-2 pt-1">
                  <button type="button" onClick={() => setShowProtocolForm(false)} className="px-3 py-1 text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1 bg-sky-600 text-white font-bold rounded-lg">Save Intervention</button>
                </div>
              </form>
            )}

            <div className="space-y-2">
              {emergencyWorkflow.interventions?.map((int) => (
                <div key={int.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                  <div>
                    <strong className="text-slate-900 block font-semibold">{int.action}</strong>
                    <span className="text-[10px] text-slate-500">
                      Authorized by: {int.authorizedBy} • Executed by: {int.performedBy} • Time: {int.time}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded">
                    {int.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* EMERGENCY RESPONSE TIMELINE */}
          <div className="p-4 bg-slate-900 text-white rounded-xl space-y-3">
            <h4 className="font-bold text-xs uppercase tracking-wider text-sky-400 border-b border-slate-800 pb-2">
              Emergency Response Audit Timeline
            </h4>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-2 text-xs font-mono">
              {emergencyWorkflow.timeline?.map((t, idx) => (
                <div key={idx} className="flex items-start gap-3 border-b border-slate-800/60 pb-1.5">
                  <span className="text-sky-400 font-bold text-[11px] whitespace-nowrap">{t.time}</span>
                  <div className="flex-1">
                    <span className="text-slate-200">{t.event}</span>
                    <span className="text-slate-500 text-[10px] block font-sans">Actor: {t.actor}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </section>
      )}

      {/* 2. NEEDS YOUR ATTENTION SECTION (HIERARCHY #2) */}
      <section className="medx-card p-6 bg-white space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <span>Needs Your Attention</span>
          </h2>
          <span className="text-xs font-bold text-slate-500">{needsAttention?.length || 0} Action Items</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {needsAttention?.map((item) => {
            const matchedPatient = patients.find(p => p.id === item.patientId);

            return (
              <div
                key={item.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 text-xs ${
                  item.color === 'rose' || item.severity === 'Critical'
                    ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                    : item.color === 'amber' || item.severity === 'High Priority'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-sky-50/70 border-sky-200 text-sky-950'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      item.severity === 'Critical' ? 'bg-rose-600 animate-ping' : item.severity === 'High Priority' ? 'bg-amber-500' : 'bg-sky-500'
                    }`}></span>
                    <span className="font-extrabold text-[11px] uppercase tracking-wider">{item.severity}</span>
                  </div>
                  <strong className="text-slate-900 font-bold block text-sm">{item.patientName}</strong>
                  <p className="text-slate-700 font-medium">{item.item}</p>
                </div>

                <button
                  onClick={() => {
                    if (item.type === 'sos' || item.actionLabel?.toLowerCase().includes('emergency')) {
                      onNavigateTab('emergency');
                    } else if (matchedPatient) {
                      onViewPatient(matchedPatient);
                    } else {
                      onNavigateTab(item.type === 'report' ? 'records' : 'appointments');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex-shrink-0"
                >
                  {item.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TODAY'S PATIENT QUEUE SECTION (HIERARCHY #3) */}
      <section className="medx-card p-6 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-sky-600" />
              <span>Today's Patient Queue</span>
            </h2>
            <p className="text-xs text-slate-500">Chronological patient order for today's OPD & consultations</p>
          </div>

          <span className="text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1 rounded-full border border-sky-200">
            {patientQueue?.length || 0} Patients Logged
          </span>
        </div>

        <div className="space-y-2.5">
          {patientQueue?.map((q, idx) => {
            const matchedPatient = patients.find(p => p.id === q.patientId);

            return (
              <div
                key={idx}
                className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-sky-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-extrabold text-sky-800 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {q.time}
                  </span>
                  <img src={q.photo} alt={q.patientName} className="w-10 h-10 rounded-xl object-cover" />
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{q.patientName}</h4>
                    <span className="text-slate-500 font-medium">
                      {q.age} Yrs • {q.gender} • <strong className="text-slate-700">{q.visitType}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                    q.status === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    q.status === 'In Consultation' ? 'bg-sky-100 text-sky-800 border border-sky-300' :
                    q.status === 'Waiting' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {q.status}
                  </span>

                  <button
                    onClick={() => {
                      if (matchedPatient) onViewPatient(matchedPatient);
                      else onNavigateTab('appointments');
                    }}
                    className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg transition-colors"
                  >
                    Open
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. TODAY'S OVERVIEW KPI CARDS (HIERARCHY #4) */}
      <section className="space-y-3">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-sky-600" />
          <span>Today's Overview</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          
          <div
            onClick={() => onNavigateTab('appointments')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-sky-600"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Patients Today</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.patientsToday || 18}</p>
            <span className="text-[10px] text-sky-600 font-semibold block">View Queue &rarr;</span>
          </div>

          <div
            onClick={() => onNavigateTab('appointments')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-amber-500"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Waiting</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.waiting || 4}</p>
            <span className="text-[10px] text-amber-600 font-semibold block">Waiting Room &rarr;</span>
          </div>

          <div
            onClick={() => onNavigateTab('appointments')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-emerald-600"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Completed</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.completed || 11}</p>
            <span className="text-[10px] text-emerald-600 font-semibold block">Completed &rarr;</span>
          </div>

          <div
            onClick={() => onNavigateTab('records')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-purple-600"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Reports Pending</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.reportsPending || 3}</p>
            <span className="text-[10px] text-purple-600 font-semibold block">Review Reports &rarr;</span>
          </div>

          <div
            onClick={() => onNavigateTab('patients')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-cyan-600"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Follow-ups Due</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.followupsDue || 7}</p>
            <span className="text-[10px] text-cyan-600 font-semibold block">Follow-ups &rarr;</span>
          </div>

          <div
            onClick={() => onNavigateTab('messages')}
            className="medx-card medx-card-interactive p-4 cursor-pointer space-y-2 border-l-4 border-l-indigo-600"
          >
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Unread Messages</span>
            <p className="text-2xl font-black text-slate-900">{summaryStats.unreadMessages || 5}</p>
            <span className="text-[10px] text-indigo-600 font-semibold block">Open Chat &rarr;</span>
          </div>

        </div>
      </section>

      {/* 5. QUICK ACTIONS SECTION (HIERARCHY #5) */}
      <section className="medx-card p-6 bg-white space-y-4">
        <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-sky-600" />
          <span>Quick Actions</span>
        </h2>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onQuickAction('consultation')}
            className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Consultation</span>
          </button>

          <button
            onClick={() => onQuickAction('prescription')}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <FileText className="w-4 h-4" />
            <span>Write Prescription</span>
          </button>

          <button
            onClick={() => onNavigateTab('records')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            <Activity className="w-4 h-4 text-sky-600" />
            <span>View Reports</span>
          </button>

          <button
            onClick={() => onQuickAction('lab')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            <Plus className="w-4 h-4 text-teal-600" />
            <span>Order Lab Test</span>
          </button>

          <button
            onClick={() => onNavigateTab('appointments')}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all"
          >
            <Calendar className="w-4 h-4 text-sky-600" />
            <span>Schedule Appointment</span>
          </button>

          <button
            onClick={() => onNavigateTab('messages')}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs rounded-xl transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Message Patient</span>
          </button>
        </div>
      </section>

      {/* 6. RECENT PATIENT ACTIVITY & 7. MY DAY SCHEDULE SUMMARY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* RECENT PATIENT ACTIVITY (HIERARCHY #6) */}
        <section className="md:col-span-7 medx-card p-6 bg-white space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Clock className="w-5 h-5 text-sky-600" />
            <span>Recent Patient Activity</span>
          </h2>

          <div className="space-y-3">
            {recentActivity?.map((act) => (
              <div key={act.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                    act.type === 'emergency' ? 'bg-rose-100 text-rose-800' :
                    act.type === 'clinical' ? 'bg-purple-100 text-purple-800' :
                    act.type === 'rx' ? 'bg-teal-100 text-teal-800' :
                    'bg-sky-100 text-sky-800'
                  }`}>
                    {act.type === 'emergency' ? '🚨' : act.type === 'clinical' ? '🧪' : act.type === 'rx' ? '💊' : '📅'}
                  </div>
                  <div>
                    <strong className="text-slate-900 font-bold block">{act.patientName}</strong>
                    <span className="text-slate-600">{act.event}</span>
                  </div>
                </div>

                <span className="text-[10px] text-slate-400 font-mono">{act.time}</span>
              </div>
            ))}
          </div>
        </section>

        {/* MY DAY SCHEDULE SUMMARY (HIERARCHY #7) */}
        <section className="md:col-span-5 medx-card p-6 bg-white space-y-4">
          <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Calendar className="w-5 h-5 text-sky-600" />
            <span>My Day</span>
          </h2>

          <div className="space-y-2 text-xs">
            {myDaySchedule?.map((s, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-mono font-bold text-sky-800 w-20">{s.time}</span>
                <span className="font-semibold text-slate-800 flex-1 truncate px-2">{s.title}</span>
                <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                  s.type === 'Emergency' ? 'bg-rose-100 text-rose-800' :
                  s.type === 'Procedure' ? 'bg-purple-100 text-purple-800' :
                  s.type === 'Break' ? 'bg-amber-100 text-amber-800' :
                  'bg-sky-100 text-sky-800'
                }`}>
                  {s.type}
                </span>
              </div>
            ))}
          </div>
        </section>

      </div>

    </div>
  );
}
