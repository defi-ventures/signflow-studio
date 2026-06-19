import React, { useState } from 'react';
import { BrandingSettings } from '../types';
import { Layout, Palette, Save, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

interface BrandingPanelProps {
  branding: BrandingSettings;
  onSave: (branding: BrandingSettings) => void;
  onBack: () => void;
}

export default function BrandingPanel({ branding, onSave, onBack }: BrandingPanelProps) {
  const [logoUrl, setLogoUrl] = useState(branding.logoUrl || '');
  const [companyName, setCompanyName] = useState(branding.companyName);
  const [primaryColor, setPrimaryColor] = useState(branding.primaryColor);
  const [accentColor, setAccentColor] = useState(branding.accentColor);
  const [emailFooter, setEmailFooter] = useState(branding.emailFooter);
  const [showPoweredBy, setShowPoweredBy] = useState(branding.showPoweredBy);

  const handleSave = () => {
    onSave({
      logoUrl,
      companyName,
      primaryColor,
      accentColor,
      emailFooter,
      showPoweredBy
    });
    alert('Branding settings saved successfully!');
  };

  const handleReset = () => {
    setLogoUrl('');
    setCompanyName('Acme Corp');
    setPrimaryColor('#2563eb');
    setAccentColor('#10b981');
    setEmailFooter('© 2026 Acme Corp. Securely signed with SignFlow.');
    setShowPoweredBy(true);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Branded Experience</h1>
            <p className="text-sm text-slate-500">Boost client trust by adding your custom logo, colors, and legal footers.</p>
          </div>
        </div>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition duration-150 shadow-sm"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Settings Panel */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Palette className="w-5 h-5 text-blue-500" /> Custom Branding Options
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Custom Logo URL (HTTPS)</label>
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Email Invitation Footer</label>
              <textarea
                rows={3}
                value={emailFooter}
                onChange={(e) => setEmailFooter(e.target.value)}
                className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <h4 className="text-sm font-semibold text-slate-700">Show Powered By</h4>
                <p className="text-xs text-slate-400">Display "Powered by SignFlow" badge in portals.</p>
              </div>
              <input
                type="checkbox"
                checked={showPoweredBy}
                onChange={(e) => setShowPoweredBy(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-5 w-5"
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
            <button
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
            >
              Save Branding
            </button>
          </div>
        </div>

        {/* Live Preview Portal */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Live Signing Portal Preview</h3>
          <div className="bg-slate-100 rounded-2xl border border-slate-200 p-6 shadow-inner relative overflow-hidden min-h-[450px] flex flex-col justify-between">
            
            {/* Embedded simulation window */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col flex-grow">
              {/* Top Banner (Custom Branded) */}
              <div 
                className="p-4 flex items-center justify-between border-b border-slate-100 text-white"
                style={{ backgroundColor: primaryColor }}
              >
                <div className="flex items-center gap-2">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain rounded" />
                  ) : (
                    <div className="h-8 w-8 bg-white/20 rounded flex items-center justify-center font-bold">
                      {companyName.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <span className="font-bold text-sm tracking-wide">{companyName}</span>
                </div>
                <div className="flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded text-xs">
                  <ShieldCheck className="w-3.5 h-3.5" /> SECURE SIGNING
                </div>
              </div>

              {/* Portal Content Body */}
              <div className="p-6 flex-grow flex flex-col justify-center items-center text-center space-y-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${accentColor}15`, color: accentColor }}>
                  <Mail className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-800 text-lg">Signature Request From {companyName}</h4>
                  <p className="text-xs text-slate-400 max-w-sm">Please review and execute the uploaded non-disclosure terms legally and securely.</p>
                </div>
                
                <button
                  className="px-6 py-2.5 text-white font-semibold text-sm rounded-xl shadow-md transition"
                  style={{ backgroundColor: primaryColor }}
                >
                  Start Signing
                </button>
              </div>

              {/* Custom Branded Footer */}
              <div className="p-3 bg-slate-50 text-center border-t border-slate-100 space-y-1">
                <p className="text-[10px] text-slate-400 font-medium">{emailFooter}</p>
                {showPoweredBy && (
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                    POWERED BY SIGNFLOW STUDIO
                  </p>
                )}
              </div>
            </div>

            {/* Hint label */}
            <span className="absolute bottom-2 right-4 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow">
              PORTAL PREVIEW
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
