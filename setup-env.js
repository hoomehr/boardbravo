#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 BoardBravo Environment Setup');
console.log('================================\n');

const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

// Check if .env.local already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env.local already exists');
  
  // Read current config
  const envContent = fs.readFileSync(envPath, 'utf8');
  const hasGeminiKey = envContent.includes('GOOGLE_AI_API_KEY=') && !envContent.includes('GOOGLE_AI_API_KEY=your_google_ai_api_key_here');
  
  console.log('\n📋 Current Configuration:');
  console.log('- AI Provider:', envContent.match(/AI_PROVIDER=(.+)/)?.[1] || 'not set');
  console.log('- Gemini API Key:', hasGeminiKey ? '✅ configured' : '❌ not configured');
  
  if (!hasGeminiKey) {
    console.log('\n⚠️  You need to add your Google AI API key to .env.local');
    console.log('Get your free API key at: https://makersuite.google.com/app/apikey');
    console.log('Then replace "your_google_ai_api_key_here" with your actual key');
  }
} else {
  console.log('❌ .env.local not found');
  
  if (fs.existsSync(envExamplePath)) {
    // Copy env.example to .env.local
    const exampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Update the NEXTAUTH_URL to use port 3001 (since 3000 is often in use)
    const updatedContent = exampleContent.replace(
      'NEXTAUTH_URL=http://localhost:3000',
      'NEXTAUTH_URL=http://localhost:3001'
    );
    
    fs.writeFileSync(envPath, updatedContent);
    console.log('✅ Created .env.local from env.example');
    console.log('\n📋 Next Steps:');
    console.log('1. Get your free Google AI API key at: https://makersuite.google.com/app/apikey');
    console.log('2. Edit .env.local and replace "your_google_ai_api_key_here" with your actual key');
    console.log('3. Restart your development server (npm run dev)');
  } else {
    console.log('❌ env.example not found');
  }
}

console.log('\n🔧 Environment Variable Guide:');
console.log('- GOOGLE_AI_API_KEY: Required for Gemini (free tier)');
console.log('- OPENAI_API_KEY: Optional for GPT-4 (paid)');
console.log('- AI_PROVIDER: Choose "gemini", "openai", or "anthropic"');

console.log('\n💡 Need help? Check the README.md for detailed setup instructions.'); 