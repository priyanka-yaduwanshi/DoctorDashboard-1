import React, { useState, useEffect } from 'react';
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
  ChevronRight,
  ChevronLeft,
  Video,
  Trash2,
  X,
  UserPlus,
  CheckCircle2,
  Activity,
  SlidersHorizontal
} from 'lucide-react';

export default function MyPatients({
  patients = [],
  onViewPatient,
  onMessagePatient,
  onViewMedicalHistory,
  onStartConsultation,
  onCallPatient,
  onAddPatient,
  onDeletePatient
}) {
  const [filterQuery, setFilterQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');

  // Dynamic Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6); // Options: 6, 12, 24, 50, 'All'

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTargetPatient, setDeleteTargetPatient] = useState(null);

  // New Patient Form State
  const [newPatientForm, setNewPatientForm] = useState({
    name: '',
    age: 38,
    gender: 'Male',
    bloodGroup: 'O+',
    phone: '+91 ',
    email: '',
    currentCondition: 'Routine Health Monitoring & Vitals Check',
    status: 'Active',
    photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    allergy: '',
    emergencyContact: '+91 98112 34567'
  });

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterQuery, statusFilter, genderFilter, pageSize]);

  // Filtering logic
  const filteredPatients = patients.filter(p => {
    const query = filterQuery.toLowerCase().trim();
    const matchesQuery =
      !query ||
      (p.name && p.name.toLowerCase().includes(query)) ||
      (p.id && p.id.toLowerCase().includes(query)) ||
      (p.phone && p.phone.includes(query)) ||
      (p.email && p.email.toLowerCase().includes(query)) ||
      (p.currentCondition && p.currentCondition.toLowerCase().includes(query));

    const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
    const matchesGender = genderFilter === 'All' || p.gender === genderFilter;

    return matchesQuery && matchesStatus && matchesGender;
  });

  // Calculate Dynamic Pagination Slices
  const isShowAll = pageSize === 'All';
  const numericPageSize = isShowAll ? filteredPatients.length || 1 : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / numericPageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);

  const startIndex = (validCurrentPage - 1) * numericPageSize;
  const endIndex = isShowAll ? filteredPatients.length : startIndex + numericPageSize;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Handle Submit New Patient Form
  const handleSaveNewPatient = (e) => {
    e.preventDefault();
    if (!newPatientForm.name.trim()) return;

    const newRecord = {
      id: `PX-${Math.floor(10000 + Math.random() * 90000)}`,
      name: newPatientForm.name.trim(),
      age: Number(newPatientForm.age) || 30,
      gender: newPatientForm.gender,
      bloodGroup: newPatientForm.bloodGroup,
      phone: newPatientForm.phone.trim() || '+91 98112 34567',
      email: newPatientForm.email.trim() || `${newPatientForm.name.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      currentCondition: newPatientForm.currentCondition.trim() || 'General Consultation',
      status: newPatientForm.status,
      photo: newPatientForm.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      lastVisit: new Date().toISOString().split('T')[0],
      nextAppointment: 'Not Scheduled',
      alertFlags: newPatientForm.allergy ? { allergy: newPatientForm.allergy } : null,
      emergencyPhone: newPatientForm.emergencyContact,
      prescriptions: [],
      clinicalNotes: [],
      labReports: []
    };

    if (onAddPatient) {
      onAddPatient(newRecord);
    }

    setShowAddModal(false);
    // Reset Form
    setNewPatientForm({
      name: '',
      age: 38,
      gender: 'Male',
      bloodGroup: 'O+',
      phone: '+91 ',
      email: '',
      currentCondition: 'Routine Health Monitoring & Vitals Check',
      status: 'Active',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      allergy: '',
      emergencyContact: '+91 98112 34567'
    });
  };

  // Confirm Delete Patient
  const handleConfirmDelete = () => {
    if (!deleteTargetPatient) return;
    if (onDeletePatient) {
      onDeletePatient(deleteTargetPatient.id);
    }
    setDeleteTargetPatient(null);
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Page Title Header & Add Patient Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <User className="w-6 h-6 text-sky-600" />
            <span>My Patients Directory</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Total <strong className="text-slate-900 font-bold">{patients.length}</strong> patients enrolled under your clinical care
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <span className="px-3 py-1 bg-sky-100 text-sky-800 font-bold text-xs rounded-full border border-sky-200">
            {filteredPatients.length} Active Results
          </span>

          {/* Add New Patient Button */}
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
          >
            <UserPlus className="w-4 h-4 text-white" />
            <span>Add New Patient</span>
          </button>
        </div>
      </div>

      {/* Search & Filter & Page Size Controls */}
      <div className="medx-card p-5 bg-white space-y-4 shadow-2xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          
          {/* Main Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by patient name, ID, condition, phone..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-hidden transition-all text-slate-900 font-medium"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:outline-hidden text-slate-800 font-bold"
            >
              <option value="All">All Patient Status</option>
              <option value="Active">Active Care</option>
              <option value="Critical">Critical High-Risk</option>
            </select>
          </div>

          {/* Gender Filter Dropdown */}
          <div className="md:col-span-2">
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:outline-hidden text-slate-800 font-bold"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Page Size Selector */}
          <div className="md:col-span-2 flex items-center gap-1.5">
            <SlidersHorizontal className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <select
              value={pageSize}
              onChange={(e) => setPageSize(e.target.value === 'All' ? 'All' : Number(e.target.value))}
              className="w-full px-2.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:outline-hidden text-slate-800 font-extrabold"
              title="Select Records Per Page"
            >
              <option value={6}>6 / page</option>
              <option value={12}>12 / page</option>
              <option value={24}>24 / page</option>
              <option value={50}>50 / page</option>
              <option value="All">Show All</option>
            </select>
          </div>

        </div>
      </div>

      {/* Patient Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedPatients.length > 0 ? (
          paginatedPatients.map((patient) => (
            <div key={patient.id} className="medx-card medx-card-interactive p-5 bg-white space-y-4 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
              
              <div className="space-y-3">
                
                {/* Top Card Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={patient.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80'}
                      alt={patient.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-sky-500/20 shadow-xs flex-shrink-0"
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

                  <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full flex-shrink-0 ${
                    patient.status === 'Critical' ? 'bg-rose-100 text-rose-800 border border-rose-300' : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {patient.status}
                  </span>
                </div>

                {/* Condition Box */}
                <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-xs space-y-1">
                  <span className="font-bold text-sky-900 block text-[11px]">Current Clinical Condition:</span>
                  <p className="text-slate-800 font-medium line-clamp-2">{patient.currentCondition || 'General Clinical Observation'}</p>
                </div>

                {/* Patient Meta Fields */}
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  <div>
                    <span className="text-slate-400 block font-medium">Last Visit</span>
                    <strong className="text-slate-800">{patient.lastVisit || 'Today'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-medium">Next Visit</span>
                    <strong className="text-sky-700">{patient.nextAppointment ? String(patient.nextAppointment).split(' ')[0] : 'None'}</strong>
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

              {/* Action Buttons: Profile, Telehealth Video, Phone Call, Message, & Delete */}
              <div className="pt-3 border-t border-slate-100 grid grid-cols-5 gap-1">
                <button
                  onClick={() => onViewPatient(patient)}
                  className="py-2 px-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] rounded-xl transition-colors text-center"
                >
                  Profile
                </button>

                <button
                  onClick={() => onStartConsultation && onStartConsultation(null, patient)}
                  className="py-2 px-1 bg-sky-600 hover:bg-sky-700 text-white font-bold text-[11px] rounded-xl transition-colors text-center flex items-center justify-center gap-0.5"
                  title="Start Telehealth Video Call"
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Video</span>
                </button>

                <button
                  onClick={() => onCallPatient && onCallPatient(patient)}
                  className="py-2 px-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-colors text-center flex items-center justify-center gap-0.5"
                  title="Call Patient Phone"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call</span>
                </button>

                <button
                  onClick={() => onMessagePatient(patient)}
                  className="py-2 px-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] rounded-xl border border-indigo-200 transition-colors text-center flex items-center justify-center gap-0.5"
                  title="Open Chat Messages"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Chat</span>
                </button>

                {/* Delete Action Button */}
                <button
                  onClick={() => setDeleteTargetPatient(patient)}
                  className="py-2 px-1 bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white font-bold text-[11px] rounded-xl border border-rose-200 transition-colors text-center flex items-center justify-center gap-0.5"
                  title="Delete Patient Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>

            </div>
          ))
        ) : (
          <div className="col-span-full p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm space-y-2">
            <User className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="font-bold text-slate-800 text-base">No patient records found</p>
            <p className="text-xs text-slate-500">No records match your selected search or filter criteria.</p>
            <button
              onClick={() => { setFilterQuery(''); setStatusFilter('All'); setGenderFilter('All'); }}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors inline-block mt-2"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* DYNAMIC PAGINATION CONTROLS */}
      {filteredPatients.length > 0 && !isShowAll && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs text-xs">
          
          <div className="text-slate-500 font-medium">
            Showing <strong className="text-slate-900 font-bold">{startIndex + 1}–{Math.min(endIndex, filteredPatients.length)}</strong> of <strong className="text-slate-900 font-bold">{filteredPatients.length}</strong> Patient Records
          </div>

          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Page Number Buttons */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl font-bold transition-all ${
                  validCurrentPage === pageNum
                    ? 'bg-sky-600 text-white shadow-xs scale-105'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {pageNum}
              </button>
            ))}

            {/* Next Page Button */}
            <button
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* FEATURE 2: ADD NEW PATIENT MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden transform transition-all my-8">
            
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-sky-600 to-sky-800 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Enroll New Patient Record</h3>
                  <p className="text-xs text-sky-100 font-medium">Add patient into your clinical directory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveNewPatient} className="p-6 space-y-4 text-xs">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Ananya Sharma"
                    value={newPatientForm.name}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, name: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none focus:ring-2 focus:ring-sky-500 transition-all text-xs"
                  />
                </div>

                {/* Age */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Age (Years)</label>
                  <input
                    type="number"
                    min="1"
                    max="120"
                    value={newPatientForm.age}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, age: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Gender</label>
                  <select
                    value={newPatientForm.gender}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, gender: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Blood Group */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Blood Group</label>
                  <select
                    value={newPatientForm.bloodGroup}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, bloodGroup: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                {/* Status */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Clinical Status</label>
                  <select
                    value={newPatientForm.status}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, status: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  >
                    <option value="Active">Active Care</option>
                    <option value="Critical">Critical High-Risk</option>
                  </select>
                </div>

                {/* Phone */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 98112 34567"
                    value={newPatientForm.phone}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, phone: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Email Address</label>
                  <input
                    type="email"
                    placeholder="patient@example.com"
                    value={newPatientForm.email}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, email: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                {/* Current Condition */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Current Condition & Diagnosis</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Type 2 Diabetes Management & Blood Pressure Monitoring"
                    value={newPatientForm.currentCondition}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, currentCondition: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                {/* Allergy Alert */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Known Allergies (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Penicillin, Sulfa"
                    value={newPatientForm.allergy}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, allergy: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-sky-500 text-xs"
                  />
                </div>

                {/* Photo URL */}
                <div className="space-y-1">
                  <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[10px]">Avatar / Photo URL</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={newPatientForm.photo}
                    onChange={(e) => setNewPatientForm({ ...newPatientForm, photo: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4 text-white" />
                  <span>Save Patient Record</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* FEATURE 3: CONFIRMATION-BACKED DELETE MODAL */}
      {deleteTargetPatient && (
        <div className="fixed inset-0 z-60 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden transform transition-all">
            
            {/* Modal Header Banner */}
            <div className="bg-gradient-to-r from-rose-600 to-rose-700 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
                  <ShieldAlert className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base leading-tight">Confirm Patient Deletion</h3>
                  <p className="text-xs text-rose-100 font-medium">Permanent clinical record removal</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeleteTargetPatient(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4 text-xs">
              
              <div className="p-3.5 bg-rose-50 rounded-2xl border border-rose-200 text-rose-950 space-y-1">
                <strong className="text-sm font-extrabold block text-rose-900">{deleteTargetPatient.name}</strong>
                <p className="text-rose-800 font-medium">
                  ID: <strong className="font-mono">{deleteTargetPatient.id}</strong> • Age: <strong>{deleteTargetPatient.age} Yrs</strong>
                </p>
                <p className="text-[11px] text-rose-700">
                  Condition: {deleteTargetPatient.currentCondition}
                </p>
              </div>

              <p className="text-slate-600 font-medium leading-relaxed">
                Are you sure you want to permanently delete <strong>{deleteTargetPatient.name}</strong> from your clinical directory? This record will be permanently removed from state and storage.
              </p>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteTargetPatient(null)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4 text-white" />
                <span>Confirm Permanent Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
