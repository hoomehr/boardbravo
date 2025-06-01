'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  Zap,
  ArrowLeft,
  Settings,
  Users,
  Building2,
  X,
  BarChart3,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Plus,
  Mail,
  Database
} from 'lucide-react'
import Link from 'next/link'
import { useDropzone } from 'react-dropzone'
import Navbar from '@/components/layout/Navbar'
import { format, formatDistanceToNow } from 'date-fns'

// Import our refactored components
import ChatHistoryCard from '@/components/dashboard/ChatHistoryCard'
import DocumentsCard from '@/components/dashboard/DocumentsCard'
import IntegrationsCard from '@/components/dashboard/IntegrationsCard'
import ChatInterfaceCard from '@/components/dashboard/ChatInterfaceCard'
import BoardMembersCard from '@/components/dashboard/BoardMembersCard'
import NoteBoardCard from '@/components/dashboard/NoteBoardCard'

// Import shared types
import type {
  ChatMessage,
  ChatSession,
  Document,
  BoardWorkspace,
  BoardMember,
  SavedNote,
  Integration,
  AIProviderStatus,
  AgentAction
} from '@/types/dashboard'

export default function DashboardPage() {
  // Core state
  const [documents, setDocuments] = useState<Document[]>([])
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingAction, setProcessingAction] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [showManualAction, setShowManualAction] = useState(false)
  const [manualActionQuery, setManualActionQuery] = useState('')
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([])
  
  // Board workspace management
  const [currentBoard, setCurrentBoard] = useState<BoardWorkspace | null>(null)
  const [showBoardSettings, setShowBoardSettings] = useState(false)
  const [boardName, setBoardName] = useState('')
  const [isAdmin, setIsAdmin] = useState(true)
  const [currentUser] = useState({ 
    id: 'user-1', 
    name: 'John Smith', 
    email: 'john@company.com', 
    role: 'Admin' 
  })
  
  // Board members and integrations
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([])
  const [showAddMember, setShowAddMember] = useState(false)
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    role: ''
  })
  
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: 'gmail',
      name: 'Gmail',
      icon: <Mail className="w-4 h-4" />,
      status: 'disconnected',
      description: 'Connect to Gmail for email document analysis',
      color: 'red'
    },
    {
      id: 'google-drive',
      name: 'Google Drive',
      icon: <Database className="w-4 h-4" />,
      status: 'disconnected',
      description: 'Access board documents from Google Drive',
      color: 'blue'
    },
    {
      id: 'hubspot',
      name: 'HubSpot',
      icon: <Users className="w-4 h-4" />,
      status: 'disconnected',
      description: 'Connect CRM data for customer insights',
      color: 'orange'
    },
    {
      id: 'mcp-server',
      name: 'MCP Server',
      icon: <Building2 className="w-4 h-4" />,
      status: 'disconnected',
      description: 'Connect to enterprise data sources',
      color: 'purple'
    }
  ])

  // Initialize on mount
  useEffect(() => {
    setIsClient(true)
    loadOrCreateBoard()
  }, [])

  // Load or create board workspace
  const loadOrCreateBoard = async () => {
    try {
      const boardId = 'board-demo'
      const response = await fetch(`/api/boards/${boardId}`)
      
      if (response.ok) {
        const boardData = await response.json()
        if (boardData.success) {
          setCurrentBoard(boardData.board)
          setBoardMembers(boardData.members || [])
          setBoardName(boardData.board?.name || 'Board Demo Workspace')
          
          // Load documents
          if (boardData.documents && boardData.documents.length > 0) {
            const formattedDocs = boardData.documents.map((doc: any) => ({
              id: doc.id,
              name: doc.originalName || doc.filename,
              type: doc.type,
              size: doc.size,
              uploadedAt: new Date(doc.uploadedAt),
              status: doc.status || 'ready',
              extractedText: doc.extractedText
            }))
            setDocuments(formattedDocs)
          }
          
          // Load chat sessions
          if (boardData.chatSessions && boardData.chatSessions.length > 0) {
            const formattedSessions = boardData.chatSessions.map((session: any) => ({
              ...session,
              createdAt: new Date(session.createdAt),
              updatedAt: new Date(session.updatedAt),
              messages: session.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp)
              }))
            }))
            setChatSessions(formattedSessions)
            
            console.log('Chat sessions loaded:', {
              sessionsCount: formattedSessions.length,
              sessions: formattedSessions.map((s: ChatSession) => ({
                id: s.id,
                title: s.title,
                messageCount: s.messages.length,
                lastUpdated: s.updatedAt
              }))
            })
          } else {
            console.log('No existing chat sessions found, will create default when needed')
          }
          
          // Load saved notes from dedicated endpoint
          try {
            const notesResponse = await fetch(`/api/boards/notes?boardId=${boardData.board?.id || 'board-demo'}`)
            if (notesResponse.ok) {
              const notesData = await notesResponse.json()
              if (notesData.success && notesData.notes && notesData.notes.length > 0) {
                const formattedNotes = notesData.notes.map((note: any) => ({
                  ...note,
                  createdAt: new Date(note.createdAt),
                  updatedAt: new Date(note.updatedAt)
                }))
                setSavedNotes(formattedNotes)
                console.log('Saved notes loaded from dedicated endpoint:', formattedNotes.length)
              } else {
                console.log('No notes found in dedicated endpoint')
              }
            }
          } catch (notesError) {
            console.error('Failed to load notes from dedicated endpoint:', notesError)
            // Fallback to loading from main board data
            if (boardData.savedNotes && boardData.savedNotes.length > 0) {
              const formattedNotes = boardData.savedNotes.map((note: any) => ({
                ...note,
                createdAt: new Date(note.createdAt),
                updatedAt: new Date(note.updatedAt)
              }))
              setSavedNotes(formattedNotes)
              console.log('Saved notes loaded from fallback:', formattedNotes.length)
            }
          }
          
          console.log('Board loaded successfully:', {
            boardId: boardData.board?.id,
            documentsCount: boardData.documents?.length || 0,
            membersCount: boardData.members?.length || 0,
            chatSessionsCount: boardData.chatSessions?.length || 0,
            savedNotesCount: boardData.savedNotes?.length || 0
          })
        }
      } else {
        console.log('Board not found, creating new board...')
        createNewBoard()
      }
    } catch (error) {
      console.error('Failed to load board:', error)
      createNewBoard()
    }
  }

  // Create new board workspace
  const createNewBoard = async () => {
    const newBoard: BoardWorkspace = {
      id: 'board-demo',
      name: 'Board Demo Workspace',
      createdBy: currentUser.id,
      createdAt: new Date(),
      lastActivity: new Date(),
      members: [
        {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: 'Admin',
          addedAt: new Date(),
          status: 'active'
        }
      ],
      settings: {
        allowMemberInvites: true,
        requireApproval: false
      }
    }
    
    setCurrentBoard(newBoard)
    setBoardMembers(newBoard.members)
    setBoardName(newBoard.name)
    
    try {
      await saveBoard(newBoard)
      console.log('New board created and saved:', newBoard.id)
    } catch (error) {
      console.error('Failed to save new board:', error)
    }
  }

  // Save board data
  const saveBoard = async (board: BoardWorkspace) => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board,
          members: boardMembers,
          documents,
          chatSessions
        })
      })
      
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || 'Failed to save board')
      }
      
      console.log('Board saved successfully')
    } catch (error) {
      console.error('Failed to save board:', error)
    }
  }

  // Chat functionality
  const createNewChatSession = useCallback(() => {
    const newSession: ChatSession = {
      id: Math.random().toString(36).substr(2, 9),
      title: `Chat ${chatSessions.length + 1}`,
      messages: [
        {
          id: '1',
          type: 'assistant',
          content: "Hi! I'm your BoardBravo AI assistant. 📊\n\nAttach documents and start analyzing, or connect your data sources to get started!",
          timestamp: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    setChatSessions(prev => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    setChatMessages(newSession.messages)
    
    console.log('New chat session created:', {
      sessionId: newSession.id,
      totalSessions: chatSessions.length + 1
    })
    
    // Save to backend immediately
    saveChatSessionsToBackend([newSession, ...chatSessions])
  }, [chatSessions.length, chatSessions])

  const switchToSession = useCallback((sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId)
    if (session) {
      setCurrentSessionId(sessionId)
      setChatMessages(session.messages)
    }
  }, [chatSessions])

  const deleteSession = useCallback((sessionId: string) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId)
    setChatSessions(updatedSessions)
    
    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) {
        switchToSession(updatedSessions[0].id)
      } else {
        createNewChatSession()
        return // Don't save yet, let createNewChatSession handle it
      }
    }
    
    // Save updated sessions to backend
    saveChatSessionsToBackend(updatedSessions)
  }, [chatSessions, currentSessionId, switchToSession, createNewChatSession])

  const updateSessionTitle = useCallback((sessionId: string, newTitle: string) => {
    const updatedSessions = chatSessions.map(session => 
      session.id === sessionId 
        ? { ...session, title: newTitle, updatedAt: new Date() }
        : session
    )
    setChatSessions(updatedSessions)
    
    // Save updated sessions to backend
    saveChatSessionsToBackend(updatedSessions)
    
    console.log('Session title updated:', { sessionId, newTitle })
  }, [chatSessions])

  // Save chat sessions to backend
  const saveChatSessionsToBackend = async (sessions: ChatSession[]) => {
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          board: currentBoard,
          members: boardMembers,
          documents,
          chatSessions: sessions
        })
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save chat sessions')
      }
      
      console.log('Chat sessions saved to backend:', sessions.length)
    } catch (error) {
      console.error('Failed to save chat sessions:', error)
    }
  }

  // Handle chat input
  const handleChatInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMessage(e.target.value)
  }, [])

  const sendMemberMessage = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!currentMessage.trim()) return

    if (!currentSessionId) {
      createNewChatSession()
    }

    // Check if message contains @agent mention
    const isAgentMention = currentMessage.toLowerCase().includes('@agent')
    const cleanMessage = currentMessage.replace(/@agent\s*/gi, '').trim()

    const memberMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: currentMessage,
      timestamp: new Date()
    }

    setChatMessages(prev => [...prev, memberMessage])
    setCurrentMessage('')
    
    // Update session with new message
    const updatedSessions = chatSessions.map(session => 
      session.id === currentSessionId 
        ? { ...session, messages: [...session.messages, memberMessage], updatedAt: new Date() }
        : session
    )
    setChatSessions(updatedSessions)
    
    // If @agent mention, process as agent action
    if (isAgentMention && cleanMessage) {
      handleAgentInteraction(cleanMessage, memberMessage)
    }
    
    // Save to backend
    saveChatSessionsToBackend(updatedSessions)
  }, [currentMessage, currentSessionId, createNewChatSession, chatSessions])

  // Handle @agent interactions
  const handleAgentInteraction = async (query: string, userMessage: ChatMessage) => {
    setIsProcessing(true)
    setProcessingAction('AI Analysis')

    try {
      const readyDocuments = documents.filter(doc => doc.status === 'ready')
      const connectedIntegrations = integrations.filter(i => i.status === 'connected')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          documents: readyDocuments,
          integrations: connectedIntegrations,
          isAgentMention: true,
          boardId: currentBoard?.id
        })
      })

      const data = await response.json()

      if (response.ok) {
        const agentResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          charts: data.charts, // Only include if AI returns chart data
          summary: data.summary
        }
        setChatMessages(prev => [...prev, agentResponse])
        
        // Update session with agent response
        const updatedSessions = chatSessions.map(session => 
          session.id === currentSessionId 
            ? { 
                ...session, 
                messages: [...session.messages, agentResponse],
                updatedAt: new Date() 
              }
            : session
        )
        setChatSessions(updatedSessions)
        
        // Save to backend
        saveChatSessionsToBackend(updatedSessions)
        
        console.log('@agent interaction completed')
      } else {
        throw new Error(data.error || 'Failed to process @agent request')
      }
    } catch (error) {
      console.error('@agent interaction error:', error)
      
      const errorResponse: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: `❌ Sorry, I couldn't process your request. Please try again.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
      
      // Update session with error message
      const updatedSessions = chatSessions.map(session => 
        session.id === currentSessionId 
          ? { 
              ...session,
              messages: [...session.messages, errorResponse],
              updatedAt: new Date()
            }
          : session
      )
      setChatSessions(updatedSessions)
      saveChatSessionsToBackend(updatedSessions)
    } finally {
      setIsProcessing(false)
      setProcessingAction('')
    }
  }

  // File upload functionality
  const handleFileUpload = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.xlsx,.xls,.csv,.pptx,.ppt'
    input.multiple = true
    
    input.addEventListener('change', (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        onDrop(Array.from(files))
      }
    })
    
    input.click()
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return
    
    setIsUploading(true)

    for (const file of acceptedFiles) {
      const newDoc: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date(),
        status: 'processing'
      }
      
      setDocuments(prev => [...prev, newDoc])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('boardId', currentBoard?.id || 'board-demo')

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })

        if (response.ok) {
          const uploadResult = await response.json()
          const documentData = uploadResult.document || uploadResult
          
          setDocuments(prev => 
            prev.map(doc => 
              doc.id === newDoc.id 
                ? { 
                    ...doc, 
                    status: 'ready', 
                    extractedText: documentData.extractedText,
                    id: documentData.id
                  }
                : doc
            )
          )
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        setDocuments(prev => 
          prev.map(doc => 
            doc.id === newDoc.id 
              ? { ...doc, status: 'error' }
              : doc
          )
        )
        alert(`Failed to upload ${file.name}`)
      }
    }

    setIsUploading(false)
  }, [currentBoard])

  const removeDocument = useCallback((documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
  }, [])

  // Integration handlers
  const handleIntegrationConnect = async (integrationId: string) => {
    console.log(`Connecting to ${integrationId}...`)
    alert(`${integrationId} integration coming soon!`)
  }

  // Board Members handlers
  const toggleAddMember = () => {
    setShowAddMember(!showAddMember)
  }

  const updateNewMember = (field: keyof typeof newMember, value: string) => {
    setNewMember(prev => ({ ...prev, [field]: value }))
  }

  const addMember = async () => {
    if (!newMember.name || !newMember.email || !newMember.role) {
      alert('Please fill in all required fields')
      return
    }

    if (!currentBoard) {
      alert('No board selected')
      return
    }

    try {
      const response = await fetch(`/api/boards/${currentBoard.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newMember.name,
          email: newMember.email,
          role: newMember.role,
          adminUserId: currentUser.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to add member')
        return
      }

      // Update local state with the new member
      const updatedMembers = [...boardMembers, result.member]
      setBoardMembers(updatedMembers)
      setNewMember({ name: '', email: '', role: '' })
      setShowAddMember(false)

      alert('Member added successfully!')
      console.log('Member added:', result.member)

    } catch (error) {
      console.error('Failed to add member:', error)
      alert('Failed to add member. Please try again.')
    }
  }

  const removeMember = async (memberId: string) => {
    if (memberId === currentUser.id) {
      alert("You cannot remove yourself from the board")
      return
    }

    if (!currentBoard) {
      alert('No board selected')
      return
    }

    const memberToRemove = boardMembers.find(m => m.id === memberId)
    if (!memberToRemove) {
      alert('Member not found')
      return
    }

    const confirmRemoval = confirm(`Are you sure you want to remove ${memberToRemove.name} from the board?`)
    if (!confirmRemoval) return

    try {
      const response = await fetch(
        `/api/boards/${currentBoard.id}/members?memberId=${memberId}&adminUserId=${currentUser.id}`,
        {
          method: 'DELETE'
        }
      )

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to remove member')
        return
      }

      // Update local state
      const updatedMembers = boardMembers.filter(m => m.id !== memberId)
      setBoardMembers(updatedMembers)

      alert('Member removed successfully!')
      console.log('Member removed:', result.removedMember)

    } catch (error) {
      console.error('Failed to remove member:', error)
      alert('Failed to remove member. Please try again.')
    }
  }

  // Notes handlers
  const saveNote = async (note: Omit<SavedNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newNote: SavedNote = {
      ...note,
        id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const updatedNotes = [newNote, ...savedNotes]
    setSavedNotes(updatedNotes)
    
    // Save to backend
    await saveNotesToBackend(updatedNotes)
  }

  const updateNote = async (noteId: string, updates: Partial<SavedNote>) => {
    const updatedNotes = savedNotes.map(note => 
      note.id === noteId 
        ? { ...note, ...updates, updatedAt: new Date() }
        : note
    )
    setSavedNotes(updatedNotes)
    
    // Save to backend
    await saveNotesToBackend(updatedNotes)
  }

  const deleteNote = async (noteId: string) => {
    const updatedNotes = savedNotes.filter(note => note.id !== noteId)
    setSavedNotes(updatedNotes)
    
    // Save to backend
    await saveNotesToBackend(updatedNotes)
  }

  const togglePinNote = async (noteId: string) => {
    const updatedNotes = savedNotes.map(note => 
      note.id === noteId 
        ? { ...note, isPinned: !note.isPinned, updatedAt: new Date() }
        : note
    )
    setSavedNotes(updatedNotes)
    
    // Save to backend
    await saveNotesToBackend(updatedNotes)
  }

  // Save notes to backend
  const saveNotesToBackend = async (notes: SavedNote[]) => {
    try {
      const response = await fetch('/api/boards/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          boardId: currentBoard?.id || 'board-demo',
          notes: notes
        })
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || 'Failed to save notes')
      }
      
      console.log('Notes saved to backend:', notes.length)
    } catch (error) {
      console.error('Failed to save notes:', error)
      // Fallback to main board data save
      try {
        const fallbackResponse = await fetch('/api/boards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            board: currentBoard,
            members: boardMembers,
            documents,
            chatSessions,
            savedNotes: notes
          })
        })
        if (fallbackResponse.ok) {
          console.log('Notes saved via fallback method')
        }
      } catch (fallbackError) {
        console.error('Fallback save also failed:', fallbackError)
      }
    }
  }

  // Function to save chat messages as notes
  const saveMessageAsNote = async (messageContent: string, messageType: 'user' | 'assistant') => {
    // Helper function to detect action type from message content
    const getActionCategoryFromContent = (content: string): 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy' | 'general' => {
      const agentActions = getAgentActions()
      
      // Check if this is an agent action message
      if (content.includes('🤖 Agent Action:')) {
        // Check for specific custom actions from manual modal
        if (content.includes('Document Summary')) {
          return 'compliance'
        }
        if (content.includes('Action Items Extraction')) {
          return 'strategy'
        }
        if (content.includes('Board Readiness Check')) {
          return 'performance'
        }
        if (content.includes('Stakeholder Communication')) {
          return 'general'
        }
        if (content.includes('Market Trends Analysis')) {
          return 'financial'
        }
        if (content.includes('Competitive Benchmarking')) {
          return 'strategy'
        }
        if (content.includes('Investment Readiness')) {
          return 'financial'
        }
        if (content.includes('ESG Assessment')) {
          return 'compliance'
        }
        // Generic custom analysis fallback
        if (content.includes('Custom Analysis')) {
          return 'general'
        }
        
        for (const action of agentActions) {
          if (content.includes(action.title)) {
            return action.id as 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy'
          }
        }
      }
      
      // Check if this is a response to an agent action (assistant message following agent action)
      const messageIndex = chatMessages.findIndex(m => m.content === content)
      if (messageIndex > 0 && messageType === 'assistant') {
        const previousMessage = chatMessages[messageIndex - 1]
        if (previousMessage.content.includes('🤖 Agent Action:')) {
          // Check for specific custom action responses
          if (previousMessage.content.includes('Document Summary')) {
            return 'compliance'
          }
          if (previousMessage.content.includes('Action Items Extraction')) {
            return 'strategy'
          }
          if (previousMessage.content.includes('Board Readiness Check')) {
            return 'performance'
          }
          if (previousMessage.content.includes('Stakeholder Communication')) {
            return 'general'
          }
          if (previousMessage.content.includes('Market Trends Analysis')) {
            return 'financial'
          }
          if (previousMessage.content.includes('Competitive Benchmarking')) {
            return 'strategy'
          }
          if (previousMessage.content.includes('Investment Readiness')) {
            return 'financial'
          }
          if (previousMessage.content.includes('ESG Assessment')) {
            return 'compliance'
          }
          // Generic custom analysis responses
          if (previousMessage.content.includes('Custom Analysis')) {
            return 'general'
          }
          
          for (const action of agentActions) {
            if (previousMessage.content.includes(action.title)) {
              return action.id as 'financial' | 'risk' | 'compliance' | 'performance' | 'strategy'
            }
          }
        }
      }
      
      return 'general'
    }

    const actionCategory = getActionCategoryFromContent(messageContent)
    const agentActions = getAgentActions()
    const actionInfo = agentActions.find((a: AgentAction) => a.id === actionCategory)
    
    // Helper function to get custom action info
    const getCustomActionInfo = (content: string) => {
      if (content.includes('Document Summary')) {
        return { tag: 'Summary', type: 'Document Summary' }
      }
      if (content.includes('Action Items Extraction')) {
        return { tag: 'Tasks', type: 'Action Items' }
      }
      if (content.includes('Board Readiness Check')) {
        return { tag: 'Readiness', type: 'Board Readiness' }
      }
      if (content.includes('Stakeholder Communication')) {
        return { tag: 'Communication', type: 'Stakeholder Analysis' }
      }
      if (content.includes('Market Trends Analysis')) {
        return { tag: 'Market', type: 'Market Trends' }
      }
      if (content.includes('Competitive Benchmarking')) {
        return { tag: 'Benchmark', type: 'Competitive Analysis' }
      }
      if (content.includes('Investment Readiness')) {
        return { tag: 'Investment', type: 'Investment Readiness' }
      }
      if (content.includes('ESG Assessment')) {
        return { tag: 'ESG', type: 'ESG Assessment' }
      }
      if (content.includes('Custom Analysis')) {
        return { tag: 'Custom', type: 'Custom Analysis' }
      }
      return null
    }
    
    const customActionInfo = getCustomActionInfo(messageContent)
    const isCustomAction = customActionInfo !== null
    
    const title = messageType === 'user' 
      ? (actionCategory !== 'general' && !isCustomAction ? `${actionInfo?.tag} Action - ${format(new Date(), 'MMM dd, HH:mm')}` 
          : isCustomAction ? `${customActionInfo.tag} Action - ${format(new Date(), 'MMM dd, HH:mm')}`
          : `Board Message - ${format(new Date(), 'MMM dd, HH:mm')}`)
      : (actionCategory !== 'general' && !isCustomAction ? `${actionInfo?.tag} Analysis - ${format(new Date(), 'MMM dd, HH:mm')}` 
          : isCustomAction ? `${customActionInfo.tag} Analysis - ${format(new Date(), 'MMM dd, HH:mm')}`
          : `AI Response - ${format(new Date(), 'MMM dd, HH:mm')}`)
    
    const source = messageType === 'user' 
      ? (actionCategory !== 'general' && !isCustomAction ? `Agent Action by ${currentUser.name}` 
          : isCustomAction ? `${customActionInfo.type} by ${currentUser.name}`
          : `Message from ${currentUser.name}`)
      : (actionCategory !== 'general' && !isCustomAction ? `BoardBravo AI - ${actionInfo?.tag} Analysis` 
          : isCustomAction ? `BoardBravo AI - ${customActionInfo.type}`
          : 'BoardBravo AI Assistant')
    
    await saveNote({
      title: title,
      content: messageContent,
      category: actionCategory,
      source: source,
      isPinned: false,
      tags: messageType === 'user' 
        ? (actionCategory !== 'general' ? ['agent-action', actionCategory] 
            : isCustomAction ? ['custom-action', actionCategory]
            : ['user-message'])
        : (actionCategory !== 'general' ? ['ai-analysis', actionCategory] 
            : isCustomAction ? ['custom-analysis', actionCategory]
            : ['ai-response'])
    })
  }

  // Agent Actions
  const handleAgentAction = async (actionTitle: string, actionDescription: string) => {
    let targetSessionId = currentSessionId
    
    if (!targetSessionId) {
      const newSession: ChatSession = {
        id: Math.random().toString(36).substr(2, 9),
        title: `Agent: ${actionTitle}`,
        messages: [
          {
            id: '1',
            type: 'assistant',
            content: "Hi! I'm your BoardBravo AI assistant. 📊\n\nAttach documents and start analyzing, or connect your data sources to get started!",
            timestamp: new Date()
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      setChatSessions(prev => [newSession, ...prev])
      setCurrentSessionId(newSession.id)
      setChatMessages(newSession.messages)
      targetSessionId = newSession.id
      
      // Small delay to ensure state updates
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    const actionMessage: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'user',
      content: `🤖 Agent Action: ${actionTitle}`,
      timestamp: new Date()
    }
    setChatMessages(prev => [...prev, actionMessage])

    setIsProcessing(true)
    setProcessingAction(actionTitle)

    try {
      const readyDocuments = documents.filter(doc => doc.status === 'ready')
      const connectedIntegrations = integrations.filter(i => i.status === 'connected')
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: actionDescription,
          documents: readyDocuments,
          integrations: connectedIntegrations,
          isAgentAction: true,
          actionTitle: actionTitle,
          boardId: currentBoard?.id,
          generateCharts: true,
          includeStatistics: true,
          chartTypes: ['bar', 'pie', 'line', 'scatter'],
          requestVisualAnalysis: true
        })
      })

      const data = await response.json()

      if (response.ok) {
        const agentResponse: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          type: 'assistant',
          content: data.response,
          timestamp: new Date(),
          charts: data.charts,
          summary: data.summary
        }
        setChatMessages(prev => [...prev, agentResponse])
        
        // Update session with both messages
        const updatedSessions = chatSessions.map(session => 
          session.id === targetSessionId 
            ? { 
                ...session, 
                title: `Agent: ${actionTitle}`,
                messages: [...session.messages, actionMessage, agentResponse],
                updatedAt: new Date() 
              }
            : session
        )
        setChatSessions(updatedSessions)
        
        // Save to backend
        saveChatSessionsToBackend(updatedSessions)
        
        console.log('Agent action completed:', actionTitle)
      } else {
        throw new Error(data.error || 'Failed to execute agent action')
      }
    } catch (error) {
      console.error('Agent action error:', error)
      
      const errorResponse: ChatMessage = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'assistant',
        content: `❌ Failed to execute ${actionTitle}. Please try again.`,
        timestamp: new Date()
      }
      setChatMessages(prev => [...prev, errorResponse])
      
      // Update session with error message
      const updatedSessions = chatSessions.map(session => 
        session.id === targetSessionId 
          ? { 
          ...session,
              messages: [...session.messages, actionMessage, errorResponse],
      updatedAt: new Date()
    }
          : session
      )
      setChatSessions(updatedSessions)
      saveChatSessionsToBackend(updatedSessions)
    } finally {
      setIsProcessing(false)
      setProcessingAction('')
    }
  }

  const getAgentActions = (): AgentAction[] => {
    const hasDocuments = documents.filter(doc => doc.status === 'ready').length > 0
    
    return [
      {
        id: 'financial',
        title: hasDocuments ? 'Q4 Financial Analysis' : 'Financial Analysis',
        description: hasDocuments 
          ? 'Extract financial data with revenue charts, margin analysis, and cash flow metrics'
          : 'Analyze financial documents and data with visual charts',
        detailedDescription: 'Revenue trends, cost analysis, profitability metrics with bar charts and statistics',
        prompt: hasDocuments 
          ? 'Agent Action: Q4 Financial Analysis - Extract specific financial metrics from uploaded documents. Provide: 1) Revenue figures (current quarter vs previous), 2) Gross margin percentages, 3) Operating expenses breakdown, 4) Cash flow data, 5) EBITDA margins, 6) Year-over-year growth rates. Generate 2 key charts: Revenue performance bar chart (quarterly data) and profit margin trend lines. Include exact numerical values for statistics cards.'
          : 'Agent Action: Financial Analysis - Provide general financial analysis guidance with example charts and statistical insights for revenue trends, profitability metrics, and cash flow patterns.',
        icon: BarChart3,
        color: 'bg-green-50',
        hoverColor: 'hover:bg-green-100',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        tagColor: 'text-green-600',
        tag: 'Financial'
      },
      {
        id: 'risk',
        title: 'Enterprise Risk Analysis',
        description: 'Extract risk data with impact scores, probability metrics, and mitigation status',
        detailedDescription: 'Operational, financial, strategic, and compliance risks with visual dashboards',
        prompt: 'Agent Action: Enterprise Risk Analysis - Identify and quantify specific risks from uploaded documents. Provide: 1) Risk categories with impact scores (1-10), 2) Probability percentages for each risk, 3) Financial exposure amounts, 4) Mitigation status percentages, 5) Risk trend analysis, 6) Critical risk count. Generate 2 charts: Risk distribution pie chart and risk impact matrix. Include specific risk metrics and numerical scores for statistics.',
        icon: AlertCircle,
        color: 'bg-red-50',
        hoverColor: 'hover:bg-red-100',
        borderColor: 'border-red-200',
        iconColor: 'text-red-600',
        tagColor: 'text-red-600',
        tag: 'Risk'
      },
      {
        id: 'compliance',
        title: 'Regulatory Compliance Audit',
        description: 'Extract compliance scores, framework adherence %, and gap analysis data',
        detailedDescription: 'SOX compliance, governance standards with visual compliance dashboards',
        prompt: 'Agent Action: Regulatory Compliance Audit - Assess compliance status from uploaded documents. Provide: 1) Overall compliance score (percentage), 2) Individual framework scores (SOX, GDPR, ISO 27001, etc.), 3) Number of outstanding issues, 4) Audit readiness percentage, 5) Training completion rates, 6) Policy update counts. Generate 2 charts: Compliance score bar chart by framework and compliance gap analysis. Include specific compliance percentages and numerical metrics.',
        icon: CheckCircle,
        color: 'bg-blue-50',
        hoverColor: 'hover:bg-blue-100',
        borderColor: 'border-blue-200',
        iconColor: 'text-blue-600',
        tagColor: 'text-blue-600',
        tag: 'Compliance'
      },
      {
        id: 'performance',
        title: 'Executive Performance Dashboard',
        description: 'Extract KPI data, achievement rates, efficiency metrics, and benchmark comparisons',
        detailedDescription: 'Operational efficiency charts, strategic goal progress with visual metrics',
        prompt: 'Agent Action: Executive Performance Dashboard - Extract performance metrics from uploaded documents. Provide: 1) KPI achievement percentages, 2) Operational efficiency scores, 3) Revenue per employee, 4) Customer satisfaction scores, 5) Goal completion rates, 6) Productivity improvements. Generate 2 charts: KPI achievement bar chart and performance trend line. Include specific performance percentages and quantitative metrics for statistics.',
        icon: TrendingUp,
        color: 'bg-purple-50',
        hoverColor: 'hover:bg-purple-100',
        borderColor: 'border-purple-200',
        iconColor: 'text-purple-600',
        tagColor: 'text-purple-600',
        tag: 'Performance'
      },
      {
        id: 'strategy',
        title: 'Strategic Intelligence Report',
        description: 'Extract market data, competitive metrics, strategic initiative progress, and opportunity analysis',
        detailedDescription: 'Competitive landscape charts, market opportunity visuals with strategic metrics',
        prompt: 'Agent Action: Strategic Intelligence Report - Analyze strategic data from uploaded documents. Provide: 1) Market share percentages, 2) Competitive positioning scores, 3) Strategic initiative completion rates, 4) Market opportunity size (TAM), 5) Brand strength ratings, 6) Partnership revenue figures. Generate 2 charts: Market position pie chart and strategic initiative progress bars. Include specific market percentages and strategic metrics for statistics.',
        icon: Zap,
        color: 'bg-orange-50',
        hoverColor: 'hover:bg-orange-100',
        borderColor: 'border-orange-200',
        iconColor: 'text-orange-600',
        tagColor: 'text-orange-600',
        tag: 'Strategy'
      }
    ]
  }

  // Board Header Component
  const BoardHeaderCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-4">
                      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {currentBoard?.name || 'Board Workspace'}
            </h1>
            <div className="flex items-center space-x-3 mt-1">
              <p className="text-xs text-gray-500">
                {boardMembers.length} member{boardMembers.length !== 1 ? 's' : ''} • 
                Last activity {currentBoard ? formatDistanceToNow(currentBoard.lastActivity, { addSuffix: true }) : 'now'}
              </p>
              {isAdmin && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  Admin
                            </span>
              )}
                          </div>
                        </div>
                      </div>
                    </div>
                </div>
  )

  // Manual Action Modal
  const ManualActionModal = () => (
    showManualAction && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Additional Agent Actions</h3>
            <button
              onClick={() => setShowManualAction(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
              </div>

          {/* Quick Analysis Actions */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Document & Communication Analysis</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                onClick={() => {
                  handleAgentAction('Document Summary', 'Provide a comprehensive executive summary of all uploaded documents, highlighting key decisions, action items, and financial implications.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm text-blue-600 uppercase tracking-wide font-semibold">Summary</span>
                </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Document Summary</h5>
                <p className="text-sm text-gray-600">Executive summary of all uploaded documents with key insights</p>
                </button>
                
                <button
                onClick={() => {
                  handleAgentAction('Action Items Extraction', 'Extract and prioritize all action items, decisions, and follow-up tasks from the uploaded documents and conversations.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-orange-50 hover:bg-orange-100 rounded-lg border border-orange-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-orange-100">
                    <Plus className="w-5 h-5 text-orange-600" />
                  </div>
                  <span className="text-sm text-orange-600 uppercase tracking-wide font-semibold">Tasks</span>
                </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Action Items</h5>
                <p className="text-sm text-gray-600">Extract and prioritize action items from documents</p>
                </button>
                
                <button
                onClick={() => {
                  handleAgentAction('Board Readiness Check', 'Assess board meeting readiness, document completeness, and identify any gaps or missing information.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <AlertCircle className="w-5 h-5 text-purple-600" />
                  </div>
                  <span className="text-sm text-purple-600 uppercase tracking-wide font-semibold">Readiness</span>
                </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Board Readiness</h5>
                <p className="text-sm text-gray-600">Check meeting readiness and document completeness</p>
                </button>
                
                <button
                onClick={() => {
                  handleAgentAction('Stakeholder Communication', 'Analyze communication patterns, sentiment, and key themes from board discussions and email exchanges.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-cyan-100">
                    <Users className="w-5 h-5 text-cyan-600" />
              </div>
                  <span className="text-sm text-cyan-600 uppercase tracking-wide font-semibold">Communication</span>
                  </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Stakeholder Analysis</h5>
                <p className="text-sm text-gray-600">Communication patterns and sentiment analysis</p>
              </button>
                        </div>
                      </div>

          {/* Market & Industry Analysis */}
          <div className="mb-8">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Market & Industry Intelligence</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                onClick={() => {
                  handleAgentAction('Market Trends Analysis', 'Analyze industry trends, competitive landscape, and market opportunities based on available data and documents.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                  <span className="text-sm text-green-600 uppercase tracking-wide font-semibold">Market</span>
                    </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Market Trends</h5>
                <p className="text-sm text-gray-600">Industry trends and competitive landscape analysis</p>
              </button>

                  <button
                onClick={() => {
                  handleAgentAction('Competitive Benchmarking', 'Compare company performance against industry benchmarks and key competitors across financial and operational metrics.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-indigo-100">
                    <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                  <span className="text-sm text-indigo-600 uppercase tracking-wide font-semibold">Benchmark</span>
              </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Competitive Analysis</h5>
                <p className="text-sm text-gray-600">Performance benchmarking against competitors</p>
              </button>

              <button
                onClick={() => {
                  handleAgentAction('Investment Readiness', 'Assess investment readiness, valuation metrics, and prepare data room summary for potential investors.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-yellow-100">
                    <Zap className="w-5 h-5 text-yellow-600" />
                  </div>
                  <span className="text-sm text-yellow-600 uppercase tracking-wide font-semibold">Investment</span>
                              </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">Investment Readiness</h5>
                <p className="text-sm text-gray-600">Valuation metrics and investor preparation</p>
              </button>

              <button
                onClick={() => {
                  handleAgentAction('ESG Assessment', 'Evaluate Environmental, Social, and Governance practices and provide ESG scoring and improvement recommendations.')
                  setShowManualAction(false)
                }}
                disabled={isProcessing}
                className="text-left p-4 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 rounded-lg bg-emerald-100">
                    <Building2 className="w-5 h-5 text-emerald-600" />
                              </div>
                  <span className="text-sm text-emerald-600 uppercase tracking-wide font-semibold">ESG</span>
                                      </div>
                <h5 className="text-sm font-semibold text-gray-900 mb-2">ESG Assessment</h5>
                <p className="text-sm text-gray-600">Environmental, Social, and Governance evaluation</p>
              </button>
                                      </div>
                                    </div>

          {/* Custom Action Section */}
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">Custom Analysis Request</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What would you like the AI agent to analyze?
                </label>
                <textarea
                  value={manualActionQuery}
                  onChange={(e) => setManualActionQuery(e.target.value)}
                  placeholder="Describe your specific analysis request (e.g., 'Analyze customer churn patterns and recommend retention strategies' or 'Compare Q3 vs Q4 performance metrics')..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="font-medium">Tip:</span> Be specific about what insights or charts you need
                </div>
                <div className="flex items-center space-x-3">
                      <button
                    onClick={() => setShowManualAction(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                        onClick={() => {
                      if (manualActionQuery.trim()) {
                        handleAgentAction('Custom Analysis', manualActionQuery)
                        setManualActionQuery('')
                        setShowManualAction(false)
                      }
                    }}
                    disabled={!manualActionQuery.trim() || isProcessing}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isProcessing ? 'Processing...' : 'Execute Analysis'}
                      </button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    )
  )

  return (
    <div className="min-h-screen bg-white">
      <Navbar currentPage="dashboard" />
      <div className="px-4 py-4">
        <BoardHeaderCard />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 max-w-none">
          {/* Left Panel: Modular Cards */}
          <div className="lg:col-span-1 space-y-4">
            <ChatHistoryCard
              chatSessions={chatSessions}
              currentSessionId={currentSessionId}
              currentBoard={currentBoard}
              chatMessages={chatMessages}
              isClient={isClient}
              isAdmin={isAdmin}
              onSwitchToSession={switchToSession}
              onDeleteSession={deleteSession}
              onUpdateSessionTitle={updateSessionTitle}
            />
            
            <DocumentsCard
              documents={documents}
              isUploading={isUploading}
              onFileUpload={handleFileUpload}
              onRemoveDocument={removeDocument}
            />
            
            <IntegrationsCard
              integrations={integrations}
              onConnect={handleIntegrationConnect}
            />
              </div>

          {/* Middle Panel: Board Management Cards */}
          <div className="lg:col-span-1 space-y-4">
            <BoardMembersCard
              boardMembers={boardMembers}
              isAdmin={isAdmin}
              currentUser={currentUser}
              showAddMember={showAddMember}
              newMember={newMember}
              onToggleAddMember={toggleAddMember}
              onUpdateNewMember={updateNewMember}
              onAddMember={addMember}
              onRemoveMember={removeMember}
            />
            
            <NoteBoardCard
              savedNotes={savedNotes}
              isAdmin={isAdmin}
              onSaveNote={saveNote}
              onUpdateNote={updateNote}
              onDeleteNote={deleteNote}
              onTogglePin={togglePinNote}
            />
            </div>

          {/* Right Panel: Chat Interface */}
          <div className="lg:col-span-2">
            <ChatInterfaceCard
              chatMessages={chatMessages}
              currentMessage={currentMessage}
              isProcessing={isProcessing}
              processingAction={processingAction}
              boardMembers={boardMembers}
              currentUser={currentUser}
              currentSessionId={currentSessionId}
              documents={documents}
              integrations={integrations}
              isClient={isClient}
              onCreateNewSession={createNewChatSession}
              onSendMessage={sendMemberMessage}
              onMessageChange={handleChatInputChange}
              onAgentAction={handleAgentAction}
              onShowManualAction={() => setShowManualAction(true)}
              onSaveMessageAsNote={saveMessageAsNote}
              getAgentActions={getAgentActions}
            />
          </div>
        </div>
      </div>

      <ManualActionModal />
    </div>
  )
} 