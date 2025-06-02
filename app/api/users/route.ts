import { NextRequest, NextResponse } from 'next/server'
import { DatabaseService } from '@/lib/database-service'
import { UserDocument } from '@/lib/models'

// GET - Get user by ID or search users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const email = searchParams.get('email')
    const query = searchParams.get('query')
    const limit = parseInt(searchParams.get('limit') || '10')

    if (userId) {
      // Get specific user by ID
      const user = await DatabaseService.getUserById(userId)
      if (!user) {
        return NextResponse.json({
          error: 'User not found',
          userId
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          bio: user.bio,
          phone: user.phone,
          company: user.company,
          department: user.department,
          jobTitle: user.jobTitle,
          location: user.location,
          timezone: user.timezone,
          preferences: user.preferences,
          socialLinks: user.socialLinks,
          skills: user.skills,
          status: user.status,
          lastLoginAt: user.lastLoginAt,
          emailVerified: user.emailVerified,
          onboardingCompleted: user.onboardingCompleted,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      })
    }

    if (email) {
      // Get specific user by email
      const user = await DatabaseService.getUserByEmail(email)
      if (!user) {
        return NextResponse.json({
          error: 'User not found',
          email
        }, { status: 404 })
      }

      return NextResponse.json({
        success: true,
        user: {
          id: user.userId,
          email: user.email,
          name: user.name,
          status: user.status,
          emailVerified: user.emailVerified
        }
      })
    }

    if (query) {
      // Search users
      const users = await DatabaseService.searchUsers(query, limit)
      return NextResponse.json({
        success: true,
        users: users.map(user => ({
          id: user.userId,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          company: user.company,
          jobTitle: user.jobTitle,
          status: user.status
        })),
        count: users.length
      })
    }

    return NextResponse.json({
      error: 'Missing required parameter: userId, email, or query'
    }, { status: 400 })

  } catch (error) {
    console.error('Error fetching user(s):', error)
    return NextResponse.json({
      error: 'Failed to fetch user(s)',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST - Create a new user
export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    // Validate required fields
    if (!userData.name || !userData.email) {
      return NextResponse.json({
        error: 'Missing required fields: name and email are required'
      }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return NextResponse.json({
        error: 'Invalid email format'
      }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await DatabaseService.getUserByEmail(userData.email)
    if (existingUser) {
      return NextResponse.json({
        error: 'A user with this email already exists'
      }, { status: 409 })
    }

    // Create user
    const newUser = await DatabaseService.createUserFromBasicInfo(
      userData.name,
      userData.email,
      userData.userId
    )

    // Update with additional provided data
    if (userData.avatar || userData.bio || userData.company || userData.jobTitle || userData.phone) {
      const updates: Partial<UserDocument> = {}
      if (userData.avatar) updates.avatar = userData.avatar
      if (userData.bio) updates.bio = userData.bio
      if (userData.phone) updates.phone = userData.phone
      if (userData.company) updates.company = userData.company
      if (userData.department) updates.department = userData.department
      if (userData.jobTitle) updates.jobTitle = userData.jobTitle
      if (userData.location) updates.location = userData.location
      if (userData.timezone) updates.timezone = userData.timezone
      if (userData.skills) updates.skills = userData.skills
      if (userData.socialLinks) updates.socialLinks = userData.socialLinks

      await DatabaseService.updateUser(newUser.userId, updates)
    }

    // Get the updated user
    const updatedUser = await DatabaseService.getUserById(newUser.userId)

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      user: {
        id: updatedUser!.userId,
        email: updatedUser!.email,
        name: updatedUser!.name,
        avatar: updatedUser!.avatar,
        company: updatedUser!.company,
        jobTitle: updatedUser!.jobTitle,
        status: updatedUser!.status,
        emailVerified: updatedUser!.emailVerified,
        onboardingCompleted: updatedUser!.onboardingCompleted,
        createdAt: updatedUser!.createdAt
      }
    })

  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json({
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing required parameter: userId'
      }, { status: 400 })
    }

    const updates = await request.json()

    // Check if user exists
    const existingUser = await DatabaseService.getUserById(userId)
    if (!existingUser) {
      return NextResponse.json({
        error: 'User not found',
        userId
      }, { status: 404 })
    }

    // Validate email if being updated
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json({
          error: 'Invalid email format'
        }, { status: 400 })
      }

      // Check if email is already taken by another user
      const userWithEmail = await DatabaseService.getUserByEmail(updates.email)
      if (userWithEmail && userWithEmail.userId !== userId) {
        return NextResponse.json({
          error: 'Email is already taken by another user'
        }, { status: 409 })
      }
    }

    // Validate status if being updated
    if (updates.status && !['active', 'inactive', 'pending'].includes(updates.status)) {
      return NextResponse.json({
        error: 'Invalid status. Must be "active", "inactive", or "pending"'
      }, { status: 400 })
    }

    // Update user
    const success = await DatabaseService.updateUser(userId, updates)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to update user'
      }, { status: 500 })
    }

    // Get updated user data
    const updatedUser = await DatabaseService.getUserById(userId)

    return NextResponse.json({
      success: true,
      message: 'User updated successfully',
      user: {
        id: updatedUser!.userId,
        email: updatedUser!.email,
        name: updatedUser!.name,
        avatar: updatedUser!.avatar,
        bio: updatedUser!.bio,
        phone: updatedUser!.phone,
        company: updatedUser!.company,
        department: updatedUser!.department,
        jobTitle: updatedUser!.jobTitle,
        location: updatedUser!.location,
        timezone: updatedUser!.timezone,
        preferences: updatedUser!.preferences,
        socialLinks: updatedUser!.socialLinks,
        skills: updatedUser!.skills,
        status: updatedUser!.status,
        lastLoginAt: updatedUser!.lastLoginAt,
        emailVerified: updatedUser!.emailVerified,
        onboardingCompleted: updatedUser!.onboardingCompleted,
        updatedAt: updatedUser!.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json({
      error: 'Failed to update user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({
        error: 'Missing required parameter: userId'
      }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await DatabaseService.getUserById(userId)
    if (!existingUser) {
      return NextResponse.json({
        error: 'User not found',
        userId
      }, { status: 404 })
    }

    // TODO: Check if user is referenced in any boards and handle appropriately
    // For now, we'll just delete the user
    const success = await DatabaseService.deleteUser(userId)
    
    if (!success) {
      return NextResponse.json({
        error: 'Failed to delete user'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser.userId,
        email: existingUser.email,
        name: existingUser.name
      }
    })

  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json({
      error: 'Failed to delete user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 