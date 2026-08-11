import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaWallet, FaMobileAlt, FaMoneyBillWave, FaPlus, FaArrowDown, FaArrowUp } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('bkash');
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchWallet();
    fetchTransactions();
  }, []);

  const fetchWallet = async () => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/payment/wallet`);
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet:', error);
    }
  };

  const fetchTransactions = async () => {
    // Mock transactions
    setTransactions([
      { id: 1, type: 'received', amount: 1000, from: 'Rafi Ali', date: '2024-01-15', description: 'Emergency fund' },
      { id: 2, type: 'sent', amount: 500, to: 'Samiya Rahman', date: '2024-01-14', description: 'Transport assistance' },
      { id: 3, type: 'received', amount: 2000, from: 'Aniruddha Barua', date: '2024-01-13', description: 'Medical support' },
    ]);
  };

  const addMoney = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/payment/pay`, {
        amount: parseFloat(amount),
        method
      });
      toast.success('Money added successfully!');
      setShowAddMoney(false);
      setAmount('');
      fetchWallet();
    } catch (error) {
      toast.error('Failed to add money');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-emerald-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 mb-6">
          <h1 className="text-3xl font-bold text-white mb-6">Emergency Payment</h1>

          {/* Balance Card */}
          <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 border border-white/10 rounded-xl p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-400 text-sm">Available Balance</p>
                <p className="text-4xl font-bold text-white mt-2">৳{balance}</p>
                <p className="text-xs text-gray-400 mt-1">Ready for emergencies</p>
              </div>
              <button
                onClick={() => setShowAddMoney(true)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-xl transition-colors flex items-center space-x-2"
              >
                <FaPlus />
                <span>Add Money</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
<FaMobileAlt className="text-4xl text-pink-500 mx-auto mb-2" />
              <p className="text-white font-medium">bKash</p>
              <p className="text-xs text-gray-400">Quick payment</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
              <FaMoneyBillWave className="text-4xl text-yellow-500 mx-auto mb-2" />
              <p className="text-white font-medium">Nagad</p>
              <p className="text-xs text-gray-400">Quick payment</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors cursor-pointer">
              <FaWallet className="text-4xl text-blue-500 mx-auto mb-2" />
              <p className="text-white font-medium">Emergency Fund</p>
              <p className="text-xs text-gray-400">Prepared for you</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Recent Transactions</h2>
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="bg-white/5 rounded-xl p-4 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        tx.type === 'received' ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}>
                        {tx.type === 'received' ? (
                          <FaArrowDown className="text-green-500" />
                        ) : (
                          <FaArrowUp className="text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {tx.type === 'received' ? `From ${tx.from}` : `To ${tx.to}`}
                        </p>
                        <p className="text-sm text-gray-400">{tx.description}</p>
                        <p className="text-xs text-gray-500">{tx.date}</p>
                      </div>
                    </div>
                    <p className={`font-bold ${
                      tx.type === 'received' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.type === 'received' ? '+' : '-'}৳{tx.amount}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-sos-gray rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">Add Money to Wallet</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount (BDT)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-sos-red transition-colors"
                >
                  <option value="bkash">bKash</option>
                  <option value="nagad">Nagad</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={addMoney}
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Add Money
              </button>
              <button
                onClick={() => setShowAddMoney(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;