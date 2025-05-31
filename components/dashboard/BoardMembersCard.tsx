'use client'

import { useState } from 'react'
import { Users, Plus, Trash2, Mail, Crown, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface BoardMember {
  id: string
  name: string
  email: string
  role: string
  addedAt: Date
  status: 'active' | 'pending' | 'inactive'
}

interface NewMemberForm {
  name: string
  email: string
  role: string
}

interface BoardMembersCardProps {
  boardMembers: BoardMember[]
  isAdmin: boolean
  currentUser: any
  showAddMember: boolean
  newMember: NewMemberForm
  onToggleAddMember: () => void
  onUpdateNewMember: (field: keyof NewMemberForm, value: string) => void
  onAddMember: () => void
  onRemoveMember: (memberId: string) => void
}

export default function BoardMembersCard({
  boardMembers,
  isAdmin,
  currentUser,
  showAddMember,
  newMember,
  onToggleAddMember,
  onUpdateNewMember,
  onAddMember,
  onRemoveMember
}: BoardMembersCardProps) {
  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'admin':
        return <Crown className="w-4 h-4 text-yellow-500" />
      case 'member':
        return <User className="w-4 h-4 text-blue-500" />
      default:
        return <User className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50'
      case 'pending':
        return 'text-yellow-600 bg-yellow-50'
      case 'inactive':
        return 'text-gray-600 bg-gray-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Board Members</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {boardMembers.length} members
          </span>
          {isAdmin && (
            <button
              onClick={onToggleAddMember}
              className="p-1 text-blue-600 hover:text-blue-700 transition-colors"
              title="Add member"
            >
              <Plus className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Add Member Form */}
      {showAddMember && (
        <div className="mb-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-xs font-medium text-blue-900 mb-2">Add New Member</h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Full name"
              value={newMember.name}
              onChange={(e) => onUpdateNewMember('name', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="email"
              placeholder="Email address"
              value={newMember.email}
              onChange={(e) => onUpdateNewMember('email', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            />
            <select
              value={newMember.role}
              onChange={(e) => onUpdateNewMember('role', e.target.value)}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select role</option>
              <option value="Member">Member</option>
              <option value="Admin">Admin</option>
            </select>
            <div className="flex items-center space-x-2 pt-1">
              <button
                onClick={onAddMember}
                disabled={!newMember.name || !newMember.email || !newMember.role}
                className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={onToggleAddMember}
                className="px-3 py-1 text-gray-600 hover:text-gray-800 text-xs transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Members List */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {boardMembers.map((member) => (
          <div key={member.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-medium">
                {member.name.charAt(0).toUpperCase()}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1">
                <p className="text-xs font-medium text-gray-900 truncate">{member.name}</p>
                {member.role === 'Admin' && <Crown className="w-3 h-3 text-yellow-500" />}
                {member.role === 'Member' && <User className="w-3 h-3 text-gray-500" />}
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500 truncate">{member.email}</span>
                <span className="text-xs text-gray-400">•</span>
                <span className={`text-xs font-medium ${
                  member.status === 'active' ? 'text-green-600' :
                  member.status === 'pending' ? 'text-yellow-600' :
                  'text-gray-500'
                }`}>
                  {member.status}
                </span>
              </div>
            </div>
            
            {isAdmin && member.id !== currentUser.id && (
              <button
                onClick={() => onRemoveMember(member.id)}
                className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
                title="Remove member"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {boardMembers.length === 0 && (
        <div className="text-center py-6">
          <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs">No board members</p>
          <p className="text-gray-400 text-xs mt-1">Add members to start collaborating</p>
        </div>
      )}
    </div>
  )
} 