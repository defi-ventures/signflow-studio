import React, { useState } from 'react';
import { PDFDocument } from '../types';
import { Share2, ArrowLeft, Link2, Eye, ShieldCheck, DollarSign, Upload, Sparkles, RefreshCw, Smartphone } from 'lucide-react';

interface PowerFormPanelProps {
  documents: PDFDocument[];
  onBack: () => void;
  onSimulatePowerForm: (doc: PDFDocument) => void;
}

export default function PowerFormPanel({ documents, onBack, onSimulatePowerForm }: PowerFormPanelProps) {
  const powerForms = documents.filter(d => d.isPowerForm);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (id: string) => {
    navigator.clipboard.writeText(`https://signflow.studio/powerform/pub_${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">PowerForms Portal</h1>
            <p className="text-sm text-slate-500">Deploy self-service links. Embed signing agreements on your website, send via SMS, or share simple QR codes.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main List of PowerForms */}
        <div className="lg:col-span-2 space-y-4">
          {powerForms.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 shadow-sm">
              <Share2 className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
              <p>No active PowerForms. Click "Create Document" and toggle "Publish as PowerForm" to generate one.</p>
            </div>
          ) : (
            powerForms.map(pf => {
              const paymentField = pf.fields.find(f => f.type === 'payment');
              const attachmentField = pf.fields.find(f => f.type === 'attachment');

              return (
                <div key={pf.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                        Self-Service PowerForm Link Active
                      </span>
                      <h3 className="text-lg font-bold text-slate-800 mt-1">{pf.title}</h3>
                      <p className="text-xs text-slate-400">Created on {pf.createdAt} • Perfect for embeds and email newsletters</p>
                    </div>

                    <button
                      onClick={() => onSimulatePowerForm(pf)}
                      className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                    >
                      Fill & Sign Form <Eye className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Public Link Card */}
                  <div className="bg-slate-50 p-3 rounded-xl flex items-center justify-between border border-slate-100 text-xs gap-4">
                    <span className="font-mono text-slate-500 truncate">
                      https://signflow.studio/powerform/pub_{pf.id}
                    </span>
                    <button
                      onClick={() => copyToClipboard(pf.id)}
                      className={`font-semibold shrink-0 transition ${
                        copiedId === pf.id ? 'text-emerald-600' : 'text-blue-600 hover:text-blue-700'
                      }`}
                    >
                      {copiedId === pf.id ? 'Copied Link!' : 'Copy Link'}
                    </button>
                  </div>

                  {/* Form Configurations list */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="bg-slate-50/50 p-2.5 rounded-lg text-center space-y-0.5 border border-slate-100/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">ID Check</span>
                      <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                        {pf.recipients[0]?.verificationType !== 'none' ? 'Enforced' : 'None'}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-2.5 rounded-lg text-center space-y-0.5 border border-slate-100/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Redirects To</span>
                      <span className="text-xs font-bold text-slate-700 truncate block max-w-full" title={pf.redirectUrl}>
                        {pf.redirectUrl ? 'Custom Success' : 'Default Finish'}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-2.5 rounded-lg text-center space-y-0.5 border border-slate-100/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">File Uploads</span>
                      <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
                        <Upload className="w-3.5 h-3.5 text-purple-500" />
                        {attachmentField ? 'Required' : 'Disabled'}
                      </span>
                    </div>

                    <div className="bg-slate-50/50 p-2.5 rounded-lg text-center space-y-0.5 border border-slate-100/50">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Payments</span>
                      <span className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-0.5">
                        <DollarSign className="w-3.5 h-3.5" />
                        {paymentField ? `$${paymentField.paymentAmount}` : 'None'}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Informative Side Card on PowerForms */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg">Self-Serve Advantages</h3>
            </div>
            <p className="text-xs text-indigo-100 leading-relaxed">
              PowerForms revolutionize bulk and repeatable agreements. Rather than manually typing and sending forms one-by-one to hundreds of people:
            </p>
            <ul className="text-xs text-indigo-200 space-y-2 list-disc list-inside">
              <li>Deploy signing waivers directly inside custom mobile apps.</li>
              <li>Collect application fees via built-in credit card processing.</li>
              <li>Redirect signers automatically to success or feedback pages.</li>
              <li>Verify signer mobile identity via SMS code prior to document release.</li>
            </ul>
          </div>

          {/* Quick Stats Block */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Instant Signer Traffic</h4>
            <div className="flex items-center justify-between border-b border-slate-50 pb-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Smartphone className="w-4 h-4 text-slate-400" /> Mobile Signers
              </span>
              <span className="font-bold text-slate-700">82% (Excellent response)</span>
            </div>
            <div className="flex items-center justify-between border-b border-slate-50 pb-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-4 h-4 text-slate-400" /> Auto-reminders
              </span>
              <span className="font-bold text-slate-700">Every 48 Hours</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
