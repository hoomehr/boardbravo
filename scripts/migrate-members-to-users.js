const { MongoClient } = require('mongodb')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/boardbravo'
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'boardbravo'

async function migrateMembersToUsers() {
  let client = null
  
  try {
    console.log('🚀 Starting migration from embedded members to user-reference structure...')
    console.log(`📡 MongoDB URI: ${MONGODB_URI}`)
    console.log(`🗄️  Database: ${MONGODB_DB_NAME}`)
    
    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI)
    await client.connect()
    
    const db = client.db(MONGODB_DB_NAME)
    
    // Test connection
    await db.admin().ping()
    console.log('✅ MongoDB connection successful!')
    
    // Get all boards with members
    const boards = await db.collection('boards').find({}).toArray()
    console.log(`📋 Found ${boards.length} boards`)
    
    let totalUsersCreated = 0
    let totalMembershipsConverted = 0
    const userCache = new Map() // Cache to avoid duplicate users
    
    for (const board of boards) {
      if (!board.members || board.members.length === 0) {
        console.log(`   ⚠️  Board ${board.boardId} has no members to migrate`)
        continue
      }
      
      console.log(`\n📝 Processing board: ${board.boardId}`)
      console.log(`   - ${board.members.length} members to process`)
      
      const newMembers = []
      
      for (const member of board.members) {
        try {
          // Check if this is old embedded format or new reference format
          if (member.userId && !member.name && !member.email) {
            // Already in new format (userId reference)
            newMembers.push(member)
            console.log(`   ✅ Member ${member.userId} already in new format`)
            continue
          }
          
          // Convert old embedded format to new user-reference format
          const memberEmail = member.email || `${member.name || member.id}@example.com`.toLowerCase()
          const memberName = member.name || `User ${member.id}`
          const memberId = member.memberId || member.id
          
          // Check if user already exists (in cache or database)
          let existingUser = userCache.get(memberEmail)
          if (!existingUser) {
            existingUser = await db.collection('users').findOne({ email: memberEmail })
          }
          
          let userId
          
          if (existingUser) {
            userId = existingUser.userId
            console.log(`   👤 Found existing user: ${memberName} (${memberEmail})`)
          } else {
            // Create new user
            userId = memberId || Math.random().toString(36).substr(2, 9)
            
            const newUser = {
              userId: userId,
              email: memberEmail,
              name: memberName,
              preferences: {
                notifications: true,
                emailUpdates: true,
                theme: 'light',
                language: 'en'
              },
              status: member.status || 'active',
              emailVerified: false,
              onboardingCompleted: false,
              createdAt: new Date(),
              updatedAt: new Date()
            }
            
            await db.collection('users').insertOne(newUser)
            userCache.set(memberEmail, newUser)
            totalUsersCreated++
            console.log(`   ✨ Created new user: ${memberName} (${memberEmail}) -> ${userId}`)
          }
          
          // Create new board member reference
          const newMember = {
            userId: userId,
            role: member.role || 'Member',
            addedAt: member.addedAt ? new Date(member.addedAt) : new Date(),
            addedBy: board.createdBy || 'migration',
            permissions: {
              canInviteMembers: (member.role || 'Member') === 'Admin',
              canEditDocuments: (member.role || 'Member') !== 'Viewer',
              canDeleteDocuments: (member.role || 'Member') === 'Admin',
              canManageNotes: (member.role || 'Member') !== 'Viewer'
            },
            status: member.status || 'active'
          }
          
          newMembers.push(newMember)
          totalMembershipsConverted++
          console.log(`   🔗 Converted member: ${memberName} -> references user ${userId}`)
          
        } catch (error) {
          console.error(`   ❌ Error processing member ${member.id || member.memberId}:`, error.message)
        }
      }
      
      // Update board with new member references
      if (newMembers.length > 0) {
        await db.collection('boards').updateOne(
          { _id: board._id },
          {
            $set: {
              members: newMembers,
              updatedAt: new Date()
            }
          }
        )
        console.log(`   ✅ Updated board ${board.boardId} with ${newMembers.length} member references`)
      }
    }
    
    // Update statistics
    console.log('\n📊 Migration Summary:')
    console.log(`   👤 Users created: ${totalUsersCreated}`)
    console.log(`   🔗 Board memberships converted: ${totalMembershipsConverted}`)
    
    // Verify final state
    const finalStats = {
      users: await db.collection('users').countDocuments(),
      activeUsers: await db.collection('users').countDocuments({ status: 'active' }),
      boards: await db.collection('boards').countDocuments()
    }
    
    console.log('\n📈 Final Database State:')
    console.log(`   - Total users: ${finalStats.users}`)
    console.log(`   - Active users: ${finalStats.activeUsers}`)
    console.log(`   - Total boards: ${finalStats.boards}`)
    
    // Show sample user
    const sampleUser = await db.collection('users').findOne({})
    if (sampleUser) {
      console.log(`   - Sample user: ${sampleUser.name} (${sampleUser.email})`)
    }
    
    // Show sample board member reference
    const sampleBoard = await db.collection('boards').findOne({ 'members.0': { $exists: true } })
    if (sampleBoard && sampleBoard.members[0]) {
      console.log(`   - Sample member reference: { userId: "${sampleBoard.members[0].userId}", role: "${sampleBoard.members[0].role}" }`)
    }
    
    console.log('\n🎉 Migration completed successfully!')
    console.log('✅ Board members now reference users in separate collection')
    console.log('🔍 Test with: curl http://localhost:3000/api/db-health')
    
  } catch (error) {
    console.error('💥 Migration failed:', error.message)
    console.error(error)
    process.exit(1)
  } finally {
    if (client) {
      await client.close()
    }
  }
}

if (require.main === module) {
  migrateMembersToUsers()
}

module.exports = { migrateMembersToUsers } 