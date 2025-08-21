import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SigninMessage } from '@/lib/SigninMessage';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { AuthRateLimit } from '@/lib/auth-utils';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'solana',
      name: 'Solana',
      credentials: {
        message: {
          label: 'Message',
          type: 'text',
        },
        signature: {
          label: 'Signature',
          type: 'text',
        },
      },
      async authorize(credentials, req) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing credentials');
            return null;
          }

          // Parse the message
          let messageData;
          try {
            messageData = JSON.parse(credentials.message);
          } catch (error) {
            console.error('Invalid message format:', error);
            return null;
          }

          const { domain, publicKey, nonce, statement } = messageData;

          // Rate limiting check
          const rateLimitResult = AuthRateLimit.checkRateLimit(publicKey);
          if (!rateLimitResult.allowed) {
            console.error('Rate limit exceeded for:', publicKey);
            return null;
          }

          // Create and validate the signin message
          const signinMessage = new SigninMessage({
            domain,
            publicKey,
            nonce,
            statement,
          });

          const validation = signinMessage.validate();
          if (!validation.valid) {
            console.error('Message validation failed:', validation.errors);
            return null;
          }

          // Verify the signature
          const isValid = signinMessage.verify(credentials.signature);
          if (!isValid) {
            console.error('Signature verification failed');
            return null;
          }

          // Verify the nonce matches the CSRF token
          const csrfToken = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/csrf`, {
            headers: {
              'Content-Type': 'application/json',
            },
          }).then(res => res.json()).then(data => data.csrfToken);

          if (nonce !== csrfToken) {
            console.error('Invalid nonce/CSRF token');
            return null;
          }

          // Connect to database
          await dbConnect();

          // Find or create user
          let user = await User.findOne({ walletAddress: publicKey });

          if (!user) {
            // Create new user with default values
            const username = `Player_${publicKey.slice(0, 8)}`;
            user = new User({
              walletAddress: publicKey,
              username,
              level: 1,
              xp: 0,
              stats: {
                gamesPlayed: 0,
                totalScore: 0,
                winRate: 0,
                avgGameTime: 0,
              },
              achievements: [],
            });
            
            await user.save();
            console.log('Created new user:', username);
          } else {
            console.log('Found existing user:', user.username);
          }

          // Reset rate limit on successful authentication
          AuthRateLimit.resetRateLimit(publicKey);

          // Return user data for session
          return {
            id: user._id.toString(),
            walletAddress: user.walletAddress,
            username: user.username,
            image: user.avatar || null,
          };
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).walletAddress = (user as any).walletAddress;
        (token as any).username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      // Add wallet address and username to the session object
      if (session.user) {
        (session.user as any).walletAddress = (token as any).walletAddress;
        (session.user as any).username = (token as any).username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signIn(message) {
      console.log('User signed in:', {
        walletAddress: (message.user as any).walletAddress,
        username: (message.user as any).username,
        isNewUser: message.isNewUser,
      });
    },
    async signOut(message) {
      console.log('User signed out:', (message.session?.user as any)?.walletAddress);
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
