import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { BoardMember } from '@/lib/models'

// GET - Fetch all board members with user details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Get board members with full user details
    const membersWithUsers = await DatabaseService.getBoardMembersWithUserDetails(boardId)

    return NextResponse.json({
      success: true,
      members: membersWithUsers.map(memberWithUser => ({
        userId: memberWithUser.userId,
        role: memberWithUser.role,
        addedAt: memberWithUser.addedAt,
        addedBy: memberWithUser.addedBy,
        permissions: memberWithUser.permissions,
        status: memberWithUser.status,
        user: {
          id: memberWithUser.user.userId,
          name: memberWithUser.user.name,
          email: memberWithUser.user.email,
          avatar: memberWithUser.user.avatar,
          bio: memberWithUser.user.bio,
          company: memberWithUser.user.company,
          department: memberWithUser.user.department,
          jobTitle: memberWithUser.user.jobTitle,
          location: memberWithUser.user.location,
          status: memberWithUser.user.status,
          lastLoginAt: memberWithUser.user.lastLoginAt,
          emailVerified: memberWithUser.user.emailVerified
        }
      })),
      boardId,
      membersCount: membersWithUsers.length,
      storageInfo: {
        source: 'mongodb',
        userReferences: true
      }
    })

  } catch (error) {
    console.error('Error fetching board members:', error)
    return NextResponse.json({
      error: 'Failed to fetch board members',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Add a new board member (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { userId, email, name, role, adminUserId, permissions } = await request.json()

    // Validate required fields
    if (!role || !adminUserId) {
      return NextResponse.json({
        error: 'Missing required fields: role and adminUserId are required'
      }, { status: 400 })
    }

    // Must provide either userId or (email and name) to add a member
    if (!userId && (!email || !name)) {
      return NextResponse.json({
        error: 'Must provide either userId or both email and name'
      }, { status: 400 })
    }

    // Validate role
    if (!['Member', 'Admin', 'Viewer'].includes(role)) {
      return NextResponse.json({
        error: 'Invalid role. Must be "Member", "Admin", or "Viewer"'
      }, { status: 400 })
    }

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Check if requesting user is admin
    const isAdmin = await DatabaseService.isBoardAdmin(boardId, adminUserId)
    if (!isAdmin) {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can add members'
      }, { status: 403 })
    }

    let targetUserId = userId

    // If no userId provided, find or create user
    if (!targetUserId && email) {
      // Check if user already exists
      let user = await DatabaseService.getUserByEmail(email)
      
      if (!user) {
        // Create new user
        user = await DatabaseService.createUserFromBasicInfo(name, email)
      }
      
      targetUserId = user.userId
    }

    // Check if user is already a member
    const existingMember = await DatabaseService.getBoardMember(boardId, targetUserId)
    if (existingMember) {
      return NextResponse.json({
        error: 'User is already a member of this board'
      }, { status: 409 })
    }

    // Create new member
    const newMember: BoardMember = {
      userId: targetUserId,
      role,
      addedAt: new Date(),
      addedBy: adminUserId,
      permissions: permissions || {
        canInviteMembers: role === 'Admin',
        canEditDocuments: role !== 'Viewer',
        canDeleteDocuments: role === 'Admin',
        canManageNotes: role !== 'Viewer'
      },
      status: 'active'
    }

    // Add member to board using DatabaseService
    const success = await DatabaseService.addBoardMember(boardId, newMember)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to add member to board'
      }, { status: 500 })
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    // Get the user details for response
    const user = await DatabaseService.getUserById(targetUserId)

    return NextResponse.json({
      success: true,
      message: 'Member added successfully',
      member: {
        userId: newMember.userId,
        role: newMember.role,
        addedAt: newMember.addedAt,
        addedBy: newMember.addedBy,
        permissions: newMember.permissions,
        status: newMember.status,
        user: {
          id: user!.userId,
          name: user!.name,
          email: user!.email,
          avatar: user!.avatar,
          company: user!.company,
          jobTitle: user!.jobTitle,
          status: user!.status
        }
      },
      boardId,
      storageInfo: {
        source: 'mongodb',
        userReferences: true
      }
    })

  } catch (error) {
    console.error('Error adding board member:', error)
    return NextResponse.json({
      error: 'Failed to add board member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Remove a board member (Admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { searchParams } = new URL(request.url)
    const userIdToRemove = searchParams.get('userId')
    const adminUserId = searchParams.get('adminUserId')

    if (!userIdToRemove || !adminUserId) {
      return NextResponse.json({
        error: 'Missing required parameters: userId and adminUserId'
      }, { status: 400 })
    }

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Check if requesting user is admin
    const isAdmin = await DatabaseService.isBoardAdmin(boardId, adminUserId)
    if (!isAdmin) {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can remove members'
      }, { status: 403 })
    }

    // Prevent self-removal
    if (userIdToRemove === adminUserId) {
      return NextResponse.json({
        error: 'Cannot remove yourself from the board'
      }, { status: 400 })
    }

    // Check if member exists
    const memberToRemove = await DatabaseService.getBoardMember(boardId, userIdToRemove)
    if (!memberToRemove) {
      return NextResponse.json({
        error: 'Member not found',
        userId: userIdToRemove
      }, { status: 404 })
    }

    // Get user details before removal
    const user = await DatabaseService.getUserById(userIdToRemove)

    // Remove member from board
    const success = await DatabaseService.removeBoardMember(boardId, userIdToRemove)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to remove member from board'
      }, { status: 500 })
    }

    // Update board metadata
    await DatabaseService.updateBoardMetadata(boardId)

    // Get updated member count
    const remainingMembers = await DatabaseService.getBoardMembers(boardId)

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
      removedMember: {
        userId: memberToRemove.userId,
        role: memberToRemove.role,
        user: user ? {
          id: user.userId,
          name: user.name,
          email: user.email
        } : null
      },
      boardId,
      remainingMembers: remainingMembers.length,
      storageInfo: {
        source: 'mongodb',
        userReferences: true
      }
    })

  } catch (error) {
    console.error('Error removing board member:', error)
    return NextResponse.json({
      error: 'Failed to remove board member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update board member role/permissions (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { userId, role, status, permissions, adminUserId } = await request.json()

    if (!userId || !adminUserId) {
      return NextResponse.json({
        error: 'Missing required fields: userId and adminUserId'
      }, { status: 400 })
    }

    // Check if board exists
    const board = await DatabaseService.getBoardById(boardId)
    if (!board) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    // Check if requesting user is admin
    const isAdmin = await DatabaseService.isBoardAdmin(boardId, adminUserId)
    if (!isAdmin) {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can update member details'
      }, { status: 403 })
    }

    // Check if member exists
    const existingMember = await DatabaseService.getBoardMember(boardId, userId)
    if (!existingMember) {
      return NextResponse.json({
        error: 'Member not found',
        userId
      }, { status: 404 })
    }

    // Validate role if provided
    if (role && !['Member', 'Admin', 'Viewer'].includes(role)) {
      return NextResponse.json({
        error: 'Invalid role. Must be "Member", "Admin", or "Viewer"'
      }, { status: 400 })
    }

    // Validate status if provided
    if (status && !['active', 'pending', 'inactive'].includes(status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be "active", "pending", or "inactive"'
      }, { status: 400 })
    }

    // Prepare updates
    const updates: Partial<BoardMember> = {}
    if (role) updates.role = role
    if (status) updates.status = status
    if (permissions) updates.permissions = permissions

    // Update member
    const success = await DatabaseService.updateBoardMember(boardId, userId, updates)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to update member'
      }, { status: 500 })
    }

    // Get updated member data with user details
    const updatedMember = await DatabaseService.getBoardMember(boardId, userId)
    const user = await DatabaseService.getUserById(userId)

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      member: updatedMember && user ? {
        userId: updatedMember.userId,
        role: updatedMember.role,
        addedAt: updatedMember.addedAt,
        addedBy: updatedMember.addedBy,
        permissions: updatedMember.permissions,
        status: updatedMember.status,
        user: {
          id: user.userId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          company: user.company,
          jobTitle: user.jobTitle,
          status: user.status
        }
      } : null,
      boardId,
      storageInfo: {
        source: 'mongodb',
        userReferences: true
      }
    })

  } catch (error) {
    console.error('Error updating board member:', error)
    return NextResponse.json({
      error: 'Failed to update board member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 