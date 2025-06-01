import { NextRequest, NextResponse } from 'next/server'
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

interface BoardMember {
  id: string
  name: string
  email: string
  role: string
  addedAt: Date
  status: 'active' | 'pending' | 'inactive'
}

interface BoardData {
  board: any
  members: BoardMember[]
  documents: any[]
  chatSessions: any[]
  savedNotes?: any[]
  metadata?: any
}

// GET - Fetch all board members
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    if (!existsSync(boardDataPath)) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData: BoardData = JSON.parse(boardDataRaw)

    return NextResponse.json({
      success: true,
      members: boardData.members || [],
      boardId,
      membersCount: boardData.members?.length || 0
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
    const { name, email, role, adminUserId } = await request.json()

    // Validate required fields
    if (!name || !email || !role) {
      return NextResponse.json({
        error: 'Missing required fields: name, email, and role are required'
      }, { status: 400 })
    }

    // Validate role
    if (!['Member', 'Admin'].includes(role)) {
      return NextResponse.json({
        error: 'Invalid role. Must be "Member" or "Admin"'
      }, { status: 400 })
    }

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    if (!existsSync(boardDataPath)) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData: BoardData = JSON.parse(boardDataRaw)

    // Check if requesting user is admin
    const requestingUser = boardData.members?.find(m => m.id === adminUserId)
    if (!requestingUser || requestingUser.role !== 'Admin') {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can add members'
      }, { status: 403 })
    }

    // Check if email already exists
    const existingMember = boardData.members?.find(m => m.email.toLowerCase() === email.toLowerCase())
    if (existingMember) {
      return NextResponse.json({
        error: 'A member with this email already exists'
      }, { status: 409 })
    }

    // Create new member
    const newMember: BoardMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      addedAt: new Date(),
      status: 'active'
    }

    // Add member to board
    const updatedMembers = [...(boardData.members || []), newMember]
    const updatedBoardData: BoardData = {
      ...boardData,
      members: updatedMembers,
      metadata: {
        ...boardData.metadata,
        lastUpdated: new Date().toISOString(),
        membersCount: updatedMembers.length
      }
    }

    // Save updated data
    await writeFile(boardDataPath, JSON.stringify(updatedBoardData, null, 2))

    // Create backup
    const backupPath = path.join(boardDir, `backup-${Date.now()}.json`)
    await writeFile(backupPath, JSON.stringify(updatedBoardData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Member added successfully',
      member: newMember,
      boardId,
      totalMembers: updatedMembers.length
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
    const memberIdToRemove = searchParams.get('memberId')
    const adminUserId = searchParams.get('adminUserId')

    if (!memberIdToRemove || !adminUserId) {
      return NextResponse.json({
        error: 'Missing required parameters: memberId and adminUserId'
      }, { status: 400 })
    }

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    if (!existsSync(boardDataPath)) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData: BoardData = JSON.parse(boardDataRaw)

    // Check if requesting user is admin
    const requestingUser = boardData.members?.find(m => m.id === adminUserId)
    if (!requestingUser || requestingUser.role !== 'Admin') {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can remove members'
      }, { status: 403 })
    }

    // Prevent self-removal
    if (memberIdToRemove === adminUserId) {
      return NextResponse.json({
        error: 'Cannot remove yourself from the board'
      }, { status: 400 })
    }

    // Find and remove member
    const memberToRemove = boardData.members?.find(m => m.id === memberIdToRemove)
    if (!memberToRemove) {
      return NextResponse.json({
        error: 'Member not found',
        memberId: memberIdToRemove
      }, { status: 404 })
    }

    const updatedMembers = boardData.members?.filter(m => m.id !== memberIdToRemove) || []
    const updatedBoardData: BoardData = {
      ...boardData,
      members: updatedMembers,
      metadata: {
        ...boardData.metadata,
        lastUpdated: new Date().toISOString(),
        membersCount: updatedMembers.length
      }
    }

    // Save updated data
    await writeFile(boardDataPath, JSON.stringify(updatedBoardData, null, 2))

    // Create backup
    const backupPath = path.join(boardDir, `backup-${Date.now()}.json`)
    await writeFile(backupPath, JSON.stringify(updatedBoardData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Member removed successfully',
      removedMember: {
        id: memberToRemove.id,
        name: memberToRemove.name,
        email: memberToRemove.email
      },
      boardId,
      totalMembers: updatedMembers.length
    })

  } catch (error) {
    console.error('Error removing board member:', error)
    return NextResponse.json({
      error: 'Failed to remove board member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update a board member (Admin only)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const boardId = params.id
    const { memberId, name, email, role, status, adminUserId } = await request.json()

    if (!memberId || !adminUserId) {
      return NextResponse.json({
        error: 'Missing required fields: memberId and adminUserId'
      }, { status: 400 })
    }

    const storageDir = path.join(process.cwd(), 'storage')
    const boardDir = path.join(storageDir, 'boards', boardId)
    const boardDataPath = path.join(boardDir, 'board-data.json')

    if (!existsSync(boardDataPath)) {
      return NextResponse.json({
        error: 'Board not found',
        boardId
      }, { status: 404 })
    }

    const boardDataRaw = await readFile(boardDataPath, 'utf8')
    const boardData: BoardData = JSON.parse(boardDataRaw)

    // Check if requesting user is admin
    const requestingUser = boardData.members?.find(m => m.id === adminUserId)
    if (!requestingUser || requestingUser.role !== 'Admin') {
      return NextResponse.json({
        error: 'Unauthorized. Only admins can update members'
      }, { status: 403 })
    }

    // Find member to update
    const memberIndex = boardData.members?.findIndex(m => m.id === memberId) ?? -1
    if (memberIndex === -1) {
      return NextResponse.json({
        error: 'Member not found',
        memberId
      }, { status: 404 })
    }

    const currentMember = boardData.members![memberIndex]
    
    // Update member with provided fields
    const updatedMember: BoardMember = {
      ...currentMember,
      ...(name && { name: name.trim() }),
      ...(email && { email: email.toLowerCase().trim() }),
      ...(role && ['Member', 'Admin'].includes(role) && { role }),
      ...(status && ['active', 'pending', 'inactive'].includes(status) && { status })
    }

    // Update members array
    const updatedMembers = [...boardData.members!]
    updatedMembers[memberIndex] = updatedMember

    const updatedBoardData: BoardData = {
      ...boardData,
      members: updatedMembers,
      metadata: {
        ...boardData.metadata,
        lastUpdated: new Date().toISOString()
      }
    }

    // Save updated data
    await writeFile(boardDataPath, JSON.stringify(updatedBoardData, null, 2))

    return NextResponse.json({
      success: true,
      message: 'Member updated successfully',
      member: updatedMember,
      boardId
    })

  } catch (error) {
    console.error('Error updating board member:', error)
    return NextResponse.json({
      error: 'Failed to update board member',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 