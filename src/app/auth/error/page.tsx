'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration. Please try again later.',
          canRetry: true,
        };
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          canRetry: false,
        };
      case 'Verification':
        return {
          title: 'Verification Failed',
          description: 'The signature verification failed. Please try signing the message again.',
          canRetry: true,
        };
      case 'Default':
      default:
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication. Please try again.',
          canRetry: true,
        };
    }
  };

  const errorDetails = getErrorDetails(error);

  useEffect(() => {
    console.error('Authentication error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-white mb-2">
            {errorDetails.title}
          </h1>
          
          <p className="text-gray-400 mb-6">
            {errorDetails.description}
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6">
              <p className="text-red-400 text-sm font-mono">
                Error Code: {error}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {errorDetails.canRetry && (
            <Link
              href="/auth/signin"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Try Again
            </Link>
          )}

          <Link
            href="/"
            className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-300 hover:text-white hover:border-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Go Home
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-500 text-xs">
            If you continue to experience issues, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
