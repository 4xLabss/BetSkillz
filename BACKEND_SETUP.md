# BetSkillz Backend Setup

## Overview
This document covers the foundational backend setup for the BetSkillz platform, implementing MongoDB integration with Mongoose ODM in a Next.js 14+ environment.

## Project Structure

```
src/
├── lib/
│   ├── mongodb.ts          # Database connection management
│   ├── database-utils.ts   # Database testing utilities
│   └── utils.ts           # General utilities
├── models/
│   ├── User.ts            # User schema and interface
│   ├── Game.ts            # Game schema and interface
│   ├── Score.ts           # Score schema and interface
│   ├── Achievement.ts     # Achievement schema and interface
│   ├── News.ts            # News schema and interface
│   └── index.ts           # Model exports
├── types/
│   └── database.ts        # TypeScript type definitions
└── app/
    └── api/
        └── test/
            └── db-connection/
                └── route.ts   # Database connection test endpoint
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# MongoDB Connection String
MONGO_URI="mongodb+srv://<username>:<password>@<cluster-url>/BetSkillzDB?retryWrites=true&w=majority"

# NextAuth.js Secret
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
```

## Database Models

### User Model
- **Purpose**: Stores player profiles and statistics
- **Key Features**: Wallet-based authentication, XP system, achievement tracking
- **Indexes**: walletAddress, username

### Game Model
- **Purpose**: Stores game metadata and configuration
- **Key Features**: Difficulty levels, tags, control schemes
- **Indexes**: slug

### Score Model
- **Purpose**: Records game session results for leaderboards
- **Key Features**: User-game relationship, optimized for leaderboard queries
- **Indexes**: user+game compound, game+score for leaderboards

### Achievement Model
- **Purpose**: Defines available achievements
- **Key Features**: Unique achievement IDs, metadata storage

### News Model
- **Purpose**: Platform news and updates
- **Key Features**: Slug-based routing, tag system
- **Indexes**: slug

## Connection Management

The database connection uses a singleton pattern with caching to optimize performance in serverless environments:

- **Caching**: Connections are cached globally to prevent connection pool exhaustion
- **Error Handling**: Automatic retry logic with promise reset on failure
- **Performance**: Zero cold-start overhead after initial connection

## Testing the Setup

1. **Database Connection Test**:
   ```bash
   curl http://localhost:3000/api/test/db-connection
   ```

2. **Using the Test Utility**:
   ```typescript
   import { testDatabaseConnection } from '@/lib/database-utils';
   
   const isConnected = await testDatabaseConnection();
   ```

## Next Steps

After completing this foundational setup, you can proceed with:

1. **Authentication System**: Implement Solana wallet authentication
2. **API Routes**: Create CRUD operations for each model
3. **Data Migration**: Migrate existing JSON data to MongoDB
4. **Validation**: Add Zod schemas for API request validation

## Dependencies

All required packages are already installed:
- `mongoose`: MongoDB ODM
- `next-auth`: Authentication framework
- `bs58` & `tweetnacl`: Solana cryptography
- `zod`: Schema validation

## Notes

- The Next.js configuration includes Mongoose as an external package to prevent bundling issues
- All models use TypeScript interfaces for type safety
- The connection utility is optimized for Vercel's serverless environment
- Environment variables are automatically ignored by Git via `.gitignore`
