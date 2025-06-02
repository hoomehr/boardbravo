import { MongoClient, Db, Collection, Document } from 'mongodb'

interface MongoConnection {
  client: MongoClient
  db: Db
}

let cached: MongoConnection | null = null

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cached) {
    return cached
  }

  const uri = process.env.MONGODB_URI
  const dbName = process.env.MONGODB_DB_NAME || 'boardbravo'

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local')
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    await client.connect()
    const db = client.db(dbName)

    // Test the connection
    await db.admin().ping()
    console.log('Successfully connected to MongoDB')

    cached = { client, db }
    return cached
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error)
    throw error
  }
}

export async function getCollection<T extends Document = Document>(collectionName: string): Promise<Collection<T>> {
  const { db } = await connectToDatabase()
  return db.collection<T>(collectionName)
}

// Collection names
export const Collections = {
  USERS: 'users',
  BOARDS: 'boards',
  DOCUMENTS: 'documents',
  CHAT_SESSIONS: 'chatSessions',
  SAVED_NOTES: 'savedNotes',
  UPLOADS: 'uploads'
} as const

// Cleanup function for graceful shutdown
export async function disconnectFromDatabase(): Promise<void> {
  if (cached) {
    await cached.client.close()
    cached = null
  }
} 