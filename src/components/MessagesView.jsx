import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  User,
  Search,
  CheckCircle2,
  Paperclip,
  Clock,
  Phone
} from 'lucide-react';

export default function MessagesView({
  messages,
  patients,
  onSendMessage,
  onViewPatient
}) {
  const [selectedConvId, setSelectedConvId] = useState(messages[0]?.id || null);
  const [inputText, setInputText] = useState('');
  const [searchConv, setSearchConv] = useState('');

  const activeConv = messages.find(m => m.id === selectedConvId) || messages[0];
  const matchedPatient = patients.find(p => p.id === activeConv?.patientId);

  const filteredMessages = messages.filter(m =>
    m.patientName.toLowerCase().includes(searchConv.toLowerCase())
  );

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConv) return;

    onSendMessage(activeConv.id, inputText);
    setInputText('');
  };

  const cannedTemplates = [
    "Please continue your medications as prescribed.",
    "Your lab test results look good.",
    "Please visit the clinic for an in-person BP check tomorrow.",
    "Ensure 8 hours of fasting before your blood test."
  ];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-sky-600" />
            <span>Doctor Patient Messaging Desk</span>
          </h1>
          <p className="text-xs text-slate-500">
            Secure HIPAA-compliant clinical tele-consultation chat messaging
          </p>
        </div>
      </div>

      {/* Main 2-Column Chat Container */}
      <div className="medx-card bg-white rounded-2xl border border-slate-200 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[560px] shadow-sm">
        
        {/* Left Column: Conversation List */}
        <div className="md:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50">
          
          {/* Search Box */}
          <div className="p-4 border-b border-slate-200 bg-white">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient chat..."
                value={searchConv}
                onChange={(e) => setSearchConv(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-sky-500/30"
              />
            </div>
          </div>

          {/* Conversation List Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-200">
            {filteredMessages.map((conv) => {
              const isSelected = conv.id === selectedConvId;
              
              return (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConvId(conv.id)}
                  className={`p-4 cursor-pointer transition-all flex items-start gap-3 ${
                    isSelected ? 'bg-white border-l-4 border-l-sky-600 shadow-xs' : 'hover:bg-slate-100'
                  }`}
                >
                  <img
                    src={conv.photo}
                    alt={conv.patientName}
                    className="w-11 h-11 rounded-xl object-cover ring-2 ring-sky-500/20 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900 truncate">{conv.patientName}</h4>
                      <span className="text-[10px] text-slate-400 font-medium">{conv.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 truncate mt-0.5">{conv.lastMessage}</p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="w-5 h-5 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Chat Conversation Pane */}
        {activeConv ? (
          <div className="md:col-span-8 flex flex-col justify-between bg-white">
            
            {/* Active Patient Chat Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <img
                  src={activeConv.photo}
                  alt={activeConv.patientName}
                  className="w-10 h-10 rounded-xl object-cover ring-2 ring-sky-500/20"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{activeConv.patientName}</h3>
                  <span className="text-[11px] text-slate-500">Patient ID: {activeConv.patientId}</span>
                </div>
              </div>

              {matchedPatient && (
                <button
                  onClick={() => onViewPatient(matchedPatient)}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                >
                  View Profile
                </button>
              )}
            </div>

            {/* Chat Messages Log */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4 max-h-[380px] bg-slate-50/30">
              {activeConv.conversation?.map((msg, idx) => {
                const isDoctor = msg.sender === 'doctor';
                
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isDoctor ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs shadow-2xs leading-relaxed ${
                        isDoctor
                          ? 'bg-sky-600 text-white rounded-br-none font-medium'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none font-medium'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 font-medium px-1">
                      {msg.time}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Canned Advice Templates Strip */}
            <div className="p-2 px-4 bg-slate-100 border-t border-slate-200 flex items-center gap-2 overflow-x-auto">
              <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">Quick Responses:</span>
              {cannedTemplates.map((tmpl, i) => (
                <button
                  key={i}
                  onClick={() => setInputText(tmpl)}
                  className="px-2.5 py-1 bg-white hover:bg-sky-50 text-slate-700 hover:text-sky-800 border border-slate-200 rounded-lg text-[10px] font-medium whitespace-nowrap transition-colors"
                >
                  {tmpl}
                </button>
              ))}
            </div>

            {/* Message Input Box */}
            <form onSubmit={handleSend} className="p-4 border-t border-slate-200 flex items-center gap-3 bg-white">
              <input
                type="text"
                placeholder="Type your medical response or clinical advice..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 focus:outline-hidden text-slate-900"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send</span>
              </button>
            </form>

          </div>
        ) : (
          <div className="md:col-span-8 flex items-center justify-center p-12 text-slate-400 text-xs">
            Select a patient conversation on the left to start messaging.
          </div>
        )}

      </div>

    </div>
  );
}
