'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  GamepadIcon, 
  TargetIcon,
  EditIcon,
  CopyIcon,
  CheckIcon,
  WalletIcon,
  AwardIcon
} from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';

// Mock user data
const mockUserData = {
  username: 'QuantumGamer',
  avatar: '🎮',
  level: 25,
  experience: 12750,
  totalEarnings: 3995.23,
  gamesPlayed: 234,
  winRate: 78.5,
  streak: 12,
  rank: 1,
  joinDate: '2024-01-15',
  favoriteGame: 'Cosmic Drift',
  achievements: [
    { id: 1, name: 'First Victory', icon: '🏆', description: 'Win your first game' },
    { id: 2, name: 'Streak Master', icon: '🔥', description: 'Win 10 games in a row' },
    { id: 3, name: 'High Roller', icon: '💎', description: 'Earn over $1000' },
    { id: 4, name: 'Veteran', icon: '⭐', description: 'Play 100 games' },
  ],
  recentGames: [
    { id: 1, game: 'Cosmic Drift', result: 'Win', earnings: '+$25.50', time: '2 hours ago' },
    { id: 2, game: 'Cellularity', result: 'Win', earnings: '+$18.75', time: '5 hours ago' },
    { id: 3, game: 'Voidfall', result: 'Loss', earnings: '-$10.00', time: '1 day ago' },
    { id: 4, game: 'Cosmic Drift', result: 'Win', earnings: '+$32.25', time: '1 day ago' },
  ]
};

export default function ProfilePage() {
  const { connected, publicKey } = useWallet();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userData] = useState(mockUserData);

  useEffect(() => {
    // Simulate loading user data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const copyAddress = async () => {
    if (publicKey) {
      await navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getExperienceProgress = () => {
    const currentLevelExp = userData.level * 500;
    const nextLevelExp = (userData.level + 1) * 500;
    const progress = ((userData.experience - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="glass-effect rounded-2xl p-8 text-center max-w-md">
          <WalletIcon className="h-16 w-16 text-blue-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-300 mb-6">
            Please connect your wallet to view your profile and gaming statistics.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] py-8">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-effect rounded-2xl p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-8">
            
            {/* Avatar and Basic Info */}
            <div className="text-center md:text-left">
              <div className="text-8xl mb-4">{userData.avatar}</div>
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <h1 className="text-3xl font-bold text-white">{userData.username}</h1>
                <button className="text-gray-400 hover:text-blue-400 transition-colors">
                  <EditIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-2">
                <span className="text-lg text-blue-400 font-bold">Level {userData.level}</span>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-600"
                    style={{ width: `${getExperienceProgress()}%` }}
                  />
                </div>
              </div>
              <p className="text-gray-400 text-sm mt-1">{userData.experience.toLocaleString()} XP</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-6 flex-1">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">${userData.totalEarnings.toFixed(2)}</div>
                <div className="text-gray-400 text-sm">Total Earnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">#{userData.rank}</div>
                <div className="text-gray-400 text-sm">Global Rank</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{userData.gamesPlayed}</div>
                <div className="text-gray-400 text-sm">Games Played</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{userData.winRate}%</div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
            </div>
          </div>

          {/* Wallet Address */}
          {publicKey && (
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">Wallet Address</h3>
                  <code className="text-gray-400 text-sm">
                    {publicKey.toString().slice(0, 8)}...{publicKey.toString().slice(-8)}
                  </code>
                </div>
                <button
                  onClick={copyAddress}
                  className="flex items-center space-x-2 bg-white/5 hover:bg-white/10 text-gray-300 px-3 py-2 rounded-lg transition-colors"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4 text-green-400" />
                  ) : (
                    <CopyIcon className="h-4 w-4" />
                  )}
                  <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Games */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <GamepadIcon className="h-5 w-5 text-blue-400 mr-2" />
                Recent Games
              </h2>
              
              <div className="space-y-4">
                {userData.recentGames.map((game) => (
                  <div key={game.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div>
                        <div className="text-white font-medium">{game.game}</div>
                        <div className="text-gray-400 text-sm">{game.time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-bold ${
                        game.result === 'Win' ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.result}
                      </div>
                      <div className={`text-sm ${
                        game.earnings.startsWith('+') ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {game.earnings}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Performance Stats */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <TargetIcon className="h-5 w-5 text-purple-400 mr-2" />
                Performance
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-blue-400 font-bold">{userData.winRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-700 rounded-full">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                      style={{ width: `${userData.winRate}%` }}
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Current Streak</span>
                    <span className="text-yellow-400 font-bold">{userData.streak} wins</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-full h-2 bg-gray-700 rounded-full">
                      <div 
                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full"
                        style={{ width: `${Math.min(100, (userData.streak / 20) * 100)}%` }}
                      />
                    </div>
                    <span className="text-gray-400 text-sm">/20</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            
            {/* Achievements */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <AwardIcon className="h-5 w-5 text-yellow-400 mr-2" />
                Achievements
              </h2>
              
              <div className="space-y-4">
                {userData.achievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <div className="text-2xl">{achievement.icon}</div>
                    <div>
                      <div className="text-white font-medium text-sm">{achievement.name}</div>
                      <div className="text-gray-400 text-xs">{achievement.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Profile Info */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-effect rounded-2xl p-6"
            >
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <UserIcon className="h-5 w-5 text-blue-400 mr-2" />
                Profile Info
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{new Date(userData.joinDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Favorite Game</span>
                  <span className="text-white">{userData.favoriteGame}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Level</span>
                  <span className="text-blue-400 font-bold">{userData.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience</span>
                  <span className="text-purple-400">{userData.experience.toLocaleString()} XP</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
