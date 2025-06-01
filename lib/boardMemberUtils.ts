import { BoardMember } from '@/types/dashboard'

// Utility functions for board member JSON handling and validation

export interface BoardMemberJSON {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Member'
  addedAt: string // ISO string format
  status: 'active' | 'pending' | 'inactive'
}

// Convert BoardMember to JSON-safe format
export function boardMemberToJSON(member: BoardMember): BoardMemberJSON {
  return {
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role as 'Admin' | 'Member',
    addedAt: member.addedAt instanceof Date ? member.addedAt.toISOString() : String(member.addedAt),
    status: member.status
  }
}

// Convert JSON format back to BoardMember
export function boardMemberFromJSON(memberJSON: BoardMemberJSON): BoardMember {
  return {
    id: memberJSON.id,
    name: memberJSON.name,
    email: memberJSON.email,
    role: memberJSON.role,
    addedAt: new Date(memberJSON.addedAt),
    status: memberJSON.status
  }
}

// Convert array of BoardMembers to JSON format
export function boardMembersToJSON(members: BoardMember[]): BoardMemberJSON[] {
  return members.map(boardMemberToJSON)
}

// Convert array of JSON members back to BoardMembers
export function boardMembersFromJSON(membersJSON: BoardMemberJSON[]): BoardMember[] {
  return membersJSON.map(boardMemberFromJSON)
}

// Validate board member data
export function validateBoardMember(member: any): member is BoardMemberJSON {
  return (
    typeof member === 'object' &&
    member !== null &&
    typeof member.id === 'string' &&
    typeof member.name === 'string' &&
    typeof member.email === 'string' &&
    ['Admin', 'Member'].includes(member.role) &&
    typeof member.addedAt === 'string' &&
    ['active', 'pending', 'inactive'].includes(member.status) &&
    isValidEmail(member.email)
  )
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if user has admin permissions
export function isAdmin(members: BoardMember[], userId: string): boolean {
  const user = members.find(m => m.id === userId)
  return user?.role === 'Admin'
}

// Get member by ID
export function getMemberById(members: BoardMember[], memberId: string): BoardMember | undefined {
  return members.find(m => m.id === memberId)
}

// Get member by email
export function getMemberByEmail(members: BoardMember[], email: string): BoardMember | undefined {
  return members.find(m => m.email.toLowerCase() === email.toLowerCase())
}

// Check if email is already in use
export function isEmailTaken(members: BoardMember[], email: string, excludeId?: string): boolean {
  return members.some(m => 
    m.email.toLowerCase() === email.toLowerCase() && 
    m.id !== excludeId
  )
}

// Generate member statistics
export function getMemberStats(members: BoardMember[]) {
  const total = members.length
  const admins = members.filter(m => m.role === 'Admin').length
  const activeMembers = members.filter(m => m.status === 'active').length
  const pendingMembers = members.filter(m => m.status === 'pending').length
  const inactiveMembers = members.filter(m => m.status === 'inactive').length

  return {
    total,
    admins,
    members: total - admins,
    active: activeMembers,
    pending: pendingMembers,
    inactive: inactiveMembers,
    activePercentage: total > 0 ? Math.round((activeMembers / total) * 100) : 0
  }
}

// Create default board member object
export function createDefaultMember(
  name: string, 
  email: string, 
  role: 'Admin' | 'Member' = 'Member'
): BoardMember {
  return {
    id: Math.random().toString(36).substr(2, 9),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    role,
    addedAt: new Date(),
    status: 'active'
  }
}

// JSON schema for validation
export const BOARD_MEMBER_SCHEMA = {
  type: 'object',
  required: ['id', 'name', 'email', 'role', 'addedAt', 'status'],
  properties: {
    id: { type: 'string', minLength: 1 },
    name: { type: 'string', minLength: 1 },
    email: { type: 'string', format: 'email' },
    role: { type: 'string', enum: ['Admin', 'Member'] },
    addedAt: { type: 'string', format: 'date-time' },
    status: { type: 'string', enum: ['active', 'pending', 'inactive'] }
  }
} as const

// Bulk operations
export function sortMembersByRole(members: BoardMember[]): BoardMember[] {
  return [...members].sort((a, b) => {
    // Admins first, then members
    if (a.role === 'Admin' && b.role !== 'Admin') return -1
    if (a.role !== 'Admin' && b.role === 'Admin') return 1
    // Then sort by name
    return a.name.localeCompare(b.name)
  })
}

export function sortMembersByName(members: BoardMember[]): BoardMember[] {
  return [...members].sort((a, b) => a.name.localeCompare(b.name))
}

export function sortMembersByDate(members: BoardMember[]): BoardMember[] {
  return [...members].sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime())
} 