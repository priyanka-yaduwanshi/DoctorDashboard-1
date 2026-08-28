import React, { useState, useEffect, useRef } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  Volume2,
  VolumeX,
  Bell,
  Activity,
  Heart,
  Clock,
  RefreshCw,
  ExternalLink,
  Filter,
  MessageSquare,
  Send,
  X,
  ShieldCheck,
  FileText,
  BellRing,
  Smartphone,
  Radio,
  Zap,
  Check,
  Settings
} from 'lucide-react';
import RealGpsMapModal from './RealGpsMapModal';
import { executeEmergencyBroadcast } from '../services/notificationService';

export default function EmergencyView({
  emergencyAlerts = [],
  patients = [],
  onViewPatient,
  onAcknowledgeEmergency,
  emergencyWorkflow,
  isMuted: globalIsMuted,
  isPlayingAudio: globalIsPlayingAudio,
  onToggleAudioMute: globalToggleAudioMute,
  onTriggerAudioTest: globalTriggerAudioTest,
  onCallPatient,
  onStartConsultation,
  notificationPermission = 'default',
  onRequestNotificationPermission,
  onTriggerEmergencySOS
}) {
  const [selectedMapAlert, setSelectedMapAlert] = useState(null);
  const [localIsMuted, setLocalIsMuted] = useState(false);
  const [localIsPlayingAudio, setLocalIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const audioRef = useRef(null);

  const isMuted = globalToggleAudioMute !== undefined ? globalIsMuted : localIsMuted;
  const isPlayingAudio = globalToggleAudioMute !== undefined ? globalIsPlayingAudio : localIsPlayingAudio;

  // Feature 1: Filter state ('All', 'Critical', 'Pending')
  const [activeFilter, setActiveFilter] = useState('All');

  // Feature 2: Live response timer ticker (seconds)
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Feature 3: Resolution Notes Modal state
  const [ackModalAlert, setAckModalAlert] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [dispatchStatus, setDispatchStatus] = useState('Rapid Response Squad Dispatched');

  // Feature 4: Web Push & Gateway Broadcast SOS Modal State
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastPatientId, setBroadcastPatientId] = useState(patients[0]?.id || 'PX-10482');
  const [broadcastAlertType, setBroadcastAlertType] = useState('Critical Vent Oxygen Pressure Drop');
  const [broadcastVitals, setBroadcastVitals] = useState('BP: 84/52 mmHg | HR: 138 BPM | SpO2: 88%');
  const [broadcastPhone, setBroadcastPhone] = useState('+91 98112 34567');
  const [broadcastWebhook, setBroadcastWebhook] = useState('');
  const [broadcastLogs, setBroadcastLogs] = useState([]);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  const activeAlertsCount = emergencyAlerts.length;

  // Live timer interval updating every 1 second
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Format elapsed time in human-readable format
  const formatElapsedTime = (totalSec) => {
    if (totalSec < 60) {
      return `${totalSec}s`;
    }
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Initialize and handle emergency SOS alarm audio
  useEffect(() => {
    // If global audio control is provided by parent (App.jsx), parent manages audio playing
    if (globalToggleAudioMute !== undefined) {
      return;
    }

    if (activeAlertsCount > 0 && !isMuted) {
      if (!audioRef.current) {
        try {
          audioRef.current = new Audio('/sos-alarm.mp3');
          audioRef.current.loop = true;
        } catch (err) {
          console.error('Failed to create Audio instance:', err);
          setAudioError(true);
        }
      }

      if (audioRef.current) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setLocalIsPlayingAudio(true);
              setAudioError(false);
            })
            .catch(err => {
              console.warn('SOS Audio autoplay blocked by browser or file missing:', err);
              setLocalIsPlayingAudio(false);
              setAudioError(true);
            });
        }
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setLocalIsPlayingAudio(false);
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setLocalIsPlayingAudio(false);
      }
    };
  }, [activeAlertsCount, isMuted, globalToggleAudioMute]);

  // Toggle Mute / Sound Manual Play
  const toggleAudioMute = () => {
    if (globalToggleAudioMute) {
      globalToggleAudioMute();
      return;
    }
    if (localIsMuted) {
      setLocalIsMuted(false);
      if (activeAlertsCount > 0 && audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setLocalIsPlayingAudio(true);
            setAudioError(false);
          })
          .catch(err => {
            console.warn('Manual audio play failed:', err);
            setAudioError(true);
          });
      }
    } else {
      setLocalIsMuted(true);
      if (audioRef.current) {
        audioRef.current.pause();
        setLocalIsPlayingAudio(false);
      }
    }
  };

  // Manual Test Audio Trigger
  const triggerAudioTest = () => {
    if (globalTriggerAudioTest) {
      globalTriggerAudioTest();
      return;
    }
    if (!audioRef.current) {
      audioRef.current = new Audio('/sos-alarm.mp3');
      audioRef.current.loop = true;
    }
    if (isPlayingAudio) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setLocalIsPlayingAudio(false);
    } else {
      setLocalIsMuted(false);
      audioRef.current
        .play()
        .then(() => {
          setLocalIsPlayingAudio(true);
          setAudioError(false);
        })
        .catch(err => {
          console.warn('Audio test failed:', err);
          setAudioError(true);
        });
    }
  };

  // Filter Emergency Alerts
  const filteredAlerts = emergencyAlerts.filter(alert => {
    if (activeFilter === 'Critical') {
      return (
        alert.vitalSeverity?.toLowerCase().includes('critical') ||
        alert.status?.toLowerCase().includes('critical')
      );
    }
    if (activeFilter === 'Pending') {
      return (
        alert.status?.toLowerCase().includes('sos active') ||
        alert.status?.toLowerCase().includes('pending')
      );
    }
    return true; // 'All'
  });

  const criticalCount = emergencyAlerts.filter(a =>
    a.vitalSeverity?.toLowerCase().includes('critical') || a.status?.toLowerCase().includes('critical')
  ).length;

  const pendingCount = emergencyAlerts.filter(a =>
    a.status?.toLowerCase().includes('sos active') || a.status?.toLowerCase().includes('pending')
  ).length;

  // Handle open acknowledgement modal
  const handleOpenAckModal = (alert) => {
    setAckModalAlert(alert);
    setResolutionNote('');
    setDispatchStatus('Rapid Response Squad Dispatched');
  };

  // Handle submit acknowledgement with resolution note
  const handleConfirmAck = () => {
    if (!ackModalAlert) return;
    const finalNote = resolutionNote.trim()
      ? `[${dispatchStatus}] ${resolutionNote}`
      : dispatchStatus;

    if (onAcknowledgeEmergency) {
      onAcknowledgeEmergency(ackModalAlert.id, finalNote);
    }

    setAckModalAlert(null);
    setResolutionNote('');
  };

  const matchedPatientForMap = selectedMapAlert
    ? patients.find(p => p.id === selectedMapAlert.patientId)
    : null;

  // Quick preset resolution notes
  const presetNotes = [
    'Rapid Response Squad Dispatched',
    'Physician Attending in ER Room 2',
    'Patient Stabilized - Meds Administered',
    'Ambulance En Route to Location',
    'Patient Transferred to ICU'
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title & Emergency SOS Control Bar Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-rose-200 pb-4 bg-gradient-to-r from-rose-50/60 to-transparent p-4 rounded-2xl border border-rose-100 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-rose-950 flex items-center gap-2.5">
            <div className="relative">
              <AlertTriangle className="w-7 h-7 text-rose-600 animate-pulse" />
              {activeAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-600 rounded-full animate-ping" />
              )}
            </div>
            <span>Emergency Alerts & SOS Desk</span>
          </h1>
          <p className="text-xs text-rose-700 font-medium mt-1">
            Real-time critical patient SOS signals, telemetry monitor alerts & immediate response dispatch
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          {/* Active SOS Count Pill */}
          <div className="flex items-center gap-2 bg-rose-600 text-white px-3.5 py-1.5 rounded-full shadow-sm text-xs font-bold animate-pulse">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>{activeAlertsCount} Active SOS Alert{activeAlertsCount === 1 ? '' : 's'}</span>
          </div>

          {/* Sound Alarm Toggle Button */}
          <button
            onClick={toggleAudioMute}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-full border transition-all ${
              isMuted
                ? 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
                : isPlayingAudio
                ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse shadow-sm'
                : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
            }`}
            title={isMuted ? 'Unmute SOS Siren' : 'Mute SOS Siren'}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-slate-500" />
                <span>Alarm Muted</span>
              </>
            ) : isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-rose-600 animate-bounce" />
                <span>Siren Active</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-amber-600" />
                <span>Audio Ready</span>
              </>
            )}
          </button>

          {/* Test Audio Button */}
          <button
            onClick={triggerAudioTest}
            className="px-3 py-1.5 bg-white text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-300 rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isPlayingAudio ? 'Stop Sound' : 'Test Sound'}</span>
          </button>

          {/* Multi-Patient GPS Map Radar Button */}
          {activeAlertsCount > 0 && (
            <button
              onClick={() => setSelectedMapAlert(emergencyAlerts[0])}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
              title="Open Multi-Patient GPS Map Radar"
            >
              <Navigation className="w-3.5 h-3.5 text-white" />
              <span>GPS Radar ({activeAlertsCount})</span>
            </button>
          )}

          {/* Web Push API & Device SOS Alert Dispatcher Button */}
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white rounded-full text-xs font-black transition-all shadow-sm flex items-center gap-1.5 hover:scale-105"
            title="Dispatch Live Web Push & Twilio SMS SOS Alert to connected phone and laptop"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-amber-300 animate-bounce" />
            <span>Dispatch SOS Push</span>
          </button>
        </div>
      </div>

      {/* Audio Error Alert if browser blocked sound */}
      {audioError && activeAlertsCount > 0 && (
        <div className="bg-amber-50 border-l-4 border-amber-500 p-3.5 rounded-r-xl flex items-center justify-between text-xs text-amber-900 shadow-xs">
          <div className="flex items-center gap-2">
            <VolumeX className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Browser autoplay restricted the SOS alarm sound. Click <strong>Test Sound</strong> or <strong>Siren Active</strong> to enable audio alerts.</span>
          </div>
          <button
            onClick={triggerAudioTest}
            className="px-2.5 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 transition-colors text-[11px]"
          >
            Enable Sound
          </button>
        </div>
      )}

      {/* FEATURE 1: Status Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">Filter Alerts:</span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveFilter('All')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeFilter === 'All'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <span>All Alerts</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeFilter === 'All' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
            }`}>
              {emergencyAlerts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('Critical')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeFilter === 'Critical'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
            <span>Critical</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeFilter === 'Critical' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-800'
            }`}>
              {criticalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('Pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${
              activeFilter === 'Pending'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Pending</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              activeFilter === 'Pending' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800'
            }`}>
              {pendingCount}
            </span>
          </button>
        </div>
      </div>

      {/* Emergency Cards Feed */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert, index) => {
            // Find matched patient or build safe default
            const matchedPatient = patients.find(p => p.id === alert.patientId) || {
              id: alert.patientId || 'PX-10482',
              name: alert.patientName || 'Rajesh Kumar',
              age: alert.age || 64,
              gender: alert.gender || 'Male',
              bloodGroup: alert.bloodGroup || 'O-',
              phone: alert.phone || '+91 98112 34567',
              photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
              vitals: {
                bp: '88/56',
                hr: '118',
                spo2: '91',
                temp: '98.6°F'
              }
            };

            // Calculate live elapsed seconds for this alert
            const alertElapsedSec = elapsedSeconds + (index + 1) * 145; // simulated initial offset + live ticking

            return (
              <div
                key={alert.id}
                className="medx-card p-6 bg-gradient-to-r from-rose-50/90 via-white to-white border-2 border-rose-300 rounded-2xl shadow-md space-y-4 transition-all hover:shadow-lg"
              >
                
                {/* Alert Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center text-xl font-black shadow-sm animate-pulse flex-shrink-0">
                      🚨
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-base text-rose-950">{alert.alertType}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white uppercase tracking-wider">
                          {alert.status || 'SOS ACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-rose-700 font-medium mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Triggered: {alert.time}</span>
                        </span>
                        <span>•</span>
                        <span>Alert ID: <strong className="font-mono">{alert.id}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center">
                    {/* FEATURE 2: Live Response Timer Counter */}
                    <div className="bg-amber-100 border border-amber-300 text-amber-900 px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-2xs animate-pulse">
                      <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                      <span>Active for <strong className="font-mono text-amber-950">{formatElapsedTime(alertElapsedSec)}</strong></span>
                    </div>

                    <div className="text-left sm:text-right bg-rose-100/60 p-1.5 rounded-xl border border-rose-200">
                      <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">Vitals Severity</span>
                      <span className="text-xs font-black text-rose-700 bg-white px-2 py-0.5 rounded border border-rose-300 inline-block mt-0.5">
                        {alert.vitalSeverity || 'Critical High Risk'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Patient & Vitals Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* Patient Info Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Patient Details</span>
                    <strong className="text-slate-900 text-sm font-extrabold block">{alert.patientName || matchedPatient.name}</strong>
                    <div className="text-slate-600 font-medium space-y-0.5">
                      <p>Age & Gender: <strong>{alert.age || matchedPatient.age} Yrs ({matchedPatient.gender})</strong></p>
                      <p>Blood Group: <strong className="text-rose-700 font-bold">{alert.bloodGroup || matchedPatient.bloodGroup}</strong></p>
                    </div>
                  </div>

                  {/* Recorded Vitals Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Recorded Vitals at SOS</span>
                    <strong className="text-slate-900 font-mono font-bold text-xs text-rose-950 block">
                      {alert.vitalsAtAlert || 'BP: 88/56 mmHg | HR: 118 BPM | SpO2: 91%'}
                    </strong>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                        BP: 88/56 Low
                      </span>
                      <span className="px-2 py-0.5 bg-rose-50 text-rose-700 text-[10px] font-bold rounded border border-rose-200">
                        HR: 118 High
                      </span>
                    </div>
                  </div>

                  {/* GPS & Location Card */}
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-1">
                    <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider block">Telemetry Location</span>
                    <div className="text-slate-800 font-semibold flex items-start gap-1.5 pt-0.5">
                      <MapPin className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5 animate-bounce" />
                      <div>
                        <p className="font-bold text-slate-900 text-xs">{alert.location || 'Emergency Room 2'}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{alert.coordinates || '28.6139° N, 77.2090° E'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Toolbar */}
                <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => onViewPatient && onViewPatient(matchedPatient)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <User className="w-4 h-4 text-slate-300" />
                    <span>View Patient Profile</span>
                  </button>

                  <button
                    onClick={() => setSelectedMapAlert(alert)}
                    className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>View Real GPS Location</span>
                  </button>

                  <button
                    onClick={() => onCallPatient ? onCallPatient(matchedPatient) : window.open(`tel:${matchedPatient.phone || alert.phone || '+919811234567'}`)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Call Patient SOS</span>
                  </button>

                  {/* FEATURE 3: Triggers Resolution Notes Modal */}
                  <button
                    onClick={() => handleOpenAckModal(alert)}
                    className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge SOS</span>
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          /* All Clear or No Filter Match State */
          <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                {activeFilter === 'All' ? 'All Emergency SOS Clear' : `No ${activeFilter} Emergency Alerts`}
              </h3>
              <p className="text-xs text-slate-500">
                {activeFilter === 'All'
                  ? 'There are currently no active patient emergency alerts requiring physician dispatch.'
                  : `There are currently no active emergency alerts matching the "${activeFilter}" filter.`}
              </p>
            </div>
            {activeFilter !== 'All' && (
              <button
                onClick={() => setActiveFilter('All')}
                className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors inline-block"
              >
                Reset Filter to All
              </button>
            )}
          </div>
        )}
      </div>

      {/* FEATURE 3: RESOLUTION NOTES MODAL */}
      {ackModalAlert && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden transform transition-all">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-rose-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Acknowledge SOS Alert</h3>
                  <p className="text-xs text-amber-100 font-medium">Record dispatch action & resolution notes</p>
                </div>
              </div>
              <button
                onClick={() => setAckModalAlert(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              
              {/* Alert Summary Box */}
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-rose-950 text-sm">{ackModalAlert.alertType}</span>
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-bold text-[10px] rounded-full">
                    {ackModalAlert.id}
                  </span>
                </div>
                <p className="text-rose-800 font-medium">
                  Patient: <strong>{ackModalAlert.patientName}</strong> • Location: <strong>{ackModalAlert.location}</strong>
                </p>
              </div>

              {/* Action / Dispatch Preset Selectors */}
              <div className="space-y-2">
                <label className="text-xs font-extrabold text-slate-700 block uppercase tracking-wider">
                  Quick Dispatch Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {presetNotes.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDispatchStatus(preset)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                        dispatchStatus === preset
                          ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resolution Note Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold text-slate-700 flex items-center justify-between">
                  <span>Additional Resolution Notes (Optional)</span>
                  <span className="text-[10px] text-slate-400 font-normal">Stored in ER log</span>
                </label>
                <textarea
                  value={resolutionNote}
                  onChange={(e) => setResolutionNote(e.target.value)}
                  placeholder="e.g. Oxygen administered by Nurse Priya. Dr. Vance proceeding to ER."
                  rows={3}
                  className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all outline-none"
                />
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setAckModalAlert(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAck}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Confirm Acknowledgement</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* REAL INTERACTIVE LEAFLET GPS MAP MODAL */}
      {selectedMapAlert && (
        <RealGpsMapModal
          alert={selectedMapAlert}
          alerts={emergencyAlerts}
          patient={matchedPatientForMap}
          patients={patients}
          onClose={() => setSelectedMapAlert(null)}
        />
      )}

      {/* FEATURE 4: WEB PUSH & SMS GATEWAY DISPATCHER MODAL */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden transform transition-all my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                  <Zap className="w-6 h-6 text-amber-300 animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Live Web Push & SMS SOS Dispatcher</h3>
                  <p className="text-xs text-rose-100 font-medium">Broadcast immediate SOS alerts to connected laptop & phone</p>
                </div>
              </div>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              
              {/* Web Push API Status Box */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold ${
                    notificationPermission === 'granted' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <BellRing className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Browser Web Push API Status</span>
                    <span className="text-[11px] text-slate-500">
                      Permission: <strong className={notificationPermission === 'granted' ? 'text-emerald-700' : 'text-amber-700'}>
                        {notificationPermission.toUpperCase()}
                      </strong> • Service Worker Active
                    </span>
                  </div>
                </div>

                {notificationPermission !== 'granted' && onRequestNotificationPermission && (
                  <button
                    type="button"
                    onClick={onRequestNotificationPermission}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-colors shadow-2xs whitespace-nowrap"
                  >
                    Enable Push
                  </button>
                )}
              </div>

              {/* Patient Selector */}
              <div className="space-y-1.5">
                <label className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
                  Target Patient SOS
                </label>
                <select
                  value={broadcastPatientId}
                  onChange={(e) => setBroadcastPatientId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.id}) — Age {p.age}, {p.bloodGroup || 'O-'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Alert Type & Vitals input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Alert Category</label>
                  <input
                    type="text"
                    value={broadcastAlertType}
                    onChange={(e) => setBroadcastAlertType(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Telemetry Vitals</label>
                  <input
                    type="text"
                    value={broadcastVitals}
                    onChange={(e) => setBroadcastVitals(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] font-bold outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              </div>

              {/* Gateway SMS Recipient Phone & Webhook URL */}
              <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 space-y-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-rose-600" />
                  <span className="font-extrabold text-rose-950 text-xs">Connected Phone SMS Gateway</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Target Phone Number</label>
                    <input
                      type="text"
                      value={broadcastPhone}
                      onChange={(e) => setBroadcastPhone(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-xl font-mono font-bold text-rose-950 outline-none text-xs"
                      placeholder="+91 98112 34567"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-rose-800 uppercase block mb-1">Optional Twilio / Webhook Endpoint</label>
                    <input
                      type="text"
                      value={broadcastWebhook}
                      onChange={(e) => setBroadcastWebhook(e.target.value)}
                      className="w-full p-2 bg-white border border-rose-300 rounded-xl font-mono text-[10px] text-slate-800 outline-none"
                      placeholder="https://api.twilio.com/v1/sms or Custom Endpoint"
                    />
                  </div>
                </div>
              </div>

              {/* Live Dispatch Result Log */}
              {broadcastLogs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="font-extrabold text-slate-700 uppercase tracking-wider block text-[10px]">
                    Recent SOS Dispatch Logs ({broadcastLogs.length})
                  </span>
                  <div className="p-3 bg-slate-900 text-slate-100 rounded-2xl font-mono text-[11px] max-h-32 overflow-y-auto space-y-1.5 border border-slate-800">
                    {broadcastLogs.map((log, idx) => (
                      <div key={idx} className="border-b border-slate-800 pb-1 last:border-none">
                        <div className="text-amber-400 font-bold">[{log.time}] SOS Broadcast Executed</div>
                        <div className="text-emerald-400 pl-2">➔ Web Push: {log.webPush.method || 'Sent via ServiceWorker'}</div>
                        <div className="text-sky-300 pl-2">➔ SMS Gateway: {log.sms.status || 'Delivered to ' + log.sms.recipient}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Close
              </button>

              <button
                type="button"
                disabled={isBroadcasting}
                onClick={async () => {
                  setIsBroadcasting(true);
                  const targetPatient = patients.find(p => p.id === broadcastPatientId) || patients[0] || {
                    id: broadcastPatientId,
                    name: 'Rajesh Kumar',
                    age: 64
                  };

                  const newAlert = {
                    id: `SOS-${Math.floor(100 + Math.random() * 900)}`,
                    patientId: targetPatient.id,
                    patientName: targetPatient.name,
                    age: targetPatient.age || 64,
                    bloodGroup: targetPatient.bloodGroup || 'O-',
                    alertType: broadcastAlertType,
                    vitalSeverity: 'Critical High Risk',
                    vitalsAtAlert: broadcastVitals,
                    location: 'Emergency Bay ER-2',
                    coordinates: '28.6139° N, 77.2090° E',
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    status: 'SOS ACTIVE'
                  };

                  let res;
                  if (onTriggerEmergencySOS) {
                    res = await onTriggerEmergencySOS(newAlert, broadcastPhone, { webhookUrl: broadcastWebhook });
                  } else {
                    res = await executeEmergencyBroadcast(newAlert, broadcastPhone, { webhookUrl: broadcastWebhook });
                  }

                  const logEntry = {
                    time: new Date().toLocaleTimeString(),
                    webPush: res.webPushResult,
                    sms: res.smsResult
                  };

                  setBroadcastLogs(prev => [logEntry, ...prev]);
                  setIsBroadcasting(false);
                }}
                className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 hover:scale-105 active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-4 h-4 fill-current text-amber-300" />
                <span>{isBroadcasting ? 'Broadcasting...' : '🚨 Dispatch Web Push & SMS Alert'}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
