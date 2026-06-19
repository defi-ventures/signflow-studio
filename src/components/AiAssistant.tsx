import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, Brain, Save, Search, Sparkles, Send, ShieldAlert, BookOpen, 
  Trash2, Landmark, DollarSign, Scale, ArrowRight, MessageSquare, ChevronDown
} from 'lucide-react';
import { PDFDocument, ChatMessage, SpecialistRole, SpecialistMemoryEntry } from '../types';

interface AiAssistantProps {
  documents: PDFDocument[];
  onSelectDoc: (doc: PDFDocument, mode: 'view' | 'edit' | 'sign' | 'docsend') => void;
}

interface SpecialistProfile {
  id: SpecialistRole;
  title: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  borderColor: string;
  welcomeMessage: string;
}

export default function AiAssistant({ documents, onSelectDoc }: AiAssistantProps) {
  // Specialist Profiles Configurations
  const specialists: SpecialistProfile[] = [
    {
      id: 'legal',
      title: 'Senior Corporate Counsel',
      name: 'Elena Vance, Esq.',
      description: 'Specializes in contract compliance, liability limits, risk mitigation, and regulatory clauses.',
      icon: Scale,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-100',
      welcomeMessage: 'Hello. I am Elena Vance, Senior Corporate Counsel. I will scan this document for contract risk, indemnification loops, non-disclosure compliance, and standard ESIGN/eIDAS validity. What specific clause are we auditing?'
    },
    {
      id: 'accounting',
      title: 'Principal Forensic Accountant',
      name: 'Marcus Brody, CPA',
      description: 'Specializes in tax classifications (W-9), cashflow risk, billing schedules, and ledger reconciliation.',
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100',
      welcomeMessage: 'Hello. Marcus Brody here. I focus on the cashflow, payment requested objects, fiscal terms, and contractor validation. Let\'s make sure these financial objects match standard tax schedules.'
    },
    {
      id: 'banking',
      title: 'Managing Investment Banker',
      name: 'Sterling Archer, MBA',
      description: 'Specializes in valuations, covenants, transaction routing, and strategic merger clauses.',
      icon: Landmark,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-100',
      welcomeMessage: 'Welcome. I am Sterling Archer. I specialize in valuation multiples, transactional liability, funding thresholds, and strategic financial structures. Let\'s evaluate this deal for maximum leverage.'
    }
  ];

  // State Management
  const [selectedDocId, setSelectedDocId] = useState<string>('');
  const [activeSpecialistId, setActiveSpecialistId] = useState<SpecialistRole>('legal');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({});
  const [userInput, setUserInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [knowledgeBaseMemories, setKnowledgeBaseMemories] = useState<Record<SpecialistRole, SpecialistMemoryEntry[]>>({
    legal: [],
    accounting: [],
    banking: []
  });

  // Chat message scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, activeSpecialistId, selectedDocId]);

  // Handle selected document changing
  const activeDoc = documents.find(d => d.id === selectedDocId);

  // Initialize Welcome Message when changing Specialist or Document
  useEffect(() => {
    if (!selectedDocId) return;
    const chatKey = `${selectedDocId}-${activeSpecialistId}`;
    if (!chatHistory[chatKey]) {
      const specialist = specialists.find(s => s.id === activeSpecialistId)!;
      const initialMsg: ChatMessage = {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: specialist.welcomeMessage,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => ({
        ...prev,
        [chatKey]: [initialMsg]
      }));
    }
  }, [selectedDocId, activeSpecialistId]);

  const activeChatKey = `${selectedDocId}-${activeSpecialistId}`;
  const currentMessages = chatHistory[activeChatKey] || [];

  // Simulate specialist response logic with specialized domain knowledge
  const generateSpecialistResponse = (docTitle: string, fieldCount: number, userQuery: string, specId: SpecialistRole): string => {
    const query = userQuery.toLowerCase();
    
    // Legal responses
    if (specId === 'legal') {
      if (query.includes('risk') || query.includes('indemn') || query.includes('liability')) {
        return `AUDIT RISK ANALYSIS: The document "${docTitle}" exhibits standard corporate bindings. However, we must review the indemnification loops. If the Tenant or Disclosing Party bears unlimited liability without a specified cap (e.g., 1x or 2x contract value), the legal posture remains HIGH-RISK. I recommend injecting a strict 'Limitation of Liability' clause.`;
      }
      if (query.includes('sign') || query.includes('signature') || query.includes('esign')) {
        return `LEGAL SIGNATURE COMPLIANCE: With ${fieldCount} interaction fields mapped, this layout complies with basic ESIGN guidelines (electronic symbols logically associated with the record). Since we have enforced identity checkpoints like multi-factor code checks, the contract will be highly defensible in court under eIDAS Article 25 guidelines.`;
      }
      return `AUDIT ANALYSIS FOR "${docTitle}": I have scanned the body clauses. Under strict corporate guidelines, I suggest verifying that the jurisdiction/Governing Law matches our standard headquarters (Delaware). We should also double-check whether a 'Severability' clause exists so that any voided terms do not dissolve the whole agreement.`;
    }

    // Accounting responses
    if (specId === 'accounting') {
      if (query.includes('tax') || query.includes('w9') || query.includes('classification')) {
        return `TAX AUDIT REPORT: Reviewing the layout for tax schedules. If this is a W-9 scenario, checking LLC classifications is vital. We have categorized individual tax classifications. Make sure the 'SSN' and 'EIN' entry boxes are clearly partitioned to avoid backup withholding issues under Section 3406.`;
      }
      if (query.includes('payment') || query.includes('fee') || query.includes('money') || query.includes('price')) {
        return `FINANCIAL AUDIT: Checking payment structures in "${docTitle}". I detected specific payment nodes of simulated fee triggers. Remember, to keep the bookkeeping simple, any transaction fee should be automatically mapped into our QuickBooks ledger using standard Stripe transaction objects. Let's ensure the invoice details are locked before sending.`;
      }
      return `FINANCIAL REPORT FOR "${docTitle}": Reviewing the financial components. I advise setting up explicit due dates or 'Late Payment' penalty interest rates (e.g. 1.5% per month) on the main document canvas. This reduces outstanding accounts receivable (A/R) delay issues significantly.`;
    }

    // Banking responses
    if (specId === 'banking') {
      if (query.includes('deal') || query.includes('multiples') || query.includes('valuation') || query.includes('ebitda')) {
        return `DEAL MERGER ADVISORY: Analyzing covenants for "${docTitle}". When negotiating EBITDA valuation multiples or strategic acquisitions, make sure the leverage covenants (debt-to-equity ceilings) are clearly documented in the Appendix. We must verify that no 'Change of Control' clauses trigger a mandatory debt acceleration or pre-payment penalty.`;
      }
      if (query.includes('covenant') || query.includes('guarantee')) {
        return `COVENANT AUDIT: Let's review the debt service coverage ratio (DSCR). If this document binds strategic capital assets, we need to guarantee that the operational covenants do not restrict our secondary equity issuance limits.`;
      }
      return `DEAL ADVISORY REPORT: I have audited "${docTitle}" for transactional strategic viability. The strategic language is solid. I advise setting up a post-execution redirection link directly into the deal-room vault to coordinate secondary diligence rounds quickly.`;
    }

    return `I have parsed the terms in "${docTitle}". Let's double check standard provisions or create a dedicated layout model. Let me know if you need any specific structural revisions.`;
  };

  // Submit Question to Specialist AI
  const handleSendMessage = () => {
    if (!userInput.trim() || !selectedDocId || !activeDoc) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const chatKey = activeChatKey;
    setChatHistory(prev => ({
      ...prev,
      [chatKey]: [...(prev[chatKey] || []), userMsg]
    }));

    const savedInput = userInput;
    setUserInput('');
    setIsAiTyping(true);

    // Simulated network delay for professional AI processing
    setTimeout(() => {
      const specResponseText = generateSpecialistResponse(
        activeDoc.title,
        activeDoc.fields.length,
        savedInput,
        activeSpecialistId
      );

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: specResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => ({
        ...prev,
        [chatKey]: [...(prev[chatKey] || []), aiMsg]
      }));
      setIsAiTyping(false);
    }, 1200);
  };

  // Keep Document in Specialist's Long-term Memory
  const handleSaveToSpecialistMemory = () => {
    if (!selectedDocId || !activeDoc) return;

    const memories = knowledgeBaseMemories[activeSpecialistId];
    const alreadySaved = memories.some(m => m.documentId === selectedDocId);

    if (alreadySaved) {
      alert(`The document "${activeDoc.title}" is already stored in the long-term knowledge memory of ${specialists.find(s => s.id === activeSpecialistId)!.name}.`);
      return;
    }

    const currentNotes = prompt(
      `Save document details in memory for future legal/accounting linking. Add customized specialist instruction notes (optional):`,
      `Governing Law: Delaware. Verified contract elements for ${activeDoc.title}.`
    );

    const newMemory: SpecialistMemoryEntry = {
      documentId: selectedDocId,
      documentTitle: activeDoc.title,
      savedAt: new Date().toISOString().substring(0, 10) + ' ' + new Date().toTimeString().substring(0, 5),
      specialistNotes: currentNotes || undefined
    };

    setKnowledgeBaseMemories(prev => ({
      ...prev,
      [activeSpecialistId]: [...prev[activeSpecialistId], newMemory]
    }));

    alert(`Successfully compiled semantic hash! "${activeDoc.title}" has been saved in the cognitive memory vault of ${specialists.find(s => s.id === activeSpecialistId)!.name}. Future queries on this template will automatically link to this contextual resource.`);
  };

  const activeSpecialist = specialists.find(s => s.id === activeSpecialistId)!;
  const currentMemories = knowledgeBaseMemories[activeSpecialistId];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Title */}
      <div className="border-b border-slate-100 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Bot className="w-7 h-7 text-blue-600" /> Specialist AI Copilot Vault
          </h1>
          <p className="text-sm text-slate-500">Query your agreements, run specialized audits with custom profiles, and link documents to memory.</p>
        </div>

        {/* Selected Document Dropdown Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Audit Target:</label>
          <select
            value={selectedDocId}
            onChange={(e) => setSelectedDocId(e.target.value)}
            className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">-- Choose Document --</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>{d.title} ({d.status.toUpperCase()})</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedDocId ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center text-slate-400 shadow-sm max-w-2xl mx-auto space-y-4">
          <Brain className="w-16 h-16 mx-auto stroke-1 text-slate-300 animate-pulse" />
          <div className="space-y-1">
            <h3 className="font-bold text-slate-700 text-lg">Select a Document to Begin</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select any agreement from the dropdown above to load terms into our specialized cognitive models. Elena (Legal), Marcus (Finance), and Sterling (Investment) will analyze and audit details immediately.
            </p>
          </div>
        </div>
      ) : (
        /* Assistant Workspace */
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Column: Specialist Selector & Memory Vault */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-700 text-xs uppercase tracking-wider border-b border-slate-50 pb-2">Cognitive Models</h3>
              
              <div className="space-y-2">
                {specialists.map(spec => {
                  const Icon = spec.icon;
                  const isActive = activeSpecialistId === spec.id;
                  return (
                    <button
                      key={spec.id}
                      onClick={() => setActiveSpecialistId(spec.id)}
                      className={`w-full text-left p-3 rounded-xl border transition flex items-start gap-3 ${
                        isActive 
                          ? `${spec.bgColor} ${spec.borderColor} ring-2 ring-blue-500/10` 
                          : 'border-transparent hover:bg-slate-50'
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${spec.bgColor} ${spec.color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="font-bold text-slate-800 text-xs">{spec.name}</h4>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{spec.title}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Specialist Memory Vault Storage */}
            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-blue-400" /> Specialist Memory Vault
                </span>
                <button
                  onClick={handleSaveToSpecialistMemory}
                  className="bg-white/10 hover:bg-white/20 p-1 rounded-lg transition"
                  title="Save Current PDF Context to Specialist Knowledge Base"
                >
                  <Save className="w-3.5 h-3.5" />
                </button>
              </div>

              <p className="text-[11px] text-slate-300 leading-relaxed">
                Save agreements to Elena, Marcus, or Sterling's memory context to persist specific terms across different chat sessions.
              </p>

              <div className="space-y-2 border-t border-slate-800 pt-3 max-h-[150px] overflow-y-auto">
                {currentMemories.length === 0 ? (
                  <p className="text-[10px] text-slate-500 italic">No contexts saved in specialist memory yet.</p>
                ) : (
                  currentMemories.map((entry, index) => (
                    <div key={index} className="bg-slate-800/80 p-2 rounded-lg space-y-1 text-[10px]">
                      <div className="flex justify-between font-bold text-slate-200">
                        <span className="truncate max-w-[70%]}">{entry.documentTitle}</span>
                        <span className="text-slate-500 text-[8px]">{entry.savedAt}</span>
                      </div>
                      {entry.specialistNotes && (
                        <p className="text-slate-400 italic font-mono leading-tight">{entry.specialistNotes}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: PDF Viewer Context & Interactive Chat */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-5 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden min-h-[500px]">
            
            {/* Quick Context Summary Panel (2 Cols) */}
            <div className="md:col-span-2 bg-slate-50 p-4 border-r border-slate-100 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs uppercase tracking-widest pb-2 border-b border-slate-200/60">
                  <BookOpen className="w-4 h-4 text-slate-500" /> Active PDF Context
                </div>

                <div className="space-y-2">
                  <h4 className="font-black text-slate-800 text-sm">{activeDoc?.title}</h4>
                  <div className="text-[11px] text-slate-400">
                    Status: <span className="font-bold text-slate-600 uppercase">{activeDoc?.status}</span>
                  </div>
                </div>

                {/* Simulated Field Elements Found in PDF */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Semantic Elements Audited:</span>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                    {activeDoc?.fields.map((f) => (
                      <div key={f.id} className="bg-white p-2 rounded-lg border border-slate-100 text-[10px] flex items-center justify-between">
                        <div>
                          <span className="font-bold text-slate-700">{f.label}</span>
                          <span className="text-slate-400 block text-[9px]">Assigned: {f.role}</span>
                        </div>
                        <span className="bg-slate-100 text-slate-500 px-1 py-0.5 rounded font-mono font-bold text-[8px]">{f.type}</span>
                      </div>
                    ))}
                    {activeDoc?.fields.length === 0 && (
                      <p className="text-[10px] text-slate-400 italic">No mapped fields. Open this document in the editor to define fields first.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Legal validation stamp */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-3 text-[10px] text-blue-800 space-y-1 mt-4">
                <span className="font-bold uppercase tracking-wider block">Context Guarantee</span>
                <p className="leading-relaxed text-[9px] text-blue-900">
                  Specialists scan standard clauses, signatures, and payment schedules within the PDF structure to prevent legal, financial, and credit vulnerabilities.
                </p>
              </div>
            </div>

            {/* Interactive Chat Board (3 Cols) */}
            <div className="md:col-span-3 flex flex-col justify-between h-[550px]">
              {/* Specialist Header */}
              <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
                <div className={`p-1.5 rounded-lg ${activeSpecialist.bgColor} ${activeSpecialist.color}`}>
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-xs">{activeSpecialist.name}</h3>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{activeSpecialist.title}</span>
                </div>
              </div>

              {/* Chat Messages Scrolling */}
              <div className="flex-grow p-4 overflow-y-auto space-y-4">
                {currentMessages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs space-y-1 leading-relaxed ${
                      msg.sender === 'user' 
                        ? 'bg-blue-600 text-white rounded-br-none shadow-md' 
                        : `${activeSpecialist.bgColor} text-slate-700 rounded-bl-none border ${activeSpecialist.borderColor}`
                    }`}>
                      <p>{msg.text}</p>
                      <span className={`text-[8px] block text-right font-medium ${
                        msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                      }`}>
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isAiTyping && (
                  <div className="flex justify-start">
                    <div className={`max-w-[85%] p-3 rounded-2xl text-xs flex items-center gap-1.5 rounded-bl-none border ${activeSpecialist.bgColor} ${activeSpecialist.borderColor} text-slate-500`}>
                      <Bot className="w-4 h-4 text-slate-400 animate-spin" />
                      <span>{activeSpecialist.name} is auditing contract provisions...</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input prompt */}
              <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center gap-2">
                <input
                  type="text"
                  placeholder={`Ask ${activeSpecialist.name.split(',')[0]} about risk terms, calculations, ESIGN details...`}
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-grow text-xs border border-slate-200 rounded-xl px-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!userInput.trim() || isAiTyping}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white p-2.5 rounded-xl transition shadow-md"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
