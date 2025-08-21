'use client';

import { useState, useCallback } from 'react';
import { useSession, signIn, signOut, getCsrfToken } from 'next-auth/react';
import { useWallet } from '@/components/WalletProvider';
import { SigninMessage } from '@/lib/SigninMessage';
import bs58 from 'bs58';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    walletAddress: string;
    username: string;
    image?: string;
  } | null;
  error: string | null;
}

export interface AuthActions {
  signInWithSolana: () => Promise<boolean>;
  signOutUser: () => Promise<void>;
  clearError: () => void;
}

export function useSolanaAuth(): AuthState & AuthActions {
  const { data: session, status } = useSession();
  const { wallet } = useWallet();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const signInWithSolana = useCallback(async (): Promise<boolean> => {
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      setError('Please connect your wallet first');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get CSRF token from NextAuth
      const csrfToken = await getCsrfToken();
      if (!csrfToken) {
        throw new Error('Failed to get CSRF token');
      }

      // Create the signin message
      const domain = window.location.host;
      const statement = 'Sign this message to authenticate with BetSkillz';
      
      const signinMessage = new SigninMessage({
        domain,
        publicKey: wallet.publicKey,
        nonce: csrfToken,
        statement,
      });

      // Prepare the message to be signed
      const message = signinMessage.prepare();
      const messageBytes = new TextEncoder().encode(message);

      // Sign the message using the wallet
      const signatureBytes = await wallet.signMessage(messageBytes);
      const signature = bs58.encode(signatureBytes);

      // Create the message object for the backend
      const messageObject = {
        domain,
        publicKey: wallet.publicKey,
        nonce: csrfToken,
        statement,
      };

      // Sign in with NextAuth using the credentials provider
      const result = await signIn('solana', {
        message: JSON.stringify(messageObject),
        signature,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      if (result?.ok) {
        console.log('Successfully signed in with Solana wallet');
        return true;
      }

      throw new Error('Sign in failed');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
      console.error('Solana auth error:', err);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  const signOutUser = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      await signOut({ redirect: false });
      await wallet.disconnect();
      console.log('Successfully signed out');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Sign out failed';
      setError(errorMessage);
      console.error('Sign out error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [wallet]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isAuthenticated: !!session?.user,
    isLoading: status === 'loading' || isLoading,
    user: session?.user ? {
      walletAddress: (session.user as any).walletAddress,
      username: (session.user as any).username,
      image: session.user.image || undefined,
    } : null,
    error,
    signInWithSolana,
    signOutUser,
    clearError,
  };
}
