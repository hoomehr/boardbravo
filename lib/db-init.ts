import { connectToDatabase } from './mongodb'
import { INDEX_DEFINITIONS } from './models'

let isInitialized = false

export async function initializeDatabase(): Promise<void> {
  // Only initialize once per app lifecycle
  if (isInitialized) {
    return
  }

  try {
    console.log('🚀 Initializing MongoDB database...')
    
    const { db } = await connectToDatabase()
    
    // Create indexes for all collections
    for (const [collectionName, indexes] of Object.entries(INDEX_DEFINITIONS)) {
      const collection = db.collection(collectionName)
      
      for (const indexDef of indexes) {
        const options: any = { background: true }
        if ('unique' in indexDef && indexDef.unique) {
          options.unique = true
        }
        
        try {
          await collection.createIndex(indexDef.key, options)
          console.log(`✅ Created index on ${collectionName}: ${JSON.stringify(indexDef.key)}`)
        } catch (error: any) {
          // Index already exists (error code 85) - this is fine
          if (error.code === 85) {
            console.log(`⚠️  Index already exists on ${collectionName}: ${JSON.stringify(indexDef.key)}`)
          } else {
            console.error(`❌ Failed to create index on ${collectionName}:`, error.message)
          }
        }
      }
    }
    
    // Check existing collections and their document counts
    const collections = ['boards', 'documents', 'chatSessions', 'savedNotes']
    const counts: Record<string, number> = {}
    
    for (const collectionName of collections) {
      counts[collectionName] = await db.collection(collectionName).countDocuments()
    }
    
    console.log('📊 Database initialization complete:')
    console.log('   Collections:')
    Object.entries(counts).forEach(([name, count]) => {
      console.log(`   - ${name}: ${count} documents`)
    })
    
    console.log('   Note: Board members are embedded within board documents')
    
    isInitialized = true
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error)
    throw error
  }
}

// Auto-initialize on first import (for API routes)
export async function ensureInitialized(): Promise<void> {
  if (!isInitialized) {
    await initializeDatabase()
  }
} 