const { readFile, readdir, stat } = require('fs/promises')
const { existsSync } = require('fs')
const path = require('path')
const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boardbravo'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'boardbravo'

console.log('⚠️  MIGRATION NOTICE')
console.log('==================')
console.log('This migration script is designed for converting old file-based data to MongoDB.')
console.log('For the current implementation, no migration is needed as the app starts fresh with MongoDB.')
console.log('Board members are now embedded within board documents for better performance.')
console.log('')
console.log('If you want to proceed with migration anyway, please continue...')
console.log('')

class MongoMigrator {
  constructor() {
    this.client = null
    this.db = null
  }

  async connect() {
    try {
      this.client = new MongoClient(MONGODB_URI)
      await this.client.connect()
      this.db = this.client.db(MONGODB_DB_NAME)
      console.log('✅ Connected to MongoDB')
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error.message)
      throw error
    }
  }

  async disconnect() {
    if (this.client) {
      await this.client.close()
      console.log('✅ Disconnected from MongoDB')
    }
  }

  async createIndexes() {
    console.log('📝 Creating database indexes...')
    
    const indexDefinitions = {
      boards: [
        { key: { boardId: 1 }, unique: true },
        { key: { createdBy: 1 } },
        { key: { lastActivity: -1 } },
        { key: { 'members.email': 1 } },
        { key: { 'members.memberId': 1 } }
      ],
      documents: [
        { key: { boardId: 1, documentId: 1 }, unique: true },
        { key: { boardId: 1 } },
        { key: { status: 1 } },
        { key: { uploadedAt: -1 } }
      ],
      chatSessions: [
        { key: { boardId: 1, sessionId: 1 }, unique: true },
        { key: { boardId: 1 } },
        { key: { updatedAt: -1 } }
      ],
      savedNotes: [
        { key: { boardId: 1, noteId: 1 }, unique: true },
        { key: { boardId: 1 } },
        { key: { category: 1 } },
        { key: { isPinned: -1, updatedAt: -1 } }
      ]
    }

    for (const [collectionName, indexes] of Object.entries(indexDefinitions)) {
      const collection = this.db.collection(collectionName)
      
      for (const indexDef of indexes) {
        const options = { background: true }
        if (indexDef.unique) {
          options.unique = true
        }
        
        try {
          await collection.createIndex(indexDef.key, options)
          console.log(`   ✅ Created index on ${collectionName}: ${JSON.stringify(indexDef.key)}`)
        } catch (error) {
          if (error.code === 85) { // Index already exists
            console.log(`   ⚠️  Index already exists on ${collectionName}: ${JSON.stringify(indexDef.key)}`)
          } else {
            console.error(`   ❌ Failed to create index on ${collectionName}:`, error.message)
          }
        }
      }
    }
  }

  async migrateBoardData() {
    const storageDir = path.join(process.cwd(), 'storage', 'boards')
    
    if (!existsSync(storageDir)) {
      console.log('⚠️  No storage directory found, skipping file migration')
      return
    }

    console.log('📂 Scanning storage directory for boards...')
    
    try {
      const boardDirs = await readdir(storageDir)
      console.log(`📋 Found ${boardDirs.length} potential board directories`)

      for (const boardId of boardDirs) {
        const boardDir = path.join(storageDir, boardId)
        const stats = await stat(boardDir)
        
        if (!stats.isDirectory()) continue

        await this.migrateSingleBoard(boardId, boardDir)
      }

      console.log('✅ Migration completed successfully!')
    } catch (error) {
      console.error('❌ Migration failed:', error.message)
      throw error
    }
  }

  async migrateSingleBoard(boardId, boardDir) {
    console.log(`\n🔄 Migrating board: ${boardId}`)
    
    const boardDataPath = path.join(boardDir, 'board-data.json')
    
    if (!existsSync(boardDataPath)) {
      console.log(`   ⚠️  No board-data.json found for ${boardId}, skipping`)
      return
    }

    try {
      const boardDataRaw = await readFile(boardDataPath, 'utf8')
      const boardData = JSON.parse(boardDataRaw)
      
      // Check if board already exists in MongoDB
      const existingBoard = await this.db.collection('boards').findOne({ boardId })
      if (existingBoard) {
        console.log(`   ⚠️  Board ${boardId} already exists in MongoDB, skipping`)
        return
      }

      const now = new Date()

      // Transform members to embedded format
      const embeddedMembers = (boardData.members || []).map(member => ({
        memberId: member.id,
        name: member.name,
        email: member.email,
        role: member.role,
        addedAt: member.addedAt ? new Date(member.addedAt) : now,
        status: member.status || 'active'
      }))

      // Migrate board workspace with embedded members
      const boardDoc = {
        boardId: boardId,
        name: boardData.board?.name || 'Migrated Board',
        createdBy: boardData.board?.createdBy || 'migration',
        lastActivity: boardData.board?.lastSaved ? new Date(boardData.board.lastSaved) : now,
        members: embeddedMembers, // Embed members in board document
        settings: boardData.board?.settings || {
          allowMemberInvites: true,
          requireApproval: false
        },
        metadata: boardData.metadata || {
          version: '1.0',
          documentsCount: 0,
          membersCount: embeddedMembers.length,
          chatSessionsCount: 0,
          savedNotesCount: 0
        },
        createdAt: boardData.board?.createdAt ? new Date(boardData.board.createdAt) : now,
        updatedAt: now
      }

      await this.db.collection('boards').insertOne(boardDoc)
      console.log(`   ✅ Migrated board workspace with ${embeddedMembers.length} embedded members`)

      // Migrate documents
      if (boardData.documents && boardData.documents.length > 0) {
        for (const doc of boardData.documents) {
          const documentDoc = {
            boardId: boardId,
            documentId: doc.id,
            name: doc.name,
            type: doc.type,
            size: doc.size,
            uploadedAt: doc.uploadedAt ? new Date(doc.uploadedAt) : now,
            status: doc.status || 'ready',
            extractedText: doc.extractedText,
            metadata: {
              originalName: doc.name,
              mimeType: doc.type,
              uploadedBy: doc.uploadedBy
            },
            createdAt: now,
            updatedAt: now
          }
          
          await this.db.collection('documents').insertOne(documentDoc)
        }
        console.log(`   ✅ Migrated ${boardData.documents.length} documents`)
      }

      // Migrate chat sessions
      if (boardData.chatSessions && boardData.chatSessions.length > 0) {
        for (const session of boardData.chatSessions) {
          const sessionDoc = {
            boardId: boardId,
            sessionId: session.id,
            title: session.title,
            messages: session.messages || [],
            createdAt: session.createdAt ? new Date(session.createdAt) : now,
            updatedAt: session.updatedAt ? new Date(session.updatedAt) : now
          }
          
          await this.db.collection('chatSessions').insertOne(sessionDoc)
        }
        console.log(`   ✅ Migrated ${boardData.chatSessions.length} chat sessions`)
      }

      // Migrate saved notes
      if (boardData.savedNotes && boardData.savedNotes.length > 0) {
        for (const note of boardData.savedNotes) {
          const noteDoc = {
            boardId: boardId,
            noteId: note.id,
            title: note.title,
            content: note.content,
            category: note.category || 'general',
            source: note.source,
            isPinned: note.isPinned || false,
            tags: note.tags || [],
            charts: note.charts,
            summary: note.summary,
            createdAt: note.createdAt ? new Date(note.createdAt) : now,
            updatedAt: note.updatedAt ? new Date(note.updatedAt) : now
          }
          
          await this.db.collection('savedNotes').insertOne(noteDoc)
        }
        console.log(`   ✅ Migrated ${boardData.savedNotes.length} saved notes`)
      }

      // Update board metadata with actual counts
      const counts = await Promise.all([
        this.db.collection('documents').countDocuments({ boardId }),
        this.db.collection('chatSessions').countDocuments({ boardId }),
        this.db.collection('savedNotes').countDocuments({ boardId })
      ])

      await this.db.collection('boards').updateOne(
        { boardId },
        {
          $set: {
            'metadata.documentsCount': counts[0],
            'metadata.membersCount': embeddedMembers.length,
            'metadata.chatSessionsCount': counts[1],
            'metadata.savedNotesCount': counts[2],
            updatedAt: now
          }
        }
      )

      console.log(`   ✅ Updated board metadata`)

    } catch (error) {
      console.error(`   ❌ Failed to migrate board ${boardId}:`, error.message)
    }
  }

  async generateReport() {
    console.log('\n📊 Migration Report:')
    console.log('==================')
    
    const collections = ['boards', 'documents', 'chatSessions', 'savedNotes']
    
    for (const collection of collections) {
      const count = await this.db.collection(collection).countDocuments()
      console.log(`${collection.padEnd(15)}: ${count} documents`)
    }
    
    // Count embedded members
    const boardsWithMembers = await this.db.collection('boards').aggregate([
      { $project: { membersCount: { $size: { $ifNull: ['$members', []] } } } },
      { $group: { _id: null, totalMembers: { $sum: '$membersCount' } } }
    ]).toArray()
    
    const totalMembers = boardsWithMembers[0]?.totalMembers || 0
    console.log(`${'embedded members'.padEnd(15)}: ${totalMembers} members`)
    
    console.log('==================')
    console.log('Note: Members are now embedded within board documents')
  }
}

async function runMigration() {
  const migrator = new MongoMigrator()
  
  try {
    console.log('🚀 Starting MongoDB migration...')
    console.log(`📡 MongoDB URI: ${MONGODB_URI}`)
    console.log(`🗄️  Database: ${MONGODB_DB_NAME}`)
    
    await migrator.connect()
    await migrator.createIndexes()
    await migrator.migrateBoardData()
    await migrator.generateReport()
    
  } catch (error) {
    console.error('💥 Migration failed:', error)
    process.exit(1)
  } finally {
    await migrator.disconnect()
  }
}

// Run migration if called directly
if (require.main === module) {
  runMigration()
}

module.exports = { MongoMigrator } 