# 🧠 BoardBravo - AI-Powered Board Document Assistant

BoardBravo is an intelligent document analysis platform designed specifically for board members, investors, and executives. It combines multi-provider AI capabilities with extensive data source integrations to provide comprehensive board document analysis and investment insights.

## 🎯 Key Features

### 📊 Investor-Focused AI Assistant
- **Executive Briefs**: Concise 2-3 sentence summaries leading with financial impact
- **Key Insights**: Structured bullet points highlighting risks, opportunities, and strategic decisions  
- **Investment Analysis**: Focus on valuation impact, competitive positioning, and governance
- **Interactive Charts**: Automatic generation of financial performance, risk assessment, and growth trend visualizations
- **Action Items**: Clear recommendations for board and investment decisions

### 🔗 Data Source Integrations
- **Gmail Integration**: Automatic extraction and analysis of email attachments and board communications
- **Google Drive**: Direct access to board folders, meeting minutes, and financial documents
- **HubSpot CRM**: Sales pipeline analysis and customer data integration
- **MCP Server**: Model Context Protocol server connectivity for advanced AI workflows

### 🤖 Multi-Provider AI Support
- **Google Gemini 2.0**: Primary free-tier AI provider with advanced reasoning
- **OpenAI GPT**: Optional premium AI provider for enhanced capabilities
- **Anthropic Claude**: Available for specialized analysis workflows

### 📈 Advanced Analytics
- Real-time chart generation (bar, line, pie, area charts)
- Executive dashboard with KPI tracking
- Risk assessment visualizations
- Growth metrics and trend analysis

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google AI API key (free tier available)
- Google OAuth credentials (for Gmail/Drive integration)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/boardbravo.git
   cd boardbravo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp env.example .env.local
   ```

Edit `.env.local` with your API keys:
```env
# AI Provider Configuration
AI_PROVIDER=gemini
GOOGLE_AI_API_KEY=your_google_ai_api_key_here

# Google OAuth Integration (for Gmail and Google Drive)
GOOGLE_CLIENT_ID=your_google_oauth_client_id_here
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret_here
NEXTAUTH_URL=http://localhost:3001
```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open BoardBravo**
   Navigate to [http://localhost:3001](http://localhost:3001)

## 🔧 Configuration

### AI Provider Setup

#### Google Gemini (Recommended)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GOOGLE_AI_API_KEY`

#### Optional Providers
- **OpenAI**: Add `OPENAI_API_KEY` for GPT models
- **Anthropic**: Add `ANTHROPIC_API_KEY` for Claude models

### Integration Setup

#### Gmail Integration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Gmail API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3001/api/integrations/gmail/callback`
6. Add client credentials to `.env.local`

#### Google Drive Integration
1. In the same Google Cloud project
2. Enable Google Drive API
3. Use the same OAuth credentials
4. Add redirect URI: `http://localhost:3001/api/integrations/google-drive/callback`

#### HubSpot CRM Integration
1. Create HubSpot developer account
2. Register your app
3. Add OAuth credentials to `.env.local`

## 💼 Investor-Focused Features

### AI Response Structure
Every AI response follows this investor-optimized format:

1. **Executive Brief** - Immediate financial and strategic impact
2. **Key Insights** - Material information affecting valuation
3. **Detailed Analysis** - Structured sections with quantified metrics
4. **Charts/Visuals** - Automatic generation for financial data
5. **Action Items** - Specific recommendations for board decisions

### Sample Queries for Investors
- "Summarize the Q4 financial performance and growth trajectory"
- "What are the top 3 risks identified in the board materials?"
- "Show me revenue trends and compare to industry benchmarks"
- "Analyze the competitive positioning from the strategy deck"
- "Extract key metrics for the investor update"

### Chart Generation
BoardBravo automatically creates charts for:
- Revenue and financial performance trends
- Risk assessment distributions  
- Growth metrics and KPI dashboards
- Market opportunity analysis
- Operational performance indicators

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API routes, Node.js
- **AI Integration**: Google Generative AI SDK, OpenAI SDK
- **Visualizations**: Recharts, Chart.js
- **Authentication**: OAuth 2.0 (Google, HubSpot)
- **Document Processing**: PDF-parse, XLSX

### Project Structure
```
boardbravo/
├── app/
│   ├── dashboard/           # Main dashboard interface
│   │   ├── chat/           # AI chat endpoint
│   │   ├── upload/         # Document upload handling
│   │   └── integrations/   # OAuth and data source APIs
├── components/
│   ├── charts/             # Chart rendering components
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── ai-service.ts       # Multi-provider AI abstraction
│   └── sample-data.ts      # Demo data for testing
└── public/                 # Static assets
```

## 🔐 Security & Privacy

- **OAuth 2.0**: Secure authentication with Google and HubSpot
- **API Key Protection**: Server-side API key management
- **Data Encryption**: All document uploads encrypted in transit
- **Token Storage**: Secure token management for integrations
- **CORS Protection**: Restricted API access to authorized domains

## 🚀 Deployment

### Production Setup
1. **Deploy to Vercel/Netlify**
```bash
npm run build
```

2. **Configure production environment variables**
- Update `NEXTAUTH_URL` to your production domain
- Add all OAuth redirect URIs to your provider settings

3. **Update OAuth Settings**
- Add production callback URLs to Google Cloud Console
- Update HubSpot app settings with production URLs

## 📊 Usage Examples

### Document Analysis
1. Upload board documents via drag-and-drop
2. Connect Gmail for automatic email attachment processing
3. Sync Google Drive folders containing board materials
4. Ask investor-focused questions about the documents

### Sample Investor Queries
```
"Create an executive summary of our Q4 performance"
→ Returns: Brief, key insights, revenue charts, action items

"What risks should the board be aware of?"
→ Returns: Risk analysis, assessment charts, mitigation recommendations

"Show me our growth trajectory and market position"
→ Returns: Growth metrics, trend charts, competitive analysis
```

### Integration Workflows
1. **Gmail**: Automatically processes board emails with attachments
2. **Google Drive**: Syncs specific folders (Board Meetings, Financial Reports)
3. **HubSpot**: Integrates sales data for board reporting
4. **MCP Server**: Advanced AI workflows for complex analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the [Issues](https://github.com/your-repo/boardbravo/issues) page
- Review the configuration documentation
- Ensure all API keys are properly configured

---

**BoardBravo** - Empowering better board decisions through AI-driven document analysis. 