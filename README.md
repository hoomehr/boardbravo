# 🧠 BoardBravo - AI-Powered Board Document Assistant

BoardBravo is an intelligent document analysis platform designed specifically for board meetings and corporate governance. Upload your board materials and get instant AI-powered insights, summaries, and analysis using Google's Gemini AI (free tier supported).

## ✨ Features

### 📄 Document Ingestion
- **Smart Upload**: Drag & drop support for PDFs, Excel files, PowerPoint presentations, and CSV files
- **Real-time Processing**: Automatic text extraction and content analysis
- **Google Drive Integration**: OAuth-based connection to access board packs and meeting materials
- **Multiple File Formats**: Support for .pdf, .xlsx, .xls, .csv, .pptx, .ppt

### 🤖 AI Assistant (Multi-Provider Support)
- **Google Gemini**: Free tier API support as primary provider
- **OpenAI GPT**: Optional premium provider support
- **Anthropic Claude**: Ready for future integration
- **Intelligent Analysis**: Specialized prompts for board governance
- **Natural Language Q&A**: Ask questions about your documents in plain English
- **Contextual Responses**: AI understands document content and provides relevant insights

### 💼 Sample Use Cases
- "Summarize the latest board deck"
- "What are the top 3 risks mentioned in this quarter's report?"
- "Give me financial trend highlights from the last 3 board meetings"
- "Prepare a summary of this investment pitch with pros and cons"
- "Extract all action items from the meeting minutes"
- "What are the key strategic initiatives mentioned?"

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API key (free tier available)
- Optional: OpenAI API key, Google Drive API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd boardbravo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   # Primary AI Provider (Gemini - Free Tier)
   AI_PROVIDER=gemini
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   
   # Optional - Additional AI Providers
   OPENAI_API_KEY=your_openai_api_key_here
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   
   # Optional - Google Drive integration
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. **Get your Google AI API key (Free)**
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy it to your `.env.local` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **UI Components**: Radix UI primitives with custom design system
- **Animations**: Framer Motion for smooth interactions
- **AI Providers**: 
  - Google Gemini Pro (Primary - Free tier)
  - OpenAI GPT-4 (Optional)
  - Anthropic Claude (Ready for integration)
- **Document Processing**: pdf-parse, xlsx for text extraction
- **File Upload**: react-dropzone with real-time processing
- **Google Integration**: Google APIs for Drive access

## 📁 Project Structure

```
boardbravo/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── chat/          # Multi-provider AI chat endpoint
│   │   ├── upload/        # Document upload & processing
│   │   └── google-drive/  # Google Drive integration
│   ├── dashboard/         # Main application interface
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Landing page
│   └── globals.css        # Design system
├── components/ui/         # Reusable UI components
├── lib/
│   ├── ai-service.ts     # Multi-provider AI abstraction
│   └── utils.ts          # Utility functions
├── uploads/              # Document storage (auto-created)
└── README.md             # This file
```

## 🔧 Configuration

### AI Provider Setup

#### Google Gemini (Recommended - Free)
1. Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Set `AI_PROVIDER=gemini` in `.env.local`
3. Add `GOOGLE_AI_API_KEY=your_key` to `.env.local`

#### OpenAI (Optional - Paid)
1. Get API key from [OpenAI Platform](https://platform.openai.com)
2. Set `AI_PROVIDER=openai` in `.env.local`
3. Add `OPENAI_API_KEY=your_key` to `.env.local`

#### Anthropic (Future Support)
1. Get API key from [Anthropic Console](https://console.anthropic.com)
2. Set `AI_PROVIDER=anthropic` in `.env.local`
3. Add `ANTHROPIC_API_KEY=your_key` to `.env.local`

### Provider Switching
Change the `AI_PROVIDER` environment variable to switch between providers:
- `gemini` - Google Gemini Pro (Free tier)
- `openai` - OpenAI GPT-4 (Paid)
- `anthropic` - Anthropic Claude (Paid)

### Google Drive Integration (Optional)
1. Create a project in [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Google Drive API
3. Create OAuth 2.0 credentials
4. Add the credentials to your `.env.local` file

## 📋 API Endpoints

### AI Chat
```http
GET /api/chat
# Check AI provider status and available providers

POST /api/chat
Content-Type: application/json

{
  "message": "Summarize the board deck",
  "documents": [/* array of uploaded documents */]
}
```

### Document Upload
```http
POST /api/upload
Content-Type: multipart/form-data

# Upload and process document files
```

### Google Drive Integration
```http
GET /api/google-drive?access_token=token
# List board-related documents

POST /api/google-drive
Content-Type: application/json

{
  "fileId": "google_drive_file_id",
  "accessToken": "user_access_token"
}
```

## ⚡ Features in Action

### Real-time Document Processing
- Upload files via drag & drop
- Watch processing status in real-time
- Automatic text extraction from PDFs and Excel files
- Error handling with retry mechanisms

### Intelligent Chat Interface
- Context-aware AI responses
- Provider status indicators
- Real-time typing indicators
- Message history with timestamps

### Multi-Provider AI Support
- Seamless switching between AI providers
- Provider status monitoring
- Fallback handling for API errors
- Cost optimization recommendations

## 🎨 Design System

BoardBravo uses a modern design system built with:
- **Color Palette**: Blue and purple gradients with semantic tokens
- **Typography**: Inter font family optimized for readability
- **Components**: Consistent spacing, border radius, and interactions
- **Responsive**: Mobile-first design that adapts to all screen sizes
- **Accessibility**: WCAG compliant with keyboard navigation support

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
Set all required environment variables in your production environment:
- `GOOGLE_AI_API_KEY` (required for Gemini)
- `AI_PROVIDER` (defaults to 'gemini')
- Additional provider keys as needed

### Deployment Platforms
- **Vercel**: Recommended for Next.js applications
- **Netlify**: Alternative with serverless functions
- **Docker**: Container support available
- **AWS/GCP/Azure**: Enterprise deployment options

## 💡 Tips for Best Results

1. **Use Gemini for Cost-Effective Analysis**: The free tier provides excellent results for most board document analysis tasks
2. **Upload Clear Documents**: Better document quality leads to better AI analysis
3. **Be Specific in Queries**: Ask targeted questions for more precise responses
4. **Organize Documents**: Group related documents for better context
5. **Regular API Key Rotation**: Keep your API keys secure and rotate them regularly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly with multiple AI providers
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For support, please:
- Check the AI provider status in the dashboard
- Verify your API keys are correctly configured
- Review the console for detailed error messages
- Contact the development team for advanced issues

---

**BoardBravo** - Transforming board meetings with multi-provider AI intelligence, starting with Google Gemini's free tier. 