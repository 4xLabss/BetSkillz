'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, MedalIcon, CrownIcon, StarIcon, ClockIcon, TargetIcon, GamepadIcon } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  gameId: string;
  rank: number;
  player: {
    id: string;
    username: string;
    walletAddress: string;
    avatar: string;
    level: number;
    experience: number;
  };
  score: number;
  gameTime: string;
  timestamp: string;
  isVerified: boolean;
  kills?: number;
  deaths?: number;
  accuracy?: number;
  massGained?: number;
  cellsAbsorbed?: number;
}

interface Game {
  id: string;
  title: string;
  category: string;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [leaderboardData, gamesData] = await Promise.all([
          import('@/data/leaderboard.json'),
          import('@/data/games.json')
        ]);
        
        setLeaderboard(leaderboardData.default as unknown as LeaderboardEntry[]);
        setGames(gamesData.default as unknown as Game[]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading leaderboard data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredLeaderboard = selectedGame === 'all' 
    ? leaderboard 
    : leaderboard.filter(entry => entry.gameId === selectedGame);

  const groupedByGame = leaderboard.reduce((acc, entry) => {
    if (!acc[entry.gameId]) {
      acc[entry.gameId] = [];
    }
    acc[entry.gameId].push(entry);
    return acc;
  }, {} as Record<string, LeaderboardEntry[]>);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <CrownIcon className="h-6 w-6 text-yellow-400" />;
      case 2:
        return <MedalIcon className="h-6 w-6 text-slate-400" />;
      case 3:
        return <MedalIcon className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-gray-600 font-bold text-lg">{rank}</span>;
    }
  };

  const getRankBorder = (rank: number) => {
    switch (rank) {
      case 1:
        return 'border-yellow-400 bg-yellow-400/10';
      case 2:
        return 'border-slate-300 bg-slate-300/10';
      case 3:
        return 'border-amber-600 bg-amber-600/10';
      default:
        return 'border-gray-300 bg-white/50';
    }
  };

  const getGameStats = (entry: LeaderboardEntry) => {
    const stats = [];

    if (entry.kills !== undefined) {
      stats.push({ label: 'Kills', value: entry.kills, icon: TargetIcon });
    }
    if (entry.deaths !== undefined) {
      stats.push({ label: 'Deaths', value: entry.deaths, icon: TargetIcon });
    }
    if (entry.accuracy !== undefined) {
      stats.push({ label: 'Accuracy', value: `${entry.accuracy}%`, icon: TargetIcon });
    }
    if (entry.massGained !== undefined) {
      stats.push({ label: 'Mass', value: entry.massGained, icon: StarIcon });
    }
    if (entry.cellsAbsorbed !== undefined) {
      stats.push({ label: 'Cells', value: entry.cellsAbsorbed, icon: GamepadIcon });
    }

    return stats;
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboards...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-indigo-100 relative overflow-hidden particles cyber-grid">
      {/* Animated cosmic background elements */}
      <div className="absolute inset-0 opacity-30">
        <motion.div
          className="absolute top-20 left-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -50, 100, 0],
            scale: [1, 1.2, 0.8, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute top-1/3 right-20 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-12"
        >
          <motion.h1
            variants={itemVariants}
            className="text-4xl md:text-6xl font-bold mb-4"
          >
            <span className="bg-gradient-to-r from-amber-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Leaderboard
            </span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            See who&apos;s dominating the competition across all games
          </motion.p>
        </motion.div>

        {/* Game Filter */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-8"
        >
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700">
            <div className="flex flex-wrap gap-4 justify-center">
              <button
                onClick={() => setSelectedGame('all')}
                className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedGame === 'all'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Games
              </button>
              {games.map(game => (
                <button
                  key={game.id}
                  onClick={() => setSelectedGame(game.id)}
                  className={`px-6 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedGame === game.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {game.title}
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {selectedGame === 'all' ? (
          /* All Games View */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-12"
          >
            {Object.entries(groupedByGame).map(([gameId, entries]) => {
              const game = games.find(g => g.id === gameId);
              if (!game) return null;

              return (
                <motion.div key={gameId} variants={itemVariants}>
                  <h2 className="text-2xl font-bold mb-6 text-center">
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      {game.title}
                    </span>
                  </h2>
                  <div className="grid gap-4">
                    {entries.slice(0, 5).map((entry) => (
                      <div
                        key={entry.id}
                        className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${getRankBorder(entry.rank)}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12 rounded-full">
                              {getRankIcon(entry.rank)}
                            </div>
                            <img
                              src={entry.player.avatar}
                              alt={entry.player.username}
                              className="w-12 h-12 rounded-full border-2 border-purple-500"
                              onError={(e) => {
                                e.currentTarget.src = '/api/placeholder/48/48';
                              }}
                            />
                            <div>
                              <h3 className="font-bold text-lg">{entry.player.username}</h3>
                              <div className="flex items-center space-x-2 text-sm text-gray-400">
                                <span>Level {entry.player.level}</span>
                                {entry.isVerified && (
                                  <StarIcon className="h-4 w-4 text-yellow-400" />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-purple-400">
                              {entry.score.toLocaleString()}
                            </div>
                            <div className="text-sm text-gray-400 flex items-center space-x-1">
                              <ClockIcon className="h-4 w-4" />
                              <span>{entry.gameTime}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          /* Single Game View */
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {filteredLeaderboard.map((entry) => {
              const stats = getGameStats(entry);
              
              return (
                <motion.div
                  key={entry.id}
                  variants={itemVariants}
                  className={`p-6 rounded-xl border backdrop-blur-sm transition-all duration-300 hover:scale-105 ${getRankBorder(entry.rank)}`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between">
                    <div className="flex items-center space-x-4 mb-4 lg:mb-0">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full">
                        {getRankIcon(entry.rank)}
                      </div>
                      <img
                        src={entry.player.avatar}
                        alt={entry.player.username}
                        className="w-16 h-16 rounded-full border-2 border-purple-500"
                        onError={(e) => {
                          e.currentTarget.src = '/api/placeholder/64/64';
                        }}
                      />
                      <div>
                        <h3 className="font-bold text-xl">{entry.player.username}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-400">
                          <span>Level {entry.player.level}</span>
                          <span>•</span>
                          <span>{entry.player.experience.toLocaleString()} XP</span>
                          {entry.isVerified && (
                            <>
                              <span>•</span>
                              <StarIcon className="h-4 w-4 text-yellow-400" />
                              <span>Verified</span>
                            </>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {entry.player.walletAddress.slice(0, 8)}...{entry.player.walletAddress.slice(-8)}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-4 lg:space-y-0 lg:space-x-8">
                      {/* Game Stats */}
                      {stats.length > 0 && (
                        <div className="flex space-x-6 text-sm">
                          {stats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                              <div key={index} className="flex items-center space-x-2 text-gray-400">
                                <Icon className="h-4 w-4" />
                                <span>{stat.label}: {stat.value}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Score and Time */}
                      <div className="text-right">
                        <div className="text-3xl font-bold text-purple-400">
                          {entry.score.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-400 flex items-center space-x-1">
                          <ClockIcon className="h-4 w-4" />
                          <span>{entry.gameTime}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(entry.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={containerVariants}
          className="text-center mt-16"
        >
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 backdrop-blur-sm rounded-xl p-8 border border-purple-500/30"
          >
            <TrophyIcon className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold mb-4">Think You Can Do Better?</h3>
            <p className="text-gray-300 mb-6">
              Join the competition and show off your skills. 
              Every game is a chance to climb the leaderboard!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/games"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                Start Playing
              </a>
              <a
                href="/profile"
                className="border-2 border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
              >
                View Your Stats
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
