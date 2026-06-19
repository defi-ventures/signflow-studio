import React, { useState, useEffect } from 'react';
import { 
  Send, Link, Eye, Shield, Lock, Calendar, Download, RefreshCw, 
  Mail, Users, CheckCircle, ToggleLeft, ToggleRight, Trash2, 
  ChevronRight, AlertCircle, FileText, Plus, HelpCircle, X, ExternalLink
} from 'lucide-react';
import { PDFDocument, DocSendLink, DocSendVisitor, PreViewQuestion } from '../types';

interface DocSendPanelProps {
  documents: PDFDocument[];
  onBack: () => void;
  onUpdateDocumentList: (updatedDocs: PDFDocument[]) => void;
}

export default function DocSendPanel({ documents, onBack, onUpdateDocumentList }: DocSendPanelProps) {
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeLinkId, setActiveLinkId] = useState<string>('');
  
  // Link creator form state
  const [newLinkName, setNewLinkName] = useState('');
  const [requireEmail, setRequireEmail] = useState(true);
  const [requireNda, setRequireNda] = useState(false);
  const [allowDownload, setAllowDownload] = useState(true);
  const [passwordProtection, setPasswordProtection] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // custom questions builder
  const [questions, setQuestions] = useState<PreViewQuestion[]>([]);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<'text' | 'yesno'>('text');

  // Direct email sharing form state
  const [shareEmails, setShareEmails] = useState('');
  const [shareSubject, setShareSubject] = useState('');
  const [shareBody, setShareBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // File replacement simulator state
  const [isReplacingFile, setIsReplacingFile] = useState(false);
  const [replaceTargetDocId, setReplaceTargetDocId] = useState('');

  // Visitor portal simulator state
  const [simVisitorLink, setSimVisitorLink] = useState<DocSendLink | null>(null);
  const [simVisitorDoc, setSimVisitorDoc] = useState<PDFDocument | null>(null);
  const [simEmail, setSimEmail] = useState('');
  const [simPassword, setSimPassword] = useState('');
  const [simNdaAccepted, setSimNdaAccepted] = useState(false);
  const [simAnswers, setSimAnswers] = useState<Record<string, string>>({});
  const [simActivePage, setSimActivePage] = useState(1);
  const [simPageStats, setSimPageStats] = useState<Record<number, number>>({});
  const [simTimeElapsed, setSimTimeElapsed] = useState(0);
  const [simGateUnlocked, setSimGateUnlocked] = useState(false);
  const [simPortalMessage, setSimPortalMessage] = useState('');

  const activeDoc = documents.find(d => d.id === selectedDocId);
  const activeLink = activeDoc?.docSendLinks?.find(l => l.id === activeLinkId);

  // Auto-initialize first document
  useEffect(() => {
    if (documents.length > 0 && !selectedDocId) {
      setSelectedDocId(documents[0].id);
    }
  }, [documents, selectedDocId]);

  // Handle active link changes
  useEffect(() => {
    if (activeDoc?.docSendLinks && activeDoc.docSendLinks.length > 0) {
      if (!activeLinkId || !activeDoc.docSendLinks.some(l => l.id === activeLinkId)) {
        setActiveLinkId(activeDoc.docSendLinks[0].id);
      }
    } else {
      setActiveLinkId('');
    }
  }, [selectedDocId, activeDoc]);

  // Visitor Portal page-timer simulator
  useEffect(() => {
    let timer: any;
    if (simGateUnlocked && simVisitorLink && simVisitorDoc) {
      timer = setInterval(() => {
        setSimTimeElapsed(t => t + 1);
        setSimPageStats(prev => ({
          ...prev,
          [simActivePage]: (prev[simActivePage] || 0) + 1
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [simGateUnlocked, simActivePage, simVisitorLink, simVisitorDoc]);

  // Add custom question to form
  const handleAddQuestion = () => {
    if (!newQuestionText.trim()) return;
    const newQ: PreViewQuestion = {
      id: `q-${Date.now()}`,
      text: newQuestionText.trim(),
      type: newQuestionType
    };
    setQuestions([...questions, newQ]);
    setNewQuestionText('');
  };

  const handleRemoveQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  // Create standard DocSend secure link
  const handleCreateLink = () => {
    if (!selectedDocId || !activeDoc) return;
    if (!newLinkName.trim()) {
      alert('Please provide a secure link access name.');
      return;
    }

    const timestamp = new Date().toISOString().substring(0, 10);
    const newLink: DocSendLink = {
      id: `dsl-${Date.now()}`,
      name: newLinkName.trim(),
      createdAt: timestamp,
      isActive: true,
      requireEmail,
      requireNda,
      allowDownload,
      passwordProtection: passwordProtection.trim() || undefined,
      expiryDate: expiryDate || undefined,
      questions: [...questions],
      visitors: []
    };

    const currentLinks = activeDoc.docSendLinks || [];
    const updatedDoc: PDFDocument = {
      ...activeDoc,
      docSendLinks: [...currentLinks, newLink]
    };

    const updatedDocuments = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocuments);

    // Reset Form
    setNewLinkName('');
    setRequireEmail(true);
    setRequireNda(false);
    setAllowDownload(true);
    setPasswordProtection('');
    setExpiryDate('');
    setQuestions([]);
    setActiveLinkId(newLink.id);

    alert(`Secure DocSend link "${newLink.name}" has been generated successfully! You can copy the tracking URL, set up distribution lists, or send direct emails instantly.`);
  };

  // Toggle active status manually
  const handleToggleLinkActive = (linkId: string) => {
    if (!activeDoc) return;
    const updatedLinks = (activeDoc.docSendLinks || []).map(l => {
      if (l.id === linkId) {
        return { ...l, isActive: !l.isActive };
      }
      return l;
    });

    const updatedDoc = { ...activeDoc, docSendLinks: updatedLinks };
    const updatedDocs = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocs);
  };

  // Delete a link
  const handleDeleteLink = (linkId: string) => {
    if (!activeDoc || !confirm('Are you sure you want to delete this link? Analytics history will be permanently wiped.')) return;
    const updatedLinks = (activeDoc.docSendLinks || []).filter(l => l.id !== linkId);
    const updatedDoc = { ...activeDoc, docSendLinks: updatedLinks };
    const updatedDocs = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocs);
  };

  // Replace document file but maintain tracking URLs (Soda + DocSend combo)
  const handleReplaceSourceFile = () => {
    if (!selectedDocId || !replaceTargetDocId) return;
    const targetDoc = documents.find(d => d.id === replaceTargetDocId);
    if (!targetDoc) return;

    // We clone the targetDoc page layout onto our activeDoc, leaving activeDoc's docSendLinks intact
    const updatedDoc: PDFDocument = {
      ...activeDoc!,
      pages: [...targetDoc.pages],
      fields: [...targetDoc.fields],
      drawings: [...targetDoc.drawings]
    };

    const updatedDocs = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocs);
    setIsReplacingFile(false);
    setReplaceTargetDocId('');
    alert(`Source document payload updated! The secure links generated for "${activeDoc?.title}" will now render the page elements of "${targetDoc.title}" without altering any active distribution links or visitor URLs.`);
  };

  // Direct platform sharing trigger
  const handleSendDirectEmail = () => {
    if (!shareEmails.trim() || !activeLink) return;
    setIsSendingEmail(true);

    // Simulate enterprise distribution routing
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailSent(true);
      setShareEmails('');
      setTimeout(() => setIsEmailSent(false), 3000);
    }, 1500);
  };

  // Initialize Simulator Gated Session
  const handleLaunchVisitorSimulator = (link: DocSendLink) => {
    setSimVisitorLink(link);
    setSimVisitorDoc(activeDoc || null);
    setSimEmail('');
    setSimPassword('');
    setSimNdaAccepted(false);
    setSimAnswers({});
    setSimActivePage(1);
    setSimPageStats({});
    setSimTimeElapsed(0);
    setSimGateUnlocked(false);
    setSimPortalMessage('');
  };

  // Verify access conditions in Simulator
  const handleUnlockSimulatorAccess = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simVisitorLink) return;

    // 1. Expiry Check
    if (simVisitorLink.expiryDate) {
      const exp = new Date(simVisitorLink.expiryDate);
      if (exp < new Date()) {
        setSimPortalMessage('This tracking link has expired and is no longer accepting visitors.');
        return;
      }
    }

    // 2. Manual activation check
    if (!simVisitorLink.isActive) {
      setSimPortalMessage('This tracking link has been deactivated by the document owner.');
      return;
    }

    // 3. Email requirement check
    if (simVisitorLink.requireEmail && !simEmail.trim()) {
      setSimPortalMessage('Please enter your email to proceed.');
      return;
    }

    // 4. Password validation check
    if (simVisitorLink.passwordProtection && simPassword !== simVisitorLink.passwordProtection) {
      setSimPortalMessage('Incorrect access password.');
      return;
    }

    // 5. NDA agreement check
    if (simVisitorLink.requireNda && !simNdaAccepted) {
      setSimPortalMessage('You must agree to the Mutual NDA terms before viewing.');
      return;
    }

    // Unlock
    setSimPortalMessage('');
    setSimGateUnlocked(true);
  };

  // Execute Visitor session simulated closure
  const handleFinishSimulatorSession = () => {
    if (!simVisitorLink || !simVisitorDoc || !activeDoc) return;

    const timestamp = new Date().toISOString().substring(0, 16).replace('T', ' ');
    const newVisitor: DocSendVisitor = {
      id: `vst-${Date.now()}`,
      email: simVisitorLink.requireEmail ? simEmail : 'Anonymous Vis',
      joinedAt: timestamp,
      durationSeconds: simTimeElapsed,
      ndaAccepted: simVisitorLink.requireNda ? simNdaAccepted : undefined,
      answers: simVisitorLink.questions.length > 0 ? { ...simAnswers } : undefined,
      pageStats: { ...simPageStats }
    };

    const updatedLinks = (activeDoc.docSendLinks || []).map(l => {
      if (l.id === simVisitorLink.id) {
        return {
          ...l,
          visitors: [...l.visitors, newVisitor]
        };
      }
      return l;
    });

    const updatedDoc: PDFDocument = {
      ...activeDoc,
      docSendLinks: updatedLinks
    };

    const updatedDocs = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocs);

    // Close Simulator
    setSimVisitorLink(null);
    setSimVisitorDoc(null);
    alert('Simulated viewing session recorded! Real-time heatmaps and duration details are now available on the tracking dashboard.');
  };

  // Mock initial link data if document has none
  const handleInjectMockData = () => {
    if (!activeDoc) return;
    const mockLinks: DocSendLink[] = [
      {
        id: 'dsl-mock-1',
        name: 'Sequoia Pitch deck Route',
        createdAt: '2026-06-12',
        isActive: true,
        requireEmail: true,
        requireNda: true,
        allowDownload: false,
        passwordProtection: 'sequoia2026',
        questions: [
          { id: 'q-m1', text: 'Are you planning to follow-on in the next seed round?', type: 'yesno' }
        ],
        visitors: [
          {
            id: 'v-m1',
            email: 'partner@sequoiacap.com',
            joinedAt: '2026-06-14 10:11',
            durationSeconds: 142,
            ndaAccepted: true,
            answers: { 'Are you planning to follow-on in the next seed round?': 'Yes' },
            pageStats: { 1: 30, 2: 92, 3: 20 }
          },
          {
            id: 'v-m2',
            email: 'associate@sequoiacap.com',
            joinedAt: '2026-06-15 14:02',
            durationSeconds: 45,
            ndaAccepted: true,
            answers: { 'Are you planning to follow-on in the next seed round?': 'No' },
            pageStats: { 1: 15, 2: 30 }
          }
        ]
      },
      {
        id: 'dsl-mock-2',
        name: 'Public Website Download URL',
        createdAt: '2026-06-10',
        isActive: true,
        requireEmail: false,
        requireNda: false,
        allowDownload: true,
        questions: [],
        visitors: [
          {
            id: 'v-m3',
            email: 'Anonymous Vis',
            joinedAt: '2026-06-11 09:22',
            durationSeconds: 220,
            pageStats: { 1: 110, 2: 110 }
          }
        ]
      }
    ];

    const updatedDoc: PDFDocument = {
      ...activeDoc,
      docSendLinks: mockLinks
    };
    const updatedDocs = documents.map(d => d.id === selectedDocId ? updatedDoc : d);
    onUpdateDocumentList(updatedDocs);
    setActiveLinkId('dsl-mock-1');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      
      {/* Title Header */}
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Send className="w-7 h-7 text-indigo-600" /> Secure DocSend Tracking Panel
          </h1>
          <p className="text-sm text-slate-500">
            Securely distribute your PDFs with unique tracking links, gating options, survey responses, and real-time page-by-page duration maps.
          </p>
        </div>

        {/* Selected Document Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Document Target:</label>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.title} ({d.status.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {activeDoc && (!activeDoc.docSendLinks || activeDoc.docSendLinks.length === 0) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-800">
            <HelpCircle className="w-5 h-5 shrink-0" />
            <span>
              This document has no tracking links currently. You can set up custom links manually, or inject <strong>Pre-configured Sequoia and Public mock analytics</strong> instantly.
            </span>
          </div>
          <button
            onClick={handleInjectMockData}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg transition shrink-0"
          >
            Load Sample Analytics
          </button>
        </div>
      )}

      {/* Simulator Modal view */}
      {simVisitorLink && simVisitorDoc && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full h-[650px] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow">
              <div className="flex items-center gap-2">
                <ExternalLink className="w-5 h-5" />
                <h3 className="font-bold">Live Visitor Viewer Portal Simulator: "{simVisitorDoc.title}"</h3>
              </div>
              <button onClick={() => setSimVisitorLink(null)} className="p-1 hover:bg-white/20 rounded">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Gated verification screen */}
            {!simGateUnlocked ? (
              <form onSubmit={handleUnlockSimulatorAccess} className="flex-1 p-8 overflow-y-auto max-w-md mx-auto flex flex-col justify-center space-y-4">
                <div className="text-center space-y-2">
                  <Shield className="w-12 h-12 text-indigo-600 mx-auto" />
                  <h4 className="text-lg font-bold">Secure Access Requested</h4>
                  <p className="text-xs text-slate-400">Please complete the sender credentials below to gain entrance.</p>
                </div>

                {simPortalMessage && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" /> {simPortalMessage}
                  </div>
                )}

                <div className="space-y-3">
                  {simVisitorLink.requireEmail && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Enter your Email Address</label>
                      <input
                        type="email"
                        required
                        placeholder="e.g. guest@sequoiacap.com"
                        value={simEmail}
                        onChange={(e) => setSimEmail(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {simVisitorLink.passwordProtection && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">Enter Access Password</label>
                      <input
                        type="password"
                        required
                        placeholder="Request from sender"
                        value={simPassword}
                        onChange={(e) => setSimPassword(e.target.value)}
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {simVisitorLink.requireNda && (
                    <div className="bg-slate-50 border border-slate-100 p-3 rounded-lg space-y-2">
                      <div className="h-20 overflow-y-auto border-b border-slate-200 pb-2 text-[10px] text-slate-400 leading-relaxed font-mono">
                        MUTUAL NON-DISCLOSURE CLAUSES: The receiving party agrees to maintain strict confidentiality of all intellectual files, metrics, valuations, and covenants compiled in this digital container...
                      </div>
                      <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={simNdaAccepted}
                          onChange={(e) => setSimNdaAccepted(e.target.checked)}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Accept and Sign NDA Terms
                      </label>
                    </div>
                  )}

                  {simVisitorLink.questions.map((q) => (
                    <div key={q.id}>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">{q.text}</label>
                      {q.type === 'yesno' ? (
                        <select
                          required
                          value={simAnswers[q.text] || ''}
                          onChange={(e) => setSimAnswers({ ...simAnswers, [q.text]: e.target.value })}
                          className="w-full border border-slate-200 bg-white rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        >
                          <option value="">-- Choose Option --</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <input
                          type="text"
                          required
                          placeholder="Type answer..."
                          value={simAnswers[q.text] || ''}
                          onChange={(e) => setSimAnswers({ ...simAnswers, [q.text]: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg transition shadow-md"
                >
                  Confirm & View Document
                </button>
              </form>
            ) : (
              /* Inside unlocked portal display page */
              <div className="flex-grow flex overflow-hidden">
                {/* Left hand viewer canvas */}
                <div className="flex-1 bg-slate-100 overflow-y-auto p-8 flex flex-col items-center justify-start space-y-4">
                  <div className="bg-white border border-slate-300 shadow-xl w-[450px] h-[580px] relative select-none rounded p-12 text-center flex flex-col justify-between">
                    <div>
                      <h4 className="text-xl font-bold text-slate-800 border-b pb-2 mb-4">{simVisitorDoc.title}</h4>
                      <div className="text-xs text-slate-400 uppercase tracking-widest block font-bold mb-8">Page {simActivePage}</div>
                      
                      {/* Simulated Page Contents */}
                      <p className="text-xs text-slate-500 leading-relaxed text-left font-serif">
                        {simActivePage === 1 && "This is page 1 of the secure document container. It outlines our strategic milestones, strategic covenants, market shares, and executive summaries. Examine each clause carefully."}
                        {simActivePage === 2 && "This is page 2. This sections focuses heavily on finance, accounts receivable schedules, balance sheets, debt multiples, and strategic valuation models."}
                        {simActivePage === 3 && "This is page 3. Legal and governing jurisdictions, severability nodes, NDA requirements, and general administrative directives."}
                      </p>
                    </div>

                    <div className="text-[10px] text-slate-400 italic">
                      SECURELY MONITORED BY SIGNFLOW DOCSEND ROUTING
                    </div>
                  </div>
                </div>

                {/* Right hand controls dashboard */}
                <div className="w-80 border-l border-slate-100 bg-slate-50 p-6 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Live Session Logger:</span>
                    
                    <div className="bg-white p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Active Viewer:</span>
                        <span className="font-bold text-slate-700 truncate max-w-[140px]">{simEmail || "Anonymous"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Duration:</span>
                        <span className="font-mono font-bold text-slate-700">{simTimeElapsed} seconds</span>
                      </div>
                    </div>

                    {/* Page navigation list */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Interactive Pages:</span>
                      {simVisitorDoc.pages.map((p) => {
                        const isActive = simActivePage === p.pageNumber;
                        return (
                          <button
                            key={p.id}
                            onClick={() => setSimActivePage(p.pageNumber)}
                            className={`w-full text-left px-3 py-2 rounded-xl border text-xs font-semibold transition flex justify-between items-center ${
                              isActive 
                                ? 'bg-indigo-50 border-indigo-100 text-indigo-700 font-bold'
                                : 'bg-white border-transparent hover:bg-slate-100 text-slate-600'
                            }`}
                          >
                            <span>Page {p.pageNumber}</span>
                            <span className="text-[10px] font-mono text-slate-400">Spent: {simPageStats[p.pageNumber] || 0}s</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {simVisitorLink.allowDownload ? (
                      <button 
                        onClick={() => alert('Secure file downloaded!')}
                        className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Document
                      </button>
                    ) : (
                      <div className="text-center text-[10px] text-red-500 font-bold bg-red-50 border border-red-100 py-1.5 rounded">
                        Download permissions disabled
                      </div>
                    )}

                    <button
                      onClick={handleFinishSimulatorSession}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1"
                    >
                      Close Viewer & Save Stats <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Generated Links & Configuration Panel (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Links List Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Active Tracking Links</h3>
            
            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {(activeDoc?.docSendLinks || []).map(link => {
                const isActive = link.isActive;
                const isSelected = activeLinkId === link.id;
                return (
                  <div
                    key={link.id}
                    onClick={() => setActiveLinkId(link.id)}
                    className={`p-3 rounded-xl border transition cursor-pointer flex justify-between items-start gap-2 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/20' 
                        : 'border-slate-100 bg-slate-50 hover:bg-slate-100/50'
                    }`}
                  >
                    <div className="space-y-1.5 truncate max-w-[70%]">
                      <div className="flex items-center gap-1.5">
                        <Link className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                        <h4 className="font-bold text-slate-800 text-xs truncate">{link.name}</h4>
                      </div>
                      <span className="text-[10px] text-slate-400 block font-semibold uppercase tracking-wider">
                        Created {link.createdAt} • {link.visitors.length} visitors
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {/* Manual Activation Switch */}
                      <button
                        onClick={() => handleToggleLinkActive(link.id)}
                        className={`p-1 rounded hover:bg-slate-200 transition ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}
                        title={isActive ? 'Deactivate Link manually' : 'Activate Link manually'}
                      >
                        {isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                      </button>

                      {/* Launch simulator */}
                      <button
                        onClick={() => handleLaunchVisitorSimulator(link)}
                        className="p-1 hover:bg-slate-200 rounded transition text-slate-600"
                        title="Simulate visitor session"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>

                      {/* Remove link */}
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="p-1 hover:bg-slate-200 hover:text-red-500 rounded transition text-slate-400"
                        title="Delete Secure URL"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {(!activeDoc?.docSendLinks || activeDoc.docSendLinks.length === 0) && (
                <div className="text-center p-6 text-xs text-slate-400 italic">
                  No active tracking links. Generate your first tracking URL below.
                </div>
              )}
            </div>
          </div>

          {/* Secure Link Creator Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2 flex items-center gap-1">
              <Plus className="w-4 h-4 text-indigo-500" /> Create Custom Secure Link
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-semibold mb-1">Link Name / Tracking Group</label>
                <input
                  type="text"
                  placeholder="e.g., Sequoia Capital Investor Pitch"
                  value={newLinkName}
                  onChange={(e) => setNewLinkName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              {/* Security Toggles */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireEmail}
                    onChange={(e) => setRequireEmail(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Require Email Gating
                </label>

                <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireNda}
                    onChange={(e) => setRequireNda(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Require Signed NDA
                </label>

                <label className="flex items-center gap-1.5 font-semibold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowDownload}
                    onChange={(e) => setAllowDownload(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Allow File Download
                </label>
              </div>

              {/* Password & Expiry */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Lock className="w-3.5 h-3.5" /> Password Protection
                  </label>
                  <input
                    type="password"
                    placeholder="None"
                    value={passwordProtection}
                    onChange={(e) => setPasswordProtection(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" /> Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Pre-view Questions constructor */}
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600 block">Pre-View Survey Questions:</span>
                  <span className="text-[10px] text-slate-400 font-medium">Capture answers prior to load</span>
                </div>

                {/* Question List */}
                <div className="space-y-1">
                  {questions.map((q) => (
                    <div key={q.id} className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="truncate max-w-[80%] font-medium text-slate-700">{q.text} ({q.type.toUpperCase()})</span>
                      <button onClick={() => handleRemoveQuestion(q.id)} className="text-red-500 hover:bg-red-50 p-0.5 rounded">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Builder inputs */}
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="e.g. Investment timeline?"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    className="flex-grow border border-slate-200 rounded-lg px-2 py-1.5"
                  />
                  <select
                    value={newQuestionType}
                    onChange={(e) => setNewQuestionType(e.target.value as any)}
                    className="border border-slate-200 rounded-lg px-1 py-1.5 bg-white text-slate-600"
                  >
                    <option value="text">Text</option>
                    <option value="yesno">Y/N</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg transition"
                  >
                    Add
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateLink}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-lg transition shadow-md mt-2 flex items-center justify-center gap-1"
              >
                Create Secure Tracking Link <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Analytics Dashboard, Gated Sharing & File Replacement (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Link Analytics Details Card */}
          {activeLink ? (
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <div className="border-b border-slate-50 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <Users className="w-4.5 h-4.5 text-indigo-500" /> Link Tracking Directory: "{activeLink.name}"
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Email gate: {activeLink.requireEmail ? 'ON' : 'OFF'}</span>
                    <span>•</span>
                    <span>NDA gate: {activeLink.requireNda ? 'ON' : 'OFF'}</span>
                    <span>•</span>
                    <span>Expiry: {activeLink.expiryDate || 'Unlimited'}</span>
                  </div>
                </div>

                {/* Tracking URL Badge */}
                <div className="bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1 truncate max-w-[220px]">
                  <Link className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">signflow.com/dsl/{activeLink.id}</span>
                </div>
              </div>

              {/* Summary stats grids */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Total Visitors</span>
                  <span className="text-xl font-black text-slate-700 block">{activeLink.visitors.length}</span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Avg. Time spent</span>
                  <span className="text-xl font-black text-slate-700 block">
                    {activeLink.visitors.length > 0 
                      ? `${Math.round(activeLink.visitors.reduce((acc, v) => acc + v.durationSeconds, 0) / activeLink.visitors.length)}s` 
                      : '0s'}
                  </span>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">NDA Execution</span>
                  <span className="text-xl font-black text-slate-700 block">
                    {activeLink.visitors.filter(v => v.ndaAccepted).length}
                  </span>
                </div>
              </div>

              {/* Visitors Ledger */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Access History Details:</span>
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto">
                  {activeLink.visitors.map((visitor) => (
                    <div key={visitor.id} className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-2 text-xs">
                      <div className="flex justify-between items-center border-b border-slate-200/50 pb-1.5">
                        <span className="font-bold text-slate-700">{visitor.email || 'Anonymous'}</span>
                        <span className="text-[10px] text-slate-400">{visitor.joinedAt}</span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
                        <div>
                          <span className="font-medium">Total Duration:</span> <span className="font-bold text-slate-700">{visitor.durationSeconds}s</span>
                        </div>
                        {visitor.ndaAccepted !== undefined && (
                          <div>
                            <span className="font-medium">NDA signed:</span> <span className="font-bold text-emerald-600">YES ✓</span>
                          </div>
                        )}
                      </div>

                      {/* Survey answers details */}
                      {visitor.answers && Object.keys(visitor.answers).length > 0 && (
                        <div className="bg-white p-2.5 rounded-lg border border-slate-200/60 space-y-1 text-[10px]">
                          <span className="font-bold text-slate-500 uppercase tracking-wider block text-[9px]">Survey Feedback:</span>
                          {Object.entries(visitor.answers).map(([q, ans], i) => (
                            <div key={i}>
                              <span className="text-slate-400 font-medium">{q}</span> <span className="font-bold text-slate-700 italic">"{ans}"</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Heatmap duration list */}
                      {visitor.pageStats && Object.keys(visitor.pageStats).length > 0 && (
                        <div className="space-y-1">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Page-by-page Duration Heatmap:</span>
                          <div className="flex gap-1.5">
                            {Object.entries(visitor.pageStats).map(([page, sec]) => (
                              <div key={page} className="bg-indigo-50 border border-indigo-100 rounded px-2 py-1 text-[10px] text-center min-w-[70px]">
                                <span className="block text-slate-400 font-semibold text-[8px]">Page {page}</span>
                                <span className="font-bold text-indigo-700 font-mono">{sec}s</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {activeLink.visitors.length === 0 && (
                    <p className="text-center text-xs text-slate-400 italic py-6">
                      No visitors have accessed this tracking URL yet. Use the simulator above to verify logging configurations.
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm space-y-3">
              <Eye className="w-12 h-12 mx-auto stroke-1 text-slate-300 animate-pulse" />
              <div>
                <h4 className="font-bold text-slate-700">Link Analytics Dashboard</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Select a tracking link from the left-hand ledger to examine click rates, survey metrics, and heatmap logs.
                </p>
              </div>
            </div>
          )}

          {/* DocSend Combo Actions Block (Email Sharing + File Replacement) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Direct Platform Emailer Gating */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1">
                <Mail className="w-4 h-4 text-indigo-500" /> Direct Email Gating
              </h4>
              <p className="text-xs text-slate-400">Send unique secure tracking URLs directly to one or multiple recipients from the platform.</p>

              <div className="space-y-2.5 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">To: Recipient Emails (comma separated)</label>
                  <input
                    type="text"
                    required
                    placeholder="sequoia@cap.com, funding@firm.com"
                    value={shareEmails}
                    onChange={(e) => setShareEmails(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Secure files regarding Seed A Proposal"
                    value={shareSubject}
                    onChange={(e) => setShareSubject(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Message Body</label>
                  <textarea
                    rows={2}
                    placeholder="We have attached our milestone tracking layout via a secure link..."
                    value={shareBody}
                    onChange={(e) => setShareBody(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2 focus:outline-none"
                  />
                </div>

                {isEmailSent && (
                  <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg p-2 font-bold text-[10px] text-center">
                    Distribution loop executed! Secure emails sent successfully.
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSendDirectEmail}
                  disabled={isSendingEmail || !shareEmails.trim() || !activeLink}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg transition flex items-center justify-center gap-1 shadow-sm"
                >
                  {isSendingEmail ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Routing SMTP servers...
                    </>
                  ) : (
                    <>
                      Distribute Secure Link <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Soda Editor payload switcher: Update file without changing link URL */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider border-b border-slate-50 pb-2 flex items-center gap-1">
                <RefreshCw className="w-4 h-4 text-indigo-500" /> Hot Update Source Payload
              </h4>
              <p className="text-xs text-slate-400">
                Replace the background canvas pages and field coordinates for "{activeDoc?.title}" while keeping all generated URLs identical.
              </p>

              {!isReplacingFile ? (
                <div className="space-y-3 pt-2">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] leading-relaxed text-slate-500">
                    With DocSend technology, you can upload and apply an entirely new design or page content behind existing tracking URLs. This prevents broken links in old email threads.
                  </div>
                  <button
                    onClick={() => setIsReplacingFile(true)}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-2 rounded-lg transition text-xs flex items-center justify-center gap-1"
                  >
                    Swap Source PDF File <FileText className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Select New Source payload:</label>
                    <select
                      value={replaceTargetDocId}
                      onChange={(e) => setReplaceTargetDocId(e.target.value)}
                      className="w-full border border-slate-200 bg-white rounded-lg px-2.5 py-1.5 text-xs"
                    >
                      <option value="">-- Choose New File --</option>
                      {documents.filter(d => d.id !== selectedDocId).map(d => (
                        <option key={d.id} value={d.id}>{d.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-1.5 pt-2">
                    <button
                      onClick={() => setIsReplacingFile(false)}
                      className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-2 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReplaceSourceFile}
                      disabled={!replaceTargetDocId}
                      className="w-2/3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-1 shadow-sm"
                    >
                      Update & Save Links <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
