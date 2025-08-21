'use client';

import React from 'react';
import Link from 'next/link';
import { TwitterIcon, MessageCircleIcon, GithubIcon } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Logo and Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Link href="/" className="flex items-center">
              <img
                src="/Logo-removebg.png"
                alt="BetSkillz Logo"
                height={32}
                width={128}
                onError={(e) => {
                  e.currentTarget.src = '/api/placeholder/32/32';
                }}
              />
            </Link>
            <p className="text-gray-600 text-xs">
              Web3 gaming hub for competitive browser games
            </p>
          </div>

          {/* Links and Social */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            {/* Quick Links */}
            <div className="flex items-center gap-4">
              <Link href="/games" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Games
              </Link>
              <Link href="/leaderboard" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Leaderboard
              </Link>
              <Link href="/profile" className="text-gray-600 hover:text-blue-600 text-sm transition-colors duration-200">
                Profile
              </Link>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-3">
              <a
                href="https://twitter.com/BetSkillz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              >
                <TwitterIcon className="h-4 w-4" />
              </a>
              <a
                href="https://discord.gg/BetSkillz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              >
                <MessageCircleIcon className="h-4 w-4" />
              </a>
              <a
                href="https://github.com/BetSkillz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 transition-colors duration-200"
              >
                <GithubIcon className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 mt-3 pt-3 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {currentYear} BetSkillz. All rights reserved.</p>
          <p className="mt-1 sm:mt-0">Built with ❤️ by 4xLabs</p>
        </div>
      </div>
    </footer>
  );
}
