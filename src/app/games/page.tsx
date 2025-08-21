'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, UsersIcon, StarIcon, ClockIcon, TagIcon, SearchIcon, FilterIcon, GamepadIcon, TrophyIcon, ChevronDownIcon } from 'lucide-react';
import { useWallet } from '@/components/WalletProvider';
import { PresenceIndicator } from '@/components/PresenceComponents';

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
  isActive: boolean;
  stats: {
    totalPlayers: number;
    dailyPlayers: number;
    averageScore: number;
    highestScore: number;
  };
  controls: {
    [key: string]: string;
  };
  gameUrl: string;
}

export default function GamesPage() {
  const { wallet } = useWallet();
  const [games, setGames] = useState<Game[]>([]);
  const [filteredGames, setFilteredGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  
  // Custom dropdown states
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [difficultyDropdownOpen, setDifficultyDropdownOpen] = useState(false);

  // Refs for click-outside detection
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const difficultyDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
      if (difficultyDropdownRef.current && !difficultyDropdownRef.current.contains(event.target as Node)) {
        setDifficultyDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const loadGames = async () => {
      try {
        const gamesData = await import('@/data/games.json');
        setGames(gamesData.default as unknown as Game[]);
        setFilteredGames(gamesData.default as unknown as Game[]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading games:', error);
        setLoading(false);
      }
    };

    loadGames();
  }, []);

  useEffect(() => {
    let filtered = games;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(game => game.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(game => game.difficulty === selectedDifficulty);
    }

    setFilteredGames(filtered);
  }, [games, searchTerm, selectedCategory, selectedDifficulty]);

  const categories = ['all', ...new Set(games.map(game => game.category))];
  const difficulties = ['all', ...new Set(games.map(game => game.difficulty))];

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
          <p className="text-gray-600">Loading games...</p>
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
          className="absolute top-1/3 right-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, -80, 60, 0],
            y: [0, 80, -40, 0],
            scale: [1, 0.8, 1.3, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-32 h-32 bg-pink-500/10 rounded-full blur-3xl"
          animate={{
            x: [0, 120, -80, 0],
            y: [0, -60, 40, 0],
            scale: [1, 1.4, 0.9, 1],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10 min-h-screen">
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="text-center mb-16"
        >
          <motion.div
            variants={itemVariants}
            className="space-y-4"
          >
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Game Library
              </span>
            </h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Choose your adventure from our collection of competitive browser games. 
              Battle players worldwide and climb the leaderboards!
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-400 mt-6">
              <div className="flex items-center space-x-2">
                <GamepadIcon className="h-5 w-5 text-purple-400" />
                <span>{games.length} Games Available</span>
              </div>
              <div className="flex items-center space-x-2">
                <UsersIcon className="h-5 w-5 text-blue-400" />
                <span>Multiplayer Ready</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrophyIcon className="h-5 w-5 text-yellow-400" />
                <span>Competitive Ranked</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Enhanced Filters Section */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mb-16 relative z-50"
        >
          <div className="relative bg-gradient-to-br from-gray-800/80 via-purple-900/20 to-blue-900/30 backdrop-blur-xl rounded-3xl p-8 border border-gray-700/50 shadow-2xl">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                className="absolute top-0 left-0 w-32 h-32 bg-purple-500 rounded-full blur-3xl"
                animate={{
                  x: [0, 50, -25, 0],
                  y: [0, -30, 20, 0],
                }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute bottom-0 right-0 w-40 h-40 bg-blue-500 rounded-full blur-3xl"
                animate={{
                  x: [0, -40, 30, 0],
                  y: [0, 25, -35, 0],
                }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
              />
            </div>

            {/* Header */}
            <div className="relative z-10 mb-8 text-center">
              <motion.h3 
                className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-3"
                animate={{ backgroundPosition: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                🎮 Filter Games
              </motion.h3>
              <p className="text-gray-300 text-lg">Discover your next gaming adventure</p>
            </div>
            
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Enhanced Search */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold text-gray-200 mb-4 flex items-center space-x-2">
                  <SearchIcon className="h-4 w-4 text-purple-400" />
                  <span>Search Games</span>
                </label>
                <div className="relative group">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  />
                  <input
                    type="text"
                    placeholder="Type game name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="relative w-full pl-12 pr-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-800/80 backdrop-blur-sm"
                  />
                  <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-purple-400 transition-colors duration-200" />
                </div>
              </div>

              {/* Custom Category Dropdown */}
              <div className="relative z-[100]" ref={categoryDropdownRef}>
                <label className="block text-sm font-bold text-gray-200 mb-4 flex items-center space-x-2">
                  <FilterIcon className="h-4 w-4 text-blue-400" />
                  <span>Category</span>
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => {
                      setCategoryDropdownOpen(!categoryDropdownOpen);
                      setDifficultyDropdownOpen(false);
                    }}
                    className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-800/80 backdrop-blur-sm flex items-center justify-between group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="capitalize flex items-center space-x-2">
                      <span className="text-lg">
                        {selectedCategory === 'all' ? '🎯' : 
                         selectedCategory === 'action' ? '⚔️' : 
                         selectedCategory === 'strategy' ? '🧠' : 
                         selectedCategory === 'arcade' ? '🕹️' : '🎮'}
                      </span>
                      <span>
                        {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
                      </span>
                    </span>
                    <motion.div
                      animate={{ rotate: categoryDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-purple-400 transition-colors duration-200" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {categoryDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-900/98 backdrop-blur-xl border border-gray-600/70 rounded-xl shadow-2xl overflow-hidden"
                        style={{ zIndex: 999999 }}
                      >
                        {categories.map((category, index) => (
                          <motion.button
                            key={category}
                            onClick={() => {
                              setSelectedCategory(category);
                              setCategoryDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center space-x-3 ${
                              selectedCategory === category
                                ? 'bg-purple-600/30 text-purple-300 border-l-4 border-purple-500'
                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-lg">
                              {category === 'all' ? '🎯' : 
                               category === 'action' ? '⚔️' : 
                               category === 'strategy' ? '🧠' : 
                               category === 'arcade' ? '🕹️' : '🎮'}
                            </span>
                            <span className="capitalize">
                              {category === 'all' ? 'All Categories' : category}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Custom Difficulty Dropdown */}
              <div className="relative z-[100]" ref={difficultyDropdownRef}>
                <label className="block text-sm font-bold text-gray-200 mb-4 flex items-center space-x-2">
                  <TrophyIcon className="h-4 w-4 text-yellow-400" />
                  <span>Difficulty</span>
                </label>
                <div className="relative">
                  <motion.button
                    onClick={() => {
                      setDifficultyDropdownOpen(!difficultyDropdownOpen);
                      setCategoryDropdownOpen(false);
                    }}
                    className="w-full px-4 py-4 bg-gray-800/60 border border-gray-600/50 rounded-xl text-white focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 hover:bg-gray-800/80 backdrop-blur-sm flex items-center justify-between group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="capitalize flex items-center space-x-2">
                      <span className="text-lg">
                        {selectedDifficulty === 'all' ? '🎯' : 
                         selectedDifficulty === 'easy' ? '🟢' : 
                         selectedDifficulty === 'medium' ? '🟡' : '🔴'}
                      </span>
                      <span>
                        {selectedDifficulty === 'all' ? 'All Difficulties' : selectedDifficulty}
                      </span>
                    </span>
                    <motion.div
                      animate={{ rotate: difficultyDropdownOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDownIcon className="h-5 w-5 text-gray-400 group-hover:text-yellow-400 transition-colors duration-200" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {difficultyDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-600/80 rounded-xl shadow-2xl overflow-hidden"
                        style={{ zIndex: 999999 }}
                      >
                        {difficulties.map((difficulty, index) => (
                          <motion.button
                            key={difficulty}
                            onClick={() => {
                              setSelectedDifficulty(difficulty);
                              setDifficultyDropdownOpen(false);
                            }}
                            className={`w-full px-4 py-3 text-left transition-all duration-200 flex items-center space-x-3 ${
                              selectedDifficulty === difficulty
                                ? 'bg-yellow-600/30 text-yellow-300 border-l-4 border-yellow-500'
                                : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                            }`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ x: 5 }}
                          >
                            <span className="text-lg">
                              {difficulty === 'all' ? '🎯' : 
                               difficulty === 'easy' ? '🟢' : 
                               difficulty === 'medium' ? '🟡' : '🔴'}
                            </span>
                            <span className="capitalize">
                              {difficulty === 'all' ? 'All Difficulties' : difficulty}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            
            {/* Enhanced Filter Results Summary */}
            <div className="relative z-10 mt-8 pt-6 border-t border-gray-700/50">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
                  <motion.div 
                    className="flex items-center space-x-2 text-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-gray-400">Showing</span>
                    <span className="text-purple-400 font-bold text-xl">{filteredGames.length}</span>
                    <span className="text-gray-400">of</span>
                    <span className="text-blue-400 font-bold text-xl">{games.length}</span>
                    <span className="text-gray-400">games</span>
                  </motion.div>
                  
                  {(searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all') && (
                    <motion.button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedCategory('all');
                        setSelectedDifficulty('all');
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-gradient-to-r from-red-600/20 to-pink-600/20 hover:from-red-600/30 hover:to-pink-600/30 text-red-300 px-4 py-2 rounded-lg transition-all duration-200 border border-red-500/30 flex items-center space-x-2"
                    >
                      <span>🗑️</span>
                      <span>Clear Filters</span>
                    </motion.button>
                  )}
                </div>
                
                {/* Enhanced Quick Filters */}
                <div className={`flex flex-wrap items-center gap-3 transition-all duration-300 ${
                  (categoryDropdownOpen || difficultyDropdownOpen) 
                    ? 'opacity-30 pointer-events-none' 
                    : 'opacity-100'
                }`}>
                  <span className="text-sm text-gray-500 font-medium">Quick Select:</span>
                  {[
                    { key: 'action', label: 'Action', emoji: '⚔️', color: 'purple' },
                    { key: 'strategy', label: 'Strategy', emoji: '🧠', color: 'blue' },
                    { key: 'easy', label: 'Easy', emoji: '🟢', color: 'green', type: 'difficulty' }
                  ].map((filter) => (
                    <motion.button
                      key={filter.key}
                      onClick={() => {
                        if (filter.type === 'difficulty') {
                          setSelectedDifficulty(filter.key);
                        } else {
                          setSelectedCategory(filter.key);
                        }
                      }}
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 text-sm font-medium border ${
                        (filter.type === 'difficulty' ? selectedDifficulty : selectedCategory) === filter.key
                          ? `bg-${filter.color}-600/30 text-${filter.color}-300 border-${filter.color}-500/50 shadow-lg shadow-${filter.color}-500/20`
                          : 'bg-gray-700/30 text-gray-400 border-gray-600/30 hover:bg-gray-600/40 hover:text-white hover:border-gray-500/50'
                      }`}
                    >
                      <span>{filter.emoji}</span>
                      <span>{filter.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Games Grid */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {filteredGames.length === 0 ? (
            <motion.div
              variants={itemVariants}
              className="text-center py-12"
            >
              <FilterIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No games found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredGames.map((game) => (
                <motion.div
                  key={game.id}
                  variants={itemVariants}
                  className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-all duration-300 group"
                >
                  <motion.div 
                    className="relative overflow-hidden group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src={game.thumbnail}
                      alt={game.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-all duration-500"
                      style={{
                        filter: 'brightness(0.8) contrast(1.2)',
                      }}
                      onError={(e) => {
                        e.currentTarget.src = `https://picsum.photos/400/240?random=${game.id}&blur=1`;
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <motion.div
                      className="absolute inset-0 bg-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      animate={{
                        background: [
                          'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 80% 50%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)',
                          'radial-gradient(circle at 20% 50%, rgba(168, 85, 247, 0.2) 0%, transparent 50%)',
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                    
                    <div className="absolute top-4 left-4 flex space-x-2">
                      <motion.span 
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm"
                        whileHover={{ scale: 1.1 }}
                        animate={{ 
                          boxShadow: [
                            '0 0 10px rgba(168, 85, 247, 0.5)',
                            '0 0 20px rgba(168, 85, 247, 0.8)',
                            '0 0 10px rgba(168, 85, 247, 0.5)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        {game.category.toUpperCase()}
                      </motion.span>
                      <motion.span 
                        className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm shadow-lg ${
                          game.difficulty === 'easy' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          game.difficulty === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }`}
                        whileHover={{ scale: 1.1 }}
                      >
                        {game.difficulty.toUpperCase()}
                      </motion.span>
                    </div>
                    
                    {game.isActive && (
                      <motion.div 
                        className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full p-1 shadow-lg"
                        animate={{ 
                          scale: [1, 1.2, 1],
                          boxShadow: [
                            '0 0 10px rgba(34, 197, 94, 0.5)',
                            '0 0 20px rgba(34, 197, 94, 0.8)',
                            '0 0 10px rgba(34, 197, 94, 0.5)',
                          ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-3 h-3 bg-white rounded-full" />
                      </motion.div>
                    )}
                    
                    {/* Play overlay */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                    >
                      <motion.div
                        className="bg-white/20 backdrop-blur-md rounded-full p-4 border border-white/30"
                        whileHover={{ scale: 1.1 }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      >
                        <PlayIcon className="h-8 w-8 text-white" fill="white" />
                      </motion.div>
                    </motion.div>
                  </motion.div>

                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-colors duration-300">
                        {game.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed line-clamp-2">
                        {game.description}
                      </p>
                    </div>

                    {/* Game Stats */}
                    <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-700/50">
                      <div className="flex items-center space-x-2 text-gray-400">
                        <UsersIcon className="h-4 w-4 text-purple-400" />
                        <PresenceIndicator 
                          gameSlug={game.id}
                          variant="full"
                          size="sm"
                          className="text-sm"
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <ClockIcon className="h-4 w-4 text-blue-400" />
                        <span className="text-sm">{game.averageGameTime}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <StarIcon className="h-4 w-4 text-yellow-400" />
                        <span className="text-sm">{game.stats.highestScore.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-400">
                        <UsersIcon className="h-4 w-4 text-green-400" />
                        <span className="text-sm">Max {game.maxPlayers}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {game.tags.slice(0, 3).map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center space-x-1 bg-gray-700/50 hover:bg-gray-600/50 rounded-full px-3 py-1 text-xs text-gray-300 transition-colors duration-200"
                        >
                          <TagIcon className="h-3 w-3" />
                          <span>{tag}</span>
                        </span>
                      ))}
                    </div>

                    {/* Controls Info */}
                    <div className="text-xs text-gray-500 bg-gray-700/30 rounded-lg px-3 py-2">
                      <span className="font-medium text-gray-400">Controls:</span> {game.controls.movement}
                    </div>

                    {/* Play Button */}
                    <div className="pt-4">
                      {wallet.connected ? (
                        <motion.div
                          whileHover={{ scale: 1.05, rotateX: 5 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full"
                        >
                          <Link
                            href={game.gameUrl}
                            className="w-full bg-gradient-to-r from-purple-600 via-purple-700 to-blue-600 hover:from-purple-700 hover:via-purple-800 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-3 group relative overflow-hidden shadow-lg hover:shadow-purple-500/25 border border-purple-500/30"
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
                              <PlayIcon className="h-6 w-6" fill="white" />
                            </motion.div>
                            <span className="relative z-10 text-lg font-bold">PLAY NOW</span>
                            <motion.div
                              className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                              animate={{ x: [0, 5, 0] }}
                              transition={{ duration: 1, repeat: Infinity }}
                            >
                              ⚡
                            </motion.div>
                          </Link>
                        </motion.div>
                      ) : (
                        <motion.button
                          onClick={() => wallet.connect()}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="w-full bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white py-4 px-6 rounded-xl font-bold transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg border border-gray-500/30"
                        >
                          <span className="text-lg">🔗 Connect Wallet to Play</span>
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Bottom CTA */}
        {wallet.connected && (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mt-20 mb-16"
          >
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-purple-600/20 backdrop-blur-md rounded-2xl p-10 border border-purple-500/30 shadow-2xl"
            >
              <h3 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                Ready to Compete?
              </h3>
              <p className="text-gray-300 mb-8 text-lg max-w-2xl mx-auto leading-relaxed">
                Join thousands of players in intense multiplayer battles. 
                Climb the leaderboards, earn achievements, and prove your skills in our cosmic gaming arena!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/leaderboard"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25"
                >
                  <TrophyIcon className="h-5 w-5" />
                  <span>View Leaderboards</span>
                </Link>
                <Link
                  href="/profile"
                  className="inline-flex items-center space-x-2 bg-gray-700/50 hover:bg-gray-600/50 text-white px-8 py-4 rounded-xl font-medium transition-all duration-200 border border-gray-600"
                >
                  <span>View Profile</span>
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
