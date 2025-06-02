import { ObjectId } from 'mongodb'

// Base MongoDB document interface
export interface MongoDocument {
  _id?: ObjectId
  createdAt: Date
  updatedAt: Date
}

// User Profile MongoDB Model (detailed user information)
export interface UserDocument extends MongoDocument {
  userId: string // Unique user identifier
  email: string
  name: string
  avatar?: string
  bio?: string
  phone?: string
  company?: string
  department?: string
  jobTitle?: string
  location?: string
  timezone?: string
  preferences: {
    notifications: boolean
    emailUpdates: boolean
    theme: 'light' | 'dark' | 'auto'
    language: string
  }
  socialLinks?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  skills?: string[]
  status: 'active' | 'inactive' | 'pending'
  lastLoginAt?: Date
  emailVerified: boolean
  onboardingCompleted: boolean
}

// Board Member reference (lightweight, references User collection)
export interface BoardMember {
  userId: string // Reference to User document
  role: 'Admin' | 'Member' | 'Viewer'
  addedAt: Date
  addedBy: string // userId of who added this member
  permissions?: {
    canInviteMembers: boolean
    canEditDocuments: boolean
    canDeleteDocuments: boolean
    canManageNotes: boolean
  }
  status: 'active' | 'pending' | 'inactive'
}

// Board Workspace MongoDB Model (with user references)
export interface BoardWorkspaceDocument extends MongoDocument {
  boardId: string // Unique board identifier
  name: string
  description?: string
  createdBy: string // userId
  lastActivity: Date
  members: BoardMember[] // References to users
  settings: {
    allowMemberInvites: boolean
    requireApproval: boolean
    isPublic: boolean
    allowGuestAccess: boolean
  }
  metadata: {
    version: string
    documentsCount: number
    membersCount: number
    chatSessionsCount: number
    savedNotesCount: number
  }
}

// Document MongoDB Model
export interface DocumentDocument extends MongoDocument {
  boardId: string
  documentId: string // Unique document identifier
  name: string
  type: string
  size: number
  uploadedAt: Date
  uploadedBy: string // userId
  status: 'processing' | 'ready' | 'error'
  extractedText?: string
  filePath?: string // Path to stored file
  metadata: {
    originalName: string
    mimeType: string
    uploadedBy?: string
  }
}

// Chat Session MongoDB Model
export interface ChatSessionDocument extends MongoDocument {
  boardId: string
  sessionId: string // Unique session identifier
  title: string
  createdBy: string // userId
  messages: ChatMessageData[]
}

export interface ChatMessageData {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  userId?: string // For user messages
  charts?: any[]
  summary?: any
}

// Saved Note MongoDB Model
export interface SavedNoteDocument extends MongoDocument {
  boardId: string
  noteId: string // Unique note identifier
  title: string
  content: string
  category: 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general'
  source?: string
  createdBy: string // userId
  isPinned: boolean
  tags: string[]
  charts?: any[]
  summary?: any
}

// Upload Tracking MongoDB Model (for file uploads)
export interface UploadDocument extends MongoDocument {
  boardId: string
  uploadId: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  filePath: string
  status: 'uploading' | 'completed' | 'failed'
  uploadedBy: string // userId
  metadata?: Record<string, any>
}

// Database indexes for better performance
export const INDEX_DEFINITIONS = {
  users: [
    { key: { userId: 1 }, unique: true },
    { key: { email: 1 }, unique: true },
    { key: { status: 1 } },
    { key: { lastLoginAt: -1 } },
    { key: { company: 1 } }
  ],
  boards: [
    { key: { boardId: 1 }, unique: true },
    { key: { createdBy: 1 } },
    { key: { lastActivity: -1 } },
    { key: { 'members.userId': 1 } }, // Index for member user ID searches
    { key: { 'members.role': 1 } } // Index for role-based queries
  ],
  documents: [
    { key: { boardId: 1, documentId: 1 }, unique: true },
    { key: { boardId: 1 } },
    { key: { status: 1 } },
    { key: { uploadedAt: -1 } },
    { key: { uploadedBy: 1 } }
  ],
  chatSessions: [
    { key: { boardId: 1, sessionId: 1 }, unique: true },
    { key: { boardId: 1 } },
    { key: { createdBy: 1 } },
    { key: { updatedAt: -1 } }
  ],
  savedNotes: [
    { key: { boardId: 1, noteId: 1 }, unique: true },
    { key: { boardId: 1 } },
    { key: { category: 1 } },
    { key: { createdBy: 1 } },
    { key: { isPinned: -1, updatedAt: -1 } }
  ],
  uploads: [
    { key: { boardId: 1, uploadId: 1 }, unique: true },
    { key: { boardId: 1 } },
    { key: { status: 1 } },
    { key: { uploadedBy: 1 } },
    { key: { createdAt: -1 } }
  ]
} as const 