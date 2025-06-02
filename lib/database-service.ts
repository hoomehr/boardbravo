import { ObjectId } from 'mongodb'
import { getCollection, Collections } from './mongodb'
import { ensureInitialized } from './db-init'
import {
  UserDocument,
  BoardWorkspaceDocument,
  BoardMember,
  DocumentDocument,
  ChatSessionDocument,
  SavedNoteDocument,
  UploadDocument,
  ChatMessageData,
  INDEX_DEFINITIONS
} from './models'

export class DatabaseService {
  // Ensure database is initialized before any operation
  private static async init() {
    await ensureInitialized()
  }

  // User Operations
  static async createUser(userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<UserDocument> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    
    const user: UserDocument = {
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(user)
    return { ...user, _id: result.insertedId }
  }

  static async getUserById(userId: string): Promise<UserDocument | null> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    return await collection.findOne({ userId })
  }

  static async getUserByEmail(email: string): Promise<UserDocument | null> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    return await collection.findOne({ email: email.toLowerCase() })
  }

  static async updateUser(userId: string, updates: Partial<UserDocument>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    
    const result = await collection.updateOne(
      { userId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async deleteUser(userId: string): Promise<boolean> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    const result = await collection.deleteOne({ userId })
    return result.deletedCount > 0
  }

  static async searchUsers(query: string, limit: number = 10): Promise<UserDocument[]> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    
    return await collection.find({
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { company: { $regex: query, $options: 'i' } }
      ],
      status: 'active'
    }).limit(limit).toArray()
  }

  static async getUsersByIds(userIds: string[]): Promise<UserDocument[]> {
    await this.init()
    const collection = await getCollection<UserDocument>(Collections.USERS)
    return await collection.find({ userId: { $in: userIds } }).toArray()
  }

  // Board Operations
  static async createBoard(boardData: Omit<BoardWorkspaceDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<BoardWorkspaceDocument> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    
    const board: BoardWorkspaceDocument = {
      ...boardData,
      members: boardData.members || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(board)
    return { ...board, _id: result.insertedId }
  }

  static async getBoardById(boardId: string): Promise<BoardWorkspaceDocument | null> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    return await collection.findOne({ boardId })
  }

  static async updateBoard(boardId: string, updates: Partial<BoardWorkspaceDocument>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    
    const result = await collection.updateOne(
      { boardId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async deleteBoard(boardId: string): Promise<boolean> {
    await this.init()
    // Delete board and all related data
    const [boardResult, documentsResult, chatResult, notesResult] = await Promise.all([
      (await getCollection(Collections.BOARDS)).deleteOne({ boardId }),
      (await getCollection(Collections.DOCUMENTS)).deleteMany({ boardId }),
      (await getCollection(Collections.CHAT_SESSIONS)).deleteMany({ boardId }),
      (await getCollection(Collections.SAVED_NOTES)).deleteMany({ boardId })
    ])
    
    return boardResult.deletedCount > 0
  }

  // Board Member Operations (working with user references)
  static async addBoardMember(boardId: string, memberData: BoardMember): Promise<boolean> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    
    // Verify the user exists
    const user = await this.getUserById(memberData.userId)
    if (!user) {
      throw new Error(`User with ID ${memberData.userId} not found`)
    }
    
    const result = await collection.updateOne(
      { boardId },
      { 
        $push: { members: memberData },
        $set: { updatedAt: new Date() }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async getBoardMembers(boardId: string): Promise<BoardMember[]> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    const board = await collection.findOne({ boardId }, { projection: { members: 1 } })
    return board?.members || []
  }

  static async getBoardMembersWithUserDetails(boardId: string): Promise<Array<BoardMember & { user: UserDocument }>> {
    await this.init()
    const members = await this.getBoardMembers(boardId)
    const userIds = members.map(m => m.userId)
    const users = await this.getUsersByIds(userIds)
    const userMap = new Map(users.map(u => [u.userId, u]))

    return members.map(member => ({
      ...member,
      user: userMap.get(member.userId)!
    })).filter(m => m.user) // Filter out members whose users don't exist
  }

  static async updateBoardMember(boardId: string, userId: string, updates: Partial<BoardMember>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    
    // Build the update object for the specific member
    const setUpdate: any = { updatedAt: new Date() }
    Object.keys(updates).forEach(key => {
      if (key !== 'userId') { // Don't allow changing userId
        setUpdate[`members.$.${key}`] = (updates as any)[key]
      }
    })
    
    const result = await collection.updateOne(
      { boardId, 'members.userId': userId },
      { $set: setUpdate }
    )
    
    return result.modifiedCount > 0
  }

  static async removeBoardMember(boardId: string, userId: string): Promise<boolean> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    
    const result = await collection.updateOne(
      { boardId },
      { 
        $pull: { members: { userId } },
        $set: { updatedAt: new Date() }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async getBoardMember(boardId: string, userId: string): Promise<BoardMember | null> {
    await this.init()
    const collection = await getCollection<BoardWorkspaceDocument>(Collections.BOARDS)
    const board = await collection.findOne(
      { boardId, 'members.userId': userId },
      { projection: { 'members.$': 1 } }
    )
    return board?.members?.[0] || null
  }

  static async isBoardMember(boardId: string, userId: string): Promise<boolean> {
    await this.init()
    const member = await this.getBoardMember(boardId, userId)
    return member !== null && member.status === 'active'
  }

  static async isBoardAdmin(boardId: string, userId: string): Promise<boolean> {
    await this.init()
    const member = await this.getBoardMember(boardId, userId)
    return member !== null && member.role === 'Admin' && member.status === 'active'
  }

  // Document Operations
  static async addDocument(documentData: Omit<DocumentDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<DocumentDocument> {
    await this.init()
    const collection = await getCollection<DocumentDocument>(Collections.DOCUMENTS)
    
    const document: DocumentDocument = {
      ...documentData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(document)
    return { ...document, _id: result.insertedId }
  }

  static async getBoardDocuments(boardId: string): Promise<DocumentDocument[]> {
    await this.init()
    const collection = await getCollection<DocumentDocument>(Collections.DOCUMENTS)
    return await collection.find({ boardId }).sort({ uploadedAt: -1 }).toArray()
  }

  static async getDocumentById(boardId: string, documentId: string): Promise<DocumentDocument | null> {
    await this.init()
    const collection = await getCollection<DocumentDocument>(Collections.DOCUMENTS)
    return await collection.findOne({ boardId, documentId })
  }

  static async updateDocument(boardId: string, documentId: string, updates: Partial<DocumentDocument>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<DocumentDocument>(Collections.DOCUMENTS)
    
    const result = await collection.updateOne(
      { boardId, documentId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async deleteDocument(boardId: string, documentId: string): Promise<boolean> {
    await this.init()
    const collection = await getCollection<DocumentDocument>(Collections.DOCUMENTS)
    const result = await collection.deleteOne({ boardId, documentId })
    return result.deletedCount > 0
  }

  // Chat Session Operations
  static async createChatSession(sessionData: Omit<ChatSessionDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<ChatSessionDocument> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    
    const session: ChatSessionDocument = {
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(session)
    return { ...session, _id: result.insertedId }
  }

  static async getBoardChatSessions(boardId: string): Promise<ChatSessionDocument[]> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    return await collection.find({ boardId }).sort({ updatedAt: -1 }).toArray()
  }

  static async getChatSessionById(boardId: string, sessionId: string): Promise<ChatSessionDocument | null> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    return await collection.findOne({ boardId, sessionId })
  }

  static async updateChatSession(boardId: string, sessionId: string, updates: Partial<ChatSessionDocument>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    
    const result = await collection.updateOne(
      { boardId, sessionId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async addMessageToSession(boardId: string, sessionId: string, message: ChatMessageData): Promise<boolean> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    
    const result = await collection.updateOne(
      { boardId, sessionId },
      { 
        $push: { messages: message },
        $set: { updatedAt: new Date() }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async deleteChatSession(boardId: string, sessionId: string): Promise<boolean> {
    await this.init()
    const collection = await getCollection<ChatSessionDocument>(Collections.CHAT_SESSIONS)
    const result = await collection.deleteOne({ boardId, sessionId })
    return result.deletedCount > 0
  }

  // Saved Notes Operations
  static async createSavedNote(noteData: Omit<SavedNoteDocument, '_id' | 'createdAt' | 'updatedAt'>): Promise<SavedNoteDocument> {
    await this.init()
    const collection = await getCollection<SavedNoteDocument>(Collections.SAVED_NOTES)
    
    const note: SavedNoteDocument = {
      ...noteData,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    const result = await collection.insertOne(note)
    return { ...note, _id: result.insertedId }
  }

  static async getBoardSavedNotes(boardId: string): Promise<SavedNoteDocument[]> {
    await this.init()
    const collection = await getCollection<SavedNoteDocument>(Collections.SAVED_NOTES)
    return await collection.find({ boardId }).sort({ isPinned: -1, updatedAt: -1 }).toArray()
  }

  static async getSavedNoteById(boardId: string, noteId: string): Promise<SavedNoteDocument | null> {
    await this.init()
    const collection = await getCollection<SavedNoteDocument>(Collections.SAVED_NOTES)
    return await collection.findOne({ boardId, noteId })
  }

  static async updateSavedNote(boardId: string, noteId: string, updates: Partial<SavedNoteDocument>): Promise<boolean> {
    await this.init()
    const collection = await getCollection<SavedNoteDocument>(Collections.SAVED_NOTES)
    
    const result = await collection.updateOne(
      { boardId, noteId },
      { 
        $set: { 
          ...updates, 
          updatedAt: new Date() 
        }
      }
    )
    
    return result.modifiedCount > 0
  }

  static async deleteSavedNote(boardId: string, noteId: string): Promise<boolean> {
    await this.init()
    const collection = await getCollection<SavedNoteDocument>(Collections.SAVED_NOTES)
    const result = await collection.deleteOne({ boardId, noteId })
    return result.deletedCount > 0
  }

  // Utility Methods
  static async updateBoardMetadata(boardId: string): Promise<void> {
    await this.init()
    
    const [documentsCount, chatSessionsCount, savedNotesCount, board] = await Promise.all([
      (await getCollection(Collections.DOCUMENTS)).countDocuments({ boardId }),
      (await getCollection(Collections.CHAT_SESSIONS)).countDocuments({ boardId }),
      (await getCollection(Collections.SAVED_NOTES)).countDocuments({ boardId }),
      this.getBoardById(boardId)
    ])

    const membersCount = board?.members?.length || 0

    await this.updateBoard(boardId, {
      lastActivity: new Date(),
      metadata: {
        version: '1.0',
        documentsCount,
        membersCount,
        chatSessionsCount,
        savedNotesCount
      }
    })
  }

  static async getBoardSummary(boardId: string) {
    await this.init()
    const [board, documents, chatSessions, savedNotes, membersWithUsers] = await Promise.all([
      this.getBoardById(boardId),
      this.getBoardDocuments(boardId),
      this.getBoardChatSessions(boardId),
      this.getBoardSavedNotes(boardId),
      this.getBoardMembersWithUserDetails(boardId)
    ])

    return {
      board,
      members: membersWithUsers,
      documents,
      chatSessions,
      savedNotes
    }
  }

  // User convenience methods
  static async createUserFromBasicInfo(name: string, email: string, userId?: string): Promise<UserDocument> {
    await this.init()
    
    const userData: Omit<UserDocument, '_id' | 'createdAt' | 'updatedAt'> = {
      userId: userId || Math.random().toString(36).substr(2, 9),
      email: email.toLowerCase().trim(),
      name: name.trim(),
      preferences: {
        notifications: true,
        emailUpdates: true,
        theme: 'light',
        language: 'en'
      },
      status: 'active',
      emailVerified: false,
      onboardingCompleted: false
    }

    return await this.createUser(userData)
  }

  // Migration helper: convert old embedded member data to users
  static async migrateEmbeddedMembersToUsers(boardId: string): Promise<void> {
    await this.init()
    // This would be used to migrate from the old embedded structure
    // Implementation would depend on the existing data format
  }
} 