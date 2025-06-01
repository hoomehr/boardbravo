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
    if (newMember.name && newMember.email && newMember.role) {
      const member: BoardMember = {
      id: Math.random().toString(36).substr(2, 9),
        name: newMember.name,
        email: newMember.email,
        role: newMember.role,
        addedAt: new Date(),
        status: 'active'
      }
      
      const updatedMembers = [...boardMembers, member]
      setBoardMembers(updatedMembers)
      setNewMember({ name: '', email: '', role: '' })
      setShowAddMember(false)
      
      // Save to backend
      if (currentBoard) {
        await saveBoard({ ...currentBoard, members: updatedMembers })
      }
    }
  }

  const removeMember = async (memberId: string) => {
    if (memberId === currentUser.id) return // Can't remove yourself
    
    const updatedMembers = boardMembers.filter(m => m.id !== memberId)
    setBoardMembers(updatedMembers)
    
    // Save to backend
    if (currentBoard) {
      await saveBoard({ ...currentBoard, members: updatedMembers })
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

  // Helper function to save agent results as notes
  const saveAgentResultAsNote = async (actionTitle: string, content: string, category: SavedNote['category']) => {
    await saveNote({
      title: `${actionTitle} - ${format(new Date(), 'MMM dd, yyyy')}`,
      content: content,
      category: category,
      source: `Agent: ${actionTitle}`,
      isPinned: false,
      tags: ['agent-generated']
    })
  }

  // Function to save chat messages as notes
  const saveMessageAsNote = async (messageContent: string, messageType: 'user' | 'assistant') => {
    const title = messageType === 'user' 
      ? `Board Message - ${format(new Date(), 'MMM dd, HH:mm')}`
      : `AI Response - ${format(new Date(), 'MMM dd, HH:mm')}`
    
    const source = messageType === 'user' 
      ? `Message from ${currentUser.name}`
      : 'BoardBravo AI Assistant'
    
    await saveNote({
      title: title,
      content: messageContent,
      category: 'general',
      source: source,
      isPinned: false,
      tags: messageType === 'user' ? ['user-message'] : ['ai-response']
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
        
        // Auto-save agent result as note
        const category = actionTitle.toLowerCase().includes('financial') ? 'financial' :
                        actionTitle.toLowerCase().includes('risk') ? 'risk' :
                        actionTitle.toLowerCase().includes('compliance') ? 'compliance' :
                        actionTitle.toLowerCase().includes('performance') ? 'performance' :
                        actionTitle.toLowerCase().includes('strategy') ? 'strategy' : 'general'
        
        await saveAgentResultAsNote(actionTitle, data.response, category)
        
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
          ? 'Comprehensive analysis of uploaded financial statements with charts and projections'
          : 'Analyze financial documents and data with visual charts',
        detailedDescription: 'Revenue trends, cost analysis, profitability metrics with bar charts and statistics',
        prompt: hasDocuments 
          ? 'Analyze the uploaded financial documents in detail. Create comprehensive analysis with charts showing revenue trends, cost structures, profitability metrics, and cash flow patterns. Include bar charts for year-over-year comparisons, pie charts for expense breakdowns, and line charts for trend analysis. Provide specific statistics and forward-looking projections with visual representations.'
          : 'Provide general financial analysis guidance with example charts and statistical insights',
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
        description: 'Risk identification with impact charts and probability matrices',
        detailedDescription: 'Operational, financial, strategic, and compliance risks with visual dashboards',
        prompt: 'Conduct a comprehensive risk assessment based on all uploaded documents. Create visual risk matrices, impact charts, and probability distributions. Generate bar charts showing risk categories, heat maps for risk severity, and statistical analysis of potential impacts. Include specific risk metrics and mitigation recommendations.',
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
        description: 'Compliance review with score charts and gap analysis visuals',
        detailedDescription: 'SOX compliance, governance standards with visual compliance dashboards',
        prompt: 'Perform a detailed compliance audit of all uploaded documents. Create compliance score charts, gap analysis visuals, and regulatory adherence metrics. Generate bar charts showing compliance levels across different frameworks, pie charts for compliance categories, and trend analysis. Include specific compliance statistics and improvement recommendations.',
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
        description: 'KPI analysis with performance charts and benchmarking visuals',
        detailedDescription: 'Operational efficiency charts, strategic goal progress with visual metrics',
        prompt: 'Create a comprehensive performance analysis from uploaded documents. Generate KPI dashboards with bar charts showing performance metrics, line charts for trend analysis, and comparison charts against benchmarks. Include operational efficiency statistics, goal achievement metrics, and visual performance scorecards with specific numerical insights.',
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
        description: 'Market analysis with competitive charts and strategic visuals',
        detailedDescription: 'Competitive landscape charts, market opportunity visuals with strategic metrics',
        prompt: 'Generate a strategic intelligence report based on all available documents. Create market positioning charts, competitive analysis visuals, and strategic opportunity matrices. Include bar charts for market share analysis, pie charts for market segments, and trend charts for strategic initiatives. Provide specific market statistics and strategic recommendations with visual support.',
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