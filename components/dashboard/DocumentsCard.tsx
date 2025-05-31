'use client'

import { useState } from 'react'
import { FileText, Upload, Trash2, CheckCircle, AlertCircle, Loader } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Document {
  id: string
  name: string
  type: string
  size: number
  uploadedAt: Date
  status: 'processing' | 'ready' | 'error'
  extractedText?: string
}

interface DocumentsCardProps {
  documents: Document[]
  isUploading: boolean
  onFileUpload: () => void
  onRemoveDocument: (documentId: string) => void
}

export default function DocumentsCard({
  documents,
  isUploading,
  onFileUpload,
  onRemoveDocument
}: DocumentsCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold text-gray-900">Documents</h2>
        <div className="flex items-center space-x-2">
          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
            {documents.length} files
          </span>
          <button
            onClick={onFileUpload}
            disabled={isUploading}
            className="p-1 text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
            title="Upload documents"
          >
            <Upload className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto">
        {documents.map((doc) => (
          <div key={doc.id} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
            <div className="flex-shrink-0">
              {doc.status === 'ready' && <CheckCircle className="w-4 h-4 text-green-500" />}
              {doc.status === 'processing' && <Loader className="w-4 h-4 text-blue-500 animate-spin" />}
              {doc.status === 'error' && <AlertCircle className="w-4 h-4 text-red-500" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{doc.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className="text-xs text-gray-500">
                  {(doc.size / 1024 / 1024).toFixed(1)} MB
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs text-gray-500">
                  {formatDistanceToNow(doc.uploadedAt, { addSuffix: true })}
                </span>
              </div>
            </div>
            
            <button
              onClick={() => onRemoveDocument(doc.id)}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Remove document"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {documents.length === 0 && (
        <div className="text-center py-6">
          <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500 text-xs">No documents uploaded</p>
          <p className="text-gray-400 text-xs mt-1">Upload Excel, PDF, or PowerPoint files</p>
        </div>
      )}

      {isUploading && (
        <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center space-x-2">
            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
            <span className="text-xs text-blue-700">Uploading documents...</span>
          </div>
        </div>
      )}
    </div>
  )
} 