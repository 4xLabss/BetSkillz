'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  UsersIcon, 
  RefreshCwIcon,
  PlayIcon,
  UserPlusIcon,
  DiscIcon,
  GamepadIcon,
  StarIcon,
  ClockIcon,
  TargetIcon
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import gamesData from '@/data/games.json';
import { Game } from '@/types/game';
import WalletManager from '@/components/WalletManager';

// Mock data for demonstration - Snake focused
const mockLeaderboard = [
  { rank: 1, username: 'SnakeKing', earnings: '$2,450.75', score: 12450, avatar: '👑' },
  { rank: 2, username: 'CobraStrike', earnings: '$1,875.22', score: 9280, avatar: '�' },
  { rank: 3, username: 'VenomBite', earnings: '$1,234.56', score: 8750, avatar: '🔥' },
  { rank: 4, username: 'SlitherPro', earnings: '$987.34', score: 7600, avatar: '⚡' },
  { rank: 5, username: 'ApexPython', earnings: '$756.89', score: 6890, avatar: '🎯' },
];

const mockStats = {
  playersInGame: 23,
  globalWinnings: '$87,450',
  totalGames: 1247,
  averageScore: 850
};

const betAmounts = ['$1', '$5', '$10', '$20'];

export default function HomePage() {
  const { connected } = useWallet();
  const [selectedBet, setSelectedBet] = useState('$5');
  const [onlineCount] = useState(89);
  const [snakeGame, setSnakeGame] = useState<Game | null>(null);

  useEffect(() => {
    // Load Snake game data
    const games = gamesData as Game[];
    const game = games.find((g: Game) => g.id === 'snake-classic');
    setSnakeGame(game || null);
  }, [connected]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Leaderboard */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Leaderboard */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <TrophyIcon className="h-5 w-5 text-yellow-400" />
                <h2 className="text-lg font-bold text-white">Snake Leaderboard</h2>
                <span className="text-blue-400 text-sm">Live</span>
              </div>
              
              <div className="space-y-3">
                {mockLeaderboard.map((player) => (
                  <div key={player.rank} className="leaderboard-item">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-sm">
                        {player.rank}
                      </div>
                      <div>
                        <div className="text-white font-medium text-sm">{player.username}</div>
                        <div className="text-green-400 font-bold text-sm">{player.earnings}</div>
                        <div className="text-gray-400 text-xs">Score: {player.score.toLocaleString()}</div>
                      </div>
                    </div>
                    <div className="text-2xl">{player.avatar}</div>
                  </div>
                ))}
              </div>
              
              <Link 
                href="/leaderboard" 
                className="block mt-4 text-center text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
              >
                View Full Leaderboard
              </Link>
            </motion.div>

            {/* Friends */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <UsersIcon className="h-5 w-5 text-blue-400" />
                  <h2 className="text-lg font-bold text-white">Friends</h2>
                </div>
                <RefreshCwIcon className="h-4 w-4 text-gray-400 cursor-pointer hover:text-blue-400 transition-colors" />
              </div>
              
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">0 playing Snake</div>
                <div className="text-gray-500 text-sm mb-4">No friends... add some!</div>
                <button className="casino-button w-full">
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add Friends
                </button>
              </div>
            </motion.div>
          </div>

          {/* Main Game Area - Snake Game */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Snake Game Lobby */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="game-lobby-card"
            >
              <div className="text-center mb-8">
                <div className="text-8xl mb-4">🐍</div>
                <h1 className="text-4xl font-bold gradient-text mb-2">SNAKE CLASSIC</h1>
                <p className="text-gray-300">Skill-Based Snake Gaming • Earn While You Play</p>
              </div>

              {/* Game Info */}
              {snakeGame && (
                <div className="mb-8">
                  <p className="text-gray-300 text-center mb-6">{snakeGame.description}</p>
                  
                  {/* Game Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="glass-effect rounded-xl p-3 text-center">
                      <UsersIcon className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                      <div className="text-white font-bold">{snakeGame.stats.dailyPlayers}</div>
                      <div className="text-gray-400 text-xs">Today</div>
                    </div>
                    <div className="glass-effect rounded-xl p-3 text-center">
                      <TargetIcon className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                      <div className="text-white font-bold">{snakeGame.stats.averageScore.toLocaleString()}</div>
                      <div className="text-gray-400 text-xs">Avg Score</div>
                    </div>
                    <div className="glass-effect rounded-xl p-3 text-center">
                      <StarIcon className="h-5 w-5 text-yellow-400 mx-auto mb-1" />
                      <div className="text-white font-bold">{snakeGame.stats.highestScore.toLocaleString()}</div>
                      <div className="text-gray-400 text-xs">High Score</div>
                    </div>
                    <div className="glass-effect rounded-xl p-3 text-center">
                      <ClockIcon className="h-5 w-5 text-green-400 mx-auto mb-1" />
                      <div className="text-white font-bold">{snakeGame.averageGameTime}</div>
                      <div className="text-gray-400 text-xs">Avg Time</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bet Amount Selection */}
              <div className="mb-8">
                <h3 className="text-white font-bold text-center mb-4">Choose Your Bet</h3>
                <div className="flex justify-center space-x-4">
                  {betAmounts.map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setSelectedBet(amount)}
                      className={`bet-button ${selectedBet === amount ? 'active' : ''}`}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Join Game Button */}
              <div className="text-center mb-8">
                {snakeGame?.status === 'coming-soon' ? (
                  <button 
                    disabled
                    className="px-12 py-4 bg-gray-600/50 text-gray-400 rounded-lg font-bold text-xl cursor-not-allowed"
                  >
                    Coming Soon
                  </button>
                ) : (
                  <button className="casino-button text-xl px-12 py-4 neon-glow">
                    <PlayIcon className="h-6 w-6 mr-3" />
                    START SNAKE GAME
                  </button>
                )}
              </div>

              {/* Global Stats */}
              <div className="grid grid-cols-2 gap-6 text-center">
                <div className="glass-effect rounded-xl p-4">
                  <div className="text-2xl font-bold text-blue-400">{mockStats.playersInGame}</div>
                  <div className="text-gray-400 text-sm">Players Online</div>
                </div>
                <div className="glass-effect rounded-xl p-4">
                  <div className="text-2xl font-bold text-green-400">{mockStats.globalWinnings}</div>
                  <div className="text-gray-400 text-sm">Total Winnings</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Wallet */}
            <WalletManager />

            {/* How to Play */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="flex items-center space-x-2 mb-4">
                <GamepadIcon className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">How to Play</h2>
              </div>
              
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">1.</span>
                  <span>Connect your wallet and choose bet amount</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">2.</span>
                  <span>Use arrow keys to control your snake</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">3.</span>
                  <span>Eat food to grow and increase score</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">4.</span>
                  <span>Avoid walls and your own tail</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-400">5.</span>
                  <span>Higher scores = bigger winnings!</span>
                </div>
              </div>
            </motion.div>

            {/* Discord */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-effect rounded-2xl p-6"
            >
              <div className="text-center">
                <DiscIcon className="h-8 w-8 text-indigo-400 mx-auto mb-3" />
                <h3 className="text-white font-bold mb-2">Join Discord!</h3>
                <p className="text-gray-400 text-sm mb-4">Connect with Snake players</p>
                <a 
                  href="https://discord.gg/betskillz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="casino-button w-full block text-center"
                >
                  Join Now
                </a>
              </div>
            </motion.div>

            {/* Online Status */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="glass-effect rounded-2xl p-4 text-center"
            >
              <div className="flex items-center justify-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">{onlineCount} players online</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

