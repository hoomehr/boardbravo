#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔧 BoardBravo OAuth Configuration Fixer\n')

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local')
const envExamplePath = path.join(process.cwd(), 'env.example')

if (!fs.existsSync(envPath)) {
  console.log('❌ .env.local file not found!')
  
  if (fs.existsSync(envExamplePath)) {
    console.log('📄 Copying env.example to .env.local...')
    
    let envContent = fs.readFileSync(envExamplePath, 'utf8')
    
    // Update the port to current port (3000)
    envContent = envContent.replace(
      'NEXTAUTH_URL=http://localhost:3001',
      'NEXTAUTH_URL=http://localhost:3000'
    )
    
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env.local with correct port (3000)')
  } else {
    console.log('❌ env.example not found. Creating basic .env.local...')
    
    const basicEnv = `# Google OAuth (REQUIRED - Replace with your actual values)
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
NEXTAUTH_URL=http://localhost:3004

# Google AI API (Replace with your actual key)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
AI_PROVIDER=gemini

# Development Settings
NODE_ENV=development
`
    
    fs.writeFileSync(envPath, basicEnv)
    console.log('✅ Created basic .env.local file')
  }
} else {
  console.log('✅ .env.local file exists')
  
  // Check if port needs updating
  let envContent = fs.readFileSync(envPath, 'utf8')
  
  if (envContent.includes('localhost:3001') && !envContent.includes('localhost:3004')) {
    console.log('🔧 Updating port from 3001 to 3004...')
    envContent = envContent.replace(/localhost:3001/g, 'localhost:3004')
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Updated NEXTAUTH_URL to use port 3004')
  }
}

console.log('\n📋 Next Steps:')
console.log('1. Edit .env.local and add your actual Google OAuth credentials')
console.log('2. Visit http://localhost:3000/api/debug-oauth to check configuration')
console.log('3. Update Google Cloud Console redirect URIs to use port 3000')
console.log('4. Restart your development server\n')

console.log('📚 For detailed setup instructions, see OAUTH_SETUP.md') 