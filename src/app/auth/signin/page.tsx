'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSolanaAuth } from '@/hooks/useSolanaAuth';
import { useWallet } from '@/components/WalletProvider';

export default function SignInPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const [isConnecting, setIsConnecting] = useState(false);
  
  const { wallet } = useWallet();
  const { 
    isAuthenticated, 
    isLoading, 
    signInWithSolana, 
    error: authError, 
    clearError 
  } = useSolanaAuth();

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to profile or home page after successful authentication
      window.location.href = '/profile';
    }
  }, [isAuthenticated]);

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    clearError();
    
    try {
      await wallet.connect();
    } catch (err) {
      console.error('Wallet connection failed:', err);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSignIn = async () => {
    clearError();
    const success = await signInWithSolana();
    if (success) {
      console.log('Sign in successful');
    }
  };

  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'CredentialsSignin':
        return 'Invalid signature or authentication failed';
      case 'SessionRequired':
        return 'Please sign in to access this page';
      default:
        return errorCode || 'An unknown error occurred';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Sign in to BetSkillz
          </h1>
          <p className="text-gray-600">
            Connect your Solana wallet to get started
          </p>
        </div>

        <div className="space-y-6">
          {/* Error Display */}
          {(error || authError) && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">
                {authError || getErrorMessage(error)}
              </p>
            </div>
          )}

          {/* Wallet Connection */}
          {!wallet.connected ? (
            <button
              onClick={handleConnectWallet}
              disabled={isConnecting || wallet.connecting}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnecting || wallet.connecting ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Connecting...
                </div>
              ) : (
                'Connect Wallet'
              )}
            </button>
          ) : (
            <div className="space-y-4">
              {/* Wallet Connected */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                  <div>
                    <p className="text-emerald-700 text-sm font-medium">
                      Wallet Connected
                    </p>
                    <p className="text-gray-600 text-xs font-mono">
                      {wallet.publicKey?.slice(0, 8)}...{wallet.publicKey?.slice(-8)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <button
                onClick={handleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </div>
                ) : (
                  'Sign Message & Authenticate'
                )}
              </button>

              {/* Disconnect Option */}
              <button
                onClick={wallet.disconnect}
                className="w-full text-gray-500 hover:text-gray-700 text-sm underline"
              >
                Disconnect Wallet
              </button>
            </div>
          )}
        </div>

        {/* Information */}
        <div className="text-center">
          <p className="text-gray-500 text-xs">
            By connecting your wallet, you agree to sign a message to verify ownership.
            Your private key never leaves your wallet.
          </p>
        </div>
      </div>
    </div>
  );
}
