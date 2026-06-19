import React, { useState } from 'react';
import { 
  FileText, Send, Clock, CheckCircle, FolderOpen, 
  Settings, Users, Layers, Share2, Plus, LogOut, 
  Mail, Phone, ShieldCheck, DollarSign, ArrowRight,
  TrendingUp, RefreshCw, BarChart2, Eye, Edit3, Trash2
} from 'lucide-react';
import { PDFDocument, SignerRecipient } from '../types';

interface DashboardProps {
  documents: PDFDocument[];
  onSelectDoc: (doc: PDFDocument, mode: 'view' | 'edit' | 'sign' | 'docsend') => void;
  onCreateDoc: () => void;
  onSetFolder: (folder: any) => void;
  currentFolder: string;
  setView: (view: string) => void;
  onDeleteDoc: (id: string) => void;
}

export default function Dashboard({
  documents,
  onSelectDoc,
  onCreateDoc,
  onSetFolder,
  currentFolder,
  setView,
  onDeleteDoc
}: DashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkSelect, setBulkSelect] = useState<string[]>([]);
  const [showBulkInviteModal, setShowBulkInviteModal] = useState(false);
  const [bulkEmails, setBulkEmails] = useState('');

  // Stats computation
  const totalSent = documents.filter(d => d.status === 'waiting').length;
  const totalCompleted = documents.filter(d => d.status === 'completed').length;
  const totalTemplates = documents.filter(d => d.isTemplate).length;
  const totalPowerForms = documents.filter(d => d.isPowerForm).length;

  // Calculate simulated revenue from completed payments
  const totalRevenue = documents
    .filter(d => d.status === 'completed')
    .reduce((sum, d) => {
      const payFields = d.fields.filter(f => f.type === 'payment' && f.value === 'Paid');
      const docSum = payFields.reduce((s, f) => s + (f.paymentAmount || 0), 0);
      return sum + docSum;
    }, 0);

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (currentFolder === 'all') return matchesSearch;
    if (currentFolder === 'templates') return matchesSearch && doc.isTemplate;
    if (currentFolder === 'powerforms') return matchesSearch && doc.isPowerForm;
    return matchesSearch && doc.folder === currentFolder;
  });

  const toggleBulk = (id: string) => {
    if (bulkSelect.includes(id)) {
      setBulkSelect(bulkSelect.filter(x => x !== id));
    } else {
      setBulkSelect([...bulkSelect, id]);
    }
  };

  const handleBulkSend = () => {
    if (bulkSelect.length === 0) return;
    setShowBulkInviteModal(true);
  };

  const executeBulkSend = () => {
    alert(`Bulk Send Executed!\n${bulkSelect.length} documents sent to emails:\n${bulkEmails}`);
    setBulkSelect([]);
    setBulkEmails('');
    setShowBulkInviteModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Welcome back to SignFlow Studio!</h1>
          <p className="text-blue-100 mt-1 max-w-xl">
            Design contracts, place signatures, collect payment, verify identities, and bulk-send documents safely and securely in compliance with ESIGN and eIDAS guidelines.
          </p>
        </div>
        <button
          onClick={onCreateDoc}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl transition duration-150 shadow-md whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Create Document
        </button>
      </div>

      {/* Analytics Dashboard Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Out for Signature</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalSent}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Completed Docs</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalCompleted}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Templates Available</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalTemplates}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Share2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">PowerForms</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">{totalPowerForms}</h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 col-span-2 lg:col-span-1">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Payments Collected</p>
            <h3 className="text-2xl font-bold text-slate-800 mt-1">${totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Folders */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="font-semibold text-slate-700 px-2 py-1 text-sm uppercase tracking-wider">Folders</h3>
            <button
              onClick={() => onSetFolder('all')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                currentFolder === 'all' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2"><FolderOpen className="w-4 h-4" /> All Files</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {documents.length}
              </span>
            </button>
            <button
              onClick={() => onSetFolder('inbox')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                currentFolder === 'inbox' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2"><Mail className="w-4 h-4" /> Inbox</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {documents.filter(d => d.folder === 'inbox').length}
              </span>
            </button>
            <button
              onClick={() => onSetFolder('sent')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                currentFolder === 'sent' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Sent (Waiting)</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {documents.filter(d => d.folder === 'sent').length}
              </span>
            </button>
            <button
              onClick={() => onSetFolder('signed')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                currentFolder === 'signed' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Fully Signed</span>
              <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-full font-medium">
                {documents.filter(d => d.folder === 'signed').length}
              </span>
            </button>
            <button
              onClick={() => onSetFolder('drafts')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-sm flex items-center justify-between transition ${
                currentFolder === 'drafts' ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="flex items-center gap-2"><Clock className="w-4 h-4" /> Drafts</span>
              <span className="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full font-medium">
                {documents.filter(d => d.folder === 'drafts').length}
              </span>
            </button>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2">
            <h3 className="font-semibold text-slate-700 px-2 py-1 text-sm uppercase tracking-wider">Features</h3>
            <button
              onClick={() => setView('templates')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <Layers className="w-4 h-4 text-purple-500" /> Templates & Team
            </button>
            <button
              onClick={() => setView('powerforms')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4 text-emerald-500" /> PowerForms Portal
            </button>
            <button
              onClick={() => setView('branding')}
              className="w-full text-left px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2"
            >
              <Settings className="w-4 h-4 text-blue-500" /> Branding Settings
            </button>
          </div>
        </div>

        {/* Right Column: Document List */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="relative w-full md:w-72">
                <input
                  type="text"
                  placeholder="Search documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <FileText className="absolute left-3 top-2.5 w-4.5 h-4.5 text-slate-400" />
              </div>

              <div className="flex gap-2 w-full md:w-auto justify-end">
                {bulkSelect.length > 0 && (
                  <button
                    onClick={handleBulkSend}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition duration-150"
                  >
                    <Send className="w-4 h-4" />
                    Bulk Send ({bulkSelect.length})
                  </button>
                )}
                <button
                  onClick={onCreateDoc}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition duration-150"
                >
                  <Plus className="w-4 h-4" />
                  New Doc
                </button>
              </div>
            </div>

            {/* Document Listing Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-semibold uppercase tracking-wider border-b border-slate-100">
                    <th className="p-4 w-10">
                      <input
                        type="checkbox"
                        checked={bulkSelect.length === filteredDocs.length && filteredDocs.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelect(filteredDocs.map(d => d.id));
                          } else {
                            setBulkSelect([]);
                          }
                        }}
                        className="rounded border-slate-300 focus:ring-blue-500 h-4 w-4 text-blue-600"
                      />
                    </th>
                    <th className="p-4">Document Details</th>
                    <th className="p-4">Signers</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-slate-400">
                        <FileText className="w-12 h-12 mx-auto stroke-1 mb-2" />
                        No documents found in this view.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map(doc => {
                      const requiresPayment = doc.fields.some(f => f.type === 'payment');
                      const paymentField = doc.fields.find(f => f.type === 'payment');
                      const paymentCompleted = paymentField?.value === 'Paid';

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4">
                            <input
                              type="checkbox"
                              checked={bulkSelect.includes(doc.id)}
                              onChange={() => toggleBulk(doc.id)}
                              className="rounded border-slate-300 focus:ring-blue-500 h-4 w-4 text-blue-600"
                            />
                          </td>
                          <td className="p-4">
                            <div>
                              <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                {doc.isTemplate && <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-1.5 py-0.5 rounded">TEMPLATE</span>}
                                {doc.isPowerForm && <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-1.5 py-0.5 rounded">POWERFORM</span>}
                                {doc.title}
                              </div>
                              <div className="text-xs text-slate-400 mt-0.5">
                                Updated {doc.updatedAt} • {doc.pages.length} Pages
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex -space-x-2 overflow-hidden">
                              {doc.recipients.map((recipient, idx) => (
                                <div
                                  key={idx}
                                  title={`${recipient.name} (${recipient.role}) - ${recipient.status}`}
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-white text-xs font-bold text-white shadow-sm ${
                                    recipient.status === 'signed' ? 'bg-emerald-500' : 'bg-slate-400'
                                  }`}
                                >
                                  {recipient.name.substring(0, 2).toUpperCase()}
                                </div>
                              ))}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold w-fit ${
                                doc.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                                doc.status === 'waiting' ? 'bg-amber-100 text-amber-800' :
                                doc.status === 'template' ? 'bg-purple-100 text-purple-800' :
                                'bg-slate-100 text-slate-800'
                              }`}>
                                {doc.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                                {doc.status.toUpperCase()}
                              </span>
                              
                              {requiresPayment && (
                                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${paymentCompleted ? 'text-emerald-600' : 'text-slate-500'}`}>
                                  <DollarSign className="w-3 h-3" />
                                  {paymentCompleted ? `Paid $${paymentField?.paymentAmount}` : `Pending $${paymentField?.paymentAmount}`}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              {doc.status === 'draft' || doc.status === 'template' || doc.status === 'powerform' ? (
                                <button
                                  onClick={() => onSelectDoc(doc, 'edit')}
                                  className="p-1.5 hover:bg-slate-100 text-blue-600 rounded-lg transition"
                                  title="Edit & Design Document"
                                >
                                  <Edit3 className="w-4.5 h-4.5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => onSelectDoc(doc, 'view')}
                                  className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-lg transition"
                                  title="View Details"
                                >
                                  <Eye className="w-4.5 h-4.5" />
                                </button>
                              )}

                              {doc.status === 'waiting' && (
                                <button
                                  onClick={() => onSelectDoc(doc, 'sign')}
                                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                                  title="Simulate Recipient Signing Portal"
                                >
                                  Sign Portal <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => onSelectDoc(doc, 'docsend')}
                                className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-lg transition"
                                title="DocSend Tracking Links & Analytics"
                              >
                                DocSend <Send className="w-3 h-3" />
                              </button>

                              <button
                                onClick={() => onDeleteDoc(doc.id)}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition"
                                title="Delete Document"
                              >
                                <Trash2 className="w-4.5 h-4.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Send Invite Modal */}
      {showBulkInviteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-800">Bulk Send Invites</h3>
            <p className="text-sm text-slate-500">
              You are sending {bulkSelect.length} documents in bulk. Enter emails separated by commas or new lines. Each recipient will receive a branded secure link to sign their assigned document.
            </p>
            <textarea
              rows={4}
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder="e.g. signer1@example.com, signer2@example.com"
              className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowBulkInviteModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={executeBulkSend}
                disabled={!bulkEmails.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
