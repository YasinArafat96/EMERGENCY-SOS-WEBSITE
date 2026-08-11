import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  FaSearch,
  FaPhone,
  FaVideo,
  FaPaperPlane,
  FaImage,
  FaPaperclip,
  FaUserCircle,
  FaFile,
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SERVER_URL = API_URL.replace(/\/api\/?$/, '');
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
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
    } else {
      setChatId(null);
      setMessages([]);
    }
  }, [selectedUser]);

  // Receive realtime messages from Socket.IO.
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (!data?.message) return;

      // Only add messages for the currently opened conversation.
      if (chatId && String(data.chatId) === String(chatId)) {
        setMessages((prev) => {
          // Prevent duplicates when the same message arrives twice.
          const messageId = data.message._id;
          if (
            messageId &&
            prev.some((message) => String(message._id) === String(messageId))
          ) {
            return prev;
          }

          return [
            ...prev,
            normalizeMessageForCurrentUser(data.message),
          ];
        });
      }
    };

    socket.on('receive-message', handleReceiveMessage);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
    };
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsers = async () => {
    try {
      const [helpers, nearby] = await Promise.all([
        axios.get(`${API_URL}/users/primary-helpers`),
        axios.get(
          `${API_URL}/users/nearby-helpers?lat=23.8103&lng=90.4125&radius=5`
        ),
      ]);

      const allUsers = [...helpers.data, ...nearby.data];

      const uniqueUsers = allUsers.filter(
        (u, i, self) => i === self.findIndex((t) => t._id === u._id)
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchChat = async (userId) => {
    try {
      const { data } = await axios.get(`${API_URL}/chat/${userId}`);

      setChatId(data._id);

      const loadedMessages = (data.messages || []).map(
        (message) => ({
          ...message,
          senderId:
            message.senderId?._id ||
            message.senderId?.id ||
            message.senderId?.userId ||
            message.senderId,
        })
      );

      setMessages(loadedMessages);

      // Mark messages as read.
      if (data._id) {
        axios
          .put(`${API_URL}/chat/${data._id}/read`)
          .catch((error) => console.error('Mark read error:', error));
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setChatId(null);
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    const content = newMessage.trim();

    if (!content || !chatId || !selectedUser) return;

    try {
      const { data } = await axios.post(`${API_URL}/chat/${chatId}/messages`, {
        content,
        type: 'text',
      });

      setMessages((prev) => {
        if (data?._id && prev.some((message) => String(message._id) === String(data._id))) {
          return prev;
        }
        return [
          ...prev,
          normalizeMessageForCurrentUser({
            ...data,
            senderId: getCurrentUserMessageId(),
          }),
        ];
      });

      setNewMessage('');

      // Backend already broadcasts the saved message through Socket.IO.
      // Do not emit it again here, otherwise the receiver can get duplicates.
    } catch (error) {
      console.error('Send message error:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    // Allow selecting the same file again later.
    e.target.value = '';

    if (!file || !chatId) return;

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File must be 5MB or smaller');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/zip',
    ];

    if (!isImage && !allowedTypes.includes(file.type)) {
      toast.error('Only images, PDF, DOC, DOCX, TXT and ZIP files are allowed');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      toast.loading('Uploading file...', { id: 'chat-upload' });

      const uploadResponse = await axios.post(
        `${API_URL}/chat/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { url, type } = uploadResponse.data;

      const { data: message } = await axios.post(
        `${API_URL}/chat/${chatId}/messages`,
        {
          content: url,
          type,
        }
      );

      setMessages((prev) => {
        if (
          message?._id &&
          prev.some((item) => String(item._id) === String(message._id))
        ) {
          return prev;
        }
        return [
          ...prev,
          normalizeMessageForCurrentUser({
            ...message,
            senderId: getCurrentUserMessageId(),
          }),
        ];
      });

      toast.success('File sent successfully', { id: 'chat-upload' });
    } catch (error) {
      console.error('File upload error:', error);
      toast.error(
        error.response?.data?.message || 'Failed to upload/send file',
        { id: 'chat-upload' }
      );
    }
  };

  const getFileUrl = (content) => {
    if (!content) return '';

    // Already an absolute URL.
    if (/^https?:\/\//i.test(content)) {
      return content;
    }

    return `${SERVER_URL}${content.startsWith('/') ? '' : '/'}${content}`;
  };

  const getFileName = (content) => {
    try {
      const cleanUrl = content.split('?')[0];
      const name = cleanUrl.substring(cleanUrl.lastIndexOf('/') + 1);
      return decodeURIComponent(name) || 'Shared file';
    } catch (error) {
      return 'Shared file';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // =====================================================
  // CHECK WHETHER MESSAGE WAS SENT BY CURRENT USER
  // =====================================================
  // MongoDB may return senderId as a string, an ObjectId-like
  // value, or a populated user object. AuthContext may also
  // expose the current user's ID as _id, id, or userId.
  // Compare all available stable identifiers so the message
  // stays on the correct side even after a page refresh.
  const getIdCandidates = (value) => {
    if (!value) return [];

    if (typeof value === 'object') {
      return [
        value._id,
        value.id,
        value.userId,
      ]
        .filter(Boolean)
        .map((id) => String(id));
    }

    return [String(value)];
  };

  // Use the authenticated user's ID for messages immediately added
  // after sending. This prevents the new message from appearing on
  // the LEFT before the server/socket response is processed.
  const getCurrentUserMessageId = () => {
    return user?._id || user?.id || user?.userId || null;
  };

  const normalizeMessageForCurrentUser = (message) => {
    if (!message) return message;

    return {
      ...message,
      senderId:
        message.senderId?._id ||
        message.senderId?.id ||
        message.senderId?.userId ||
        message.senderId ||
        getCurrentUserMessageId(),
    };
  };

  const isMine = (msg) => {
    const senderIds = getIdCandidates(
      msg?.senderId || msg?.sender
    );

    const currentUserIds = [
      ...getIdCandidates(user?._id),
      ...getIdCandidates(user?.id),
      ...getIdCandidates(user?.userId),
    ];

    return senderIds.some((senderId) =>
      currentUserIds.includes(senderId)
    );
  };

  const filteredUsers = users.filter((u) =>
    `${u.name || ''} ${u.userId || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-yellow-900/10 p-4 md:p-6">
      <div className="container mx-auto max-w-7xl">
        <div className="glass-effect rounded-2xl p-6 h-[calc(100vh-140px)]">
          <div className="grid grid-cols-1 md:grid-cols-4 h-full gap-4">
            {/* Users List */}
            <div className="md:col-span-1 bg-white/5 rounded-xl p-4 overflow-y-auto">
              <div className="relative mb-4">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
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
                          <span
                            className={`text-xs ${
                              u.isOnline ? 'text-green-500' : 'text-gray-500'
                            }`}
                          >
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
            <div className="md:col-span-3 bg-white/5 rounded-xl p-4 flex flex-col min-h-0">
              {selectedUser ? (
                <>
                  {/* Chat Header */}
                  <div className="flex justify-between items-center border-b border-white/10 pb-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <FaUserCircle className="text-4xl text-gray-400" />
                      <div>
                        <p className="text-white font-medium">{selectedUser.name}</p>
                        <p
                          className={`text-xs ${
                            selectedUser.isOnline ? 'text-green-500' : 'text-gray-500'
                          }`}
                        >
                          {selectedUser.isOnline ? 'Online' : 'Offline'}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        type="button"
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Voice call (coming soon)"
                      >
                        <FaPhone className="text-xl" />
                      </button>
                      <button
                        type="button"
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Video call (coming soon)"
                      >
                        <FaVideo className="text-xl" />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-3">
                    {messages.map((msg, index) => {
                      const mine = isMine(msg);
                      const fileUrl = getFileUrl(msg.content);

                      return (
                        <div
                          key={msg._id || `${msg.timestamp}-${index}`}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          {/* IMAGE MESSAGE: no outer chat bubble */}
                          {msg.type === 'image' && (
                            <div className="relative inline-block max-w-[380px]">
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block"
                              >
                                <img
                                  src={fileUrl}
                                  alt="Shared"
                                  className="block w-auto max-w-[380px] max-h-[350px] rounded-xl object-contain cursor-pointer shadow-md hover:opacity-95 transition-opacity"
                                  onError={() =>
                                    console.error('Image failed to load:', fileUrl)
                                  }
                                />
                              </a>

                              <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md pointer-events-none">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          )}

                          {/* FILE MESSAGE */}
                          {msg.type === 'file' && (
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-3 ${
                                mine
                                  ? 'bg-sos-red text-white'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              <a
                                href={fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download
                                className="flex items-center gap-3 hover:underline"
                              >
                                <FaPaperclip className="text-xl flex-shrink-0" />
                                <span className="break-all">{getFileName(msg.content)}</span>
                              </a>
                              <p className="text-xs opacity-75 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          )}

                          {/* TEXT MESSAGE */}
                          {(!msg.type || msg.type === 'text') && (
                            <div
                              className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                mine
                                  ? 'bg-sos-red text-white'
                                  : 'bg-white/10 text-gray-300'
                              }`}
                            >
                              <p className="break-words">{msg.content}</p>
                              <p className="text-xs opacity-75 mt-1">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="border-t border-white/10 pt-4 flex-shrink-0">
                    <div className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') sendMessage();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Send image or file"
                      >
                        <FaImage className="text-xl" />
                      </button>

                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.txt,.doc,.docx,.zip"
                      />

                      <button
                        type="button"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || !chatId}
                        className="bg-sos-red hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                      >
                        <FaPaperPlane />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-2">
                      Images and files up to 5MB
                    </p>
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
