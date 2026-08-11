import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { FaSearch, FaPhone, FaVideo, FaPaperPlane, FaImage, FaPaperclip, FaUserCircle } from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchChat(selectedUser._id);
    }
  }, [selectedUser]);

  useEffect(() => {
    if (socket) {
      socket.on('receive-message', (data) => {
        if (selectedUser && data.chatId === selectedUser._id) {
          setMessages(prev => [...prev, data.message]);
        }
      });

      return () => {
        socket.off('receive-message');
      };
    }
  }, [socket, selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      // Fetch primary helpers and nearby users
      const helpers = await axios.get(`${process.env.REACT_APP_API_URL}/users/primary-helpers`);
      const nearby = await axios.get(`${process.env.REACT_APP_API_URL}/users/nearby-helpers?lat=23.8103&lng=90.4125&radius=5`);
      const allUsers = [...helpers.data, ...nearby.data];
      // Remove duplicates
      const uniqueUsers = allUsers.filter((u, i, self) => 
        i === self.findIndex(t => t._id === u._id)
      );
      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChat = async (userId) => {
    try {
      const { data } = await axios.get(`${process.env.REACT_APP_API_URL}/chat/${userId}`);
      setMessages(data.messages || []);
    } catch (error) {
      console.error('Error fetching chat:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const { data } = await axios.post(`${process.env.REACT_APP_API_URL}/chat/${selectedUser._id}/messages`, {
        content: newMessage,
        type: 'text'
      });

      setMessages(prev => [...prev, data]);
      setNewMessage('');

      if (socket) {
        socket.emit('send-message', {
          receiverId: selectedUser._id,
          chatId: selectedUser._id,
          message: data
        });
      }
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For demo, we'll just show a message
    toast.success('File attached successfully');
    // In production, upload to cloud storage and send URL
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.userId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-yellow-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 h-[calc(100vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 h-full gap-4">
            {/* Users List */}
            <div className="md:col-span-1 bg-white/5 rounded-xl p-4 overflow-y-auto">
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div
                    key={u._id}
                    onClick={() => setSelectedUser(u)}
                    className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedUser?._id === u._id
                        ? 'bg-sos-red/20 border border-sos-red'
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <FaUserCircle className="text-3xl text-gray-400" />
                      <div>
                        <p className="text-white font-medium text-sm">{u.name}</p>
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs ${
                            u.isOnline ? 'text-green-500' : 'text-gray-500'
                          }`}>
                            {u.isOnline ? '● Online' : '○ Offline'}
                          </span>
                          <span className="text-xs text-gray-500">{u.userId}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <p className="text-gray-400 text-center py-8">No users found</p>
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="md:col-span-3 bg-white/5 rounded-xl p-4 flex flex-col">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <div className="flex items-center space-x-3">
                      <FaUserCircle className="text-4xl text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{selectedUser.name}</p>
                        <p className={`text-xs ${
                          selectedUser.isOnline ? 'text-green-500' : 'text-gray-500'
                        }`}>
                          {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <FaPhone className="text-xl" />
                      </button>
                      <button className="text-gray-400 hover:text-white transition-colors">
                        <FaVideo className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-3">
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.senderId._id === user.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            msg.senderId._id === user.id
                              ? 'bg-sos-red text-white'
                              : 'bg-white/10 text-gray-300'
                          }`}
                        >
                          {msg.type === 'image' ? (
                            <img src={msg.content} alt="Shared" className="max-w-full rounded-lg" />
                          ) : (
                            <p>{msg.content}</p>
                          )}
                          <p className="text-xs opacity-75 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-white/10 pt-4">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                      />
                      <button
                        onClick={() => fileInputRef.current.click()}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <FaImage className="text-xl" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*"
                      />
                      <button
                        onClick={sendMessage}
                        className="bg-sos-red hover:bg-red-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-400 text-center">
                    Select a user to start chatting
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;