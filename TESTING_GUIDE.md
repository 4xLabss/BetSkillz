# BetSkillz Authentication Testing Guide

## Quick Start Guide for Testing the Backend Implementation

### 1. Environment Setup

1. **Copy Environment Variables**:
   ```bash
   cp .env.local.example .env.local
   ```

2. **Configure MongoDB (Optional for initial testing)**:
   - For quick testing, you can use a temporary MongoDB connection
   - Or set up MongoDB Atlas: https://www.mongodb.com/atlas

3. **Generate NextAuth Secret**:
   ```bash
   # On Windows (PowerShell)
   [Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(32))
   
   # On Linux/Mac
   openssl rand -base64 32
   ```

### 2. Installation and Setup

```bash
# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

### 3. Test Database Connection

Open your browser and navigate to:
```
http://localhost:3000/api/test/db-connection
```

**Expected Response** (with MongoDB configured):
```json
{
  "success": true,
  "message": "Database connection successful",
  "data": {
    "name": "BetSkillzDB",
    "host": "cluster0.mongodb.net",
    "readyState": 1,
    "readyStateString": "connected"
  }
}
```

### 4. Test Authentication Flow

#### 4.1 Visit Sign-In Page
Navigate to:
```
http://localhost:3000/auth/signin
```

#### 4.2 Test Mock Wallet Connection
1. Click "Connect Wallet" button
2. Wait for mock connection (1 second delay)
3. You should see wallet connected status
4. Click "Sign Message & Authenticate"

#### 4.3 Test Authentication Status
After signing in, test the authentication endpoint:
```
http://localhost:3000/api/test/auth
```

**Expected Response** (when authenticated):
```json
{
  "success": true,
  "authenticated": true,
  "user": {
    "walletAddress": "2xKXtg3CW98d97TXJSDpbD5jBkheTqA83TZRuJosgHRs",
    "username": "Player_2xKXtg3C"
  },
  "message": "Authentication successful"
}
```

### 5. Test Protected API Routes

#### 5.1 Get User Profile
```bash
# This will work only when authenticated
curl http://localhost:3000/api/user/profile
```

#### 5.2 Update User Profile
```bash
curl -X PUT http://localhost:3000/api/user/profile \
     -H "Content-Type: application/json" \
     -d '{"username":"TestPlayer","avatar":"https://example.com/avatar.jpg"}'
```

### 6. Test Rate Limiting

Try signing in multiple times with invalid credentials to test rate limiting:
- The system allows 5 attempts per 15 minutes
- After exceeding, you'll see rate limit errors

### 7. Testing with cURL (Alternative)

If you want to test the API directly with cURL:

```bash
# Get CSRF token
CSRF_TOKEN=$(curl -s http://localhost:3000/api/auth/csrf | jq -r '.csrfToken')

# Test authentication endpoint
curl -H "Cookie: next-auth.csrf-token=$CSRF_TOKEN" \
     http://localhost:3000/api/test/auth
```

### 8. Development Testing Workflow

1. **Start the server**: `npm run dev`
2. **Test database**: Visit `/api/test/db-connection`
3. **Test auth flow**: Visit `/auth/signin`
4. **Check session**: Visit `/api/test/auth`
5. **Test protected routes**: Try `/api/user/profile`

### 9. Common Issues and Solutions

#### Issue: "Database connection failed"
- **Solution**: Check if `MONGO_URI` is set in `.env.local`
- **Workaround**: The auth system works without database for testing

#### Issue: "NEXTAUTH_SECRET not set"
- **Solution**: Generate and add `NEXTAUTH_SECRET` to `.env.local`

#### Issue: "Invalid signature"
- **Solution**: This is expected with the mock wallet - it simulates the signing process

#### Issue: "Session not found"
- **Solution**: Make sure to go through the sign-in flow first

### 10. Mock vs Real Implementation

**Current Implementation (Mock)**:
- Uses mock wallet with simulated signing
- Creates mock signatures for testing
- Perfect for development and testing

**Real Implementation (Coming Next)**:
- Will integrate with actual Solana wallet adapters
- Real Ed25519 signature verification
- Production-ready authentication

### 11. Next Steps for Production

1. **Replace Mock Wallet**: Integrate with `@solana/wallet-adapter-react`
2. **Add Real Signatures**: Implement actual message signing
3. **Database Setup**: Configure production MongoDB Atlas
4. **Environment Variables**: Set production secrets
5. **Deploy**: Deploy to Vercel or your preferred platform

---

## Quick Commands Summary

```bash
# Start development
npm run dev

# Test database
curl http://localhost:3000/api/test/db-connection

# Test authentication
curl http://localhost:3000/api/test/auth

# Test protected route
curl http://localhost:3000/api/user/profile
```

**Testing URLs**:
- Sign In: http://localhost:3000/auth/signin
- Test Auth: http://localhost:3000/api/test/auth
- Test DB: http://localhost:3000/api/test/db-connection
- Profile API: http://localhost:3000/api/user/profile

This testing guide allows you to verify that all components of the authentication system are working correctly without needing a full production setup!
