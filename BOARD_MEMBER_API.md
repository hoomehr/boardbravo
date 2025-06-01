# Board Member Management API

This document describes the board member management system with proper JSON structure and admin permissions.

## 📋 Overview

Board members are stored as JSON objects in the board data structure. Only admins can add/remove members, and all operations are properly validated and persisted.

## 🏗️ JSON Structure

### BoardMember Interface
```typescript
interface BoardMember {
  id: string                              // Unique identifier
  name: string                           // Full name
  email: string                          // Email address (unique per board)
  role: 'Admin' | 'Member'              // Role with permissions
  addedAt: Date                          // When member was added
  status: 'active' | 'pending' | 'inactive'  // Member status
}
```

### JSON Storage Format
```json
{
  "board": {
    "id": "board-demo",
    "name": "Board Demo Workspace",
    "createdBy": "user-123",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "lastActivity": "2024-01-15T15:45:00.000Z",
    "settings": {
      "allowMemberInvites": true,
      "requireApproval": false
    }
  },
  "members": [
    {
      "id": "user-123",
      "name": "John Smith",
      "email": "john@company.com",
      "role": "Admin",
      "addedAt": "2024-01-15T10:30:00.000Z",
      "status": "active"
    },
    {
      "id": "user-456",
      "name": "Jane Doe",
      "email": "jane@company.com",
      "role": "Member",
      "addedAt": "2024-01-15T11:15:00.000Z",
      "status": "active"
    }
  ],
  "documents": [],
  "chatSessions": [],
  "savedNotes": [],
  "metadata": {
    "version": "1.0",
    "lastUpdated": "2024-01-15T15:45:00.000Z",
    "membersCount": 2
  }
}
```

## 🚀 API Endpoints

### Base URL
All member operations use the board-specific endpoint:
```
/api/boards/{boardId}/members
```

### 1. GET - Fetch All Members
```http
GET /api/boards/{boardId}/members
```

**Response:**
```json
{
  "success": true,
  "members": [
    {
      "id": "user-123",
      "name": "John Smith",
      "email": "john@company.com",
      "role": "Admin",
      "addedAt": "2024-01-15T10:30:00.000Z",
      "status": "active"
    }
  ],
  "boardId": "board-demo",
  "membersCount": 1
}
```

### 2. POST - Add New Member (Admin Only)
```http
POST /api/boards/{boardId}/members
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@company.com",
  "role": "Member",
  "adminUserId": "user-123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member added successfully",
  "member": {
    "id": "user-456",
    "name": "Jane Doe",
    "email": "jane@company.com",
    "role": "Member",
    "addedAt": "2024-01-15T11:15:00.000Z",
    "status": "active"
  },
  "boardId": "board-demo",
  "totalMembers": 2
}
```

### 3. DELETE - Remove Member (Admin Only)
```http
DELETE /api/boards/{boardId}/members?memberId={memberId}&adminUserId={adminUserId}
```

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully",
  "removedMember": {
    "id": "user-456",
    "name": "Jane Doe",
    "email": "jane@company.com"
  },
  "boardId": "board-demo",
  "totalMembers": 1
}
```

### 4. PUT - Update Member (Admin Only)
```http
PUT /api/boards/{boardId}/members
Content-Type: application/json
```

**Request Body:**
```json
{
  "memberId": "user-456",
  "name": "Jane Smith",
  "email": "jane.smith@company.com",
  "role": "Admin",
  "status": "active",
  "adminUserId": "user-123"
}
```

## 🔐 Security & Permissions

### Admin Requirements
- Only users with `role: "Admin"` can add/remove/update members
- Admins cannot remove themselves from the board
- Admin status is verified on every operation

### Validation Rules
- **Name**: Required, minimum 1 character
- **Email**: Required, valid email format, unique per board
- **Role**: Must be either "Admin" or "Member"
- **Status**: Must be "active", "pending", or "inactive"

### Error Responses
```json
{
  "error": "Unauthorized. Only admins can add members",
  "status": 403
}
```

```json
{
  "error": "A member with this email already exists",
  "status": 409
}
```

## 🛠️ Frontend Integration

### Adding a Member
```typescript
const addMember = async (name: string, email: string, role: string) => {
  const response = await fetch(`/api/boards/${boardId}/members`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      role,
      adminUserId: currentUser.id
    })
  })
  
  const result = await response.json()
  if (response.ok) {
    // Update local state
    setBoardMembers(prev => [...prev, result.member])
  }
}
```

### Removing a Member
```typescript
const removeMember = async (memberId: string) => {
  const response = await fetch(
    `/api/boards/${boardId}/members?memberId=${memberId}&adminUserId=${currentUser.id}`,
    { method: 'DELETE' }
  )
  
  const result = await response.json()
  if (response.ok) {
    // Update local state
    setBoardMembers(prev => prev.filter(m => m.id !== memberId))
  }
}
```

## 📊 Utility Functions

### Board Member Utils
Located in `lib/boardMemberUtils.ts`:

```typescript
import { 
  boardMemberToJSON, 
  boardMemberFromJSON,
  isAdmin,
  getMemberStats,
  validateBoardMember 
} from '@/lib/boardMemberUtils'

// Convert to JSON format
const memberJSON = boardMemberToJSON(member)

// Check admin permissions
const hasPermission = isAdmin(members, userId)

// Get statistics
const stats = getMemberStats(members)
// Returns: { total, admins, members, active, pending, inactive, activePercentage }
```

## 🔄 Data Flow

1. **Frontend Request** → API Endpoint
2. **Admin Validation** → Check user permissions
3. **Data Validation** → Validate input data
4. **JSON Update** → Update board-data.json file
5. **Backup Creation** → Create timestamped backup
6. **Response** → Return updated data to frontend

## 📁 File Structure

```
storage/
└── boards/
    └── {board-id}/
        ├── board-data.json          # Main storage with members array
        └── backup-{timestamp}.json  # Automatic backups
```

## 🎯 Key Features

✅ **JSON Storage**: All data stored in structured JSON format  
✅ **Admin Permissions**: Proper role-based access control  
✅ **Validation**: Email uniqueness and data validation  
✅ **Automatic Backups**: Timestamped backups on every change  
✅ **Type Safety**: Full TypeScript support with interfaces  
✅ **Error Handling**: Comprehensive error responses  
✅ **Real-time Updates**: Frontend state synchronization  

## 🧪 Testing

### Test Member Operations
```bash
# Add member
curl -X POST http://localhost:3000/api/boards/board-demo/members \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","role":"Member","adminUserId":"admin-id"}'

# Get members
curl http://localhost:3000/api/boards/board-demo/members

# Remove member
curl -X DELETE "http://localhost:3000/api/boards/board-demo/members?memberId=user-id&adminUserId=admin-id"
```

---

This system ensures that board members are properly managed with JSON persistence, admin permissions, and full data validation. 🚀 