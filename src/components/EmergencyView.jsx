import React, { useState } from 'react';
import {
  AlertTriangle,
  MapPin,
  Phone,
  User,
  CheckCircle2,
  ShieldAlert,
  Navigation,
  X
} from 'lucide-react';
import RealGpsMapModal from './RealGpsMapModal';

export default function EmergencyView({
  emergencyAlerts,
  patients,
  onViewPatient,
  onAcknowledgeEmergency
}) {
  const [selectedMapAlert, setSelectedMapAlert] = useState(null);

  const matchedPatientForMap = selectedMapAlert
    ? patients.find(p => p.id === selectedMapAlert.patientId)
    : null;

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-rose-950 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
            <span>Emergency Alerts & SOS Desk</span>
          </h1>
          <p className="text-xs text-rose-700 font-medium">
            Real-time critical patient SOS signals and immediate intervention dispatch
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-rose-600 text-white font-bold text-xs rounded-full shadow-sm animate-pulse">
            {emergencyAlerts.length} Active SOS
          </span>
        </div>
      </div>

      {/* Emergency Cards Feed */}
      <div className="space-y-4">
        {emergencyAlerts.length > 0 ? (
          emergencyAlerts.map((alert) => {
            const matchedPatient = patients.find(p => p.id === alert.patientId) || {
              id: alert.patientId,
              name: alert.patientName,
              age: alert.age,
              gender: 'Male',
              photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
              bloodGroup: alert.bloodGroup
            };

            return (
              <div
                key={alert.id}
                className="medx-card p-6 bg-gradient-to-r from-rose-50/80 via-white to-white border-2 border-rose-300 rounded-2xl shadow-md space-y-4"
              >
                
                {/* Alert Header Banner */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-rose-200 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black animate-pulse">
                      🚨
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-base text-rose-950">{alert.alertType}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white">
                          {alert.status}
                        </span>
                      </div>
                      <span className="text-xs text-rose-700 font-medium">Triggered: {alert.time}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">Vitals Severity</span>
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-100 px-2.5 py-0.5 rounded border border-rose-300">
                      {alert.vitalSeverity || 'High Risk'}
                    </span>
                  </div>
                </div>

                {/* Patient Detail Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium">Patient Details</span>
                    <strong className="text-slate-900 text-sm font-bold">{alert.patientName}</strong>
                    <span className="text-slate-600 block">{alert.age} Yrs • Blood Group: <strong className="text-rose-700 font-bold">{alert.bloodGroup}</strong></span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium">Recorded Vitals at Alert</span>
                    <strong className="text-slate-900 font-mono font-bold text-xs">{alert.vitalsAtAlert}</strong>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium">GPS Location</span>
                    <span className="text-slate-800 font-semibold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                      <span className="truncate">{alert.location}</span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons: View Patient, View Location, Contact Patient, Acknowledge */}
                <div className="pt-2 flex items-center gap-2 flex-wrap sm:flex-nowrap">
                  <button
                    onClick={() => onViewPatient(matchedPatient)}
                    className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center"
                  >
                    View Patient
                  </button>

                  <button
                    onClick={() => setSelectedMapAlert(alert)}
                    className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Navigation className="w-4 h-4" />
                    <span>View Location</span>
                  </button>

                  <button
                    onClick={() => window.open(`tel:${matchedPatient.phone || '+919811234567'}`)}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Contact Patient</span>
                  </button>

                  <button
                    onClick={() => onAcknowledgeEmergency(alert.id)}
                    className="flex-1 py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Acknowledge</span>
                  </button>
                </div>

              </div>
            );
          })
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-sm">
            No active emergency SOS alerts. All clear.
          </div>
        )}
      </div>

      {/* REAL INTERACTIVE LEAFLET GPS MAP MODAL */}
      {selectedMapAlert && (
        <RealGpsMapModal
          alert={selectedMapAlert}
          patient={matchedPatientForMap}
          onClose={() => setSelectedMapAlert(null)}
        />
      )}

    </div>
  );
}
