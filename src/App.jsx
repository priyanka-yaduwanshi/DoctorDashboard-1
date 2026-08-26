import React, { useState } from 'react';
import Navbar from './components/Navbar';
import DoctorHome from './components/DoctorHome';
import MyPatients from './components/MyPatients';
import AppointmentsView from './components/AppointmentsView';
import EmergencyView from './components/EmergencyView';
import MessagesView from './components/MessagesView';
import AvailabilityView from './components/AvailabilityView';
import ProfileView from './components/ProfileView';
import PatientProfileModal from './components/PatientProfileModal';
import StartConsultationModal from './components/StartConsultationModal';
import LabReportModal from './components/LabReportModal';
import PrescriptionSlipModal from './components/PrescriptionSlipModal';
import Toast from './components/Toast';

import {
  initialDoctorProfile,
  initialPatients,
  initialAppointments,
  initialEmergencyAlerts,
  initialMessages,
  initialNeedsAttention,
  initialPatientQueue,
  initialEmergencyWorkflowData,
  initialRecentActivity,
  initialMyDaySchedule
} from './data/mockData';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Data states
  const [doctorProfile, setDoctorProfile] = useState(initialDoctorProfile);
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [emergencyAlerts, setEmergencyAlerts] = useState(initialEmergencyAlerts);
  const [messages, setMessages] = useState(initialMessages);

  // Enhancement data states
  const [needsAttention, setNeedsAttention] = useState(initialNeedsAttention);
  const [patientQueue, setPatientQueue] = useState(initialPatientQueue);
  const [emergencyWorkflow, setEmergencyWorkflow] = useState(initialEmergencyWorkflowData);
  const [recentActivity, setRecentActivity] = useState(initialRecentActivity);
  const [myDaySchedule, setMyDaySchedule] = useState(initialMyDaySchedule);

  // Modal active states
  const [selectedPatientForProfile, setSelectedPatientForProfile] = useState(null);
  const [selectedConsultationAppointment, setSelectedConsultationAppointment] = useState(null);
  const [selectedLabReport, setSelectedLabReport] = useState(null);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Dynamic summary stats calculation
  const summaryStats = {
    patientsToday: 18,
    waiting: 4,
    completed: 11,
    reportsPending: 3,
    followupsDue: 7,
    unreadMessages: messages.reduce((acc, m) => acc + (m.unreadCount || 0), 0),
    todaysAppointments: appointments.filter(a => a.date === '2026-08-25').length,
    totalPatients: patients.length,
    pendingAppointments: appointments.filter(a => a.status === 'Pending').length,
    emergencyAlerts: emergencyAlerts.length
  };

  // HANDLERS
  const handleViewPatient = (patient) => {
    const freshPatient = patients.find(p => p.id === patient.id) || patient;
    setSelectedPatientForProfile(freshPatient);
  };

  const handleStartConsultation = (appointment, patient) => {
    setSelectedConsultationAppointment({
      appointment: appointment || {
        id: `APT-${Math.floor(100 + Math.random() * 900)}`,
        patientId: patient.id,
        patientName: patient.name,
        age: patient.age,
        gender: patient.gender,
        reason: patient.currentCondition,
        mode: 'In-person'
      },
      patient: patient || patients.find(p => p.id === appointment?.patientId)
    });
  };

  const handleCompleteConsultation = ({ appointmentId, patientId, diagnosis, notes }) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Completed' } : apt)
    );

    if (notes) {
      const now = new Date();
      const noteData = {
        id: `CN-${Math.floor(100 + Math.random() * 900)}`,
        date: now.toISOString().split('T')[0],
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        doctor: doctorProfile.name,
        note: `Consultation (${diagnosis || 'Routine'}): ${notes}`
      };

      setPatients(prev =>
        prev.map(p => p.id === patientId ? { ...p, clinicalNotes: [noteData, ...(p.clinicalNotes || [])] } : p)
      );
    }

    setSelectedConsultationAppointment(null);
    showToast('Consultation completed successfully & clinical note logged!');
  };

  const handleSavePrescription = (patientId, rxData) => {
    setPatients(prev =>
      prev.map(p => {
        if (p.id === patientId) {
          const updatedPrescriptions = [rxData, ...(p.prescriptions || [])];
          const newMedList = rxData.medicines.map((m, idx) => ({
            id: `MED-NEW-${idx}`,
            name: m.name,
            dosage: m.dosage,
            frequency: m.frequency,
            route: 'Oral',
            startDate: rxData.date,
            endDate: 'Ongoing',
            prescribingDoctor: rxData.doctor,
            instructions: m.instructions
          }));

          return {
            ...p,
            prescriptions: updatedPrescriptions,
            currentMedications: [...newMedList, ...(p.currentMedications || [])]
          };
        }
        return p;
      })
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        prescriptions: [rxData, ...(prev.prescriptions || [])]
      }));
    }

    showToast(`Prescription #${rxData.id} saved & added to patient records!`);
  };

  const handleSaveClinicalNote = (patientId, noteData) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, clinicalNotes: [noteData, ...(p.clinicalNotes || [])] } : p)
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        clinicalNotes: [noteData, ...(prev.clinicalNotes || [])]
      }));
    }

    showToast('Clinical note added to patient record!');
  };

  const handleSaveFollowup = (patientId, followupData) => {
    setPatients(prev =>
      prev.map(p => p.id === patientId ? { ...p, followupPlan: [followupData, ...(p.followupPlan || [])] } : p)
    );

    if (selectedPatientForProfile && selectedPatientForProfile.id === patientId) {
      setSelectedPatientForProfile(prev => ({
        ...prev,
        followupPlan: [followupData, ...(prev.followupPlan || [])]
      }));
    }

    showToast(`Follow-up scheduled for ${followupData.date}! Appears on Dashboard.`);
  };

  const handleRescheduleAppointment = (appointmentId, newDate, newTime) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, date: newDate, time: newTime, status: 'Confirmed' } : apt)
    );
    showToast(`Appointment rescheduled to ${newDate} at ${newTime}`);
  };

  const handleCancelAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Cancelled' } : apt)
    );
    showToast('Appointment cancelled.', 'warning');
  };

  const handleAcceptAppointment = (appointmentId) => {
    setAppointments(prev =>
      prev.map(apt => apt.id === appointmentId ? { ...apt, status: 'Confirmed' } : apt)
    );
    showToast('Appointment confirmed!');
  };

  const handleSendMessage = (convId, text) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setMessages(prev =>
      prev.map(conv => {
        if (conv.id === convId) {
          return {
            ...conv,
            lastMessage: text,
            time: timeStr,
            unreadCount: 0,
            conversation: [
              ...conv.conversation,
              { sender: 'doctor', text, time: timeStr }
            ]
          };
        }
        return conv;
      })
    );

    showToast('Message sent to patient!');
  };

  const handleSaveAvailability = (newAvailability) => {
    setDoctorProfile(prev => ({ ...prev, availability: newAvailability }));
    showToast('Doctor availability & slot timing saved!');
  };

  const handleUpdateDoctorProfile = (newProfile) => {
    setDoctorProfile(newProfile);
    showToast('Doctor profile updated successfully!');
  };

  const handleAcknowledgeEmergency = (alertId) => {
    setEmergencyAlerts(prev => prev.filter(a => a.id !== alertId));
    showToast('Emergency SOS alert acknowledged & status updated!', 'warning');
  };

  const handleDownloadReport = (report) => {
    const element = document.createElement('a');
    const file = new Blob([`MEDX PATHOLOGY REPORT\n\nReport: ${report.name}\nDate: ${report.date}\nDoctor: ${report.doctor}\nStatus: ${report.status}\nDetails: ${report.details}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_report.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    showToast(`Downloaded report file: ${report.name}`);
  };

  const handleQuickAction = (actionType) => {
    if (actionType === 'consultation') {
      const firstPatient = patients[0];
      handleStartConsultation(null, firstPatient);
    } else if (actionType === 'prescription') {
      const firstPatient = patients[0];
      handleViewPatient(firstPatient);
    } else if (actionType === 'lab') {
      showToast('Lab test order form opened for patient');
    }
  };

  const handleCallResponder = (responder) => {
    showToast(`Connecting direct line to ${responder.name} (${responder.phone})...`, 'info');
    window.open(`tel:${responder.phone}`);
  };

  const handleMessageResponder = (responder) => {
    showToast(`Opening clinical message thread with ${responder.name}...`, 'info');
    setActiveTab('messages');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col antialiased selection:bg-sky-500 selection:text-white">
      
      {/* Sticky Header Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        doctorProfile={doctorProfile}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        unreadMessagesCount={summaryStats.unreadMessages}
        emergencyCount={summaryStats.emergencyAlerts}
        onOpenGlobalSearch={() => setActiveTab('patients')}
      />

      {/* Main Page Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* VIEW 1: HOME / DASHBOARD */}
        {activeTab === 'home' && (
          <DoctorHome
            doctorProfile={doctorProfile}
            summaryStats={summaryStats}
            appointments={appointments}
            patients={patients}
            emergencyAlerts={emergencyAlerts}
            needsAttention={needsAttention}
            patientQueue={patientQueue}
            emergencyWorkflow={emergencyWorkflow}
            recentActivity={recentActivity}
            myDaySchedule={myDaySchedule}
            onNavigateTab={setActiveTab}
            onViewPatient={handleViewPatient}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onUpdateEmergencyWorkflow={setEmergencyWorkflow}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onQuickAction={handleQuickAction}
            onCallResponder={handleCallResponder}
            onMessageResponder={handleMessageResponder}
          />
        )}

        {/* VIEW 2: MY PATIENTS */}
        {activeTab === 'patients' && (
          <MyPatients
            patients={patients}
            onViewPatient={handleViewPatient}
            onMessagePatient={(p) => {
              const conv = messages.find(m => m.patientId === p.id);
              if (conv) setActiveTab('messages');
              else handleViewPatient(p);
            }}
            onViewMedicalHistory={(p) => handleViewPatient(p)}
          />
        )}

        {/* VIEW 3: APPOINTMENTS */}
        {activeTab === 'appointments' && (
          <AppointmentsView
            appointments={appointments}
            patients={patients}
            onViewPatient={handleViewPatient}
            onStartConsultation={(apt, pat) => handleStartConsultation(apt, pat)}
            onRescheduleAppointment={handleRescheduleAppointment}
            onCancelAppointment={handleCancelAppointment}
            onAcceptAppointment={handleAcceptAppointment}
          />
        )}

        {/* VIEW 4: MEDICAL RECORDS */}
        {activeTab === 'records' && (
          <MyPatients
            patients={patients}
            onViewPatient={handleViewPatient}
            onMessagePatient={(p) => setActiveTab('messages')}
            onViewMedicalHistory={(p) => handleViewPatient(p)}
          />
        )}

        {/* VIEW 5: MESSAGES */}
        {activeTab === 'messages' && (
          <MessagesView
            messages={messages}
            patients={patients}
            onSendMessage={handleSendMessage}
            onViewPatient={handleViewPatient}
          />
        )}

        {/* VIEW 6: EMERGENCY ALERTS */}
        {activeTab === 'emergency' && (
          <EmergencyView
            emergencyAlerts={emergencyAlerts}
            patients={patients}
            onViewPatient={handleViewPatient}
            onAcknowledgeEmergency={handleAcknowledgeEmergency}
          />
        )}

        {/* VIEW 7: AVAILABILITY */}
        {activeTab === 'availability' && (
          <AvailabilityView
            doctorProfile={doctorProfile}
            onSaveAvailability={handleSaveAvailability}
          />
        )}

        {/* VIEW 8: DOCTOR PROFILE */}
        {activeTab === 'profile' && (
          <ProfileView
            doctorProfile={doctorProfile}
            onUpdateDoctorProfile={handleUpdateDoctorProfile}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200/80 py-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>© 2026 MedX Clinical Technologies. Doctor Portal System. All rights reserved.</p>
          <p className="font-medium text-slate-400">Strictly Confidential Clinical Workstation</p>
        </div>
      </footer>

      {/* MODALS */}
      {selectedPatientForProfile && (
        <PatientProfileModal
          patient={selectedPatientForProfile}
          doctorProfile={doctorProfile}
          onClose={() => setSelectedPatientForProfile(null)}
          onSavePrescription={handleSavePrescription}
          onSaveClinicalNote={handleSaveClinicalNote}
          onSaveFollowup={handleSaveFollowup}
          onViewLabReport={(report) => setSelectedLabReport({ report, patient: selectedPatientForProfile })}
          onViewPrescription={(rx) => setSelectedPrescription({ prescription: rx, patient: selectedPatientForProfile })}
          onDownloadReport={handleDownloadReport}
          onStartConsultation={(apt) => handleStartConsultation(apt, selectedPatientForProfile)}
        />
      )}

      {selectedConsultationAppointment && (
        <StartConsultationModal
          appointment={selectedConsultationAppointment.appointment}
          patient={selectedConsultationAppointment.patient}
          onClose={() => setSelectedConsultationAppointment(null)}
          onComplete={handleCompleteConsultation}
        />
      )}

      {selectedLabReport && (
        <LabReportModal
          report={selectedLabReport.report}
          patient={selectedLabReport.patient}
          onClose={() => setSelectedLabReport(null)}
          onDownload={handleDownloadReport}
        />
      )}

      {selectedPrescription && (
        <PrescriptionSlipModal
          prescription={selectedPrescription.prescription}
          patient={selectedPrescription.patient}
          doctorProfile={doctorProfile}
          onClose={() => setSelectedPrescription(null)}
        />
      )}

      <Toast toast={toast} onClose={() => setToast(null)} />

    </div>
  );
}
