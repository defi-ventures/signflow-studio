export interface BrandingSettings {
  logoUrl?: string;
  companyName: string;
  primaryColor: string;
  accentColor: string;
  emailFooter: string;
  showPoweredBy: boolean;
}

export type FieldType = 
  | 'text' 
  | 'signature' 
  | 'initial' 
  | 'date' 
  | 'checkbox' 
  | 'radio' 
  | 'dropdown' 
  | 'attachment' 
  | 'payment';

export interface FormField {
  id: string;
  type: FieldType;
  page: number; // 1-indexed
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage or px width
  height: number; // percentage or px height
  label: string;
  required: boolean;
  role: string; // assigned signer role (e.g. 'Signer 1')
  value?: string; // value filled by signer
  options?: string[]; // for dropdown or radio
  placeholder?: string;
  validationType?: 'none' | 'email' | 'number' | 'letters-only';
  // Conditional logic: "Show this field ONLY IF triggerFieldId equals triggerValue"
  conditional?: {
    triggerFieldId: string;
    triggerValue: string;
  };
  paymentAmount?: number; // for payment type
}

export interface DrawingAction {
  id: string;
  page: number;
  type: 'pen' | 'highlighter' | 'rect' | 'circle' | 'line' | 'arrow';
  points?: { x: number; y: number }[]; // for freehand
  x?: number; // for shapes
  y?: number;
  width?: number;
  height?: number;
  color: string;
  lineWidth: number;
}

export interface DocumentPage {
  id: string;
  pageNumber: number;
  backgroundUrl?: string; // canvas background, e.g. white, imported pdf page, or image
  rotation: number; // 0, 90, 180, 270
}

export interface SignerRecipient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string; // 'Signer 1', 'Signer 2', etc.
  order: number; // Signing order (1, 2, 3...)
  status: 'pending' | 'notified' | 'verified' | 'signed' | 'declined';
  verificationType: 'none' | 'passcode' | 'sms';
  verificationCode?: string;
  signedAt?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ipAddress: string;
  details: string;
}

export interface PDFDocument {
  id: string;
  title: string;
  status: 'draft' | 'waiting' | 'completed' | 'declined' | 'template' | 'powerform';
  createdAt: string;
  updatedAt: string;
  creator: string;
  pages: DocumentPage[];
  fields: FormField[];
  drawings: DrawingAction[];
  recipients: SignerRecipient[];
  auditLogs: AuditLogEntry[];
  folder: 'inbox' | 'sent' | 'drafts' | 'signed' | 'archive';
  isTemplate?: boolean;
  isPowerForm?: boolean;
  signingOrderSequential?: boolean;
  redirectUrl?: string; // optional post-sign redirect
  smsInvites?: boolean;
  autoReminders?: boolean;
  reminderInterval?: number; // days
  paymentRequested?: boolean;
  paymentAmount?: number;
  docSendLinks?: DocSendLink[];
}

export interface DocSendVisitor {
  id: string;
  email?: string;
  joinedAt: string;
  durationSeconds: number;
  ndaAccepted?: boolean;
  answers?: Record<string, string>; // question text -> answer
  pageStats: Record<number, number>; // page number -> seconds spent
}

export interface PreViewQuestion {
  id: string;
  text: string;
  type: 'text' | 'yesno';
}

export interface DocSendLink {
  id: string;
  name: string; // e.g., "Link for Sequoia Capital"
  createdAt: string;
  isActive: boolean;
  expiryDate?: string;
  requireEmail: boolean;
  requireNda: boolean;
  allowDownload: boolean;
  passwordProtection?: string;
  questions: PreViewQuestion[];
  visitors: DocSendVisitor[];
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
}

export type SpecialistRole = 'legal' | 'accounting' | 'banking';

export interface SpecialistMemoryEntry {
  documentId: string;
  documentTitle: string;
  savedAt: string;
  specialistNotes?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface TemplateComment {
  id: string;
  author: string;
  text: string;
  timestamp: string;
}
