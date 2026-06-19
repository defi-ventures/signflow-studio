import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Save, Send, Plus, Trash2, Edit3, Type, HelpCircle, 
  Settings, Layers, Users, ShieldAlert, CheckSquare, Calendar, 
  ChevronDown, Paperclip, CreditCard, PenTool, Highlighter, Square, 
  Circle, ArrowRight, Minus, Sparkles, RefreshCw, Smartphone, Check
} from 'lucide-react';
import { PDFDocument, FormField, FieldType, DrawingAction, SignerRecipient } from '../types';

interface DocumentEditorProps {
  document: PDFDocument;
  branding: any;
  onSave: (doc: PDFDocument) => void;
  onBack: () => void;
}

export default function DocumentEditor({ document: initialDoc, branding, onSave, onBack }: DocumentEditorProps) {
  const [doc, setDoc] = useState<PDFDocument>({ ...initialDoc });
  const [activePage, setActivePage] = useState(1);
  
  // Placement/Drawing states
  const [activeTool, setActiveTool] = useState<FieldType | 'pen' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow' | 'select'>('select');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  
  // Drawing configurations
  const [drawingColor, setDrawingColor] = useState('#2563eb');
  const [drawingWidth, setDrawingWidth] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);

  // Editor settings panel toggles
  const [showSettingsTab, setShowSettingsTab] = useState<'fields' | 'recipients' | 'rules'>('fields');

  // New recipient template variables
  const [recName, setRecName] = useState('');
  const [recEmail, setRecEmail] = useState('');
  const [recPhone, setRecPhone] = useState('');
  const [recRole, setRecRole] = useState('Signer 1');
  const [recVerif, setRecVerif] = useState<'none' | 'passcode' | 'sms'>('none');
  const [recPass, setRecPass] = useState('');

  const canvasRef = useRef<HTMLDivElement>(null);

  // Quick field presets
  const availableFields: { type: FieldType; label: string; icon: any; color: string }[] = [
    { type: 'text', label: 'Text Field', icon: Type, color: 'border-blue-200 text-blue-600 bg-blue-50' },
    { type: 'signature', label: 'Signature', icon: Edit3, color: 'border-amber-200 text-amber-600 bg-amber-50' },
    { type: 'initial', label: 'Initial', icon: Edit3, color: 'border-purple-200 text-purple-600 bg-purple-50' },
    { type: 'date', label: 'Date Signature', icon: Calendar, color: 'border-green-200 text-green-600 bg-green-50' },
    { type: 'checkbox', label: 'Checkbox', icon: CheckSquare, color: 'border-pink-200 text-pink-600 bg-pink-50' },
    { type: 'dropdown', label: 'Dropdown', icon: ChevronDown, color: 'border-indigo-200 text-indigo-600 bg-indigo-50' },
    { type: 'attachment', label: 'File Upload', icon: Paperclip, color: 'border-yellow-200 text-yellow-600 bg-yellow-50' },
    { type: 'payment', label: 'Pay Request', icon: CreditCard, color: 'border-emerald-200 text-emerald-600 bg-emerald-50' },
  ];

  const drawingTools: { id: 'pen' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow'; label: string; icon: any }[] = [
    { id: 'pen', label: 'Ink Pen', icon: PenTool },
    { id: 'highlighter', label: 'Highlight', icon: Highlighter },
    { id: 'rect', label: 'Rectangle', icon: Square },
    { id: 'circle', label: 'Oval Shape', icon: Circle },
  ];

  // Canvas interaction
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    // Drawing action start
    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setIsDrawing(true);
      setCurrentPath([{ x, y }]);
      return;
    }

    if (activeTool === 'rect' || activeTool === 'circle') {
      setIsDrawing(true);
      const newDrawing: DrawingAction = {
        id: `draw-${Date.now()}`,
        page: activePage,
        type: activeTool,
        x,
        y,
        width: 1,
        height: 1,
        color: drawingColor,
        lineWidth: drawingWidth,
      };
      setDoc({
        ...doc,
        drawings: [...doc.drawings, newDrawing]
      });
      return;
    }

    // Placing field action
    if (activeTool !== 'select') {
      const type = activeTool as FieldType;
      const defaultRole = doc.recipients[0]?.role || 'Signer 1';
      
      const newField: FormField = {
        id: `f-${Date.now()}`,
        type,
        page: activePage,
        x,
        y,
        width: type === 'checkbox' ? 5 : type === 'signature' ? 25 : 20,
        height: type === 'checkbox' ? 4 : type === 'signature' ? 8 : 5,
        label: `${type.toUpperCase()} Field`,
        required: true,
        role: defaultRole,
        placeholder: type === 'payment' ? 'Amount due on sign' : 'Enter data...',
        paymentAmount: type === 'payment' ? 20.00 : undefined,
      };

      setDoc({
        ...doc,
        fields: [...doc.fields, newField]
      });
      setSelectedFieldId(newField.id);
      setActiveTool('select'); // Reset to default tool
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    if (activeTool === 'pen' || activeTool === 'highlighter') {
      setCurrentPath([...currentPath, { x, y }]);
    } else if (activeTool === 'rect' || activeTool === 'circle') {
      const currentDrawings = [...doc.drawings];
      const latest = currentDrawings[currentDrawings.length - 1];
      if (latest && latest.x !== undefined && latest.y !== undefined) {
        latest.width = x - latest.x;
        latest.height = y - latest.y;
        setDoc({ ...doc, drawings: currentDrawings });
      }
    }
  };

  const handleCanvasMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if ((activeTool === 'pen' || activeTool === 'highlighter') && currentPath.length > 1) {
      const newDrawing: DrawingAction = {
        id: `draw-${Date.now()}`,
        page: activePage,
        type: activeTool,
        points: currentPath,
        color: activeTool === 'highlighter' ? 'rgba(253, 224, 71, 0.4)' : drawingColor,
        lineWidth: drawingWidth,
      };
      setDoc({
        ...doc,
        drawings: [...doc.drawings, newDrawing]
      });
    }
    setCurrentPath([]);
  };

  // Recipient modifiers
  const handleAddRecipient = () => {
    if (!recName || !recEmail) return;
    const newRec: SignerRecipient = {
      id: `rec-${Date.now()}`,
      name: recName,
      email: recEmail,
      phone: recPhone || undefined,
      role: recRole,
      order: doc.recipients.length + 1,
      status: 'pending',
      verificationType: recVerif,
      verificationCode: recVerif !== 'none' ? recPass || '1234' : undefined,
    };

    setDoc({
      ...doc,
      recipients: [...doc.recipients, newRec]
    });
    setRecName('');
    setRecEmail('');
    setRecPhone('');
    setRecPass('');
  };

  const handleRemoveRecipient = (id: string) => {
    setDoc({
      ...doc,
      recipients: doc.recipients.filter(r => r.id !== id)
    });
  };

  const selectedField = doc.fields.find(f => f.id === selectedFieldId);

  // Field updates
  const updateSelectedField = (updates: Partial<FormField>) => {
    if (!selectedFieldId) return;
    setDoc({
      ...doc,
      fields: doc.fields.map(f => f.id === selectedFieldId ? { ...f, ...updates } : f)
    });
  };

  const handleDeleteField = (id: string) => {
    setDoc({
      ...doc,
      fields: doc.fields.filter(f => f.id !== id)
    });
    setSelectedFieldId(null);
  };

  // Drag simulation helper for repositioning placed fields
  const handleFieldDrag = (id: string, dx: number, dy: number) => {
    setDoc({
      ...doc,
      fields: doc.fields.map(f => {
        if (f.id === id) {
          const newX = Math.max(0, Math.min(95, f.x + dx));
          const newY = Math.max(0, Math.min(95, f.y + dy));
          return { ...f, x: newX, y: newY };
        }
        return f;
      })
    });
  };

  const handleSendDocument = () => {
    if (doc.recipients.length === 0) {
      alert('Please add at least one recipient with an email before sending.');
      return;
    }
    const finalDoc = {
      ...doc,
      status: doc.isTemplate ? 'template' : doc.isPowerForm ? 'powerform' : 'waiting',
      folder: (doc.isTemplate || doc.isPowerForm) ? 'drafts' : 'sent',
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    } as PDFDocument;
    onSave(finalDoc);
    alert(`Document successfully published!\nStatus: ${finalDoc.status.toUpperCase()}`);
    onBack();
  };

  return (
    <div className="flex flex-col h-screen bg-slate-100 overflow-hidden text-sm">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <input
              type="text"
              value={doc.title}
              onChange={(e) => setDoc({ ...doc, title: e.target.value })}
              className="text-lg font-bold text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none transition py-0.5"
            />
            <p className="text-xs text-slate-400">Design Workspace (Soda PDF & Signature engine)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings checkboxes */}
          <div className="flex gap-4 border-r border-slate-200 pr-4 mr-2 text-xs font-semibold text-slate-600">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.isTemplate || false}
                onChange={(e) => setDoc({ ...doc, isTemplate: e.target.checked, isPowerForm: false })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Save as Template
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                checked={doc.isPowerForm || false}
                onChange={(e) => setDoc({ ...doc, isPowerForm: e.target.checked, isTemplate: false })}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              Publish as PowerForm
            </label>
          </div>

          <button
            onClick={() => {
              onSave(doc);
              alert('Draft progress saved.');
            }}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-xl transition"
          >
            <Save className="w-4 h-4" /> Save Draft
          </button>
          <button
            onClick={handleSendDocument}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2 rounded-xl transition shadow-sm"
          >
            <Send className="w-4 h-4" /> 
            {doc.isTemplate ? 'Publish Template' : doc.isPowerForm ? 'Deploy PowerForm' : 'Send Envelope'}
          </button>
        </div>
      </div>

      {/* Main Panel Grid */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar: Form fields and tools */}
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0">
          <div className="p-4 space-y-5 overflow-y-auto flex-grow">
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Signer Form Fields</h3>
              <p className="text-[11px] text-slate-400 mb-2">Click a field below, then click on the page canvas to place it.</p>
              <div className="grid grid-cols-1 gap-2">
                {availableFields.map(f => {
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.type}
                      onClick={() => setActiveTool(f.type)}
                      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-left transition font-medium ${
                        activeTool === f.type 
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-[1.02]' 
                          : 'border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{f.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SVG Free-draw tools */}
            <div className="border-t border-slate-100 pt-4">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Drawing & Annotation</h3>
              <div className="grid grid-cols-2 gap-2">
                {drawingTools.map(t => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTool(t.id)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition ${
                        activeTool === t.id 
                          ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                          : 'border-slate-100 hover:border-slate-300 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[10px] font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Drawing options */}
              {(['pen', 'highlighter', 'rect', 'circle'].includes(activeTool)) && (
                <div className="bg-slate-50 p-2.5 rounded-xl mt-2.5 space-y-2 border border-slate-100">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Color</span>
                    <input 
                      type="color" 
                      value={drawingColor} 
                      onChange={(e) => setDrawingColor(e.target.value)} 
                      className="w-8 h-6 rounded cursor-pointer border border-slate-200"
                    />
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Stroke Thickness</span>
                      <span className="font-bold">{drawingWidth}px</span>
                    </div>
                    <input 
                      type="range" 
                      min={1} 
                      max={12} 
                      value={drawingWidth} 
                      onChange={(e) => setDrawingWidth(Number(e.target.value))} 
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-1">
            <span className="text-xs font-bold text-slate-500">Current Tool:</span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 capitalize">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              {activeTool === 'select' ? 'Select & Edit fields' : `${activeTool} Placer`}
            </div>
            {activeTool !== 'select' && (
              <button
                onClick={() => setActiveTool('select')}
                className="mt-1 text-[11px] text-slate-400 hover:text-slate-600 underline font-medium block"
              >
                Cancel and return to select
              </button>
            )}
          </div>
        </div>

        {/* Center Canvas area */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center space-y-6">
          {/* Canvas Guidelines */}
          <div className="max-w-3xl w-full flex justify-between items-center text-xs text-slate-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Page {activePage} of {doc.pages.length}</span>
            </div>
            <div className="flex gap-2">
              <button
                disabled={activePage === 1}
                onClick={() => setActivePage(activePage - 1)}
                className="hover:text-blue-600 disabled:opacity-50 font-bold transition"
              >
                Previous
              </button>
              <span>|</span>
              <button
                disabled={activePage === doc.pages.length}
                onClick={() => setActivePage(activePage + 1)}
                className="hover:text-blue-600 disabled:opacity-50 font-bold transition"
              >
                Next
              </button>
            </div>
          </div>

          {/* Page Canvas Container */}
          <div
            ref={canvasRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            className="w-[600px] h-[800px] bg-white border border-slate-300 shadow-xl relative cursor-crosshair select-none"
          >
            {/* Visual template watermark guidelines */}
            <div className="absolute inset-0 flex flex-col justify-between p-12 pointer-events-none opacity-[0.03]">
              <h1 className="text-6xl font-black text-slate-800 rotate-12 uppercase tracking-widest text-center mt-24">SIGNFLOW</h1>
              <h1 className="text-6xl font-black text-slate-800 rotate-12 uppercase tracking-widest text-center mb-24">SECURE PORTAL</h1>
            </div>

            {/* Document Header Text Block simulation */}
            <div className="p-8 space-y-4 pointer-events-none">
              <div className="h-6 bg-slate-100 rounded w-1/3"></div>
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="h-4 bg-slate-50 rounded w-5/6"></div>
              <div className="h-4 bg-slate-50 rounded w-2/3"></div>
            </div>

            {/* Render Saved SVG Drawings */}
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

              {/* Live Active drawing path */}
              {(activeTool === 'pen' || activeTool === 'highlighter') && currentPath.length > 1 && (
                <path
                  d={`M ${currentPath[0].x * 6} ${currentPath[0].y * 8} ` + 
                    currentPath.slice(1).map(p => `L ${p.x * 6} ${p.y * 8}`).join(' ')}
                  fill="none"
                  stroke={activeTool === 'highlighter' ? 'rgba(253, 224, 71, 0.4)' : drawingColor}
                  strokeWidth={drawingWidth}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </svg>

            {/* Render Form Fields placed on current page */}
            {doc.fields
              .filter(f => f.page === activePage)
              .map(f => {
                const isSelected = selectedFieldId === f.id;
                return (
                  <div
                    key={f.id}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      setSelectedFieldId(f.id);
                    }}
                    style={{
                      left: `${f.x}%`,
                      top: `${f.y}%`,
                      width: `${f.width}%`,
                      height: `${f.height}%`,
                    }}
                    className={`absolute z-20 flex flex-col justify-between p-1.5 rounded-lg border-2 text-[10px] font-bold shadow-md cursor-move transition ${
                      isSelected 
                        ? 'border-blue-600 bg-blue-50/90 text-blue-800 ring-4 ring-blue-500/10 scale-[1.02]' 
                        : 'border-slate-300 bg-slate-50/80 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="truncate max-w-[80%] uppercase tracking-wide">{f.label}</span>
                      {f.required && <span className="text-red-500 text-xs shrink-0">*</span>}
                    </div>

                    <div className="flex items-center justify-between text-[9px] text-slate-400 font-semibold border-t border-dashed border-slate-300/60 pt-1">
                      <span className="truncate max-w-[60%]">{f.role}</span>
                      {f.type === 'payment' && <span className="text-emerald-600 font-black shrink-0">${f.paymentAmount}</span>}
                    </div>

                    {/* Basic Drag handles simulation */}
                    {isSelected && (
                      <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-0.5 shadow-sm">
                        <Edit3 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Right Panel: Settings, Signer Recipient Assignments & Custom Flow Rules */}
        <div className="w-80 bg-white border-l border-slate-200 flex flex-col shrink-0">
          {/* Panel Tab selection */}
          <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50 p-1">
            <button
              onClick={() => setShowSettingsTab('fields')}
              className={`py-2 text-center text-xs font-bold rounded-lg transition ${
                showSettingsTab === 'fields' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Field Details
            </button>
            <button
              onClick={() => setShowSettingsTab('recipients')}
              className={`py-2 text-center text-xs font-bold rounded-lg transition ${
                showSettingsTab === 'recipients' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Signers ({doc.recipients.length})
            </button>
            <button
              onClick={() => setShowSettingsTab('rules')}
              className={`py-2 text-center text-xs font-bold rounded-lg transition ${
                showSettingsTab === 'rules' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Advanced Rules
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-6">
            
            {/* Field Details Editor Tab */}
            {showSettingsTab === 'fields' && (
              <div className="space-y-4">
                {selectedField ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h4 className="font-bold text-slate-700 capitalize">{selectedField.type} Configuration</h4>
                      <button
                        onClick={() => handleDeleteField(selectedField.id)}
                        className="p-1 hover:bg-red-50 text-red-500 rounded-lg transition"
                        title="Delete Field"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Field Name / Label</label>
                        <input
                          type="text"
                          value={selectedField.label}
                          onChange={(e) => updateSelectedField({ label: e.target.value })}
                          className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>

                      {selectedField.type === 'text' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Input Validation Type</label>
                          <select
                            value={selectedField.validationType || 'none'}
                            onChange={(e) => updateSelectedField({ validationType: e.target.value as any })}
                            className="w-full border border-slate-200 bg-white rounded-lg px-3 py-1.5 focus:outline-none"
                          >
                            <option value="none">No Validation (Any input)</option>
                            <option value="email">Email Address Format</option>
                            <option value="number">Numbers Only</option>
                            <option value="letters-only">Letters & Spaces Only</option>
                          </select>
                        </div>
                      )}

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Signer Role</label>
                        <select
                          value={selectedField.role}
                          onChange={(e) => updateSelectedField({ role: e.target.value })}
                          className="w-full border border-slate-200 bg-white rounded-lg px-3 py-1.5 focus:outline-none"
                        >
                          {doc.recipients.map(r => (
                            <option key={r.id} value={r.role}>{r.role} ({r.name || 'No Name'})</option>
                          ))}
                          <option value="Anyone">Anyone</option>
                        </select>
                      </div>

                      {/* Payment special configuration */}
                      {selectedField.type === 'payment' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Required Payment Amount ($)</label>
                          <input
                            type="number"
                            value={selectedField.paymentAmount || 0}
                            onChange={(e) => updateSelectedField({ paymentAmount: Number(e.target.value) })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Dropdown Options */}
                      {selectedField.type === 'dropdown' && (
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dropdown Options (Comma separated)</label>
                          <input
                            type="text"
                            placeholder="Option 1, Option 2, Option 3"
                            value={selectedField.options?.join(', ') || ''}
                            onChange={(e) => updateSelectedField({ options: e.target.value.split(',').map(s => s.trim()) })}
                            className="w-full border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                          />
                        </div>
                      )}

                      {/* Manual Reposition tweaks */}
                      <div>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Micro-Adjust Location</span>
                        <div className="grid grid-cols-4 gap-1">
                          <button onClick={() => handleFieldDrag(selectedField.id, -1, 0)} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-xs font-bold text-center">Left</button>
                          <button onClick={() => handleFieldDrag(selectedField.id, 1, 0)} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-xs font-bold text-center">Right</button>
                          <button onClick={() => handleFieldDrag(selectedField.id, 0, -1)} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-xs font-bold text-center">Up</button>
                          <button onClick={() => handleFieldDrag(selectedField.id, 0, 1)} className="bg-slate-100 hover:bg-slate-200 p-1.5 rounded text-xs font-bold text-center">Down</button>
                        </div>
                      </div>

                      {/* Conditional logic */}
                      <div className="border-t border-slate-100 pt-3">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Conditional Display logic</h5>
                        <p className="text-[10px] text-slate-400 mb-2">Show this field ONLY IF another field has a specific value.</p>
                        
                        <div className="space-y-2">
                          <select
                            value={selectedField.conditional?.triggerFieldId || ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateSelectedField({
                                conditional: val ? { triggerFieldId: val, triggerValue: selectedField.conditional?.triggerValue || '' } : undefined
                              });
                            }}
                            className="w-full border border-slate-200 bg-white rounded-lg text-xs px-2 py-1 focus:outline-none"
                          >
                            <option value="">No Conditional Rule</option>
                            {doc.fields
                              .filter(f => f.id !== selectedField.id)
                              .map(f => (
                                <option key={f.id} value={f.id}>{f.label} ({f.id})</option>
                              ))}
                          </select>

                          {selectedField.conditional && (
                            <input
                              type="text"
                              placeholder="Matches specific value"
                              value={selectedField.conditional.triggerValue}
                              onChange={(e) => {
                                updateSelectedField({
                                  conditional: {
                                    triggerFieldId: selectedField.conditional!.triggerFieldId,
                                    triggerValue: e.target.value
                                  }
                                });
                              }}
                              className="w-full border border-slate-200 rounded-lg text-xs px-2 py-1 focus:outline-none"
                            />
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between bg-slate-50 p-2 rounded-lg mt-2">
                        <span className="text-xs text-slate-600">Field Is Required</span>
                        <input
                          type="checkbox"
                          checked={selectedField.required}
                          onChange={(e) => updateSelectedField({ required: e.target.checked })}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-slate-400">
                    <HelpCircle className="w-8 h-8 mx-auto stroke-1 mb-1" />
                    <p className="text-xs">Select any field placed on the canvas to configure roles, parameters, or conditional logic rules.</p>
                  </div>
                )}
              </div>
            )}

            {/* Recipient / Signers configuration tab */}
            {showSettingsTab === 'recipients' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">Manage Recipients</h4>

                {/* Recipient list */}
                <div className="space-y-2">
                  {doc.recipients.map((rec, index) => (
                    <div key={rec.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative">
                      <button
                        onClick={() => handleRemoveRecipient(rec.id)}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-red-500 rounded transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-slate-700">
                          <span className="bg-blue-600 text-white text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black">
                            {index + 1}
                          </span>
                          <span>{rec.role}</span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{rec.name || 'Unassigned Public'} • {rec.email || 'Self-service link'}</p>
                      </div>

                      {/* Verification badge */}
                      {rec.verificationType !== 'none' && (
                        <div className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded border border-amber-100">
                          <ShieldAlert className="w-3 h-3" />
                          Security Enforced: {rec.verificationType.toUpperCase()} ({rec.verificationCode})
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Add new recipient Form */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Add Signer Recipient</h5>
                  
                  <div className="space-y-2.5">
                    <input
                      type="text"
                      placeholder="Role Name (e.g. Signer 1, Witness)"
                      value={recRole}
                      onChange={(e) => setRecRole(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />
                    
                    <input
                      type="text"
                      placeholder="Recipient Name"
                      value={recName}
                      onChange={(e) => setRecName(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />

                    <input
                      type="email"
                      placeholder="Recipient Email"
                      value={recEmail}
                      onChange={(e) => setRecEmail(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />

                    <input
                      type="tel"
                      placeholder="Phone (Optional for SMS)"
                      value={recPhone}
                      onChange={(e) => setRecPhone(e.target.value)}
                      className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                    />

                    {/* Verification Selector */}
                    <div>
                      <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Signer Identity Check</label>
                      <select
                        value={recVerif}
                        onChange={(e) => setRecVerif(e.target.value as any)}
                        className="w-full border border-slate-200 bg-white rounded-lg text-xs px-2.5 py-1.5 focus:outline-none"
                      >
                        <option value="none">None (Standard Email Direct Link)</option>
                        <option value="passcode">Custom Secure Passcode</option>
                        <option value="sms">SMS Mobile Verification Code</option>
                      </select>
                    </div>

                    {recVerif !== 'none' && (
                      <input
                        type="text"
                        placeholder="Verification Access Code (e.g. 9812)"
                        value={recPass}
                        onChange={(e) => setRecPass(e.target.value)}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    )}

                    <button
                      type="button"
                      onClick={handleAddRecipient}
                      className="w-full bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Save Recipient Role
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Rules Tab */}
            {showSettingsTab === 'rules' && (
              <div className="space-y-4">
                <h4 className="font-bold text-slate-700">Workflow Rules</h4>
                <p className="text-xs text-slate-400">Configure post-execution actions, redirect triggers, and automatic expiration deadlines.</p>

                <div className="space-y-4">
                  {/* Redirect link setting */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Post-Sign Redirect URL</label>
                    <input
                      type="text"
                      placeholder="e.g. https://yoursite.com/thankyou"
                      value={doc.redirectUrl || ''}
                      onChange={(e) => setDoc({ ...doc, redirectUrl: e.target.value })}
                      className="w-full text-xs border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none"
                    />
                  </div>

                  {/* Auto reminder triggers */}
                  <div className="space-y-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-700 text-xs block">Automated reminders</span>
                        <span className="text-[10px] text-slate-400 block">Ping pending signers automatically</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={doc.autoReminders || false}
                        onChange={(e) => setDoc({ ...doc, autoReminders: e.target.checked })}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </div>

                    {doc.autoReminders && (
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Every</span>
                        <input
                          type="number"
                          value={doc.reminderInterval || 2}
                          onChange={(e) => setDoc({ ...doc, reminderInterval: Number(e.target.value) })}
                          className="w-16 border border-slate-200 rounded px-2 py-0.5"
                        />
                        <span className="text-slate-500">days</span>
                      </div>
                    )}
                  </div>

                  {/* SMS Direct distribution */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">SMS Distribution invites</span>
                      <span className="text-[10px] text-slate-400 block">Speed up contracts via phone text</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={doc.smsInvites || false}
                      onChange={(e) => setDoc({ ...doc, smsInvites: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </div>

                  {/* Sequential Signing Order */}
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="font-bold text-slate-700 text-xs block">Sequential Signing Order</span>
                      <span className="text-[10px] text-slate-400 block">Enforce recipient order (1 then 2)</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={doc.signingOrderSequential || false}
                      onChange={(e) => setDoc({ ...doc, signingOrderSequential: e.target.checked })}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
