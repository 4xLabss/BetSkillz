src/
├── app/
│   ├── api/
│   │   ├── auth/                 # Authentication endpoints (e.g., challenge, next-auth)
│   │   │   ├── challenge/
│   │   │   │   └── route.ts
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts
│   │   ├── users/                # User profile endpoints
│   │   │   ├── [walletAddress]/
│   │   │   │   └── route.ts
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── leaderboards/         # Leaderboard endpoints
│   │   │   └── [gameId]/
│   │   │       └── route.ts
│   │   ├── achievements/         # Achievement-related endpoints
│   │   │   └── me/
│   │   │       └── route.ts
│   │   ├── game/                 # Endpoints for game interactions
│   │   │   ├── session/
│   │   │   │   └── route.ts
│   │   │   └── event/
│   │   │       └── route.ts
│   │   └── news/                 # News endpoints
│   │       └── route.ts
│   └── (frontend routes and components...)
├── lib/
│   ├── db/
│   │   ├── postgres.ts           # PostgreSQL client (e.g., Drizzle)
│   │   ├── redis.ts              # Redis client (e.g., @upstash/redis)
│   │   └── schema.ts             # Drizzle ORM schema definitions
│   ├── services/                 # Business logic modules
│   │   ├── userService.ts
│   │   ├── leaderboardService.ts
│   │   └── achievementService.ts
│   ├── utils/                    # Reusable helper functions
│   │   ├── auth.ts               # Auth-related helpers, session management
│   │   ├── errorHandler.ts       # Centralized API error handling
│   │   └── validation.ts         # Zod schemas and validation helpers
│   └── types/                    # Global TypeScript type definitions
│       └── index.d.ts
└── (other project files...)




