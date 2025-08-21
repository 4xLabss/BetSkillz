'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSession, signIn, signOut } from 'next-auth/react';
import { GamepadIcon, UserIcon, TrophyIcon, MenuIcon, XIcon, LogOut } from 'lucide-react';
import { GlobalOnlineCounter } from './PresenceComponents';

export function Navbar() {
  const { connected, publicKey } = useWallet();
  const { data: session } = useSession();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: GamepadIcon },
    { href: '/games', label: 'Games', icon: GamepadIcon },
    { href: '/leaderboard', label: 'Leaderboard', icon: TrophyIcon },
  ];

  const handleSignIn = async () => {
    if (connected && publicKey) {
      await signIn('solana', { walletAddress: publicKey.toString() });
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <img
              src="\Logo-removebg.png"
              alt="BetSkillz Logo"
              height={55}
              width={200}
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/32/32';
              }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side - Online Counter & Wallet */}
          <div className="flex items-center space-x-4">
            {/* Online Counter */}
            <div className="hidden lg:block">
              <GlobalOnlineCounter 
                className="text-gray-600"
                showLabel={true}
                pollInterval={120000}
              />
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {/* Solana Wallet Button */}
              <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700" />
              
              {/* Session Management */}
              {connected && !session && (
                <button
                  onClick={handleSignIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Sign In
                </button>
              )}

              {session && (
                <div className="flex items-center space-x-2">
                  {/* User Profile */}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">
                      {(session.user as { username?: string })?.username || 'Profile'}
                    </span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-1 text-gray-500 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-500 hover:text-gray-700 p-2"
              >
                {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Mobile wallet and session management */}
              <div className="border-t border-gray-200 pt-4 pb-3">
                <div className="flex items-center px-5">
                  <div className="flex-shrink-0">
                    <GlobalOnlineCounter className="text-gray-600" showLabel={true} />
                  </div>
                </div>
                
                {session && (
                  <div className="mt-3 px-2 space-y-1">
                    <Link
                      href="/profile"
                      className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMenuOpen(false);
                      }}
                      className="w-full text-left flex items-center space-x-2 text-gray-600 hover:text-red-600 px-3 py-2 rounded-md text-base font-medium"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
