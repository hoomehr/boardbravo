const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boardbravo'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'boardbravo'

async function testMongoDB() {
  let client = null
  
  try {
    console.log('🚀 Testing MongoDB connection...')
    console.log(`📡 URI: ${MONGODB_URI}`)
    console.log(`🗄️  Database: ${MONGODB_DB_NAME}`)
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB_NAME)
    
    // Test connection
    await db.admin().ping()
    console.log('✅ MongoDB connection successful!')
    
    // List existing collections
    const collections = await db.listCollections().toArray()
    console.log(`📊 Found ${collections.length} existing collections:`)
    
    if (collections.length > 0) {
      for (const collection of collections) {
        const count = await db.collection(collection.name).countDocuments()
        console.log(`   - ${collection.name}: ${count} documents`)
      }
      
      // Show user and board relationship details
      const users = await db.collection('users').find({}).toArray()
      const boards = await db.collection('boards').find({}).toArray()
      
      if (users.length > 0) {
        console.log(`👥 Users: ${users.length} total`)
        const activeUsers = users.filter(u => u.status === 'active').length
        console.log(`   - Active users: ${activeUsers}`)
      }
      
      if (boards.length > 0) {
        const totalMemberships = boards.reduce((sum, board) => sum + (board.members?.length || 0), 0)
        console.log(`🏢 Board memberships: ${totalMemberships} total across all boards`)
        
        // Show sample board member structure
        const sampleBoard = boards.find(b => b.members && b.members.length > 0)
        if (sampleBoard && sampleBoard.members[0]) {
          console.log(`   - Sample member structure: { userId: "${sampleBoard.members[0].userId}", role: "${sampleBoard.members[0].role}" }`)
        }
      }
    } else {
      console.log('   - No collections found (will be created automatically when app is used)')
    }
    
    console.log('\n🏗️  Schema Design:')
    console.log('   - Users are stored in separate "users" collection with detailed profiles')
    console.log('   - Board members reference users by userId (not embedded)')
    console.log('   - Documents, chat sessions, and notes are separate collections')
    console.log('   - All data is stored in MongoDB only (no file system)')
    
    console.log('\n🎉 MongoDB is ready for BoardBravo!')
    console.log('💡 Start the app with: npm run dev')
    console.log('🔍 Check health with: curl http://localhost:3000/api/db-health')
    console.log('👤 Manage users with: /api/users')
    console.log('👥 Manage board members with: /api/boards/[id]/members')
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:')
    console.error(`   Error: ${error.message}`)
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n💡 Troubleshooting:')
      console.log('   1. Make sure MongoDB is running')
      console.log('   2. Check your MONGODB_URI in .env.local')
      console.log('   3. For local MongoDB: mongod --dbpath /path/to/your/db')
      console.log('   4. For MongoDB Atlas: check your connection string')
    }
    
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

if (require.main === module) {
  testMongoDB()
}

module.exports = { testMongoDB } 