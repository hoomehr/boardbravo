# BoardBravo Storage Directory

This directory contains all board-specific data including documents, metadata, and chat sessions.

## Directory Structure

```
storage/
├── boards/
│   ├── {board-id}/
│   │   ├── board-data.json          # Main board data file
│   │   ├── documents.json           # Document metadata
│   │   ├── documents/               # Uploaded document files
│   │   │   ├── {timestamp}-{filename}
│   │   │   └── ...
│   │   └── backup-{timestamp}.json  # Automatic backups
│   └── ...
```

## Files

### board-data.json
Contains the complete board workspace data:
- Board metadata (name, created date, settings)
- Board members list
- Chat sessions and messages
- Document references
- Metadata and statistics

### documents.json
Detailed metadata for all uploaded documents:
- File information (name, size, type)
- Upload timestamps and user info
- Extracted text content for AI analysis
- Storage paths and locations

### documents/
Physical storage of uploaded files with timestamp prefixes to ensure uniqueness.

## Security

- All board data is isolated by board ID
- Documents are stored in board-specific directories
- Automatic backups are created on each save
- All sensitive data is excluded from version control

## API Endpoints

- `POST /api/upload` - Upload documents with board context
- `GET/POST /api/boards` - Manage board data
- `GET/PUT /api/boards/[id]` - Access specific board data 