import React, { useState } from 'react';
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  MessageSquare,
  AlertTriangle,
  Heart,
  Plus,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function MyPatients({ patients, onViewPatient, onMessagePatient, onViewMedicalHistory }) {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Filtering logic
  const filteredPatients = patients.filter(p => {
    const matchesQuery =
      p.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.phone.includes(filterQuery) ||
      p.email.toLowerCase().includes(filterQuery.toLowerCase()) ||
      p.currentCondition.toLowerCase().includes(filterQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;

    return matchesQuery && matchesStatus && matchesGender;
  });

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-sky-600" />
            <span>My Patients Directory</span>
          </h1>
          <p className="text-xs text-slate-500">
            Total {patients.length} patients enrolled under your clinical care
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-sky-100 text-sky-800 font-bold text-xs rounded-full">
            {filteredPatients.length} Active View
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="medx-card p-5 bg-white space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Main Search Input */}
          <div className="md:col-span-6 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, condition, phone..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-hidden transition-all text-slate-900"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:outline-hidden text-slate-800 font-medium"
            >
              <option value="All">All Patient Status</option>
              <option value="Active">Active Care</option>
              <option value="Critical">Critical High-Risk</option>
            </select>
          </div>

          {/* Gender Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:outline-hidden text-slate-800 font-medium"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPatients.length > 0 ? (
          filteredPatients.map((patient) => (
            <div key={patient.id} className="medx-card medx-card-interactive p-5 bg-white space-y-4 flex flex-col justify-between">
              
              <div className="space-y-3">
                
                {/* Top Card Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.photo}
                      alt={patient.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-xs"
                    />
                    <div>
                      <h3 className="font-extrabold text-base text-slate-900 leading-tight">{patient.name}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-0.5">
                        ID: <strong className="font-mono text-slate-800">{patient.id}</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {patient.age} Yrs • {patient.gender} • Blood Group: <strong className="text-sky-700 font-bold">{patient.bloodGroup}</strong>
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                    patient.status === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {patient.status}
                  </span>
                </div>

                {/* Condition Box */}
                <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-xs space-y-1">
                  <span className="font-bold text-sky-900 block text-[11px]">Current Clinical Condition:</span>
                  <p className="text-slate-800 font-medium line-clamp-2">{patient.currentCondition}</p>
                </div>

                {/* Patient Meta Fields */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block font-medium">Last Visit</span>
                    <strong className="text-slate-800">{patient.lastVisit}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Next Visit</span>
                    <strong className="text-sky-700">{patient.nextAppointment ? patient.nextAppointment.split(' ')[0] : 'None'}</strong>
                  </div>
                </div>

                {/* Allergy Alert Indicator */}
                {patient.alertFlags?.allergy && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span className="truncate">Allergy: {patient.alertFlags.allergy}</span>
                  </div>
                )}

              </div>

              {/* Mandated Action Buttons: View Profile, Medical History, Message */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-3 gap-2">
                <button
                  onClick={() => onViewPatient(patient)}
                  className="py-2 px-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                >
                  View Profile
                </button>
                <button
                  onClick={() => onViewMedicalHistory(patient)}
                  className="py-2 px-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
                >
                  History
                </button>
                <button
                  onClick={() => onMessagePatient(patient)}
                  className="py-2 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl border border-indigo-200 transition-colors text-center flex items-center justify-center gap-1"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-3 p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No patients match your selected filter criteria.
          </div>
        )}
      </div>

    </div>
  );
}
