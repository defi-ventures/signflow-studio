import React, { useState } from 'react';
import { PDFDocument, BrandingSettings, TeamMember } from './types';
import { mockDocuments, mockTeam, defaultBranding, createSamplePages } from './data/mockData';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import SignaturePortal from './components/SignaturePortal';
import DocumentDetail from './components/DocumentDetail';
import BrandingPanel from './components/BrandingPanel';
import TemplatePanel from './components/TemplatePanel';
import PowerFormPanel from './components/PowerFormPanel';
import AiAssistant from './components/AiAssistant';
import DocSendPanel from './components/DocSendPanel';
import { 
  FileText, ShieldCheck, Layers, Share2, Settings, Users, 
  Menu, X, Smartphone, Sparkles, LogOut, CheckCircle, Trash2, Mail, Bot, Send
} from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<PDFDocument[]>(mockDocuments);
  const [branding, setBranding] = useState<BrandingSettings>(defaultBranding);
  const [team, setTeam] = useState<TeamMember[]>(mockTeam);

  // Layout View flow
  const [currentView, setCurrentView] = useState<string>('dashboard'); // dashboard, editor, sign, view, branding, templates, powerforms
  const [selectedDoc, setSelectedDoc] = useState<PDFDocument | null>(null);
  const [currentFolder, setCurrentFolder] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSigningPowerFormMode, setIsSigningPowerFormMode] = useState(false);

  // Handle document edit selection
  const handleSelectDoc = (doc: PDFDocument, mode: 'view' | 'edit' | 'sign' | 'docsend') => {
    setSelectedDoc(doc);
    setIsSigningPowerFormMode(false);
    if (mode === 'edit') {
      setCurrentView('editor');
    } else if (mode === 'sign') {
      setCurrentView('sign');
    } else if (mode === 'docsend') {
      setCurrentView('docsend');
    } else {
      setCurrentView('view');
    }
  };

  // Create document simulation (prompt for uploaded title)
  const handleCreateDocument = () => {
    const title = prompt('Enter name for the new document envelope:', 'Employment Agreement (Standard).pdf');
    if (!title) return;

    const newDoc: PDFDocument = {
      id: `doc-${Date.now()}`,
      title,
      status: 'draft',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      creator: 'Sarah Connor',
      folder: 'drafts',
      pages: createSamplePages(title.replace(/\s+/g, '-').toLowerCase(), 2),
      fields: [],
      drawings: [],
      recipients: [
        { id: `rec-1`, name: 'Client Recipient', email: 'client@example.com', role: 'Client', order: 1, status: 'pending', verificationType: 'none' }
      ],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'Document Uploaded',
          user: 'Sarah Connor',
          ipAddress: '192.168.1.10',
          details: 'Uploaded PDF binary files from secure workstation browser.'
        }
      ]
    };

    setDocuments([newDoc, ...documents]);
    setSelectedDoc(newDoc);
    setCurrentView('editor');
  };

  // Save document from designer editor
  const handleSaveDoc = (updatedDoc: PDFDocument) => {
    setDocuments(documents.map(d => d.id === updatedDoc.id ? updatedDoc : d));
  };

  // Signer complete callback
  const handleExecuteDoc = (executedDoc: PDFDocument) => {
    setDocuments(documents.map(d => d.id === executedDoc.id ? executedDoc : d));
    // Close sign view
    setSelectedDoc(null);
    setCurrentView('dashboard');
  };

  // Reminders simulation
  const handleSendReminder = (recipientId: string) => {
    alert('Auto-Reminder Sent!\nWe have delivered a secure branded SMS and email reminder to the signer with execution links.');
  };

  const handleDeleteDoc = (id: string) => {
    setDocuments(documents.filter(d => d.id !== id));
  };

  // Use reusable template trigger
  const handleUseTemplate = (tpl: PDFDocument) => {
    const copy: PDFDocument = {
      ...tpl,
      id: `envelope-${Date.now()}`,
      title: `${tpl.title} (Copy).pdf`,
      status: 'draft',
      isTemplate: false,
      folder: 'drafts',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          action: 'Created from Template',
          user: 'Sarah Connor',
          ipAddress: '192.168.1.10',
          details: `Copied form structure and fields from shared team template: ${tpl.title}`
        }
      ]
    };
    setDocuments([copy, ...documents]);
    setSelectedDoc(copy);
    setCurrentView('editor');
  };

  const handleSimulatePowerForm = (pf: PDFDocument) => {
    setSelectedDoc(pf);
    setIsSigningPowerFormMode(true);
    setCurrentView('sign');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      {/* Sidebar Navigation */}
      <div className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 shrink-0 border-r border-slate-800">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div 
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md"
              style={{ backgroundColor: branding.primaryColor }}
            >
              SF
            </div>
            <span className="font-bold text-white text-base tracking-wide">SignFlow Studio</span>
          </div>
          <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20">
            v2.6
          </span>
        </div>

        {/* Sidebar Links */}
        <div className="flex-grow p-4 space-y-1 overflow-y-auto">
          <button
            onClick={() => {
              setCurrentView('dashboard');
              setCurrentFolder('all');
            }}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'dashboard' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Layers className="w-5 h-5" /> All Documents
          </button>

          <button
            onClick={() => setCurrentView('ai-assistant')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'ai-assistant' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Bot className="w-5 h-5 text-blue-400" /> Specialist AI Copilot
          </button>

          <button
            onClick={() => setCurrentView('docsend')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'docsend' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Send className="w-5 h-5 text-indigo-400" /> DocSend Tracking
          </button>
          
          <button
            onClick={() => setCurrentView('templates')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'templates' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-5 h-5 text-purple-400" /> Shared Templates
          </button>

          <button
            onClick={() => setCurrentView('powerforms')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'powerforms' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-5 h-5 text-emerald-400" /> PowerForms Portal
          </button>

          <button
            onClick={() => setCurrentView('branding')}
            className={`w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 font-semibold transition ${
              currentView === 'branding' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/10' : 'hover:bg-slate-800/60'
            }`}
          >
            <Settings className="w-5 h-5 text-blue-400" /> Branded Experience
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center">
              SC
            </div>
            <div>
              <p className="font-bold text-white">Sarah Connor</p>
              <p className="text-slate-500">Enterprise Admin</p>
            </div>
          </div>
          <button title="Sign Out" className="p-1.5 hover:bg-slate-800 rounded-lg">
            <LogOut className="w-4 h-4 text-slate-500 hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Main Content Pane */}
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Mobile Navbar Header */}
        <div className="md:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between shadow">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-xs">
              SF
            </div>
            <span className="font-bold text-sm">SignFlow Studio</span>
          </div>
          
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-1 hover:bg-slate-800 rounded">
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-2 z-40 relative text-slate-300">
            <button
              onClick={() => {
                setCurrentView('dashboard');
                setCurrentFolder('all');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Layers className="w-4 h-4" /> All Files
            </button>
            <button
              onClick={() => {
                setCurrentView('ai-assistant');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-blue-400" /> AI Copilot
            </button>
            <button
              onClick={() => {
                setCurrentView('docsend');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Send className="w-4 h-4 text-indigo-400" /> DocSend Tracking
            </button>
            <button
              onClick={() => {
                setCurrentView('templates');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-purple-400" /> Templates
            </button>
            <button
              onClick={() => {
                setCurrentView('powerforms');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-400" /> PowerForms
            </button>
            <button
              onClick={() => {
                setCurrentView('branding');
                setIsMobileMenuOpen(false);
              }}
              className="w-full text-left p-2.5 rounded-lg text-sm font-semibold flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-blue-400" /> Branding
            </button>
          </div>
        )}

        {/* Scrollable Core body router */}
        <div className="flex-1 overflow-y-auto">
          {currentView === 'dashboard' && (
            <Dashboard
              documents={documents}
              onSelectDoc={handleSelectDoc}
              onCreateDoc={handleCreateDocument}
              onSetFolder={setCurrentFolder}
              currentFolder={currentFolder}
              setView={setCurrentView}
              onDeleteDoc={handleDeleteDoc}
            />
          )}

          {currentView === 'editor' && selectedDoc && (
            <DocumentEditor
              document={selectedDoc}
              branding={branding}
              onSave={handleSaveDoc}
              onBack={() => {
                setSelectedDoc(null);
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'sign' && selectedDoc && (
            <SignaturePortal
              document={selectedDoc}
              branding={branding}
              isPowerFormMode={isSigningPowerFormMode}
              onExecute={handleExecuteDoc}
              onBack={() => {
                setSelectedDoc(null);
                setCurrentView('dashboard');
              }}
            />
          )}

          {currentView === 'view' && selectedDoc && (
            <DocumentDetail
              document={selectedDoc}
              onBack={() => {
                setSelectedDoc(null);
                setCurrentView('dashboard');
              }}
              onDelete={handleDeleteDoc}
              onSendReminder={handleSendReminder}
            />
          )}

          {currentView === 'branding' && (
            <BrandingPanel
              branding={branding}
              onSave={(newBranding) => setBranding(newBranding)}
              onBack={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'templates' && (
            <TemplatePanel
              documents={documents}
              team={team}
              onBack={() => setCurrentView('dashboard')}
              onUseTemplate={handleUseTemplate}
              onAddTeamMember={(m) => setTeam([...team, { ...m, id: `member-${Date.now()}` }])}
              onDeleteTeamMember={(id) => setTeam(team.filter(t => t.id !== id))}
            />
          )}

          {currentView === 'powerforms' && (
            <PowerFormPanel
              documents={documents}
              onBack={() => setCurrentView('dashboard')}
              onSimulatePowerForm={handleSimulatePowerForm}
            />
          )}

          {currentView === 'ai-assistant' && (
            <AiAssistant
              documents={documents}
              onSelectDoc={handleSelectDoc}
            />
          )}

          {currentView === 'docsend' && (
            <DocSendPanel
              documents={documents}
              onBack={() => setCurrentView('dashboard')}
              onUpdateDocumentList={(updatedDocs) => setDocuments(updatedDocs)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
