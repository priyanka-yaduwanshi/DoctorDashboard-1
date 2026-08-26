import React from 'react';
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
  Stethoscope
} from 'lucide-react';

export default function Navbar({
  activeTab,
  setActiveTab,
  doctorProfile,
  searchQuery,
  setSearchQuery,
  unreadMessagesCount,
  emergencyCount,
  onOpenGlobalSearch
}) {
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
      {/* Top Branding & Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="w-10 h-10 rounded-xl medx-gradient-brand flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Heart className="w-6 h-6 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900">Med<span className="text-sky-600">X</span></span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                  Doctor Portal
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 hidden sm:block">Clinical Workstation</p>
            </div>
          </div>

          {/* Prominent Global Patient Search Bar */}
          <div className="flex-1 max-w-xl mx-2 hidden md:block">
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
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-slate-800 placeholder-slate-400 transition-all"
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

          {/* Quick Doctor Profile & Emergency Pill */}
          <div className="flex items-center gap-3">
            {/* Quick Emergency Status */}
            {emergencyCount > 0 && (
              <button
                onClick={() => setActiveTab('emergency')}
                className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold hover:bg-rose-100 transition-colors animate-pulse-subtle"
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{emergencyCount} Emergency SOS</span>
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
