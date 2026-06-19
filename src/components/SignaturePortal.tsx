import React, { useState, useRef, useEffect } from 'react';
import { 
  ShieldCheck, ArrowRight, Eye, Calendar, CheckSquare, ChevronDown, 
  Paperclip, CreditCard, PenTool, Edit3, Type, Info, Check, 
  Smartphone, UserCheck, AlertCircle, Sparkles, LogOut, ArrowLeft,
  X, Lock, AlertTriangle, XCircle, RefreshCw, Send, CheckCircle, Clock
} from 'lucide-react';
import { PDFDocument, FormField, SignerRecipient, AuditLogEntry } from '../types';
import confetti from 'canvas-confetti';

interface SignaturePortalProps {
  document: PDFDocument;
  branding: any;
  onExecute: (updatedDoc: PDFDocument) => void;
  onBack: () => void;
  isPowerFormMode?: boolean; // If true, simulating a public link (where signer names themselves)
}

export default function SignaturePortal({
  document: initialDoc,
  branding,
  onExecute,
  onBack,
  isPowerFormMode = false
}: SignaturePortalProps) {
  const [doc, setDoc] = useState<PDFDocument>({ ...initialDoc });
  const [activePage, setActivePage] = useState(1);

  // Simulator / Test Preview Swapper (DocuSign competitive feature)
  // Let's the user simulate signing as different recipients inside the same sandbox
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');

  // Signer Identity Verification state
  const [isVerified, setIsVerified] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState('');
  const [verificationError, setVerificationError] = useState('');

  // Target Recipient Role tracking
  const [currentRecipient, setCurrentRecipient] = useState<SignerRecipient | null>(null);

  // PowerForm guest identity states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  // Fields tracking
  const [fields, setFields] = useState<FormField[]>([...initialDoc.fields]);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Decline To Sign Flow
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  // Modal signatures
  const [showSigModal, setShowSigModal] = useState<string | null>(null); // field ID
  const [sigType, setSigType] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const signatureCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawingSig, setIsDrawingSig] = useState(false);

  // Modal Payments
  const [showPaymentModal, setShowPaymentModal] = useState<string | null>(null); // field ID
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');

  // Initialization & Swapper monitor
  useEffect(() => {
    if (isPowerFormMode) {
      // Create custom temporary recipient for public self-service PowerForm
      const publicRec: SignerRecipient = {
        id: `guest-${Date.now()}`,
        name: '',
        email: '',
        role: doc.recipients[0]?.role || 'Member',
        order: 1,
        status: 'pending',
        verificationType: 'none',
      };
      setCurrentRecipient(publicRec);
      setIsVerified(false);
    } else {
      // If we have a selectedRecipientId, use that to swap identities
      let activeRec: SignerRecipient | undefined;
      if (selectedRecipientId) {
        activeRec = doc.recipients.find(r => r.id === selectedRecipientId);
      } else {
        // Default to first pending or fallback to first overall
        activeRec = doc.recipients.find(r => r.status === 'pending') || doc.recipients[0];
      }

      if (activeRec) {
        setCurrentRecipient(activeRec);
        setSelectedRecipientId(activeRec.id);
        if (activeRec.verificationType === 'none') {
          setIsVerified(true);
        } else {
          setIsVerified(false);
          setVerificationCodeInput('');
          setVerificationError('');
        }
      }
    }
  }, [selectedRecipientId, isPowerFormMode]);

  // Check if Sequential Order blocks current recipient
  // If sequential signing order is enabled, and there are preceding recipients in the queue who are not 'signed' yet, we lock execution
  const isBlockedBySequentialOrder = () => {
    if (isPowerFormMode || !doc.signingOrderSequential || !currentRecipient) return false;
    
    // Find any recipients with lower order numbers that have not signed yet
    const precedingUnsigned = doc.recipients.some(
      r => r.order < currentRecipient.order && r.status !== 'signed'
    );
    return precedingUnsigned;
  };

  // Signature drawing canvas listeners
  useEffect(() => {
    if (showSigModal && sigType === 'draw' && signatureCanvasRef.current) {
      const canvas = signatureCanvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = branding.primaryColor || '#2563eb';
        ctx.lineWidth = 3.5;
        ctx.lineCap = 'round';
      }
    }
  }, [showSigModal, sigType, branding]);

  // Handle Identity Code verification match
  const handleVerifyIdentity = () => {
    if (!currentRecipient) return;
    const correctCode = currentRecipient.verificationCode || '1234';
    if (verificationCodeInput === correctCode) {
      setIsVerified(true);
      setVerificationError('');
    } else {
      setVerificationError('Invalid access code. Please check your SMS or email passcode invite.');
    }
  };

  const handleStartPowerForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestEmail || !currentRecipient) return;
    
    const updatedRec: SignerRecipient = {
      ...currentRecipient,
      name: guestName,
      email: guestEmail
    };
    setCurrentRecipient(updatedRec);
    setIsVerified(true);
  };

  // Decline to Sign Action
  const handleDeclineSign = () => {
    if (!currentRecipient) return;
    if (!declineReason.trim()) {
      alert('Please provide a short reason for declining this agreement.');
      return;
    }

    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.15.82`;

    const declineLogs: AuditLogEntry[] = [
      {
        id: `log-${Date.now()}-d`,
        timestamp,
        action: 'Document Declined',
        user: currentRecipient.name || 'Guest',
        ipAddress: ip,
        details: `Declined signing with reason: "${declineReason}"`
      }
    ];

    // Update recipient status to 'declined'
    const updatedRecipients = doc.recipients.map(r => 
      r.id === currentRecipient.id ? { ...r, status: 'declined' as const } : r
    );

    const updatedDoc: PDFDocument = {
      ...doc,
      status: 'declined',
      folder: 'drafts', // return to drafts for revision
      recipients: updatedRecipients,
      auditLogs: [...doc.auditLogs, ...declineLogs],
      updatedAt: timestamp
    };

    setShowDeclineModal(false);
    onExecute(updatedDoc);
    alert('You have declined to sign this document. The sender has been notified.');
  };

  // Canvas drawing mouse event handlers
  const startDrawingSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      setIsDrawingSig(true);
    }
  };

  const drawSig = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawingSig || !signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    }
  };

  const stopDrawingSig = () => {
    setIsDrawingSig(false);
  };

  const clearDrawingSig = () => {
    if (!signatureCanvasRef.current) return;
    const canvas = signatureCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveSignature = () => {
    if (!showSigModal) return;
    let signatureDataUrl = '';

    if (sigType === 'type') {
      if (!typedName.trim()) return;
      // Convert typed cursive text to small mock SVG
      signatureDataUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="180" height="50"><text x="10" y="35" font-family="'Brush Script MT', cursive, sans-serif" font-size="28" fill="${encodeURIComponent(branding.primaryColor || '#2563eb')}">${encodeURIComponent(typedName)}</text></svg>`;
    } else if (signatureCanvasRef.current) {
      signatureDataUrl = signatureCanvasRef.current.toDataURL();
    }

    setFields(fields.map(f => f.id === showSigModal ? { ...f, value: signatureDataUrl } : f));
    setTypedName('');
    setShowSigModal(null);
  };

  // Payment mock execution
  const executePayment = () => {
    if (!showPaymentModal) return;
    if (!cardNumber || !cardName) {
      alert('Please fill out card details to process payment.');
      return;
    }
    // Simulate successful Stripe Charge
    setFields(fields.map(f => f.id === showPaymentModal ? { ...f, value: 'Paid' } : f));
    setCardName('');
    setCardNumber('');
    setShowPaymentModal(null);
    alert('Mock payment processed successfully! Invoice status set to: PAID.');
  };

  // Text validation handler
  const handleTextFieldChange = (id: string, val: string, validationType?: string) => {
    let error = '';
    if (val.trim()) {
      if (validationType === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) {
          error = 'Invalid email address format';
        }
      } else if (validationType === 'number') {
        const numRegex = /^\d+$/;
        if (!numRegex.test(val)) {
          error = 'Numbers only';
        }
      } else if (validationType === 'letters-only') {
        const lettersRegex = /^[a-zA-Z\s]+$/;
        if (!lettersRegex.test(val)) {
          error = 'Letters and spaces only';
        }
      }
    }

    setValidationErrors({
      ...validationErrors,
      [id]: error
    });

    setFields(fields.map(field => field.id === id ? { ...field, value: val } : field));
  };

  // Complete signature workflow
  const handleCompleteSigning = () => {
    if (!currentRecipient) return;

    // Validate that all required fields for current recipient are completed
    const pendingRequiredFields = fields.filter(
      f => f.role === currentRecipient.role && f.required && !f.value
    );

    if (pendingRequiredFields.length > 0) {
      alert(`Please fill out all required fields before executing document.\nRequired remaining: ${pendingRequiredFields.length}`);
      return;
    }

    // Check if there are active validation errors
    const hasActiveErrors = Object.values(validationErrors).some(err => !!err);
    if (hasActiveErrors) {
      alert('Please fix text input validation errors before completing signing.');
      return;
    }

    // Capture execution audit logs
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
    const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.15.82`;
    
    const newLogs: AuditLogEntry[] = [
      {
        id: `log-${Date.now()}-v`,
        timestamp,
        action: 'Identity Verified',
        user: currentRecipient.name,
        ipAddress: ip,
        details: `Identity verified secure access using ${currentRecipient.verificationType.toUpperCase()}`
      },
      {
        id: `log-${Date.now()}-s`,
        timestamp,
        action: 'Document Signed',
        user: currentRecipient.name,
        ipAddress: ip,
        details: `Successfully completed execution of assigned signer role fields.`
      }
    ];

    // Build the updated recipient list
    let updatedRecipients = doc.recipients.map(r => {
      if (isPowerFormMode && r.role === currentRecipient.role) {
        return {
          ...r,
          name: currentRecipient.name,
          email: currentRecipient.email,
          status: 'signed' as const,
          signedAt: timestamp
        };
      }
      if (r.id === currentRecipient.id) {
        return {
          ...r,
          status: 'signed' as const,
          signedAt: timestamp
        };
      }
      return r;
    });

    // If it's a guest PowerForm, we append this guest to the recipients list!
    if (isPowerFormMode) {
      updatedRecipients = [
        {
          ...currentRecipient,
          status: 'signed' as const,
          signedAt: timestamp
        }
      ];
    }

    // Check if entire package is complete (all current recipients signed)
    const allSigned = updatedRecipients.every(r => r.status === 'signed');
    const finalStatus = allSigned ? 'completed' : 'waiting';
    const finalFolder = allSigned ? 'signed' : 'sent';

    const updatedDoc: PDFDocument = {
      ...doc,
      status: finalStatus,
      folder: finalFolder,
      fields,
      recipients: updatedRecipients,
      auditLogs: [...doc.auditLogs, ...newLogs],
      updatedAt: timestamp
    };

    // Trigger canvas confetti of victory!
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });

    onExecute(updatedDoc);

    // If redirectUrl was specified, simulate redirecting them
    if (doc.redirectUrl) {
      setTimeout(() => {
        window.open(doc.redirectUrl, '_blank');
      }, 2500);
    }
  };

  // Helper check to evaluate if conditional logic lets a field render
  const shouldRenderField = (f: FormField) => {
    if (!f.conditional) return true;
    const triggerField = fields.find(tf => tf.id === f.conditional?.triggerFieldId);
    return triggerField?.value === f.conditional.triggerValue;
  };

  // Check how many required fields are completed
  const currentRecipientFields = fields.filter(f => f.role === currentRecipient?.role && shouldRenderField(f));
  const completedRequiredCount = currentRecipientFields.filter(f => f.required && f.value).length;
  const totalRequiredCount = currentRecipientFields.filter(f => f.required).length;

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-sm">
      
      {/* Simulation / Swap Banner (DocuSign Pro Tester Feature) */}
      {!isPowerFormMode && doc.recipients.length > 1 && (
        <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-2 flex flex-col sm:flex-row items-center justify-between text-xs gap-2 shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-300">
            <span className="bg-blue-500 text-white text-[9px] px-1.5 py-0.5 rounded font-black uppercase">Vibe Preview</span>
            <span>Simulate sequential workflows inside the sandbox sandbox:</span>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-slate-400 font-medium">Viewing Document as:</label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded px-2 py-1 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
            >
              {doc.recipients.map(r => (
                <option key={r.id} value={r.id}>
                  {r.role}: {r.name || 'Unassigned'} ({r.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Verification Portal Splash Block (Gated access) */}
      {!isVerified && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
            
            {isPowerFormMode ? (
              /* Public PowerForm start card */
              <form onSubmit={handleStartPowerForm} className="space-y-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800">Secure Self-Service Form</h3>
                  <p className="text-xs text-slate-400">Please enter your contact details to begin executing this agreement.</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Your Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="jane.doe@company.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition shadow-md flex items-center justify-center gap-1.5"
                >
                  Access Secure Document <ArrowRight className="w-4.5 h-4.5" />
                </button>
              </form>
            ) : (
              /* Passcode or SMS Identity Verification screen */
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Identity Check Enforced</h3>
                <p className="text-xs text-slate-400">
                  The sender requires identity confirmation before unlocking this document. Please enter the passcode sent via {currentRecipient?.verificationType === 'sms' ? 'SMS' : 'secure email invite'}.
                </p>

                <div className="space-y-2">
                  <input
                    type="password"
                    placeholder="Enter Access Code (e.g. 1234)"
                    value={verificationCodeInput}
                    onChange={(e) => setVerificationCodeInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerifyIdentity()}
                    className="w-full border border-slate-200 rounded-xl px-4 py-3 text-center tracking-widest text-lg font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  {verificationError && (
                    <p className="text-xs text-red-500 flex items-center gap-1 justify-center">
                      <AlertCircle className="w-3.5 h-3.5" /> {verificationError}
                    </p>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={onBack}
                    className="w-1/3 bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold py-2.5 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleVerifyIdentity}
                    className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md"
                  >
                    Unlock Contract
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sequential Order Lock Splash Screen */}
      {isVerified && isBlockedBySequentialOrder() && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-40">
          <div className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl text-center space-y-6">
            <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-800">Sequential Signing Order Lock</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Sequential signing is enabled for this document. You are {currentRecipient?.role} (Order {currentRecipient?.order}), but preceding signers must complete their signatures first.
              </p>
            </div>

            {/* Visual Workflow Chart */}
            <div className="border border-slate-100 bg-slate-50 p-4 rounded-xl space-y-3 text-left">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Signing Sequence Roadmap:</span>
              <div className="space-y-2">
                {doc.recipients.map((rec) => {
                  const isActive = rec.order === currentRecipient?.order;
                  const isDone = rec.status === 'signed';
                  return (
                    <div key={rec.id} className="flex items-center justify-between text-xs font-semibold py-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                          isDone ? 'bg-emerald-500 text-white' : isActive ? 'bg-amber-500 text-white' : 'bg-slate-300 text-slate-600'
                        }`}>
                          {rec.order}
                        </span>
                        <span className={`${isActive ? 'text-slate-800 font-bold' : 'text-slate-500'}`}>{rec.role}: {rec.name || 'Pending Recipient'}</span>
                      </div>
                      <span className={`text-[10px] font-bold uppercase ${
                        isDone ? 'text-emerald-600' : isActive ? 'text-amber-500' : 'text-slate-400'
                      }`}>
                        {isDone ? 'Signed ✓' : isActive ? 'Current Turn' : 'Awaiting Turn'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 justify-center pt-2">
              <button
                onClick={onBack}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold px-6 py-2.5 rounded-xl transition text-xs"
              >
                Go Back to Dashboard
              </button>
              
              {!isPowerFormMode && (
                <span className="text-[11px] text-slate-400 italic block self-center">
                  Use the preview swapper above to simulate previous signers.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Top Header */}
      <div 
        className="border-b px-6 py-3.5 flex items-center justify-between shadow-sm shrink-0 text-white"
        style={{ backgroundColor: branding.primaryColor || '#2563eb' }}
      >
        <div className="flex items-center gap-3">
          {branding.logoUrl ? (
            <img src={branding.logoUrl} alt="Logo" className="h-8 max-w-[120px] object-contain rounded" />
          ) : (
            <div className="h-8 w-8 bg-white/20 rounded-lg flex items-center justify-center font-black">
              {branding.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-base font-bold tracking-wide">{doc.title}</h1>
            <p className="text-xs text-blue-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Verified Signer Workspace • {currentRecipient?.role}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress bar */}
          <div className="hidden md:flex flex-col items-end gap-1">
            <span className="text-xs text-blue-100 font-medium">
              Required Fields Completed: {completedRequiredCount} of {totalRequiredCount}
            </span>
            <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-300"
                style={{ width: `${totalRequiredCount > 0 ? (completedRequiredCount / totalRequiredCount) * 100 : 100}%` }}
              ></div>
            </div>
          </div>

          <button
            onClick={() => setShowDeclineModal(true)}
            className="flex items-center gap-1 text-xs font-bold bg-red-600/20 hover:bg-red-600/40 text-red-200 border border-red-500/30 px-3 py-2 rounded-xl transition"
          >
            Decline to Sign
          </button>

          <button
            onClick={handleCompleteSigning}
            className="flex items-center gap-1.5 bg-emerald-400 hover:bg-emerald-500 text-slate-900 font-black px-5 py-2.5 rounded-xl transition shadow-md"
          >
            Finish & Execute <Check className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Core Signing Board */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Hand: Overview outline instructions */}
        <div className="w-64 bg-white border-r border-slate-200 p-4 space-y-6 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-4">
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="w-4 h-4 text-blue-500" /> Instructions
              </div>
              <p className="text-slate-500 leading-relaxed text-[11px]">
                Please examine the terms carefully. Click on any assigned <span className="text-blue-600 font-bold">orange-highlighted form fields</span> directly on the document pages to input data, upload attachments, or place signatures.
              </p>
            </div>

            {/* Checklist of recipient fields */}
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">My Signing Tasks</h3>
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto">
                {currentRecipientFields.map((f, i) => (
                  <div 
                    key={f.id} 
                    className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition ${
                      f.value ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-slate-50 border-slate-100 text-slate-600'
                    }`}
                  >
                    <div className="flex flex-col gap-0.5 max-w-[80%]">
                      <span className="font-semibold truncate">{f.label}</span>
                      {validationErrors[f.id] && (
                        <span className="text-[10px] text-red-500 font-bold flex items-center gap-0.5">
                          <AlertTriangle className="w-3 h-3" /> Fix format
                        </span>
                      )}
                    </div>
                    {f.value ? (
                      <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    ) : (
                      <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                        {f.required ? 'Req' : 'Opt'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onBack}
            className="flex items-center justify-center gap-1.5 w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl transition"
          >
            <ArrowLeft className="w-4 h-4" /> Exit Portal
          </button>
        </div>

        {/* Center: Interactive canvas */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center space-y-4">
          <div className="max-w-2xl w-full flex justify-between items-center text-xs text-slate-500 px-4 py-2 bg-white rounded-xl shadow-sm border border-slate-100">
            <span>Page {activePage} of {doc.pages.length}</span>
            <div className="flex gap-2">
              <button disabled={activePage === 1} onClick={() => setActivePage(activePage - 1)} className="hover:text-blue-600 disabled:opacity-50 font-bold">Prev</button>
              <span>|</span>
              <button disabled={activePage === doc.pages.length} onClick={() => setActivePage(activePage + 1)} className="hover:text-blue-600 disabled:opacity-50 font-bold">Next</button>
            </div>
          </div>

          {/* Document Canvas Display */}
          <div className="w-[600px] h-[800px] bg-white border border-slate-300 shadow-xl relative select-none overflow-hidden rounded-md">
            
            {/* Draw overlay background templates */}
            <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none opacity-[0.03]">
              <h1 className="text-6xl font-black text-slate-800 rotate-12 uppercase tracking-widest text-center mt-24">SIGNFLOW</h1>
              <h1 className="text-6xl font-black text-slate-800 rotate-12 uppercase tracking-widest text-center mb-24">SECURE PORTAL</h1>
            </div>

            {/* Document body paragraphs simulation */}
            <div className="p-8 space-y-4 pointer-events-none">
              <div className="h-6 bg-slate-100 rounded w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-50 rounded w-2/3"></div>
            </div>

            {/* Placed Static SVG drawings layer */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {doc.drawings
                .filter(d => d.page === activePage)
                .map(d => {
                  if (d.type === 'pen' || d.type === 'highlighter') {
                    if (!d.points || d.points.length < 2) return null;
                    const pathStr = `M ${d.points[0].x * 6} ${d.points[0].y * 8} ` + 
                      d.points.slice(1).map(p => `L ${p.x * 6} ${p.y * 8}`).join(' ');
                    return (
                      <path
                        key={d.id}
                        d={pathStr}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={d.lineWidth}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    );
                  } else if (d.type === 'rect') {
                    return (
                      <rect
                        key={d.id}
                        x={(d.x || 0) * 6}
                        y={(d.y || 0) * 8}
                        width={(d.width || 0) * 6}
                        height={(d.height || 0) * 8}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={d.lineWidth}
                      />
                    );
                  } else if (d.type === 'circle') {
                    const rx = Math.abs((d.width || 0) * 3);
                    const ry = Math.abs((d.height || 0) * 4);
                    const cx = ((d.x || 0) + (d.width || 0) / 2) * 6;
                    const cy = ((d.y || 0) + (d.height || 0) / 2) * 8;
                    return (
                      <ellipse
                        key={d.id}
                        cx={cx}
                        cy={cy}
                        rx={rx}
                        ry={ry}
                        fill="none"
                        stroke={d.color}
                        strokeWidth={d.lineWidth}
                      />
                    );
                  }
                  return null;
                })}
            </svg>

            {/* Dynamic Interactive Fields display for Signers */}
            {fields
              .filter(f => f.page === activePage && shouldRenderField(f))
              .map(f => {
                const isAssigned = f.role === currentRecipient?.role || f.role === 'Anyone';
                const hasError = !!validationErrors[f.id];

                return (
                  <div
                    key={f.id}
                    style={{
                      left: `${f.x}%`,
                      top: `${f.y}%`,
                      width: `${f.width}%`,
                      height: `${f.height}%`,
                    }}
                    className={`absolute z-20 flex flex-col items-stretch justify-between p-1 rounded-lg border text-xs shadow-sm transition ${
                      isAssigned 
                        ? hasError 
                          ? 'border-red-500 bg-red-50 text-red-900'
                          : f.value 
                            ? 'border-emerald-500 bg-emerald-50/90 text-emerald-800'
                            : 'border-amber-400 bg-amber-50/90 text-amber-900 animate-pulse hover:border-amber-500 cursor-pointer'
                        : 'border-slate-200 bg-slate-50 text-slate-400 pointer-events-none'
                    }`}
                    onClick={() => {
                      if (!isAssigned) return;
                      if (f.type === 'signature' || f.type === 'initial') {
                        setShowSigModal(f.id);
                      } else if (f.type === 'payment') {
                        setShowPaymentModal(f.id);
                      }
                    }}
                  >
                    {/* Render fields according to specific types */}
                    {f.type === 'text' && isAssigned && (
                      <div className="w-full h-full flex flex-col justify-center">
                        <input
                          type="text"
                          placeholder={f.label}
                          value={f.value || ''}
                          onChange={(e) => handleTextFieldChange(f.id, e.target.value, f.validationType)}
                          className={`w-full bg-transparent border-none text-[11px] focus:ring-0 px-1 py-0 outline-none ${
                            hasError ? 'text-red-700 font-bold' : ''
                          }`}
                        />
                        {hasError && (
                          <span className="text-[8px] text-red-600 font-bold px-1">{validationErrors[f.id]}</span>
                        )}
                      </div>
                    )}

                    {f.type === 'date' && isAssigned && (
                      <input
                        type="date"
                        value={f.value || ''}
                        onChange={(e) => setFields(fields.map(field => field.id === f.id ? { ...field, value: e.target.value } : field))}
                        className="w-full bg-transparent border-none text-[11px] focus:ring-0 px-1 py-0 outline-none"
                      />
                    )}

                    {f.type === 'checkbox' && isAssigned && (
                      <div className="w-full h-full flex items-center justify-center">
                        <input
                          type="checkbox"
                          checked={f.value === 'true'}
                          onChange={(e) => setFields(fields.map(field => field.id === f.id ? { ...field, value: e.target.checked ? 'true' : '' } : field))}
                          className="rounded border-slate-300 focus:ring-amber-500 h-4 w-4 text-amber-600"
                        />
                      </div>
                    )}

                    {f.type === 'dropdown' && isAssigned && (
                      <select
                        value={f.value || ''}
                        onChange={(e) => setFields(fields.map(field => field.id === f.id ? { ...field, value: e.target.value } : field))}
                        className="w-full bg-transparent border-none text-[11px] focus:ring-0 px-1 py-0 outline-none"
                      >
                        <option value="">{f.label}</option>
                        {f.options?.map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}

                    {/* Attachment / File upload action */}
                    {f.type === 'attachment' && isAssigned && (
                      <label className="w-full h-full flex items-center justify-center gap-1 cursor-pointer">
                        <Paperclip className="w-3.5 h-3.5" />
                        <span className="text-[10px] truncate max-w-[80%] font-semibold">
                          {f.value ? 'Uploaded' : f.label}
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              setFields(fields.map(field => field.id === f.id ? { ...field, value: file.name } : field));
                            }
                          }}
                        />
                      </label>
                    )}

                    {/* Signature placement label */}
                    {(f.type === 'signature' || f.type === 'initial') && (
                      <div className="w-full h-full flex items-center justify-center">
                        {f.value ? (
                          <img src={f.value} alt="Signature" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="font-bold tracking-wide uppercase text-[9px] flex items-center gap-1">
                            <Edit3 className="w-3 h-3" /> Place {f.type}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Payment Request label */}
                    {f.type === 'payment' && (
                      <div className="w-full h-full flex items-center justify-center">
                        {f.value === 'Paid' ? (
                          <span className="text-emerald-600 font-bold uppercase text-[10px] flex items-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Paid
                          </span>
                        ) : (
                          <span className="font-bold text-[10px] flex items-center gap-1">
                            <CreditCard className="w-3.5 h-3.5" /> Pay ${f.paymentAmount}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Fallback label for unassigned view */}
                    {!isAssigned && (
                      <span className="text-[9px] text-slate-400 font-medium truncate text-center block pt-1">{f.label} ({f.role})</span>
                    )}
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Decline to Sign Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              <h3 className="text-lg font-bold">Decline to Sign</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              You are choosing to decline to sign this agreement. This will void the envelope and notify the sender. Please write a short explanation of why you are declining:
            </p>

            <textarea
              rows={3}
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="e.g. Terms on Clause 4 are incorrect."
              className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-red-500 focus:outline-none"
            />

            <div className="flex justify-end gap-2 text-xs">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSign}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition shadow-md"
              >
                Decline & Void
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      {showSigModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Add Hand-Written Signature</h3>
              <button onClick={() => setShowSigModal(null)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-4 bg-slate-100/50 flex gap-1 border-b border-slate-100">
              <button
                onClick={() => setSigType('draw')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  sigType === 'draw' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Draw Signature
              </button>
              <button
                onClick={() => setSigType('type')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
                  sigType === 'type' ? 'bg-slate-800 text-white' : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Type Signature
              </button>
            </div>

            <div className="p-6 flex justify-center items-center">
              {sigType === 'draw' ? (
                <div className="space-y-2 w-full">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={150}
                    onMouseDown={startDrawingSig}
                    onMouseMove={drawSig}
                    onMouseUp={stopDrawingSig}
                    onMouseLeave={stopDrawingSig}
                    className="border border-slate-200 rounded-xl bg-white cursor-crosshair w-full shadow-inner"
                  />
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">Use finger/touchpad or mouse to sign.</span>
                    <button onClick={clearDrawingSig} className="font-bold text-red-500 hover:underline">
                      Clear canvas
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 w-full">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Type your legal name</label>
                    <input
                      type="text"
                      placeholder="e.g. David Miller"
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none"
                    />
                  </div>
                  <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl text-center min-h-[80px] flex items-center justify-center">
                    <span className="font-cursive text-3xl text-blue-600 select-none">
                      {typedName || 'Cursive Preview'}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowSigModal(null)}
                className="bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-2 rounded-xl transition border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={saveSignature}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Adopt & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Processing Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Secure Stripe Checkout</h3>
              <button onClick={() => setShowPaymentModal(null)} className="p-1 hover:bg-slate-200 rounded-lg">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1">
                <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">Invoiced Registration Fee</span>
                <span className="text-3xl font-black text-slate-800 block">
                  ${fields.find(f => f.id === showPaymentModal)?.paymentAmount?.toFixed(2)}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Name on card</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David Miller"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 font-semibold mb-1">Credit Card Number</label>
                  <input
                    type="text"
                    required
                    placeholder="4242 4242 4242 4242"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Expiration</label>
                    <input
                      type="text"
                      required
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">CVC Code</label>
                    <input
                      type="text"
                      required
                      placeholder="123"
                      value={cardCVC}
                      onChange={(e) => setCardCVC(e.target.value)}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setShowPaymentModal(null)}
                className="bg-white hover:bg-slate-100 text-slate-600 text-xs font-semibold px-4 py-2 rounded-xl border border-slate-200"
              >
                Cancel
              </button>
              <button
                onClick={executePayment}
                className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-md"
              >
                Authorize & Pay
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
