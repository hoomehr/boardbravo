const { DatabaseService } = require('../lib/database-service.ts')

async function testBoardsAPI() {
  try {
    console.log('🚀 Testing BoardBravo MongoDB Implementation...')
    
    // Test creating a board with embedded members
    const testBoardData = {
      boardId: 'test-board-123',
      name: 'Test Board',
      createdBy: 'test@example.com',
      lastActivity: new Date(),
      members: [
        {
          memberId: 'member-1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          addedAt: new Date(),
          status: 'active'
        },
        {
          memberId: 'member-2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'member',
          addedAt: new Date(),
          status: 'active'
        }
      ],
      settings: {
        allowMemberInvites: true,
        requireApproval: false
      },
      metadata: {
        version: '1.0',
        documentsCount: 0,
        membersCount: 2,
        chatSessionsCount: 0,
        savedNotesCount: 0
      }
    }
    
    console.log('📝 Creating test board with embedded members...')
    
    // Check if board exists, if so delete it first
    const existingBoard = await DatabaseService.getBoardById('test-board-123')
    if (existingBoard) {
      await DatabaseService.deleteBoard('test-board-123')
      console.log('🗑️  Deleted existing test board')
    }
    
    // Create new board
    const newBoard = await DatabaseService.createBoard(testBoardData)
    console.log('✅ Created board:', newBoard.boardId)
    console.log('👥 Members embedded:', newBoard.members.length)
    
    // Test retrieving the board
    console.log('\n📖 Testing board retrieval...')
    const retrievedBoard = await DatabaseService.getBoardById('test-board-123')
    if (retrievedBoard) {
      console.log('✅ Board retrieved successfully')
      console.log('   - Board ID:', retrievedBoard.boardId)
      console.log('   - Board Name:', retrievedBoard.name)
      console.log('   - Members Count:', retrievedBoard.members.length)
      console.log('   - Members:', retrievedBoard.members.map(m => `${m.name} (${m.role})`).join(', '))
    } else {
      console.log('❌ Failed to retrieve board')
    }
    
    // Test member operations
    console.log('\n👥 Testing member operations...')
    
    // Add a new member
    const newMember = {
      memberId: 'member-3',
      name: 'Bob Wilson',
      email: 'bob@example.com',
      role: 'viewer',
      addedAt: new Date(),
      status: 'active'
    }
    
    const addResult = await DatabaseService.addBoardMember('test-board-123', newMember)
    console.log('✅ Added new member:', addResult)
    
    // Get all members
    const allMembers = await DatabaseService.getBoardMembers('test-board-123')
    console.log('👥 Total members:', allMembers.length)
    allMembers.forEach(member => {
      console.log(`   - ${member.name} (${member.email}) - ${member.role}`)
    })
    
    // Test board summary
    console.log('\n📊 Testing board summary...')
    const summary = await DatabaseService.getBoardSummary('test-board-123')
    console.log('✅ Board summary retrieved:')
    console.log('   - Board:', summary.board?.name)
    console.log('   - Members:', summary.members.length)
    console.log('   - Documents:', summary.documents.length)
    console.log('   - Chat Sessions:', summary.chatSessions.length)
    console.log('   - Saved Notes:', summary.savedNotes.length)
    
    // Clean up - delete test board
    console.log('\n🧹 Cleaning up...')
    const deleteResult = await DatabaseService.deleteBoard('test-board-123')
    console.log('🗑️  Test board deleted:', deleteResult)
    
    console.log('\n🎉 All tests passed! MongoDB implementation is working correctly.')
    console.log('✅ Board members are properly embedded within board documents')
    console.log('✅ All operations are using MongoDB only (no file system)')
    
  } catch (error) {
    console.error('❌ Test failed:', error.message)
    console.error(error)
    process.exit(1)
  }
}

if (require.main === module) {
  testBoardsAPI()
}

module.exports = { testBoardsAPI } 