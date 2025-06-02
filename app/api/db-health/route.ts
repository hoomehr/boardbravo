import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import { ensureInitialized } from '@/lib/db-init'

export async function GET(request: NextRequest) {
  try {
    // Test MongoDB connection and initialize
    const { db } = await connectToDatabase()
    
    // Ping the database
    await db.admin().ping()
    
    // Initialize database schema
    await ensureInitialized()
    
    // Get collection counts (now includes users collection)
    const collections = ['users', 'boards', 'documents', 'chatSessions', 'savedNotes']
    const counts: Record<string, number> = {}
    
    for (const collection of collections) {
      counts[collection] = await db.collection(collection).countDocuments()
    }
    
    // Get total members count from board references
    const boardsWithMembers = await db.collection('boards').aggregate([
      { $project: { membersCount: { $size: { $ifNull: ['$members', []] } } } },
      { $group: { _id: null, totalBoardMembers: { $sum: '$membersCount' } } }
    ]).toArray()
    
    const totalBoardMembers = boardsWithMembers[0]?.totalBoardMembers || 0

    // Get active users count
    const activeUsersCount = await db.collection('users').countDocuments({ status: 'active' })
    
    return NextResponse.json({
      status: 'healthy',
      message: 'MongoDB connection is working and schema initialized',
      database: process.env.MONGODB_DB_NAME || 'boardbravo',
      collections: counts,
      userModel: {
        totalUsers: counts.users || 0,
        activeUsers: activeUsersCount,
        totalBoardMemberships: totalBoardMembers,
        note: 'Users are stored in separate collection, referenced by boards'
      },
      storageMode: 'mongodb_only',
      architecture: 'user_references',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return NextResponse.json({
      status: 'error',
      message: 'MongoDB connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 