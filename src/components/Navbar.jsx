import React, { useState, useEffect } from 'react';
import logo from '../assets/jankotilogo1.png';
import {
  Activity,
  Calendar,
  Users,
  Search,
  MessageSquare,
  AlertTriangle,
  Clock,
  User,
  Heart,
  FileText,
  Bell,
  Stethoscope,
  Volume2,
  VolumeX,
  BellRing
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  doctorProfile,
  searchQuery,
  setSearchQuery,
  unreadMessagesCount,
  emergencyCount,
  onOpenGlobalSearch,
  isMuted,
  isPlayingAudio,
  onToggleAudioMute,
  notificationPermission,
  onRequestNotificationPermission
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const navItems = [
    { id: 'home', label: 'Home', icon: Activity },
    { id: 'patients', label: 'My Patients', icon: Users },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'records', label: 'Medical Records', icon: FileText },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: unreadMessagesCount },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle, badge: emergencyCount, isEmergency: true },
    { id: 'availability', label: 'Availability', icon: Clock },
    { id: 'profile', label: 'My Profile', icon: User }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      {/* Top Branding, Live Date & Time, Search Bar & Profile */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <img src={logo} alt="Jankoti Logo" className="h-8 w-auto object-contain" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Med<span className="text-sky-600">X</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200 hidden sm:inline-block">
                  Doctor Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Clinical Workstation</p>
            </div>
          </div>

          {/* Prominent Global Patient Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by patient name, ID, phone or email..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  if (onOpenGlobalSearch) onOpenGlobalSearch();
                }}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400 hover:text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-sm"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* LIVE DATE & TIME HEADER BADGE (Visible across all main pages) */}
          <div className="hidden lg:flex items-center gap-2.5 px-3 py-1.5 bg-slate-900 text-white rounded-xl shadow-2xs border border-slate-800">
            <Clock className="w-4 h-4 text-sky-400 animate-pulse flex-shrink-0" />
            <div className="text-right">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none">
                {formattedDate}
              </div>
              <div className="font-mono text-xs font-extrabold text-sky-300 leading-tight">
                {formattedTime}
              </div>
            </div>
          </div>

          {/* GLOBAL EMERGENCY SOS STATUS & AUDIO ALARM CONTROLS */}
          <div className="flex items-center gap-2">
            
            {/* Global Emergency SOS Badge (Active & Clickable on All Pages) */}
            {emergencyCount > 0 && (
              <button
                onClick={() => setActiveTab('emergency')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-extrabold shadow-sm hover:bg-rose-700 transition-all animate-pulse"
                title="Click to open Active Emergency SOS Alerts"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <AlertTriangle className="w-4 h-4 text-white" />
                <span>{emergencyCount} Emergency SOS</span>
              </button>
            )}

            {/* Global Sound Siren Toggle (Persists & controllable on all pages) */}
            {emergencyCount > 0 && onToggleAudioMute && (
              <button
                onClick={onToggleAudioMute}
                className={`p-2 rounded-xl text-xs font-bold transition-all border ${
                  isMuted
                    ? 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                    : isPlayingAudio
                    ? 'bg-rose-100 text-rose-700 border-rose-300 animate-bounce'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
                title={isMuted ? 'Unmute Global SOS Siren' : 'Mute Global SOS Siren'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                ) : (
                  <Volume2 className="w-4 h-4 text-rose-600" />
                )}
              </button>
            )}

            {/* Device Notification Request Button */}
            {notificationPermission !== 'granted' && onRequestNotificationPermission && (
              <button
                onClick={onRequestNotificationPermission}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-all"
                title="Enable browser system notifications for critical SOS alerts"
              >
                <BellRing className="w-4 h-4 text-amber-600" />
                <span className="hidden xl:inline">Enable SOS Alerts</span>
              </button>
            )}

            {/* Doctor Avatar & Identity */}
            <div
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-3 p-1.5 pl-2.5 rounded-xl border border-slate-200 hover:border-sky-300 hover:bg-sky-50/50 cursor-pointer transition-all"
            >
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-900 flex items-center gap-1 justify-end">
                  <span>{doctorProfile.name}</span>
                  <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
                </div>
                <div className="text-[10px] font-medium text-slate-500">{doctorProfile.specialty}</div>
              </div>
              <img
                src={doctorProfile.photo}
                alt={doctorProfile.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-sky-500/20"
              />
            </div>

          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <nav className="flex items-center space-x-1 overflow-x-auto py-2 border-t border-slate-100 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                    : item.isEmergency && item.badge > 0
                    ? 'text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isEmergency && item.badge > 0 ? 'text-rose-600' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-sky-700'
                        : item.isEmergency
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
