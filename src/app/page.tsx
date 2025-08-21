'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { PlayIcon, TrophyIcon, UsersIcon, StarIcon, ArrowRightIcon } from 'lucide-react';
import { useWallet } from '@/components/WalletProvider';
import gamesData from '@/data/games.json';

interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  category: string;
  difficulty: string;
  maxPlayers: number;
  averageGameTime: string;
  tags: string[];
  stats: {
    totalPlayers: number;
    dailyPlayers: number;
  };
  gameUrl: string;
}

export default function HomePage() {
  const { wallet } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setGames(gamesData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading BetSkillz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
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
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6"
            >
              <span className="text-black">
                Welcome to BetSkillz
              </span>
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              The ultimate Web3 gaming hub where skill meets blockchain. 
              Play addictive browser games, climb leaderboards, and earn rewards.
            </motion.p>
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {wallet.connected ? (
                <Link
                  href="/games"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 flex items-center space-x-2"
                >
                  <PlayIcon className="h-5 w-5" />
                  <span>Start Playing</span>
                </Link>
              ) : (
                <button
                  onClick={wallet.connect}
                  disabled={wallet.connecting}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                >
                  {wallet.connecting ? 'Connecting...' : 'Connect Wallet to Play'}
                </button>
              )}
              <Link
                href="/leaderboard"
                className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 flex items-center space-x-2"
              >
                <TrophyIcon className="h-5 w-5" />
                <span>View Leaderboard</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Background decorations */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-20 h-20 bg-blue-500/20 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-32 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-cyan-500/20 rounded-full blur-xl"></div>
        </div>
      </section>

      {/* Featured Games Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2
              variants={itemVariants}
              className="text-4xl font-bold text-center mb-12"
            >
              Featured Games
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {games.map((game) => (
                  <motion.div
                    key={game.id}
                    variants={itemVariants}
                    className="game-card bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-lg rounded-xl overflow-hidden border border-gray-200/50 shadow-xl group perspective-1000"
                  >
                    <div className="relative overflow-hidden">
                      <motion.img
                        src={`https://picsum.photos/400/240?random=${game.id}&blur=1`}
                        alt={game.title}
                        className="w-full h-48 object-cover group-hover:scale-110 transition-all duration-500"
                        style={{
                          filter: 'brightness(0.8) contrast(1.2)',
                        }}
                        whileHover={{ scale: 1.1, rotateY: 5 }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Animated overlay */}
                      <motion.div
                        className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        animate={{
                          background: [
                            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 80% 50%, rgba(99, 102, 241, 0.2) 0%, transparent 50%)',
                            'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      
                      <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-medium text-gray-700">
                        {game.category}
                      </div>
                      
                      {/* Enhanced play overlay */}
                      <motion.div
                        className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                        initial={{ scale: 0, rotate: 0 }}
                        whileHover={{ scale: 1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        <motion.div
                          className="bg-blue-500/30 backdrop-blur-md rounded-full p-4 border border-blue-400/50 energy-pulse"
                          whileHover={{ scale: 1.2 }}
                        >
                          <PlayIcon className="h-8 w-8 text-blue-600" fill="currentColor" />
                        </motion.div>
                      </motion.div>
                    </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{game.title}</h3>
                    <p className="text-gray-600 mb-4 text-sm line-clamp-2">{game.description}</p>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <UsersIcon className="h-4 w-4" />
                          <span>{game.stats.dailyPlayers} online</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <StarIcon className="h-4 w-4" />
                          <span>{game.difficulty}</span>
                        </div>
                      </div>
                    </div>
                    <motion.div
                      whileHover={{ scale: 1.05, rotateX: 5 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-full"
                    >
                      <Link
                        href={game.gameUrl}
                        className="w-full bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 group relative overflow-hidden shadow-lg hover:shadow-blue-500/25 btn-3d"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          animate={{
                            x: [-100, 100],
                          }}
                          transition={{
                            duration: 1.5,
                            repeat: Infinity,
                            ease: "linear"
                          }}
                        />
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          className="relative z-10"
                        >
                          <PlayIcon className="h-5 w-5" fill="currentColor" />
                        </motion.div>
                        <span className="relative z-10 font-bold">PLAY NOW</span>
                        <motion.div
                          animate={{ x: [0, 5, 0] }}
                          transition={{ duration: 1, repeat: Infinity }}
                          className="relative z-10"
                        >
                          <ArrowRightIcon className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                        </motion.div>
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 bg-blue-50/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center"
          >
            <motion.div variants={itemVariants} className="game-card bg-gradient-to-br from-white/80 to-blue-50/60 backdrop-blur-sm rounded-xl p-6 border border-blue-200 hover:border-blue-400 transition-all duration-300 group">
              <motion.div 
                className="text-4xl font-bold text-blue-600 mb-2"
                animate={{ 
                  textShadow: [
                    '0 0 5px rgba(59, 130, 246, 0.3)',
                    '0 0 10px rgba(59, 130, 246, 0.5)',
                    '0 0 5px rgba(59, 130, 246, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {games.reduce((total, game) => total + game.stats.totalPlayers, 0).toLocaleString()}
              </motion.div>
              <div className="text-gray-600 font-medium">Total Players</div>
            </motion.div>
            <motion.div variants={itemVariants} className="game-card bg-gradient-to-br from-white/80 to-indigo-50/60 backdrop-blur-sm rounded-xl p-6 border border-indigo-200 hover:border-indigo-400 transition-all duration-300 group">
              <motion.div 
                className="text-4xl font-bold text-indigo-600 mb-2"
                animate={{ 
                  textShadow: [
                    '0 0 5px rgba(99, 102, 241, 0.3)',
                    '0 0 10px rgba(99, 102, 241, 0.5)',
                    '0 0 5px rgba(99, 102, 241, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                {games.reduce((total, game) => total + game.stats.dailyPlayers, 0).toLocaleString()}
              </motion.div>
              <div className="text-gray-600 font-medium">Daily Active</div>
            </motion.div>
            <motion.div variants={itemVariants} className="game-card bg-gradient-to-br from-white/80 to-emerald-50/60 backdrop-blur-sm rounded-xl p-6 border border-emerald-200 hover:border-emerald-400 transition-all duration-300 group">
              <motion.div 
                className="text-4xl font-bold text-emerald-600 mb-2"
                animate={{ 
                  textShadow: [
                    '0 0 5px rgba(16, 185, 129, 0.3)',
                    '0 0 10px rgba(16, 185, 129, 0.5)',
                    '0 0 5px rgba(16, 185, 129, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                {games.length}
              </motion.div>
              <div className="text-gray-600 font-medium">Games Available</div>
            </motion.div>
            <motion.div variants={itemVariants} className="game-card bg-gradient-to-br from-white/80 to-amber-50/60 backdrop-blur-sm rounded-xl p-6 border border-amber-200 hover:border-amber-400 transition-all duration-300 group">
              <motion.div 
                className="text-4xl font-bold text-amber-600 mb-2"
                animate={{ 
                  textShadow: [
                    '0 0 5px rgba(245, 158, 11, 0.3)',
                    '0 0 10px rgba(245, 158, 11, 0.5)',
                    '0 0 5px rgba(245, 158, 11, 0.3)',
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                24/7
              </motion.div>
              <div className="text-gray-600 font-medium">Always Online</div>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
