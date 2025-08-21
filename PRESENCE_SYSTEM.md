# Real-Time Presence System Documentation

## Overview

The BetSkillz platform implements a sophisticated real-time presence tracking system that displays online player counts across all games. This system is designed with a **serverless-first approach**, ensuring compatibility with Vercel deployment while providing near real-time updates through intelligent client-side polling.

## Architecture Design

### 🎯 Core Principles

1. **Serverless Compatibility**: Full compatibility with Vercel's serverless infrastructure
2. **Performance Optimized**: Intelligent polling with page visibility detection
3. **Scalable Foundation**: Easy migration path to Redis or other scaling solutions
4. **User Experience**: Seamless presence tracking with automatic cleanup

### 🏗️ System Components

```
Real-Time Presence Architecture
├── 📊 Centralized Presence Store (in-memory → Redis ready)
├── 🔌 RESTful API Endpoints (/api/presence/*)
├── ⚛️ React Hooks (useGamePresence, useGlobalPresence)
├── 🎨 UI Components (OnlineCounter, PresenceIndicator)
├── 🎮 Context Provider (PresenceProvider)
└── 🧹 Automatic Cleanup (inactive user removal)
```

## Implementation Details

### Backend Components

#### 1. Centralized Presence Store (`/src/lib/presenceStore.ts`)

**Purpose**: Thread-safe, centralized management of all user presence data

**Key Features**:
- Singleton pattern for consistent state
- Automatic cleanup of inactive users (2-minute threshold)
- Efficient user switching between games
- Debug information for monitoring

**Production Ready**: Designed for easy Redis migration

```typescript
// Example usage
const store = getPresenceStore();
const count = store.registerUser(walletAddress, gameSlug);
```

#### 2. Presence API Routes

**GET `/api/presence/[gameSlug]`**
- Public endpoint for game-specific online counts
- Validates game existence
- Returns formatted presence data

**POST `/api/presence/[gameSlug]`**
- Protected endpoint for presence registration
- Requires authentication
- Automatic user switching between games

**DELETE `/api/presence/[gameSlug]`**
- Protected endpoint for presence removal
- Graceful cleanup on user logout

**GET `/api/presence`**
- Global presence data across all games
- Platform statistics and summaries
- Optimized response format

### Frontend Components

#### 1. Custom React Hooks

**`useGamePresence(gameSlug, options)`**

Manages presence for a specific game with intelligent polling:

```typescript
const { 
  onlineCount, 
  isRegistered, 
  registerPresence, 
  unregisterPresence 
} = useGamePresence('cosmic-drift', {
  pollInterval: 30000,
  autoRegister: true
});
```

**Key Features**:
- Automatic registration/cleanup
- Configurable polling intervals
- Error handling and retry logic
- Page visibility optimization

**`useGlobalPresence(pollInterval)`**

Tracks overall platform presence:

```typescript
const { presence, error, isLoading } = useGlobalPresence(60000);
// Returns: { totalOnline, games: [...], lastUpdated }
```

#### 2. UI Components

**`<OnlineCounter gameSlug="cosmic-drift" />`**
- Real-time display of game-specific online counts
- Customizable styling and labels
- Loading states and error handling

**`<GlobalOnlineCounter />`**
- Platform-wide online player count
- Ideal for navigation bars
- Configurable update intervals

**`<PresenceIndicator gameSlug="cosmic-drift" variant="badge" />`**
- Flexible presence visualization
- Multiple display variants (dot, badge, full)
- Size customization options

**`<GamePresenceList />`**
- Overview of all games with online counts
- Sortable and filterable
- Zero-count hiding options

#### 3. Context Provider

**`<PresenceProvider>`**

Centralized presence management with automatic features:

- **Automatic Game Detection**: Tracks current game context
- **Page Visibility Handling**: Pauses updates when tab inactive
- **Cleanup on Navigation**: Proper presence removal
- **Session Management**: Handles authentication state changes

```typescript
// Automatic presence registration for game pages
function GamePage() {
  useGamePresenceRegistration('cosmic-drift');
  return <GameInterface />;
}
```

## Integration Examples

### 1. Game Page Integration

```typescript
// /src/app/play/cosmic-drift/page.tsx
import { useGamePresenceRegistration } from '@/components/PresenceProvider';
import { OnlineCounter } from '@/components/PresenceComponents';

export default function CosmicDriftPage() {
  // Automatically register presence for this game
  useGamePresenceRegistration('cosmic-drift');
  
  return (
    <div>
      <header>
        <h1>Cosmic Drift</h1>
        <OnlineCounter 
          gameSlug="cosmic-drift"
          showLabel={true}
          autoRegister={false} // Already registered via hook
        />
      </header>
      {/* Game content */}
    </div>
  );
}
```

### 2. Games Listing Integration

```typescript
// /src/app/games/page.tsx
import { PresenceIndicator } from '@/components/PresenceComponents';

function GameCard({ game }) {
  return (
    <div className="game-card">
      <h3>{game.title}</h3>
      <PresenceIndicator 
        gameSlug={game.id}
        variant="badge"
        size="sm"
      />
    </div>
  );
}
```

### 3. Navigation Integration

```typescript
// /src/components/Navbar.tsx
import { GlobalOnlineCounter } from '@/components/PresenceComponents';

export function Navbar() {
  return (
    <nav>
      <div className="nav-content">
        {/* Navigation items */}
        <GlobalOnlineCounter 
          className="text-gray-300"
          pollInterval={120000} // 2 minutes
        />
        {/* User menu */}
      </div>
    </nav>
  );
}
```

## Performance Optimizations

### 1. Smart Polling Strategy

**Default Intervals**:
- Game-specific presence: 30 seconds
- Global presence: 60 seconds
- Navbar global counter: 120 seconds (2 minutes)

**Page Visibility Optimization**:
- Polling rate reduced when tab is inactive
- Automatic presence cleanup when switching tabs
- Immediate re-registration when returning to tab

### 2. Efficient State Management

**Centralized Store Benefits**:
- Single source of truth for all presence data
- Automatic deduplication of users across games
- Efficient cleanup of inactive users
- Memory-optimized data structures

**Request Optimization**:
- Minimal API payload sizes
- Strategic caching of game metadata
- Batched operations where possible

### 3. Error Handling & Resilience

**Graceful Degradation**:
- Fallback to cached data during network issues
- Silent error handling for non-critical operations
- Automatic retry logic with exponential backoff

**Resource Management**:
- Automatic cleanup of polling intervals
- Memory leak prevention
- Proper event listener removal

## Scaling & Production Deployment

### Current Implementation (Development/Small Scale)

**In-Memory Store**:
- Single server instance limitation
- Suitable for development and small deployments
- No external dependencies

### Migration Path to Redis (Production Scale)

**Easy Migration**: The current implementation is designed for seamless Redis integration:

```typescript
// Replace PresenceStore implementation
class RedisPresenceStore implements PresenceStore {
  private redis: Redis;
  
  async registerUser(walletAddress: string, gameSlug: string): Promise<number> {
    // Redis implementation
    await this.redis.sadd(`game:${gameSlug}:users`, walletAddress);
    await this.redis.setex(`user:${walletAddress}:heartbeat`, 120, Date.now());
    return this.redis.scard(`game:${gameSlug}:users`);
  }
}
```

**Benefits of Redis Migration**:
- Multi-server support
- Persistent presence data
- Advanced analytics capabilities
- Built-in expiration handling

### Alternative Scaling Options

**Third-Party Services**:
- **Pusher**: WebSocket service with REST API integration
- **Ably**: Real-time messaging platform
- **Firebase Realtime Database**: Google's real-time solution

**Custom WebSocket Server**:
- Higher complexity but full control
- Requires dedicated hosting (not Vercel compatible)
- Lower latency for real-time features

## Configuration Options

### Environment Variables

```env
# Presence system configuration
PRESENCE_CLEANUP_INTERVAL=120000     # 2 minutes
PRESENCE_INACTIVE_THRESHOLD=120000   # 2 minutes
PRESENCE_DEBUG_MODE=false            # Enable debug endpoints
```

### Component Configuration

**Hook Options**:
```typescript
interface PresenceOptions {
  pollInterval?: number;        // Polling frequency (ms)
  autoRegister?: boolean;       // Auto-register presence
  pauseWhenHidden?: boolean;    // Pause when tab inactive
}
```

**Component Props**:
```typescript
interface OnlineCounterProps {
  gameSlug: string;
  className?: string;
  showLabel?: boolean;
  autoRegister?: boolean;
  pollInterval?: number;
}
```

## Monitoring & Analytics

### Debug Information

**Development Debug Endpoint**:
```bash
# Get detailed presence information
curl http://localhost:3000/api/presence -X OPTIONS
```

**Response Format**:
```json
{
  "success": true,
  "debug": {
    "totalGames": 3,
    "totalUniqueUsers": 15,
    "gameDetails": [
      {
        "gameSlug": "cosmic-drift",
        "userCount": 8,
        "users": ["wallet1...", "wallet2..."]
      }
    ]
  }
}
```

### Production Monitoring

**Key Metrics to Track**:
- Average online users per game
- Peak concurrent users
- Presence registration/cleanup rates
- API response times
- Error rates and types

**Recommended Tools**:
- Vercel Analytics for request monitoring
- Custom logging for business metrics
- Performance monitoring for response times

## Security Considerations

### Authentication & Authorization

**Protected Endpoints**:
- Presence registration requires valid session
- User can only register their own presence
- Automatic cleanup prevents session hijacking

**Rate Limiting**:
- Built into authentication middleware
- Prevents spam registration attempts
- Graceful degradation on limits

### Data Privacy

**Minimal Data Exposure**:
- Only wallet addresses stored (already public)
- No sensitive user information in presence data
- Automatic cleanup ensures data freshness

## Future Enhancements

### Short-Term Improvements

1. **Redis Integration**: Scale beyond single server
2. **Advanced Analytics**: Detailed usage patterns
3. **Mobile Optimization**: Reduced polling for mobile devices
4. **A/B Testing**: Optimal polling intervals

### Long-Term Features

1. **Real-Time Notifications**: Friend online alerts
2. **Game Lobbies**: Pre-game presence tracking
3. **Tournament Integration**: Event-based presence
4. **Social Features**: Friend presence indicators

## Troubleshooting

### Common Issues

**"Presence not updating"**:
- Check authentication status
- Verify game slug matches database
- Confirm network connectivity

**"High memory usage"**:
- Check cleanup interval configuration
- Monitor inactive user threshold
- Consider Redis migration

**"Incorrect online counts"**:
- Clear browser cache
- Check for duplicate registrations
- Verify cleanup processes

### Debug Commands

```bash
# Check presence API health
curl http://localhost:3000/api/presence

# Debug specific game presence
curl http://localhost:3000/api/presence/cosmic-drift

# View detailed debug info (dev only)
curl http://localhost:3000/api/presence -X OPTIONS
```

---

*This presence system provides a solid foundation for real-time features while maintaining compatibility with serverless deployment. The design prioritizes performance, scalability, and developer experience.*
