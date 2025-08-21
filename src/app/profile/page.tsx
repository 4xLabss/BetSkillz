'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  TrophyIcon, 
  StarIcon, 
  GamepadIcon, 
  ClockIcon, 
  TargetIcon,
  EditIcon,
  ExternalLinkIcon,
  CopyIcon,
  CheckIcon
} from 'lucide-react';
import { useWallet } from '@/components/WalletProvider';

export default function ProfilePage() {
  const { wallet, user } = useWallet();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet.connected) {
      setLoading(false);
      return;
    }

    setLoading(false);
  }, [wallet.connected]);

  const copyWalletAddress = async () => {
    if (user?.walletAddress) {
      await navigator.clipboard.writeText(user.walletAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <UserIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4 text-black">Connect Your Wallet</h2>
          <p className="text-gray-600 mb-6">Connect your Phantom wallet to view your profile</p>
          <button
            onClick={wallet.connect}
            className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-gray-200 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-60 h-60 bg-gray-300 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-32 h-32 bg-gray-100 rounded-full blur-3xl"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-8"
        >
          {/* Profile Header */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-300 rounded-xl p-8"
          >
            <div className="flex flex-col lg:flex-row items-center lg:items-start space-y-6 lg:space-y-0 lg:space-x-8">
              <div className="relative">
                <img
                  src={user?.avatar}
                  alt={user?.username}
                  className="w-32 h-32 rounded-full border-4 border-black"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/128/128';
                  }}
                />
                <div className={`absolute bottom-2 right-2 w-6 h-6 rounded-full border-2 border-white ${
                  user?.isOnline ? 'bg-black' : 'bg-gray-400'
                }`}></div>
              </div>

              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start space-x-3 mb-2">
                  <h1 className="text-3xl font-bold text-black">{user?.username}</h1>
                  <button className="text-gray-400 hover:text-black transition-colors duration-200">
                    <EditIcon className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="flex items-center justify-center lg:justify-start space-x-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <StarIcon className="h-5 w-5 text-gray-800" />
                    <span className="text-lg font-semibold text-black">Level {user?.level}</span>
                  </div>
                  <div className="text-gray-600">
                    {user?.experience?.toLocaleString()} XP
                  </div>
                </div>

                <div className="flex items-center justify-center lg:justify-start space-x-2 mb-4">
                  <span className="text-sm text-gray-600">Wallet:</span>
                  <span className="font-mono text-sm text-black">
                    {user?.walletAddress?.slice(0, 8)}...{user?.walletAddress?.slice(-8)}
                  </span>
                  <button
                    onClick={copyWalletAddress}
                    className="text-gray-400 hover:text-black transition-colors duration-200"
                  >
                    {copied ? <CheckIcon className="h-4 w-4 text-black" /> : <CopyIcon className="h-4 w-4" />}
                  </button>
                </div>

                {/* Social Links */}
                {user?.socialLinks && Object.keys(user.socialLinks).length > 0 && (
                  <div className="flex items-center justify-center lg:justify-start space-x-4">
                    {user.socialLinks.twitter && (
                      <a
                        href={`https://twitter.com/${user.socialLinks.twitter.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-800 hover:text-black transition-colors duration-200 flex items-center space-x-1"
                      >
                        <span>{user.socialLinks.twitter}</span>
                        <ExternalLinkIcon className="h-4 w-4" />
                      </a>
                    )}
                    {user.socialLinks.discord && (
                      <span className="text-gray-800">{user.socialLinks.discord}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center">
              <GamepadIcon className="h-8 w-8 text-gray-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-black mb-1">
                {user?.stats?.totalGamesPlayed}
              </div>
              <div className="text-gray-600 text-sm">Games Played</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center">
              <TrophyIcon className="h-8 w-8 text-gray-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-black mb-1">
                {user?.stats?.totalScore?.toLocaleString()}
              </div>
              <div className="text-gray-600 text-sm">Total Score</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center">
              <TargetIcon className="h-8 w-8 text-gray-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-black mb-1">
                {user?.stats?.winRate}%
              </div>
              <div className="text-gray-600 text-sm">Win Rate</div>
            </div>

            <div className="bg-white border border-gray-300 rounded-xl p-6 text-center">
              <ClockIcon className="h-8 w-8 text-gray-800 mx-auto mb-2" />
              <div className="text-2xl font-bold text-black mb-1">
                {user?.stats?.averageGameTime}
              </div>
              <div className="text-gray-600 text-sm">Avg Game Time</div>
            </div>
          </motion.div>

          {/* Favorite Game */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-300 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center space-x-3 text-black">
              <GamepadIcon className="h-6 w-6 text-gray-800" />
              <span>Favorite Game</span>
            </h2>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-black mb-2">
                {user?.stats?.favoriteGame?.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
              </div>
              <p className="text-gray-600">Most played game</p>
            </div>
          </motion.div>

          {/* Account Settings */}
          <motion.div
            variants={itemVariants}
            className="bg-white border border-gray-300 rounded-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-6 text-black">Settings</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-black">Notifications</span>
                <button className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  user?.preferences?.notifications ? 'bg-black' : 'bg-gray-400'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    user?.preferences?.notifications ? 'transform translate-x-6' : 'transform translate-x-1'
                  }`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-black">Sound Effects</span>
                <button className={`w-12 h-6 rounded-full transition-colors duration-200 ${
                  user?.preferences?.soundEffects ? 'bg-black' : 'bg-gray-400'
                }`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-200 ${
                    user?.preferences?.soundEffects ? 'transform translate-x-6' : 'transform translate-x-1'
                  }`}></div>
                </button>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-black">Music Volume</span>
                <div className="flex items-center space-x-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={user?.preferences?.musicVolume || 50}
                    className="w-24"
                    readOnly
                  />
                  <span className="text-sm text-gray-600 w-8">{user?.preferences?.musicVolume}%</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
