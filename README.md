# 🧠 BoardBravo - AI-Powered Board Document Assistant

BoardBravo is an intelligent document analysis platform designed specifically for board meetings and corporate governance. Upload your board materials and get instant AI-powered insights, summaries, and **interactive visualizations** using Google's latest Gemini 2.0 Flash-Lite AI (free tier supported).

## ✨ Features

### 📄 Document Ingestion
- **Smart Upload**: Drag & drop support for PDFs, Excel files, PowerPoint presentations, and CSV files
- **Real-time Processing**: Automatic text extraction and content analysis
- **Google Drive Integration**: OAuth-based connection to access board packs and meeting materials
- **Multiple File Formats**: Support for .pdf, .xlsx, .xls, .csv, .pptx, .ppt

### 🤖 AI Assistant (Multi-Provider Support)
- **Google Gemini 2.0 Flash-Lite**: Latest cost-efficient model (primary, free tier)
- **OpenAI GPT-4**: Premium alternative for enhanced analysis
- **Anthropic Claude**: Ready for integration (coming soon)
- **Smart Provider Switching**: Automatic fallback and configuration detection

### 📊 **NEW: Interactive Charts & Visualizations**
- **Dynamic Chart Generation**: Bar charts, line graphs, pie charts, and area charts
- **Financial Dashboards**: Revenue trends, expense analysis, and KPI tracking
- **Risk Visualization**: Risk distribution, threat analysis, and mitigation tracking
- **Performance Metrics**: Interactive summary cards with key insights
- **Real-time Data**: Charts generated from document analysis and AI insights

### 🎯 Sample Queries with Visual Outputs
- **"Show me a revenue chart"** → Bar chart with quarterly revenue growth + financial summary
- **"Analyze our risk distribution"** → Pie chart with risk categories + risk assessment metrics
- **"Create a performance dashboard"** → Multiple charts with KPI trends + summary cards
- **"Generate financial summary"** → Comprehensive metrics dashboard with insights

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Google AI API key (free tier available)

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

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```

4. **Configure your AI provider** (choose one or more):

   **Option A: Google Gemini (Recommended - Free Tier)**
   ```bash
   # Get your free API key from https://makersuite.google.com/app/apikey
   AI_PROVIDER=gemini
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   ```

   **Option B: OpenAI GPT-4**
   ```bash
   AI_PROVIDER=openai
   OPENAI_API_KEY=your_openai_api_key_here
   ```

   **Option C: Multiple Providers**
   ```bash
   AI_PROVIDER=gemini
   GOOGLE_AI_API_KEY=your_google_ai_api_key_here
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📊 Chart & Visualization Features

### Supported Chart Types
- **Bar Charts**: Revenue analysis, expense tracking, comparative metrics
- **Line Charts**: Trend analysis, performance over time, growth tracking
- **Pie Charts**: Risk distribution, market share, category breakdowns
- **Area Charts**: Cumulative data, volume analysis, stacked metrics

### Interactive Summary Cards
- **Key Metrics**: Revenue, users, market share, burn rate, compliance scores
- **Trend Indicators**: Positive/negative changes with visual indicators
- **Insights Panel**: AI-generated key takeaways and recommendations
- **Icon-based Categories**: Visual categorization for quick recognition

### Sample Visualizations
Try these queries to see the chart functionality in action:

```
"Create a revenue chart from the financial data"
"Show me risk analysis with charts"
"Generate a performance dashboard"
"Display key metrics summary"
"Analyze trends with visualizations"
```

## 🎯 Use Cases

### Board Meeting Preparation
- **Document Summarization**: Quick overviews of lengthy board packs
- **Financial Analysis**: Revenue trends, expense analysis, budget variance
- **Risk Assessment**: Visual risk matrices and mitigation strategies
- **Performance Dashboards**: KPI tracking with interactive charts

### Investment Analysis
- **Pitch Deck Analysis**: Key metrics extraction and visualization
- **Market Analysis**: Competitive landscape and opportunity sizing
- **Financial Projections**: Revenue forecasts and growth charts
- **Due Diligence**: Risk assessment with visual breakdowns

### Governance & Compliance
- **Regulatory Compliance**: Tracking and reporting with metrics
- **Policy Analysis**: Impact assessment and implementation tracking
- **Audit Preparation**: Document organization and key findings visualization
- **Strategic Planning**: Goal tracking and progress visualization

## 🔧 AI Provider Configuration

### Google Gemini (Free Tier)
- **Cost**: Free up to generous limits
- **Performance**: Fast and accurate for most use cases
- **Setup**: Get API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### OpenAI GPT-4
- **Cost**: Pay-per-use pricing
- **Performance**: Premium analysis capabilities
- **Setup**: Get API key from [OpenAI Platform](https://platform.openai.com/api-keys)

### Provider Switching
Change providers by updating the `AI_PROVIDER` environment variable:
```bash
AI_PROVIDER=gemini  # or openai, anthropic
```

## 🛠️ Technical Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **UI Components**: Radix UI, Tailwind CSS, Framer Motion
- **Charts**: Recharts, Chart.js for interactive visualizations
- **AI Integration**: Google Gemini Pro, OpenAI GPT-4, Anthropic Claude
- **Document Processing**: pdf-parse, xlsx, react-dropzone
- **Backend**: Next.js API routes with multi-provider support

## 📈 Performance & Scaling

- **Fast Response Times**: Optimized AI provider selection
- **Efficient Processing**: Streaming document analysis
- **Scalable Architecture**: Multi-provider support with fallbacks
- **Cost Optimization**: Free tier prioritization with premium options

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Docker
```bash
docker build -t boardbravo .
docker run -p 3000:3000 boardbravo
```

### Environment Variables for Production
Ensure these are set in your deployment environment:
- `AI_PROVIDER`
- `GOOGLE_AI_API_KEY` (for Gemini)
- `OPENAI_API_KEY` (for OpenAI)
- `NEXTAUTH_SECRET` (for authentication)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check our [Wiki](https://github.com/yourusername/boardbravo/wiki)
- **Issues**: Report bugs on [GitHub Issues](https://github.com/yourusername/boardbravo/issues)
- **Discussions**: Join our [GitHub Discussions](https://github.com/yourusername/boardbravo/discussions)

---

**Built with ❤️ for better board governance and decision-making** 