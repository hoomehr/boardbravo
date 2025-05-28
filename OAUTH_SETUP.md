# OAuth Setup Guide for BoardBravo Integrations

This guide will help you set up Google OAuth for Gmail and Google Drive integrations in BoardBravo.

## 🚨 CRITICAL: Fix "Error 401: invalid_client"

If you're seeing **"Error 401: invalid_client"**, this means Google cannot authenticate your OAuth credentials. Here's how to fix it:

### Quick Debug Steps

1. **Check Debug Endpoint**: Visit `http://localhost:3004/api/debug-oauth` to see detailed configuration status
2. **Verify Environment Variables**: Make sure your `.env.local` file exists and has correct values
3. **Check Port Numbers**: Your app is running on port 3004, update `NEXTAUTH_URL=http://localhost:3004`

### Most Common Causes & Fixes

#### ❌ **Issue 1: Wrong or Missing Client ID**
```bash
# Your GOOGLE_CLIENT_ID should end with .apps.googleusercontent.com
# ✅ Correct: 1234567890-abc123def456.apps.googleusercontent.com
# ❌ Wrong: abc123def456 (incomplete)
```

#### ❌ **Issue 2: Port Mismatch**
```bash
# Your app is running on localhost:3004, but NEXTAUTH_URL is wrong
# ✅ Correct: NEXTAUTH_URL=http://localhost:3004
# ❌ Wrong: NEXTAUTH_URL=http://localhost:3001
```

#### ❌ **Issue 3: Redirect URI Mismatch**
In Google Cloud Console, make sure you have these exact URIs:
```
http://localhost:3004/api/integrations/gmail/callback
http://localhost:3004/api/integrations/google-drive/callback
```

### Step-by-Step Fix

1. **Create/Update `.env.local`** in your project root:
```env
# Google OAuth (REQUIRED)
GOOGLE_CLIENT_ID=your_actual_client_id_here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
NEXTAUTH_URL=http://localhost:3004

# Google AI API
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
AI_PROVIDER=gemini
```

2. **Update Google Cloud Console**:
   - Go to APIs & Services > Credentials
   - Edit your OAuth 2.0 Client ID
   - Under "Authorized redirect URIs", add:
     - `http://localhost:3004/api/integrations/gmail/callback`
     - `http://localhost:3004/api/integrations/google-drive/callback`
   - Remove old localhost:3001 entries

3. **Restart your app**:
```bash
# Stop current process (Ctrl+C) then:
npm run dev
```

---

## The "GeneralOAuthFlow" Error

The error you're seeing typically occurs when:
1. OAuth credentials are not properly configured
2. Redirect URIs don't match between Google Cloud Console and your app
3. Required APIs are not enabled in Google Cloud Console

## Step-by-Step Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Note your project ID

### 2. Enable Required APIs

In your Google Cloud Console:

1. **Enable Gmail API**:
   - Go to APIs & Services > Library
   - Search for "Gmail API"
   - Click "Enable"

2. **Enable Google Drive API**:
   - Search for "Google Drive API" 
   - Click "Enable"

### 3. Configure OAuth Consent Screen

1. Go to APIs & Services > OAuth consent screen
2. Choose "External" for user type (unless you have Google Workspace)
3. Fill in required fields:
   - App name: "BoardBravo"
   - User support email: Your email
   - Developer contact: Your email
4. **Add Scopes** (Important!):
   - Click "Add or Remove Scopes"
   - Add these scopes:
     - `https://www.googleapis.com/auth/gmail.readonly`
     - `https://www.googleapis.com/auth/gmail.compose`  
     - `https://www.googleapis.com/auth/drive.readonly`
     - `https://www.googleapis.com/auth/drive.file`
5. **Add Test Users** (for development):
   - Add your Google account email as a test user

### 4. Create OAuth 2.0 Credentials

1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Choose "Web application"
4. Name it "BoardBravo Web Client"
5. **Add Authorized Redirect URIs** (Critical!):
   ```
   http://localhost:3001/api/integrations/gmail/callback
   http://localhost:3001/api/integrations/google-drive/callback
   ```
   
   For production, also add:
   ```
   https://yourdomain.com/api/integrations/gmail/callback
   https://yourdomain.com/api/integrations/google-drive/callback
   ```

6. Click "Create"
7. **Save the Client ID and Client Secret**

### 5. Update Environment Variables

Update your `.env.local` file:

```env
# Google OAuth Integration (REQUIRED for Gmail and Google Drive)
GOOGLE_CLIENT_ID=your_actual_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_client_secret_here
NEXTAUTH_URL=http://localhost:3001

# Google AI API (for Gemini)
GOOGLE_AI_API_KEY=your_google_ai_api_key_here
AI_PROVIDER=gemini
```

### 6. Restart Your Application

```bash
npm run dev
```

## Testing the Integration

1. Open BoardBravo at http://localhost:3001/dashboard
2. Click the "Integrations" button in the header
3. Try connecting Gmail or Google Drive
4. You should see a Google OAuth consent screen
5. Grant the requested permissions
6. You should be redirected back to the dashboard with a success message

## Common Issues and Solutions

### Issue: "Error 400: redirect_uri_mismatch"
**Solution**: Make sure the redirect URIs in Google Cloud Console exactly match:
- `http://localhost:3001/api/integrations/gmail/callback`
- `http://localhost:3001/api/integrations/google-drive/callback`

### Issue: "Access blocked: This app's request is invalid"
**Solution**: 
1. Make sure you've added the correct scopes in OAuth consent screen
2. Add your email as a test user
3. Verify APIs are enabled

### Issue: "Error 403: access_denied"
**Solution**: 
1. Check that your app is not restricted to internal users only
2. Verify you've granted all requested permissions
3. Make sure you're signed in with a test user account

### Issue: Environment variables not loaded
**Solution**:
1. Restart your dev server after updating `.env.local`
2. Make sure the file is named exactly `.env.local` (not `.env`)
3. Check that variables don't have extra spaces or quotes

## Debug Information

When you click "Connect Gmail" or "Connect Google Drive", check the browser console and server logs for:

1. **Client ID logging**: You should see truncated client ID in logs
2. **Redirect URI**: Verify it matches your Google Cloud Console setup
3. **Scopes**: Make sure all required scopes are included

## Production Deployment

For production:

1. Update `NEXTAUTH_URL` to your production domain
2. Add production redirect URIs to Google Cloud Console
3. Move your app from "Testing" to "Published" status in OAuth consent screen
4. Consider creating a separate Google Cloud project for production

## Security Notes

- Never commit your `GOOGLE_CLIENT_SECRET` to version control
- Use environment variables for all sensitive data
- Consider using Google Cloud Secret Manager for production
- Regularly rotate your OAuth credentials

## Need Help?

If you're still having issues:

1. Check the browser Network tab for the exact OAuth error
2. Look at the server console for detailed error messages
3. Verify all steps in this guide are completed
4. Make sure your Google account has the necessary permissions 