'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  TrophyIcon, 
  CrownIcon, 
  StarIcon,
  ClockIcon,
  FilterIcon,
  ArrowLeftIcon,
  RefreshCwIcon
} from 'lucide-react';
import Link from 'next/link';

// Extended leaderboard data
const leaderboardData = [
  { rank: 1, username: 'SnakeKing', earnings: '$2,450.75', score: 12450, avatar: '👑', gamesPlayed: 89, winRate: '78%', lastActive: '2 min ago' },
  { rank: 2, username: 'CobraStrike', earnings: '$1,875.22', score: 9280, avatar: '🐍', gamesPlayed: 67, winRate: '72%', lastActive: '5 min ago' },
  { rank: 3, username: 'VenomBite', earnings: '$1,234.56', score: 8750, avatar: '🔥', gamesPlayed: 54, winRate: '69%', lastActive: '1 hour ago' },
  { rank: 4, username: 'SlitherPro', earnings: '$987.34', score: 7600, avatar: '⚡', gamesPlayed: 43, winRate: '65%', lastActive: '3 hours ago' },
  { rank: 5, username: 'ApexPython', earnings: '$756.89', score: 6890, avatar: '🎯', gamesPlayed: 38, winRate: '61%', lastActive: '1 day ago' },
  { rank: 6, username: 'PixelMaster', earnings: '$689.23', score: 6234, avatar: '🎮', gamesPlayed: 45, winRate: '58%', lastActive: '2 days ago' },
  { rank: 7, username: 'GamerElite', earnings: '$567.89', score: 5876, avatar: '⭐', gamesPlayed: 32, winRate: '55%', lastActive: '3 days ago' },
  { rank: 8, username: 'ProSnaker', earnings: '$445.67', score: 5234, avatar: '🚀', gamesPlayed: 29, winRate: '52%', lastActive: '5 days ago' },
  { rank: 9, username: 'ChampPlayer', earnings: '$389.45', score: 4789, avatar: '💎', gamesPlayed: 27, winRate: '48%', lastActive: '1 week ago' },
  { rank: 10, username: 'SkillMaster', earnings: '$334.21', score: 4456, avatar: '🏆', gamesPlayed: 25, winRate: '45%', lastActive: '1 week ago' },
];

const timeFilters = ['All Time', 'This Week', 'This Month', 'Today'];

export default function LeaderboardPage() {
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All Time');

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <TrophyIcon className="h-6 w-6 text-gray-300" />;
      case 3:
        return <TrophyIcon className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-500 to-amber-600';
      case 2:
        return 'from-gray-400 to-gray-500';
      case 3:
        return 'from-amber-600 to-amber-700';
      default:
        return 'from-blue-500 to-purple-600';
    }
  };

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
          
          <button className="flex items-center space-x-2 text-gray-400 hover:text-blue-400 transition-colors">
            <RefreshCwIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-3 mb-4">
            <TrophyIcon className="h-8 w-8 text-yellow-400" />
            <h1 className="text-4xl font-bold gradient-text">Snake Leaderboard</h1>
            <TrophyIcon className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-gray-300">Top players competing for Snake supremacy</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-effect rounded-2xl p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <FilterIcon className="h-5 w-5 text-gray-400" />
              <span className="text-white font-medium">Time Period:</span>
            </div>
            
            <div className="flex space-x-2">
              {timeFilters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedTimeFilter(filter)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedTimeFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          {leaderboardData.slice(0, 3).map((player, index) => (
            <div key={player.rank} className={`order-${index === 0 ? '2' : index === 1 ? '1' : '3'} md:order-${index + 1}`}>
              <div className="glass-effect rounded-2xl p-6 text-center relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRankBadgeColor(player.rank)}`}></div>
                
                <div className="flex items-center justify-center mb-4">
                  {getRankIcon(player.rank)}
                </div>
                
                <div className="text-4xl mb-3">{player.avatar}</div>
                <h3 className="text-xl font-bold text-white mb-2">{player.username}</h3>
                
                <div className="space-y-2 mb-4">
                  <div className="text-2xl font-bold text-green-400">{player.earnings}</div>
                  <div className="text-gray-400 text-sm">Score: {player.score.toLocaleString()}</div>
                  <div className="text-gray-400 text-sm">Win Rate: {player.winRate}</div>
                </div>
                
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getRankBadgeColor(player.rank)} text-white font-bold text-lg`}>
                  #{player.rank}
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Full Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-effect rounded-2xl p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center space-x-2">
            <StarIcon className="h-6 w-6 text-purple-400" />
            <span>Full Rankings</span>
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-4 px-4 text-gray-300">Rank</th>
                  <th className="text-left py-4 px-4 text-gray-300">Player</th>
                  <th className="text-left py-4 px-4 text-gray-300">Score</th>
                  <th className="text-left py-4 px-4 text-gray-300">Earnings</th>
                  <th className="text-left py-4 px-4 text-gray-300">Games</th>
                  <th className="text-left py-4 px-4 text-gray-300">Win Rate</th>
                  <th className="text-left py-4 px-4 text-gray-300">Last Active</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((player, index) => (
                  <motion.tr
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className="border-b border-gray-800 hover:bg-gray-800/20 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r ${getRankBadgeColor(player.rank)} text-white font-bold text-sm`}>
                          {player.rank}
                        </div>
                        {player.rank <= 3 && getRankIcon(player.rank)}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{player.avatar}</span>
                        <span className="text-white font-medium">{player.username}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-white font-medium">{player.score.toLocaleString()}</td>
                    <td className="py-4 px-4 text-green-400 font-bold">{player.earnings}</td>
                    <td className="py-4 px-4 text-gray-300">{player.gamesPlayed}</td>
                    <td className="py-4 px-4">
                      <span className={`${
                        parseInt(player.winRate) >= 70 ? 'text-green-400' :
                        parseInt(player.winRate) >= 50 ? 'text-yellow-400' : 'text-red-400'
                      } font-medium`}>
                        {player.winRate}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">{player.lastActive}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8"
        >
          <div className="glass-effect rounded-xl p-6 text-center">
            <TrophyIcon className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">12,450</div>
            <div className="text-gray-400 text-sm">Highest Score</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <StarIcon className="h-8 w-8 text-purple-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">$87,450</div>
            <div className="text-gray-400 text-sm">Total Winnings</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <ClockIcon className="h-8 w-8 text-blue-400 mx-auto mb-3" />
            <div className="text-2xl font-bold text-white">1,247</div>
            <div className="text-gray-400 text-sm">Games Played</div>
          </div>
          
          <div className="glass-effect rounded-xl p-6 text-center">
            <div className="text-green-400 text-2xl mb-3">👥</div>
            <div className="text-2xl font-bold text-white">89</div>
            <div className="text-gray-400 text-sm">Active Players</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
