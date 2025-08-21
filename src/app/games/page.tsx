'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  GamepadIcon, 
  ClockIcon,
  StarIcon,
  AlertCircleIcon,
  ArrowLeftIcon
} from 'lucide-react';
import Link from 'next/link';

export default function GamesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
          </div>
        </div>

        {/* Coming Soon Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-20"
        >
          <div className="glass-effect rounded-3xl p-12 mx-auto max-w-2xl">
            <div className="text-8xl mb-8">🐍</div>
            
            <h1 className="text-5xl font-bold gradient-text mb-4">
              SNAKE GAME
            </h1>
            
            <div className="flex items-center justify-center space-x-2 mb-6">
              <ClockIcon className="h-6 w-6 text-yellow-400" />
              <span className="text-2xl font-bold text-yellow-400">COMING SOON</span>
            </div>
            
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">
              Get ready for the ultimate skill-based Snake gaming experience! 
              Compete with players worldwide, earn real rewards, and climb the leaderboard.
            </p>

            {/* Features Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="glass-effect rounded-xl p-6">
                <GamepadIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Skill-Based Gaming</h3>
                <p className="text-gray-400 text-sm">Pure skill determines your winnings</p>
              </div>
              
              <div className="glass-effect rounded-xl p-6">
                <StarIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Real Rewards</h3>
                <p className="text-gray-400 text-sm">Earn cryptocurrency for high scores</p>
              </div>
              
              <div className="glass-effect rounded-xl p-6">
                <AlertCircleIcon className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Fair Play</h3>
                <p className="text-gray-400 text-sm">Transparent and secure gameplay</p>
              </div>
            </div>

            {/* Notify Section */}
            <div className="glass-effect rounded-xl p-6 mb-8">
              <h3 className="text-white font-bold mb-4">Get Notified When We Launch</h3>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="casino-button px-6 py-3">
                  Notify Me
                </button>
              </div>
            </div>

            {/* Development Progress */}
            <div className="text-left">
              <h3 className="text-white font-bold mb-4 text-center">Development Progress</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Game Engine</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-green-400 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <span className="text-green-400 text-sm">85%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Multiplayer System</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-yellow-400 text-sm">60%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Betting Integration</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-400 h-2 rounded-full" style={{ width: '40%' }}></div>
                    </div>
                    <span className="text-blue-400 text-sm">40%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Discord Community */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center"
        >
          <div className="glass-effect rounded-2xl p-8 max-w-md mx-auto">
            <h3 className="text-white font-bold mb-4">Join Our Community</h3>
            <p className="text-gray-400 mb-6">
              Stay updated on development progress and be the first to play!
            </p>
            <a 
              href="https://discord.gg/betskillz" 
              target="_blank" 
              rel="noopener noreferrer"
              className="casino-button w-full block text-center"
            >
              Join Discord
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
