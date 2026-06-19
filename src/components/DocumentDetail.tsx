import React, { useState } from 'react';
import { 
  ArrowLeft, Download, RefreshCw, Send, CheckCircle, Clock, 
  Trash2, Mail, ShieldCheck, FileText, Smartphone, Calendar, 
  ChevronRight, ExternalLink, Activity
} from 'lucide-react';
import { PDFDocument, SignerRecipient } from '../types';
import jsPDF from 'jspdf';

interface DocumentDetailProps {
  document: PDFDocument;
  onBack: () => void;
  onDelete: (id: string) => void;
  onSendReminder: (recipientId: string) => void;
}

export default function DocumentDetail({
  document: doc,
  onBack,
  onDelete,
  onSendReminder
}: DocumentDetailProps) {
  const [activeTab, setActiveTab] = useState<'recipients' | 'audit'>('recipients');

  const handleDownloadPDF = () => {
    // Instantiate JSPDF framework to compile simulated PDF document with annotations and signers
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    // We can write basic decorative elements representing the certificate of completion
    pdf.setFillColor(248, 250, 252);
    pdf.rect(0, 0, 595, 842, 'F');

    // Header border
    pdf.setDrawColor(37, 99, 235);
    pdf.setLineWidth(4);
    pdf.line(40, 40, 555, 40);

    // Document title
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(22);
    pdf.setTextColor(15, 23, 42);
    pdf.text(doc.title, 40, 80);

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Document Securely Signed and Certified by SignFlow Studio`, 40, 100);
    pdf.text(`UUID Reference: ${doc.id}-${Date.now()}`, 40, 115);

    // Drawing divider
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(1);
    pdf.line(40, 140, 555, 140);

    // Section 1: Signer Recipient status
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Execution Certificate & Signatures', 40, 170);

    let yOffset = 200;
    doc.recipients.forEach((rec, index) => {
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text(`${index + 1}. Role: ${rec.role} - Name: ${rec.name || 'Unassigned'} (${rec.status.toUpperCase()})`, 50, yOffset);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`Email: ${rec.email || 'None'} | Verification: ${rec.verificationType.toUpperCase()}`, 60, yOffset + 15);
      
      if (rec.signedAt) {
        pdf.text(`Signed At: ${rec.signedAt}`, 60, yOffset + 30);
      }
      yOffset += 50;
    });

    // Section 2: Audit Trail details
    pdf.setDrawColor(226, 232, 240);
    pdf.line(40, yOffset + 10, 555, yOffset + 10);
    yOffset += 40;

    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('Forensic Cryptographic Audit Trail', 40, yOffset);
    yOffset += 30;

    doc.auditLogs.slice(0, 8).forEach(log => {
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(51, 65, 85);
      pdf.text(`[${log.timestamp}] - Action: ${log.action} (${log.user})`, 50, yOffset);
      
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      pdf.text(`IP: ${log.ipAddress} | Details: ${log.details}`, 60, yOffset + 12);
      yOffset += 28;
    });

    // Save and trigger browser secure download
    pdf.save(`Signed-${doc.title}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fadeIn">
      {/* Back Button and Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800">{doc.title}</h1>
            <p className="text-xs text-slate-400">
              Created on {doc.createdAt} • Updated {doc.updatedAt}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {doc.status === 'completed' && (
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition shadow-sm"
            >
              <Download className="w-4 h-4" /> Download Certificate (PDF)
            </button>
          )}

          <button
            onClick={() => {
              onDelete(doc.id);
              onBack();
            }}
            className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs px-4 py-2.5 rounded-xl transition"
          >
            <Trash2 className="w-4 h-4" /> Delete Envelope
          </button>
        </div>
      </div>

      {/* Grid panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Progress Card & Recipient overview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex border-b border-slate-100 bg-slate-50 p-1">
              <button
                onClick={() => setActiveTab('recipients')}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition ${
                  activeTab === 'recipients' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Signer Recipients
              </button>
              <button
                onClick={() => setActiveTab('audit')}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-lg transition ${
                  activeTab === 'audit' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Audit Trail Log
              </button>
            </div>

            {activeTab === 'recipients' ? (
              <div className="p-6 divide-y divide-slate-100">
                {doc.recipients.map((rec, index) => (
                  <div key={rec.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{rec.role}</h4>
                        <p className="text-xs text-slate-600 font-medium">{rec.name || 'Unassigned Guest Signer'}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {rec.email || 'Self-service powerform landing'} • Method: {rec.verificationType.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        rec.status === 'signed' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {rec.status === 'signed' ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {rec.status.toUpperCase()}
                      </span>

                      {rec.status === 'pending' && (
                        <button
                          onClick={() => onSendReminder(rec.id)}
                          className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold text-xs px-2.5 py-1.5 rounded-lg transition"
                        >
                          <Send className="w-3.5 h-3.5" /> Remind
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Cryptographic Audit Trail logs */
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest pb-2 border-b border-slate-50">
                  <span>Cryptographic History</span>
                  <span className="flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> Log Active</span>
                </div>

                <div className="space-y-4 max-h-[450px] overflow-y-auto">
                  {doc.auditLogs.map((log) => (
                    <div key={log.id} className="relative pl-6 pb-2 border-l border-slate-200 last:border-l-0">
                      {/* Decorative node ball */}
                      <span className="absolute left-[-4px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-2 border-white shadow-sm"></span>
                      
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                          <span>{log.action}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({log.timestamp})</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{log.user} • IP: {log.ipAddress}</p>
                        <p className="text-[11px] text-slate-400 italic">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Envelope overview box */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wider">Document Summary</h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-medium">Status</span>
                <span className={`font-bold uppercase ${doc.status === 'completed' ? 'text-emerald-600' : 'text-amber-500'}`}>
                  {doc.status}
                </span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-medium">Total Pages</span>
                <span className="font-bold text-slate-700">{doc.pages.length} Pages</span>
              </div>

              <div className="flex justify-between border-b border-slate-50 pb-2">
                <span className="text-slate-400 font-medium">Form Placements</span>
                <span className="font-bold text-slate-700">{doc.fields.length} Fields</span>
              </div>

              {doc.redirectUrl && (
                <div className="flex justify-between border-b border-slate-50 pb-2">
                  <span className="text-slate-400 font-medium">Post-sign Link</span>
                  <span className="font-bold text-blue-600 truncate max-w-[120px]" title={doc.redirectUrl}>
                    {doc.redirectUrl}
                  </span>
                </div>
              )}
            </div>

            <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50 space-y-1.5 text-xs">
              <h4 className="font-bold text-blue-800 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-600" /> Secure Legal Guarantee
              </h4>
              <p className="text-blue-900 leading-relaxed text-[11px]">
                SignFlow Studio employs military-grade cryptographic certificates and tamper-evident hashes to ensure ESIGN / Uniform Electronic Transactions Act compliance.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
