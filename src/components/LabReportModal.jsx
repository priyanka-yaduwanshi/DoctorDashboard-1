import React from 'react';
import { X, Download, FileText, CheckCircle2, ShieldCheck, Printer } from 'lucide-react';

export default function LabReportModal({ report, patient, onClose, onDownload }) {
  if (!report) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl medx-gradient-brand text-white flex items-center justify-center font-bold shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">{report.name}</h3>
              <p className="text-xs text-slate-400">Patient: {patient?.name || 'Patient'} • ID: {patient?.id} • Date: {report.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onDownload(report)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lab Slip Paper View */}
        <div className="p-8 bg-slate-100 max-h-[75vh] overflow-y-auto">
          <div className="bg-white p-8 rounded-xl border border-slate-300 shadow-sm space-y-6 text-slate-800 font-sans">
            
            {/* Header / Lab Branding */}
            <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Med<span className="text-sky-600">X</span> Pathology Labs</h2>
                <p className="text-xs text-slate-500 font-medium">NABL Accredited Diagnostics & Diagnostics Reference Laboratory</p>
                <p className="text-[11px] text-slate-400">MedX Health Tower, Sector 62 • Helpline: 1800-MEDX-LAB</p>
              </div>
              <div className="text-right">
                <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                  report.status === 'Normal' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                  report.status === 'Borderline' ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  'bg-rose-100 text-rose-800 border border-rose-300'
                }`}>
                  {report.status} Status
                </span>
                <p className="text-xs text-slate-500 mt-1 font-mono">Ref No: {report.id}</p>
              </div>
            </div>

            {/* Patient Information Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-xl text-xs border border-slate-200">
              <div>
                <span className="text-slate-400 block font-medium">Patient Name</span>
                <span className="font-bold text-slate-900">{patient?.name}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Age / Gender</span>
                <span className="font-bold text-slate-900">{patient?.age} Yrs / {patient?.gender}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Referred By</span>
                <span className="font-bold text-slate-900">{report.doctor || 'Dr. Rahul Vance'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Report Date</span>
                <span className="font-bold text-slate-900">{report.date}</span>
              </div>
            </div>

            {/* Test Results Table */}
            <div>
              <h4 className="font-bold text-sm text-slate-900 mb-3 uppercase tracking-wider border-b border-slate-200 pb-1">
                Investigation Findings
              </h4>
              
              <div className="p-4 bg-sky-50/50 rounded-xl border border-sky-100 text-sm leading-relaxed font-mono">
                {report.details}
              </div>
            </div>

            {/* Doctor Verification Signature */}
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-500">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <span>Electronically Signed & Verified by Senior Pathologist</span>
              </div>
              <div className="text-right">
                <p className="font-serif italic font-bold text-slate-800 text-sm">Dr. S. K. Mukherjee</p>
                <p className="text-[11px] text-slate-500">MD (Pathology)</p>
              </div>
            </div>

          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">Press Esc or click Close to return</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            Close Viewer
          </button>
        </div>

      </div>
    </div>
  );
}
