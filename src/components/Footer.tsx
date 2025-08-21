'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TwitterIcon, GithubIcon, DiscIcon } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1a1a2e]/80 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image
                src="/image.png"
                alt="BetSkillz Logo"
                height={60}
                width={160}
                className="h-10 w-auto"
              />
            </Link>
            <p className="text-gray-300 text-sm mb-4 max-w-md">
              The ultimate destination for skill-based betting and competitive gaming. 
              Join the future of Web3 gaming where skill meets rewards.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://twitter.com/BetSkillz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-blue-400 transition-colors"
              >
                <TwitterIcon className="h-5 w-5" />
              </a>
              <a
                href="https://discord.gg/betskillz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-indigo-400 transition-colors"
              >
                <DiscIcon className="h-5 w-5" />
              </a>
              <a
                href="https://github.com/4xlabss"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <GithubIcon className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <div className="space-y-2">
              <Link 
                href="/games" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                Browse Games
              </Link>
              <Link 
                href="/leaderboard" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                Leaderboard
              </Link>
              <Link 
                href="/profile" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                My Profile
              </Link>
            </div>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <div className="space-y-2">
              <a 
                href="mailto:support@betskillz.com" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                Contact Us
              </a>
              <a 
                href="/terms" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                Terms of Service
              </a>
              <a 
                href="/privacy" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                Privacy Policy
              </a>
              <a 
                href="/faq" 
                className="block text-gray-300 hover:text-blue-400 text-sm transition-colors"
              >
                FAQ
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © {currentYear} BetSkillz. All rights reserved.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <span className="text-gray-400 text-sm">Built on</span>
            <div className="flex items-center space-x-2">
              <span className="text-purple-400 text-sm font-medium">Solana</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
