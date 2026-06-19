import React, { useState } from 'react';
import { PDFDocument, TeamMember, TemplateComment } from '../types';
import { Layers, Users, MessageSquare, Plus, ArrowLeft, Send, Trash2, Shield, UserCheck } from 'lucide-react';

interface TemplatePanelProps {
  documents: PDFDocument[];
  team: TeamMember[];
  onBack: () => void;
  onUseTemplate: (doc: PDFDocument) => void;
  onAddTeamMember: (member: Omit<TeamMember, 'id'>) => void;
  onDeleteTeamMember: (id: string) => void;
}

export default function TemplatePanel({
  documents,
  team,
  onBack,
  onUseTemplate,
  onAddTeamMember,
  onDeleteTeamMember
}: TemplatePanelProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'team'>('templates');
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'editor' | 'viewer'>('editor');

  const templates = documents.filter(d => d.isTemplate || d.status === 'template');

  // Simulated Comments for templates
  const [comments, setComments] = useState<Record<string, TemplateComment[]>>({
    'doc-template-w9': [
      { id: 'c1', author: 'Sarah Connor', text: 'Please ensure we update the dropdown classification next month.', timestamp: '2026-06-12 16:30' },
      { id: 'c2', author: 'John Doe', text: 'Good catch Sarah, LLC categories need updating.', timestamp: '2026-06-13 09:15' }
    ]
  });

  const [activeCommentDocId, setActiveCommentDocId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState('');

  const handleAddComment = (docId: string) => {
    if (!newCommentText.trim()) return;
    const newComment: TemplateComment = {
      id: Math.random().toString(),
      author: 'Sarah Connor', // Current logged-in simulated user
      text: newCommentText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setComments({
      ...comments,
      [docId]: [...(comments[docId] || []), newComment]
    });
    setNewCommentText('');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberEmail) return;
    onAddTeamMember({
      name: newMemberName,
      email: newMemberEmail,
      role: newMemberRole,
      avatar: newMemberName.substring(0, 2).toUpperCase()
    });
    setNewMemberName('');
    setNewMemberEmail('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Team Collaboration</h1>
            <p className="text-sm text-slate-500">Collaborate on contract templates, co-design forms, and manage secure workspaces.</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'templates' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" /> Shared Templates
          </button>
          <button
            onClick={() => setActiveTab('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
              activeTab === 'team' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" /> Team Members
          </button>
        </div>
      </div>

      {activeTab === 'templates' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Templates List */}
          <div className="lg:col-span-2 space-y-4">
            {templates.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-100 text-center text-slate-400 shadow-sm">
                <Layers className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                <p>No reusable templates available. Click "Create Document" on your dashboard to construct a template.</p>
              </div>
            ) : (
              templates.map(tpl => {
                const docComments = comments[tpl.id] || [];
                return (
                  <div key={tpl.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                          Reusable Template
                        </span>
                        <h3 className="text-lg font-bold text-slate-800 mt-1">{tpl.title}</h3>
                        <p className="text-xs text-slate-400">Created by {tpl.creator} • {tpl.fields.length} placeholders</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setActiveCommentDocId(tpl.id === activeCommentDocId ? null : tpl.id)}
                          className="flex items-center gap-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold px-3 py-2 rounded-xl transition border border-slate-200"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Chat ({docComments.length})
                        </button>
                        <button
                          onClick={() => onUseTemplate(tpl)}
                          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow-sm"
                        >
                          Use Template <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Chat Collaboration area */}
                    {activeCommentDocId === tpl.id && (
                      <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template Thread</h4>
                        <div className="space-y-3 max-h-48 overflow-y-auto">
                          {docComments.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No feedback comments yet. Be the first!</p>
                          ) : (
                            docComments.map(c => (
                              <div key={c.id} className="bg-slate-50 p-2.5 rounded-xl space-y-1 text-xs">
                                <div className="flex justify-between font-semibold text-slate-700">
                                  <span>{c.author}</span>
                                  <span className="text-slate-400 text-[10px]">{c.timestamp}</span>
                                </div>
                                <p className="text-slate-600">{c.text}</p>
                              </div>
                            ))
                          )}
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add collaboration note..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment(tpl.id)}
                            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                          />
                          <button
                            onClick={() => handleAddComment(tpl.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Info Box */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-xl flex flex-col justify-between h-fit space-y-4">
            <div>
              <h3 className="text-lg font-bold">Collaborative Workspace</h3>
              <p className="text-slate-300 text-xs mt-1 leading-relaxed">
                Save hours by defining signature workflows once. Your colleagues can access these templates immediately, comment on form logic, and trigger automated signing workflows.
              </p>
            </div>
            <div className="space-y-2 border-t border-slate-800 pt-3">
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <Shield className="w-4 h-4 text-emerald-400" /> Auto-encryption activated
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <UserCheck className="w-4 h-4 text-emerald-400" /> Strict role separation enabled
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Team Members Screen */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Team Directory */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-4 bg-slate-50 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-700">Team Directory ({team.length})</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {team.map(member => (
                  <div key={member.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-inner">
                        {member.avatar || member.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{member.name}</h4>
                        <p className="text-xs text-slate-400">{member.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        member.role === 'admin' ? 'bg-red-50 text-red-600 border border-red-100' :
                        member.role === 'editor' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {member.role}
                      </span>
                      {member.role !== 'admin' && (
                        <button
                          onClick={() => onDeleteTeamMember(member.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Revoke Membership"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Add Team Member form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-4">
            <h3 className="font-bold text-slate-800">Invite New Collaborator</h3>
            <form onSubmit={handleInviteMember} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Robert Downey"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="robert@company.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Role Permission</label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value as any)}
                  className="w-full border border-slate-200 bg-white rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="editor">Editor (Can create templates & send)</option>
                  <option value="viewer">Viewer (Read-only audits & signed docs)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition shadow-sm"
              >
                Send Workspace Invite
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
