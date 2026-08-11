import React, { useState, useEffect, useRef } from 'react';
import { FaPhone, FaVideo, FaPaperPlane, FaImage, FaSmile, FaUserCircle } from 'react-icons/fa';
import { chatAPI } from '../../utils/api';
import { socketEvents } from '../../utils/socket';
import toast from 'react-hot-toast';

const ChatBox = ({ user: selectedUser, currentUser, messages, onSendMessage }) => {
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isCalling, setIsCalling] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Listen for typing events
  useEffect(() => {
    socketEvents.onTyping((data) => {
      if (data.userId === selectedUser?._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    return () => {
      socketEvents.off('typing');
    };
  }, [selectedUser]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageData = {
      receiverId: selectedUser._id,
      chatId: selectedUser._id,
      message: {
        content: newMessage,
        type: 'text',
        senderId: { _id: currentUser.id, name: currentUser.name },
        timestamp: new Date(),
      },
    };

    setNewMessage('');
    await onSendMessage(newMessage);
    
    // Emit via socket
    socketEvents.sendMessage(messageData);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // For demo - would handle file upload to cloud in production
    toast.success('📎 File attached successfully');
    fileInputRef.current.value = '';
  };

  const handleTyping = () => {
    socketEvents.startTyping({ userId: selectedUser?._id });
  };

  const handleCall = (type) => {
    setIsCalling(true);
    toast.info(`🔴 ${type} call to ${selectedUser?.name}...`);
    setTimeout(() => {
      setIsCalling(false);
      toast.error('Call ended');
    }, 5000);
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <FaUserCircle className="text-6xl text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400">Select a user to start chatting</p>
          <p className="text-sm text-gray-500 mt-2">Your primary helpers and nearby users appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex justify-between items-center border-b border-white/10 pb-4">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <FaUserCircle className="text-4xl text-gray-400" />
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full ${
              selectedUser.isOnline ? 'bg-green-500' : 'bg-gray-500'
            }`} />
          </div>
          <div>
            <p className="text-white font-medium">{selectedUser.name}</p>
            <p className="text-xs text-gray-400">
              {selectedUser.isOnline ? 'Online' : 'Last seen recently'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => handleCall('Audio')}
            disabled={isCalling}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaPhone className="text-xl" />
          </button>
          <button
            onClick={() => handleCall('Video')}
            disabled={isCalling}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <FaVideo className="text-xl" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No messages yet</p>
            <p className="text-sm text-gray-500 mt-1">Start a conversation with {selectedUser.name}</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.senderId._id === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.senderId._id === currentUser.id
                    ? 'bg-sos-red text-white'
                    : 'bg-white/10 text-gray-300'
                }`}
              >
                {msg.type === 'image' ? (
                  <img src={msg.content} alt="Shared" className="max-w-full rounded-lg" />
                ) : (
                  <p className="break-words">{msg.content}</p>
                )}
                <p className={`text-xs mt-1 ${
                  msg.senderId._id === currentUser.id ? 'text-red-200' : 'text-gray-500'
                }`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <p className="text-sm text-gray-400">Typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="border-t border-white/10 pt-4">
        <div className="flex items-center space-x-3">
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
            accept="image/*,.pdf,.doc,.docx"
          />
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            onFocus={handleTyping}
            placeholder={`Message ${selectedUser.name}...`}
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-sos-red hover:bg-red-700 text-white p-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;