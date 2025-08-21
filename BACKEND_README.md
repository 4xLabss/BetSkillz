# BetSkillz Backend Implementation Guide

## Overview

This document covers the complete backend implementation for the BetSkillz platform, featuring a comprehensive Web3 gaming infrastructure with Solana wallet authentication, real-time scoring, leaderboards, and content management. The platform provides enterprise-grade security, MongoDB transactions, and RESTful API architecture.

## 🏗️ Architecture Overview

```
BetSkillz Backend Architecture
├── 🔐 Authentication Layer (Solana Wallet + NextAuth.js + JWT)
├── 🗄️ Database Layer (MongoDB + Mongoose + Transactions)
├── 🛡️ Security Layer (Rate Limiting + Ownership Verification + CORS)
├── 🔧 API Layer (RESTful Routes + CRUD + Aggregations)
├── 🎮 Game Integration Layer (Score Tracking + Real-time Leaderboards)
├── 🏆 Achievement System (Progress Tracking + Rewards)
├── 📰 Content Management (News + Dynamic Updates)
└── 📊 Analytics Layer (Platform Statistics + User Insights)
```

---

## 📋 Table of Contents

1. [Foundational Setup](#1-foundational-setup)
2. [Decentralized Authentication](#2-decentralized-authentication)
3. [API Documentation](#3-api-documentation)
4. [Real-Time Presence System](#4-real-time-presence-system)
5. [Database Architecture](#5-database-architecture)
6. [Security Features](#6-security-features)
7. [Testing Guide](#7-testing-guide)
8. [Deployment](#8-deployment)
9. [Performance Optimization](#9-performance-optimization)

---

## 1. Foundational Setup

### 1.1 Environment Configuration

**Location**: `.env.local`

```env
# MongoDB Connection
MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/BetSkillzDB?retryWrites=true&w=majority"

# NextAuth.js Configuration
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
NEXTAUTH_URL="http://localhost:3000"  # Update for production
```

**Security Notes**:
- Generate `NEXTAUTH_SECRET` using: `openssl rand -base64 32`
- Never commit `.env.local` to version control
- Use environment-specific URLs for `NEXTAUTH_URL`

### 1.2 Database Models

**Core Models**:

| Model | Purpose | Key Features |
|-------|---------|--------------|
| `User` | Player profiles | Wallet-based identity, XP system, stats |
| `Game` | Game metadata | Difficulty levels, controls, tags |
| `Score` | Game results | Leaderboard data, user-game relationships |
| `Achievement` | Gamification | Unlockable rewards, progress tracking |
| `News` | Platform updates | Content management, SEO-friendly slugs |

### 1.3 Connection Management

**High-Performance Singleton Pattern**:
- Cached connections prevent pool exhaustion
- Optimized for serverless environments (Vercel)
- Automatic error handling and reconnection logic

---

## 2. Decentralized Authentication

### 2.1 "Sign-In with Solana" Protocol

**Security Principles**:
- **Non-Custodial**: Private keys never leave the wallet
- **Phishing Resistant**: Domain verification in signed message
- **Replay Protection**: Single-use nonces (CSRF tokens)
- **Cryptographic Verification**: Ed25519 signature validation

### 2.2 Implementation Components

**Core Files**:
```
src/
├── lib/
│   ├── SigninMessage.ts      # Message construction & verification
│   ├── auth-utils.ts         # Authentication middleware
│   └── mongodb.ts           # Database connection
├── app/api/auth/
│   └── [...nextauth]/
│       └── route.ts         # NextAuth.js configuration
├── hooks/
│   └── useSolanaAuth.ts     # React authentication hook
└── components/
    └── WalletProvider.tsx   # Session management
```

**Key Features**:
- Rate limiting (5 attempts per 15 minutes)
- Automatic user creation on first sign-in
- Session management with JWT
- Comprehensive error handling

### 2.3 Protected API Routes

**Middleware Types**:

---

## 3. API Documentation

### 3.1 Authentication Endpoints

#### `POST /api/auth/[...nextauth]`
**Purpose**: NextAuth.js authentication endpoints  
**Provider**: Custom Solana wallet credentials  
**Flow**: Sign message with wallet → Verify signature → Create session

#### `GET /api/test/auth`
**Purpose**: Test authentication status  
**Authentication**: Required  
**Response**: User session data

---

### 3.2 User Management

#### `GET /api/users/[walletAddress]`
**Purpose**: Get public user profile  
**Authentication**: Public endpoint  
**Parameters**: `walletAddress` - Solana wallet address  
**Response**: Public profile data (username, level, stats)

```typescript
// Response Example
{
  "success": true,
  "data": {
    "username": "Player123",
    "walletAddress": "ABC123...",
    "level": 15,
    "xp": 12500,
    "stats": {
      "gamesPlayed": 45,
      "totalScore": 98750
    }
  }
}
```

#### `PUT /api/users/[walletAddress]`
**Purpose**: Update user profile  
**Authentication**: Required (ownership verified)  
**Body**: Profile updates (username, avatar, preferences)

---

### 3.3 Game Management

#### `GET /api/games`
**Purpose**: List all available games  
**Authentication**: Public endpoint  
**Query Parameters**:
- `category` - Filter by game category
- `difficulty` - Filter by difficulty level
- `limit` - Limit results (default: 20, max: 100)

#### `GET /api/games/[slug]`
**Purpose**: Get specific game details  
**Authentication**: Public endpoint  
**Response**: Complete game information, leaderboard preview

#### `POST /api/games`
**Purpose**: Create new game (Admin only)  
**Authentication**: Required (admin role)  
**Body**: Game configuration and metadata

---

### 3.4 Score & Leaderboard System

#### `POST /api/scores`
**Purpose**: Submit game score  
**Authentication**: Required  
**Features**: 
- MongoDB transactions for data consistency
- Real-time user stats updates
- Automatic leaderboard calculation

```typescript
// Request Body
{
  "gameSlug": "cosmic-drift",
  "score": 15000,
  "metadata": {
    "level": 12,
    "duration": 180
  }
}
```

#### `GET /api/leaderboard/[gameSlug]`
**Purpose**: Get game-specific leaderboard  
**Authentication**: Public endpoint  
**Query Parameters**:
- `timeframe` - daily, weekly, monthly, all-time
- `limit` - Number of results (default: 10, max: 100)

#### `GET /api/leaderboard/global`
**Purpose**: Get global platform leaderboard  
**Authentication**: Public endpoint  
**Features**: Cross-game XP rankings with MongoDB aggregation

---

### 3.5 Achievement System

#### `GET /api/achievements`
**Purpose**: List all available achievements  
**Authentication**: Public endpoint  
**Response**: Achievement definitions with unlock requirements

#### `GET /api/users/[walletAddress]/achievements`
**Purpose**: Get user's achievement progress  
**Authentication**: Public for viewing, ownership required for detailed progress

```typescript
// Response Example
{
  "success": true,
  "data": {
    "unlockedAchievements": [
      {
        "id": "first_win",
        "title": "First Victory",
        "unlockedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "progress": [
      {
        "id": "score_master",
        "currentProgress": 7,
        "requiredProgress": 10
      }
    ]
  }
}
```

---

### 3.6 Content Management

#### `GET /api/news`
**Purpose**: Get platform news and updates  
**Authentication**: Public endpoint  
**Query Parameters**:
- `limit` - Number of articles (default: 10)
- `category` - Filter by news category
- `featured` - Show only featured articles

#### `GET /api/news/[slug]`
**Purpose**: Get specific news article  
**Authentication**: Public endpoint  
**Response**: Full article content with metadata

#### `POST /api/news` (Admin)
**Purpose**: Create news article  
**Authentication**: Required (admin role)  
**Body**: Article content and publishing settings

---

### 3.7 Platform Analytics

#### `GET /api/stats`
**Purpose**: Get platform statistics  
**Authentication**: Public endpoint  
**Response**: User counts, game statistics, recent activity

```typescript
// Response Example
{
  "success": true,
  "data": {
    "platform": {
      "totalUsers": 15420,
      "totalGames": 12,
      "totalScores": 89350
    },
    "recent": {
      "newUsersToday": 45,
      "gamesPlayedToday": 1250
    },
    "topGames": [...]
  }
}
```

---

### 3.8 Search & Discovery

#### `GET /api/search`
**Purpose**: Global search across platform content  
**Authentication**: Public endpoint  
**Query Parameters**:
- `q` - Search query (minimum 2 characters)
- `type` - Search type (all, users, games, news)
- `limit` - Results per category (default: 10, max: 50)

```typescript
// Response Example
{
  "success": true,
  "data": {
    "users": [...],
    "games": [...],
    "news": [...]
  },
  "meta": {
    "query": "cosmic",
    "totalResults": 15
  }
}
```

---

## 4. Real-Time Presence System

### 4.1 Architecture Overview

**Design Philosophy**: Serverless-compatible real-time functionality using client-side polling instead of WebSockets to maintain Vercel deployment compatibility.

**Core Components**:
```
src/
├── lib/
│   └── presenceStore.ts          # Centralized presence management
├── app/api/presence/
│   ├── route.ts                  # Global presence endpoints
│   └── [gameSlug]/
│       └── route.ts              # Game-specific presence endpoints
├── hooks/
│   └── usePresence.ts            # React hooks for presence management
├── components/
│   ├── PresenceProvider.tsx      # Context provider
│   └── PresenceComponents.tsx    # UI components
└── PRESENCE_SYSTEM.md           # Detailed documentation
```

### 4.2 Technical Implementation

**Presence Store** (`src/lib/presenceStore.ts`):
- Thread-safe singleton pattern with automatic cleanup
- In-memory storage with Redis migration path
- Automatic user removal after 2 minutes of inactivity
- Support for both game-specific and global presence tracking

**API Endpoints**:
- `GET /api/presence` - Global online count
- `GET /api/presence/[gameSlug]` - Game-specific presence data
- `POST /api/presence/[gameSlug]` - Register user presence
- `DELETE /api/presence/[gameSlug]` - Remove user presence

**React Integration**:
- `useGamePresence()` - Track presence for specific games
- `useGlobalPresence()` - Track global platform presence
- `useOptimizedGamePresence()` - Optimized with page visibility detection
- `PresenceProvider` - Automatic registration and cleanup

### 4.3 Features

**Real-Time Updates**:
- 15-30 second polling intervals
- Page visibility optimization (pause when tab inactive)
- Automatic cleanup on page unload
- Error handling with exponential backoff

**UI Components**:
- `OnlineCounter` - Display game-specific online count
- `GlobalOnlineCounter` - Platform-wide online users
- `PresenceIndicator` - Visual status indicators
- `GamePresenceList` - Detailed presence information

**Performance Optimizations**:
- Intelligent polling intervals based on user activity
- Resource cleanup on component unmount
- Page visibility API integration
- Centralized state management

---

## 5. Database Architecture

### 5.1 Data Models

#### User Model
```typescript
interface User {
  username: string;
  walletAddress: string; // Primary identifier
  avatar?: string;
  level: number;
  xp: number;
  stats: {
    gamesPlayed: number;
    totalScore: number;
    averageScore: number;
  };
  preferences: UserPreferences;
  createdAt: Date;
  lastActive: Date;
}
```

#### Game Model
```typescript
interface Game {
  title: string;
  slug: string; // URL-friendly identifier
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  maxScore?: number;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
}
```

#### Score Model
```typescript
interface Score {
  userId: ObjectId; // Reference to User
  gameId: ObjectId; // Reference to Game
  score: number;
  metadata: {
    level?: number;
    duration?: number;
    multiplier?: number;
  };
  submittedAt: Date;
}
```

### 4.2 Database Optimizations

**Indexing Strategy**:
- `User.walletAddress` - Unique index for fast user lookup
- `Score.gameId + Score.score` - Compound index for leaderboards
- `Score.userId + Score.submittedAt` - Index for user score history
- `News.publishDate` - Index for chronological queries

**Performance Features**:
- MongoDB connection pooling with singleton pattern
- Aggregation pipelines for complex queries
- Transaction support for critical operations
- Cached database connections in serverless environment

---

## 6. Security Features

### 5.1 Authentication Security
- **Cryptographic Verification**: Ed25519 signature validation using tweetnacl
- **Session Management**: JWT-based sessions with NextAuth.js
- **Rate Limiting**: 5 authentication attempts per 15-minute window
- **CSRF Protection**: Built-in NextAuth.js CSRF tokens

### 5.2 API Security
- **Ownership Verification**: Middleware ensures users can only access their own data
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Sanitized error responses prevent information leakage
- **CORS Configuration**: Properly configured cross-origin policies

### 5.3 Database Security
- **Mongoose Validation**: Schema-level data validation
- **Injection Prevention**: Parameterized queries prevent NoSQL injection
- **Connection Security**: TLS/SSL encrypted database connections
- **Environment Isolation**: Separate development and production databases

---

## 7. Testing Guide

### 6.1 API Testing Examples

```bash
# Test database connection
curl http://localhost:3000/api/test/db-connection

# Get platform statistics
curl http://localhost:3000/api/stats

# Search functionality
curl "http://localhost:3000/api/search?q=cosmic&type=games"

# Get game leaderboard
curl http://localhost:3000/api/leaderboard/cosmic-drift?timeframe=weekly

# Get user profile (public)
curl http://localhost:3000/api/users/ABC123...
```

### 6.2 Authentication Testing

1. Navigate to `/auth/signin`
2. Connect Solana wallet
3. Sign authentication message
4. Verify session creation
5. Test protected endpoints

### 6.3 Score Submission Testing

```javascript
// Example score submission
const response = await fetch('/api/scores', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    gameSlug: 'cosmic-drift',
    score: 15000,
    metadata: {
      level: 12,
      duration: 180
    }
  })
});
```

---

## 8. Deployment

### 7.1 Vercel Configuration

**Environment Variables**:
```env
# Production
MONGO_URI=mongodb+srv://...
NEXTAUTH_SECRET=your-production-secret
NEXTAUTH_URL=https://your-domain.com

# Development
NEXTAUTH_DEBUG=true
```

**Build Settings**:
- Framework: Next.js
- Node.js Version: 18.x
- Build Command: `npm run build`
- Output Directory: `.next`

### 7.2 Database Setup

**MongoDB Atlas Configuration**:
1. Create production cluster
2. Configure IP whitelist (0.0.0.0/0 for Vercel)
3. Create database user with read/write permissions
4. Update connection string with SSL enabled

### 7.3 Performance Monitoring

**Recommended Tools**:
- Vercel Analytics for request monitoring
- MongoDB Atlas monitoring for database performance
- Sentry for error tracking
- Custom logging for business metrics

---

## 9. Performance Optimization

### 8.1 Database Optimization
- **Connection Pooling**: Singleton pattern prevents connection exhaustion
- **Aggregation Pipelines**: Optimized queries for leaderboards and statistics
- **Selective Projections**: Only fetch required fields
- **Proper Indexing**: Strategic indexes for common query patterns

### 8.2 API Optimization
- **Response Caching**: Cache static data like game information
- **Pagination**: Limit response sizes with proper pagination
- **Compression**: Gzip compression enabled
- **CDN Integration**: Static assets served via CDN

### 8.3 Monitoring & Analytics
- **Request Timing**: Track API response times
- **Error Rates**: Monitor error frequencies
- **User Metrics**: Track authentication success rates
- **Database Performance**: Monitor query execution times

---

## 🚀 Implementation Status

### ✅ Section 1: Foundational Backend Setup (COMPLETED)
- [x] Environment configuration with MongoDB and NextAuth.js
- [x] High-performance MongoDB connection management with caching
- [x] Complete Mongoose schema definitions for all data models
- [x] Database connection testing utilities
- [x] TypeScript type definitions and interfaces

### ✅ Section 2: Decentralized Authentication (COMPLETED)
- [x] "Sign-In with Solana" protocol implementation
- [x] NextAuth.js configuration with custom Solana credentials provider
- [x] SigninMessage utility for message construction and verification
- [x] Authentication middleware for protected routes
- [x] Rate limiting and security features (5 attempts/15min)
- [x] Custom React hooks for authentication (useSolanaAuth)
- [x] Authentication pages with error handling
- [x] Protected API routes with ownership verification

### ✅ Section 3: API Route Implementation (COMPLETED)
- [x] **User Management APIs**: Profile viewing, updating with ownership protection
- [x] **Game Management APIs**: CRUD operations for games, public game listing
- [x] **Score System APIs**: Score submission with MongoDB transactions, real-time user stats updates
- [x] **Leaderboard APIs**: Game-specific and global leaderboards with MongoDB aggregation
- [x] **Achievement System APIs**: Achievement tracking, user progress monitoring
- [x] **Content Management APIs**: News creation, listing, and detailed views
- [x] **Platform Analytics APIs**: Statistics aggregation, user metrics, platform insights
- [x] **Search APIs**: Global search across users, games, and news content
- [x] **Security Implementation**: Rate limiting, input validation, error handling
- [x] **Database Transactions**: Atomic operations for critical data consistency

### ✅ Section 4: Real-Time Presence System (COMPLETED)
- [x] **Serverless Architecture**: Client-side polling system compatible with Vercel deployment
- [x] **Presence Store**: Thread-safe, centralized presence management with automatic cleanup
- [x] **API Endpoints**: Complete REST API for presence registration, tracking, and removal
- [x] **React Integration**: Custom hooks (useGamePresence, useGlobalPresence) with optimization
- [x] **UI Components**: Reusable components for displaying online counts and presence indicators
- [x] **Performance Features**: Page visibility detection, intelligent polling intervals, resource cleanup
- [x] **Context Provider**: Automatic presence registration and heartbeat management
- [x] **Production Ready**: Redis migration path, error handling, exponential backoff

---

## 🔧 Development Commands

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

---

## 📁 Complete Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/     # NextAuth.js configuration
│   │   ├── users/[walletAddress]/  # User management & achievements
│   │   ├── games/                  # Game CRUD operations
│   │   ├── scores/                 # Score submission system
│   │   ├── leaderboard/            # Leaderboard aggregations
│   │   ├── news/                   # Content management
│   │   ├── achievements/           # Achievement system
│   │   ├── search/                 # Global search API
│   │   ├── stats/                  # Platform analytics
│   │   └── test/                   # Testing endpoints
│   ├── auth/                       # Authentication pages
│   └── globals.css
├── components/
│   ├── WalletProvider.tsx          # Session & wallet management
│   ├── Navbar.tsx
│   └── Footer.tsx
├── hooks/
│   └── useSolanaAuth.ts            # Authentication hook
├── lib/
│   ├── mongodb.ts                  # Database connection with caching
│   ├── SigninMessage.ts            # Message signing utilities
│   ├── auth-utils.ts               # Authentication middleware
│   └── utils.ts
├── models/
│   ├── User.ts                     # User schema with stats
│   ├── Game.ts                     # Game schema with metadata
│   ├── Score.ts                    # Score schema with leaderboard optimization
│   ├── Achievement.ts              # Achievement schema with progress tracking
│   ├── News.ts                     # News schema with content management
│   └── index.ts                    # Centralized model exports
└── types/
    ├── auth.ts                     # Authentication types
    └── database.ts                 # Database types
```

---

## 🆘 Troubleshooting

### Common Issues & Solutions

#### Database Connection Issues
```bash
# Test database connection
curl http://localhost:3000/api/test/db-connection

# Check environment variables
echo $MONGO_URI
```

**Solutions**:
- Verify `MONGO_URI` format and credentials
- Check MongoDB Atlas network access (whitelist 0.0.0.0/0 for Vercel)
- Ensure database user has proper read/write permissions

#### Authentication Problems
```bash
# Test authentication status
curl http://localhost:3000/api/test/auth
```

**Solutions**:
- Verify `NEXTAUTH_SECRET` is set and secure
- Check `NEXTAUTH_URL` matches your deployment domain
- Ensure wallet is properly connected in browser
- Clear browser cookies and try again

#### API Response Issues
**Solutions**:
- Check request headers (Content-Type: application/json)
- Verify authentication for protected endpoints
- Validate request body against API documentation
- Check browser developer console for detailed errors

#### TypeScript Build Errors
```bash
# Run type checking
npm run type-check

# Build with detailed output
npm run build
```

**Solutions**:
- Verify all imports are correct
- Check NextAuth.js type declarations
- Ensure all required environment variables are set
- Update dependencies if type mismatches occur

### Debug Mode Configuration
```env
# Add to .env.local for detailed logging
NEXTAUTH_DEBUG=true
NODE_ENV=development
```

---

## 📚 Technical Resources

### Core Documentation
- [Next.js 15 Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [MongoDB Aggregation Framework](https://docs.mongodb.com/manual/aggregation/)

### Solana & Web3
- [Solana Web3.js Guide](https://docs.solana.com/developing/clients/javascript-api)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [Ed25519 Signature Verification](https://ed25519.cr.yp.to/)

### Deployment & Infrastructure
- [Vercel Deployment Guide](https://vercel.com/docs)
- [MongoDB Atlas Setup](https://docs.atlas.mongodb.com/)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

### Security Best Practices
- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [NextAuth.js Security Features](https://next-auth.js.org/configuration/options#security)
- [MongoDB Security Checklist](https://docs.mongodb.com/manual/administration/security-checklist/)

---

## 🎯 Future Enhancements

### Short-term Improvements
- [ ] Real-time WebSocket connections for live leaderboards
- [ ] Advanced achievement tracking with complex requirements
- [ ] Email notification system for important events
- [ ] Admin dashboard for platform management

### Long-term Features
- [ ] Machine learning for personalized game recommendations
- [ ] Integration with additional blockchain networks
- [ ] Advanced analytics and reporting dashboard
- [ ] Mobile app API optimization

---

*This documentation covers the complete backend implementation for BetSkillz platform. All three sections (Foundational Setup, Authentication, and API Implementation) are fully implemented and production-ready.*

---

*This implementation provides a production-ready foundation for Web3 gaming platforms with secure, decentralized authentication and robust backend infrastructure.*
