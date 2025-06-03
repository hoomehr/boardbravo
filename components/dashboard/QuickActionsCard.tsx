'use client'

import { useState } from 'react'
import { 
  Mail, 
  Calendar, 
  FileText, 
  Bell, 
  CheckSquare, 
  BarChart3, 
  UserPlus, 
  Share2,
  Download,
  Clock,
  Users,
  Send,
  ChevronDown,
  X,
  Plus,
  Paperclip,
  User,
  Check
} from 'lucide-react'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  color: string
  hoverColor: string
  action: () => void
}

interface AttachedNote {
  id: string
  title: string
  content: string
  category: string
}

interface QuickActionsCardProps {
  currentUser: any
  boardMembers: any[]
  isAdmin: boolean
  savedNotes?: AttachedNote[]
  onCreateAction?: (actionType: string, details: any) => void
}

export default function QuickActionsCard({
  currentUser,
  boardMembers,
  isAdmin,
  savedNotes = [],
  onCreateAction
}: QuickActionsCardProps) {
  const [showActionModal, setShowActionModal] = useState(false)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [showMemberDropdown, setShowMemberDropdown] = useState(false)
  const [showNotesDropdown, setShowNotesDropdown] = useState(false)
  const [actionDetails, setActionDetails] = useState({
    subject: '',
    message: '',
    recipients: [] as string[],
    dueDate: '',
    priority: 'medium',
    attachedNotes: [] as AttachedNote[]
  })

  const executeQuickAction = (actionId: string) => {
    // Reset state
    setActionDetails({
      subject: '',
      message: '',
      recipients: [],
      dueDate: '',
      priority: 'medium',
      attachedNotes: []
    })

    switch (actionId) {
      case 'email-investors':
        setSelectedAction('email-investors')
        setActionDetails({
          ...actionDetails,
          subject: 'Board Update - Q4 Performance',
          message: 'Dear Investors,\n\nI hope this message finds you well. I wanted to provide you with an update on our Q4 performance and upcoming initiatives.\n\nKey Highlights:\n• [Add key metrics here]\n• [Add achievements here]\n• [Add strategic updates here]\n\nI look forward to discussing these developments further in our upcoming meeting.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'schedule-meeting':
        setSelectedAction('schedule-meeting')
        setActionDetails({
          ...actionDetails,
          subject: 'Board Meeting - Monthly Review',
          message: 'Dear Board Members,\n\nYou are invited to attend our upcoming board meeting.\n\nMeeting Details:\n• Date: [Please select date]\n• Time: [Please select time]\n• Location: [In-person/Virtual]\n• Duration: Approximately 2 hours\n\nAgenda:\n• Financial Review\n• Strategic Updates\n• Action Items Review\n• New Business\n\nPlease confirm your availability by replying to this invitation.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'request-document':
        setSelectedAction('request-document')
        setActionDetails({
          ...actionDetails,
          subject: 'Document Request - Board Review',
          message: 'Dear Team,\n\nI am requesting the following documents for our upcoming board review:\n\n📄 Required Documents:\n• [Document 1]\n• [Document 2]\n• [Document 3]\n\n📅 Deadline: [Please specify date]\n\n📋 Format: Please provide in PDF format\n📁 Delivery: Please upload to our shared board folder\n\nIf you have any questions or need clarification, please don\'t hesitate to reach out.\n\nThank you for your assistance.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'send-reminder':
        setSelectedAction('send-reminder')
        setActionDetails({
          ...actionDetails,
          subject: 'Reminder: Pending Action Items',
          message: 'Dear Team,\n\nThis is a friendly reminder about the following pending action items:\n\n⏰ Upcoming Deadlines:\n• [Action Item 1] - Due: [Date]\n• [Action Item 2] - Due: [Date]\n• [Action Item 3] - Due: [Date]\n\n📋 Please update the status of these items and let me know if you need any assistance or if there are any blockers.\n\n🔄 Next Steps:\n• Review current progress\n• Update completion status\n• Communicate any delays immediately\n\nThank you for your attention to these matters.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'create-action-item':
        setSelectedAction('create-action-item')
        setActionDetails({
          ...actionDetails,
          subject: 'New Action Item Assignment',
          message: 'Dear Team,\n\nI am assigning the following action item:\n\n📝 Action Item: [Specify the task]\n\n📋 Description:\n[Provide detailed description of what needs to be done]\n\n🎯 Objectives:\n• [Objective 1]\n• [Objective 2]\n\n📅 Due Date: [Specify deadline]\n👤 Assigned to: [Team member name]\n⚡ Priority: [High/Medium/Low]\n\n📊 Success Criteria:\n• [Criteria 1]\n• [Criteria 2]\n\nPlease confirm receipt and estimated completion timeline.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'generate-report':
        alert('🚀 Report generation feature coming soon!')
        break
      case 'request-approval':
        setSelectedAction('request-approval')
        setActionDetails({
          ...actionDetails,
          subject: 'Approval Request - Board Decision',
          message: 'Dear Board Members,\n\nI am requesting your approval for the following matter:\n\n📋 Request Details:\n[Provide specific details of what requires approval]\n\n💰 Financial Impact:\n• Budget: $[Amount]\n• Timeline: [Duration]\n• ROI: [Expected return]\n\n📊 Business Justification:\n• [Reason 1]\n• [Reason 2]\n• [Reason 3]\n\n⚡ Urgency: [High/Medium/Low]\n📅 Decision Required By: [Date]\n\n📎 Supporting Documents:\n[List any attached documents or references]\n\nPlease review and provide your approval or feedback.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'share-update':
        setSelectedAction('share-update')
        setActionDetails({
          ...actionDetails,
          subject: 'Board Update - Progress Report',
          message: 'Dear Board Members,\n\nI wanted to share an important update on our recent progress:\n\n📈 Key Highlights:\n• [Achievement 1]\n• [Achievement 2]\n• [Achievement 3]\n\n📊 Metrics Update:\n• [Metric 1]: [Value/Status]\n• [Metric 2]: [Value/Status]\n• [Metric 3]: [Value/Status]\n\n🎯 Next Steps:\n• [Next action 1]\n• [Next action 2]\n• [Next action 3]\n\n⚠️ Challenges & Mitigation:\n• [Challenge 1]: [Mitigation strategy]\n• [Challenge 2]: [Mitigation strategy]\n\n📅 Timeline:\n[Provide relevant timeline information]\n\nI look forward to discussing these updates in our next meeting.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      case 'export-data':
        alert('📊 Data export feature coming soon!')
        break
      case 'invite-guest':
        setSelectedAction('invite-guest')
        setActionDetails({
          ...actionDetails,
          subject: 'Board Meeting Guest Invitation',
          message: 'Dear [Guest Name],\n\nYou are cordially invited to attend our upcoming board meeting as a guest speaker/advisor.\n\n📅 Meeting Details:\n• Date: [Meeting date]\n• Time: [Start time] - [End time]\n• Location: [Venue/Virtual link]\n• Duration: [Expected duration]\n\n🎯 Your Role:\n• [Specific purpose/presentation topic]\n• [Expected contribution]\n• [Time allocation]\n\n📋 Agenda Item:\n• [Relevant agenda section]\n• [Discussion topics]\n\n📎 Preparation:\n• [Any materials to review]\n• [Presentation requirements]\n• [Technical setup details]\n\nPlease confirm your availability and let us know if you have any questions.\n\nWe look forward to your valuable insights.\n\nBest regards,\n' + currentUser.name,
          recipients: [],
          attachedNotes: []
        })
        setShowActionModal(true)
        break
      default:
        console.log('Action not implemented:', actionId)
    }
  }

  const quickActions: QuickAction[] = [
    {
      id: 'email-investors',
      title: 'Email Investors',
      description: 'Send update to investors',
      icon: Mail,
      color: 'bg-blue-50',
      hoverColor: 'hover:bg-blue-100',
      action: () => executeQuickAction('email-investors')
    },
    {
      id: 'schedule-meeting',
      title: 'Schedule Meeting',
      description: 'Set up board meeting',
      icon: Calendar,
      color: 'bg-green-50',
      hoverColor: 'hover:bg-green-100',
      action: () => executeQuickAction('schedule-meeting')
    },
    {
      id: 'request-document',
      title: 'Request Document',
      description: 'Ask for specific files',
      icon: FileText,
      color: 'bg-orange-50',
      hoverColor: 'hover:bg-orange-100',
      action: () => executeQuickAction('request-document')
    },
    {
      id: 'send-reminder',
      title: 'Send Reminder',
      description: 'Remind about deadlines',
      icon: Bell,
      color: 'bg-yellow-50',
      hoverColor: 'hover:bg-yellow-100',
      action: () => executeQuickAction('send-reminder')
    },
    {
      id: 'create-action-item',
      title: 'Create Action',
      description: 'Assign new task',
      icon: CheckSquare,
      color: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      action: () => executeQuickAction('create-action-item')
    },
    {
      id: 'generate-report',
      title: 'Generate Report',
      description: 'Create board report',
      icon: BarChart3,
      color: 'bg-indigo-50',
      hoverColor: 'hover:bg-indigo-100',
      action: () => executeQuickAction('generate-report')
    },
    {
      id: 'request-approval',
      title: 'Request Approval',
      description: 'Get decision approval',
      icon: CheckSquare,
      color: 'bg-red-50',
      hoverColor: 'hover:bg-red-100',
      action: () => executeQuickAction('request-approval')
    },
    {
      id: 'share-update',
      title: 'Share Update',
      description: 'Send status update',
      icon: Share2,
      color: 'bg-cyan-50',
      hoverColor: 'hover:bg-cyan-100',
      action: () => executeQuickAction('share-update')
    },
    {
      id: 'export-data',
      title: 'Export Data',
      description: 'Download board data',
      icon: Download,
      color: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      action: () => executeQuickAction('export-data')
    },
    {
      id: 'invite-guest',
      title: 'Invite Guest',
      description: 'Add meeting guest',
      icon: UserPlus,
      color: 'bg-emerald-50',
      hoverColor: 'hover:bg-emerald-100',
      action: () => executeQuickAction('invite-guest')
    }
  ]

  const handleSendAction = () => {
    if (onCreateAction && selectedAction) {
      onCreateAction(selectedAction, actionDetails)
    }
    
    // Simulate sending (in real app, this would integrate with email service)
    alert(`✅ ${getActionTitle(selectedAction)} has been sent successfully!`)
    
    setShowActionModal(false)
    setSelectedAction(null)
    setActionDetails({
      subject: '',
      message: '',
      recipients: [],
      dueDate: '',
      priority: 'medium',
      attachedNotes: []
    })
  }

  const getActionTitle = (actionId: string | null) => {
    const action = quickActions.find(a => a.id === actionId)
    return action?.title || 'Action'
  }

  const toggleMemberSelection = (memberEmail: string) => {
    if (actionDetails.recipients.includes(memberEmail)) {
      setActionDetails({
        ...actionDetails,
        recipients: actionDetails.recipients.filter(email => email !== memberEmail)
      })
    } else {
      setActionDetails({
        ...actionDetails,
        recipients: [...actionDetails.recipients, memberEmail]
      })
    }
  }

  const toggleNoteAttachment = (note: AttachedNote) => {
    const isAttached = actionDetails.attachedNotes.some(n => n.id === note.id)
    if (isAttached) {
      setActionDetails({
        ...actionDetails,
        attachedNotes: actionDetails.attachedNotes.filter(n => n.id !== note.id)
      })
    } else {
      setActionDetails({
        ...actionDetails,
        attachedNotes: [...actionDetails.attachedNotes, note]
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
          <div className="flex items-center space-x-2">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {quickActions.length} actions
            </span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <button
                key={action.id}
                onClick={action.action}
                className={`p-3 rounded-lg border transition-colors duration-200 text-left ${action.color} ${action.hoverColor} border-gray-200 hover:border-gray-300 group hover:shadow-sm`}
              >
                <div className="flex items-center space-x-2 mb-1">
                  <IconComponent className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
                </div>
                <h3 className="text-xs font-medium text-gray-900 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500 leading-tight">{action.description}</p>
              </button>
            )
          })}
        </div>

        <div className="mt-3 pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500 text-center">
            Quick access to common board tasks
          </p>
        </div>
      </div>

      {/* Enhanced Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                    <Mail className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {getActionTitle(selectedAction)}
                  </h3>
                </div>
                <button
                  onClick={() => setShowActionModal(false)}
                  className="text-white hover:text-gray-200 transition-colors p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left Column - Main Form */}
                <div className="lg:col-span-2 space-y-6">
                  
                  {/* Recipients Section */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-blue-600" />
                      Recipients
                    </label>
                    
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      >
                        <span className="text-sm text-gray-700">
                          {actionDetails.recipients.length === 0 
                            ? 'Select board members...' 
                            : `${actionDetails.recipients.length} member${actionDetails.recipients.length !== 1 ? 's' : ''} selected`
                          }
                        </span>
                        <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showMemberDropdown ? 'rotate-180' : ''}`} />
                      </button>

                      {showMemberDropdown && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {boardMembers.map((member) => (
                            <div
                              key={member.id}
                              onClick={() => toggleMemberSelection(member.email)}
                              className="flex items-center px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                  <User className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{member.name}</p>
                                  <p className="text-xs text-gray-500">{member.email}</p>
                                </div>
                              </div>
                              {actionDetails.recipients.includes(member.email) && (
                                <Check className="w-4 h-4 text-green-600" />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Selected Recipients Tags */}
                    {actionDetails.recipients.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-3">
                        {actionDetails.recipients.map((email) => {
                          const member = boardMembers.find(m => m.email === email)
                          return (
                            <span
                              key={email}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
                            >
                              {member?.name || email}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleMemberSelection(email)
                                }}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-600" />
                      Subject
                    </label>
                    <input
                      type="text"
                      value={actionDetails.subject}
                      onChange={(e) => setActionDetails({ ...actionDetails, subject: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter subject line..."
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-blue-600" />
                      Message
                    </label>
                    <textarea
                      value={actionDetails.message}
                      onChange={(e) => setActionDetails({ ...actionDetails, message: e.target.value })}
                      rows={12}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-colors"
                      placeholder="Enter your message..."
                    />
                  </div>
                </div>

                {/* Right Column - Settings & Attachments */}
                <div className="space-y-6">
                  
                  {/* Priority & Due Date */}
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h4 className="text-sm font-semibold text-gray-900 flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-blue-600" />
                      Settings
                    </h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                      <select
                        value={actionDetails.priority}
                        onChange={(e) => setActionDetails({ ...actionDetails, priority: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="low">🟢 Low</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="high">🟠 High</option>
                        <option value="urgent">🔴 Urgent</option>
                      </select>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(actionDetails.priority)}`}>
                          {actionDetails.priority.charAt(0).toUpperCase() + actionDetails.priority.slice(1)} Priority
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
                      <input
                        type="date"
                        value={actionDetails.dueDate}
                        onChange={(e) => setActionDetails({ ...actionDetails, dueDate: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Attach Notes */}
                  {savedNotes && savedNotes.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <Paperclip className="w-4 h-4 mr-2 text-blue-600" />
                        Attach Notes
                      </label>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setShowNotesDropdown(!showNotesDropdown)}
                          className="w-full flex items-center justify-between px-3 py-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm"
                        >
                          <span className="text-gray-700">
                            {actionDetails.attachedNotes.length === 0 
                              ? 'Select notes to attach...' 
                              : `${actionDetails.attachedNotes.length} note${actionDetails.attachedNotes.length !== 1 ? 's' : ''} attached`
                            }
                          </span>
                          <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showNotesDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {showNotesDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                            {savedNotes.map((note) => (
                              <div
                                key={note.id}
                                onClick={() => toggleNoteAttachment(note)}
                                className="flex items-start px-3 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">{note.title}</p>
                                  <p className="text-xs text-gray-500 truncate">{note.content.substring(0, 50)}...</p>
                                  <span className="inline-block text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded mt-1">
                                    {note.category}
                                  </span>
                                </div>
                                {actionDetails.attachedNotes.some(n => n.id === note.id) && (
                                  <Check className="w-4 h-4 text-green-600 ml-2 flex-shrink-0" />
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Attached Notes List */}
                      {actionDetails.attachedNotes.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {actionDetails.attachedNotes.map((note) => (
                            <div key={note.id} className="flex items-center justify-between bg-white p-2 rounded border">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">{note.title}</p>
                                <span className="text-xs text-gray-500">{note.category}</span>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleNoteAttachment(note)
                                }}
                                className="text-gray-400 hover:text-gray-600 ml-2"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">
                    {actionDetails.recipients.length} recipient{actionDetails.recipients.length !== 1 ? 's' : ''}
                  </span>
                  {actionDetails.attachedNotes.length > 0 && (
                    <span className="ml-3">
                      • {actionDetails.attachedNotes.length} note{actionDetails.attachedNotes.length !== 1 ? 's' : ''} attached
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSendAction}
                    disabled={!actionDetails.subject.trim() || !actionDetails.message.trim() || actionDetails.recipients.length === 0}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 font-medium shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                    <span>Send {getActionTitle(selectedAction)}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
} 