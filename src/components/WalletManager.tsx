'use client';

import React, { useState, useEffect } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  WalletIcon, 
  DollarSignIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  CopyIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ExternalLinkIcon
} from 'lucide-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface WalletManagerProps {
  className?: string;
}

export default function WalletManager({ className = '' }: WalletManagerProps) {
  const { connection } = useConnection();
  const { publicKey, connected, disconnect, wallet } = useWallet();
  const [balance, setBalance] = useState({ sol: 0, usd: 0 });
  const [gameBalance, setGameBalance] = useState({ usd: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);

  // Mock SOL to USD conversion rate
  const SOL_TO_USD = 23.45;

  useEffect(() => {
    if (connected && publicKey) {
      getBalance();
      loadGameBalance();
    } else {
      setBalance({ sol: 0, usd: 0 });
      setGameBalance({ usd: 0 });
    }
  }, [connected, publicKey, connection]);

  const getBalance = async () => {
    if (!publicKey || !connection) return;
    
    try {
      setIsLoading(true);
      const balance = await connection.getBalance(publicKey);
      const solBalance = balance / LAMPORTS_PER_SOL;
      const usdBalance = solBalance * SOL_TO_USD;
      
      setBalance({ 
        sol: solBalance, 
        usd: usdBalance 
      });
    } catch (error) {
      console.error('Error fetching balance:', error);
      showNotification('error', 'Failed to fetch wallet balance');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGameBalance = () => {
    // Load game balance from localStorage or API
    const savedBalance = localStorage.getItem(`gameBalance_${publicKey?.toBase58()}`);
    if (savedBalance) {
      setGameBalance(JSON.parse(savedBalance));
    } else {
      setGameBalance({ usd: 0 });
    }
  };

  const saveGameBalance = (newBalance: { usd: number }) => {
    if (!publicKey) return;
    localStorage.setItem(`gameBalance_${publicKey.toBase58()}`, JSON.stringify(newBalance));
    setGameBalance(newBalance);
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const copyAddress = async () => {
    if (!publicKey) return;
    
    try {
      await navigator.clipboard.writeText(publicKey.toBase58());
      showNotification('success', 'Wallet address copied to clipboard');
    } catch (error) {
      showNotification('error', 'Failed to copy address');
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || !connected) return;
    
    try {
      setIsLoading(true);
      const amount = parseFloat(depositAmount);
      
      if (amount > balance.usd) {
        showNotification('error', 'Insufficient wallet balance');
        return;
      }
      
      // Simulate deposit (in real app, this would involve actual SOL transfer)
      const newGameBalance = { usd: gameBalance.usd + amount };
      saveGameBalance(newGameBalance);
      
      setDepositAmount('');
      setShowDepositForm(false);
      showNotification('success', `Successfully deposited $${amount.toFixed(2)} to gaming wallet`);
    } catch (error) {
      showNotification('error', 'Deposit failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !connected) return;
    
    try {
      setIsLoading(true);
      const amount = parseFloat(withdrawAmount);
      
      if (amount > gameBalance.usd) {
        showNotification('error', 'Insufficient gaming balance');
        return;
      }
      
      // Simulate withdrawal (in real app, this would transfer SOL back to wallet)
      const newGameBalance = { usd: gameBalance.usd - amount };
      saveGameBalance(newGameBalance);
      
      setWithdrawAmount('');
      setShowWithdrawForm(false);
      showNotification('success', `Successfully withdrew $${amount.toFixed(2)} to Solana wallet`);
    } catch (error) {
      showNotification('error', 'Withdrawal failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!connected) {
    return (
      <div className={`glass-effect rounded-2xl p-6 ${className}`}>
        <div className="flex items-center space-x-2 mb-4">
          <WalletIcon className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-bold text-white">Wallet</h2>
        </div>
        <div className="text-center py-6">
          <WalletIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Connect your wallet to start playing</p>
          <div className="text-2xl font-bold text-white">$0.00</div>
          <div className="text-gray-400 text-sm">0.0000 SOL</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-3 rounded-lg ${
              notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
            } text-white shadow-lg`}
          >
            {notification.type === 'success' ? 
              <CheckCircleIcon className="h-5 w-5" /> : 
              <AlertCircleIcon className="h-5 w-5" />
            }
            <span>{notification.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Solana Wallet Balance */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <WalletIcon className="h-5 w-5 text-blue-400" />
            <h2 className="text-lg font-bold text-white">Solana Wallet</h2>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={getBalance}
              disabled={isLoading}
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <RefreshCwIcon className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <a
              href={`https://explorer.solana.com/address/${publicKey?.toBase58()}?cluster=devnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-400 transition-colors"
            >
              <ExternalLinkIcon className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-2xl font-bold text-white">${balance.usd.toFixed(2)}</div>
          <div className="text-gray-400">{balance.sol.toFixed(4)} SOL</div>
          <div className="text-gray-500 text-sm mt-1">1 SOL ≈ ${SOL_TO_USD}</div>
        </div>

        {/* Wallet Address */}
        <button
          onClick={copyAddress}
          className="w-full flex items-center justify-center space-x-2 text-gray-400 hover:text-blue-400 text-sm transition-colors p-2 rounded-lg hover:bg-gray-800/30"
        >
          <CopyIcon className="h-4 w-4" />
          <span className="font-mono">{publicKey?.toBase58().slice(0, 8)}...{publicKey?.toBase58().slice(-8)}</span>
        </button>
      </div>

      {/* Gaming Balance */}
      <div className="glass-effect rounded-2xl p-6">
        <div className="flex items-center space-x-2 mb-4">
          <DollarSignIcon className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-bold text-white">Gaming Balance</h2>
        </div>

        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-400">${gameBalance.usd.toFixed(2)}</div>
          <div className="text-gray-400 text-sm">Available for betting</div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDepositForm(!showDepositForm)}
            className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <ArrowUpIcon className="h-4 w-4" />
            <span>Deposit</span>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowWithdrawForm(!showWithdrawForm)}
            className="flex items-center justify-center space-x-2 bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
          >
            <ArrowDownIcon className="h-4 w-4" />
            <span>Withdraw</span>
          </motion.button>
        </div>
      </div>

      {/* Deposit Form */}
      <AnimatePresence>
        {showDepositForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Deposit to Gaming Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={balance.usd}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-gray-400 text-xs mt-1">Available: ${balance.usd.toFixed(2)}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleDeposit}
                  disabled={!depositAmount || isLoading || parseFloat(depositAmount) > balance.usd}
                  className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  onClick={() => setShowDepositForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Withdraw Form */}
      <AnimatePresence>
        {showWithdrawForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-2xl p-6"
          >
            <h3 className="text-lg font-bold text-white mb-4">Withdraw to Solana Wallet</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Amount (USD)</label>
                <input
                  type="number"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  max={gameBalance.usd}
                  step="0.01"
                  className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="text-gray-400 text-xs mt-1">Available: ${gameBalance.usd.toFixed(2)}</div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || isLoading || parseFloat(withdrawAmount) > gameBalance.usd}
                  className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Processing...' : 'Withdraw'}
                </button>
                <button
                  onClick={() => setShowWithdrawForm(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
