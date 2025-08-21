'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useSession, signIn, signOut } from 'next-auth/react';
import { 
  GamepadIcon, 
  UserIcon, 
  TrophyIcon, 
  MenuIcon, 
  XIcon, 
  LogOut
} from 'lucide-react';
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
    <nav className="bg-[#1a1a2e]/80 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/image.png"
              alt="BetSkillz Logo"
              height={60}
              width={160}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - Online Counter & Wallet */}
          <div className="flex items-center space-x-4">
            {/* Online Counter */}
            <div className="hidden lg:flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <GlobalOnlineCounter 
                className="text-gray-300 text-sm"
                showLabel={true}
                pollInterval={120000}
              />
              <span className="text-gray-400 text-sm">online</span>
            </div>

            {/* Wallet Connection */}
            <div className="flex items-center space-x-2">
              {/* Solana Wallet Button */}
              <WalletMultiButton className="!bg-gradient-to-r !from-blue-600 !to-purple-600 hover:!from-blue-700 hover:!to-purple-700 !rounded-lg !h-10 !text-sm !font-medium !transition-all !duration-200" />
              
              {/* Session Management */}
              {connected && !session && (
                <button
                  onClick={handleSignIn}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2"
                >
                  <UserIcon className="h-4 w-4" />
                  <span>Sign In</span>
                </button>
              )}

              {session && (
                <div className="flex items-center space-x-2">
                  {/* User Profile */}
                  <Link
                    href="/profile"
                    className="flex items-center space-x-2 text-gray-300 hover:text-blue-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                  >
                    <UserIcon className="h-4 w-4" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>

                  {/* Sign Out */}
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-300 hover:text-red-400 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
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
                className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
              >
                {isMenuOpen ? (
                  <XIcon className="h-6 w-6" />
                ) : (
                  <MenuIcon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {session && (
                <>
                  <Link
                    href="/profile"
                    className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5"
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
                    className="flex items-center space-x-3 text-gray-300 hover:text-red-400 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/5 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign Out</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
