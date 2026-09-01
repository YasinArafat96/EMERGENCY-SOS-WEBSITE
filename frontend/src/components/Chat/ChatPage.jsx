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
  FaEllipsisV,
  FaUndo,
  FaSmile,
} from 'react-icons/fa';
import axios from 'axios';
import toast from 'react-hot-toast';
import { chatAPI, userAPI } from '../../utils/api';
import { useCall } from '../../context/CallContext';
import EmojiPicker from './EmojiPicker';

const API_URL =
  process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const SERVER_URL = API_URL.replace(/\/api\/?$/, '');
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ChatPage = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const { startCall, callState } = useCall();

  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [messageMenuId, setMessageMenuId] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  // =====================================================
  // FETCH USERS
  // =====================================================

  useEffect(() => {
    fetchUsers();
  }, []);

  // =====================================================
  // FETCH CHAT WHEN USER IS SELECTED
  // =====================================================

  useEffect(() => {
    if (selectedUser) {
      fetchChat(selectedUser._id);
    } else {
      setChatId(null);
      setMessages([]);
    }
  }, [selectedUser]);

  // =====================================================
  // SOCKET - RECEIVE MESSAGE
  // =====================================================

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (data) => {
      if (!data?.message) return;

      if (
        chatId &&
        String(data.chatId) === String(chatId)
      ) {
        setMessages((prev) => {
          const messageId = data.message._id;

          // Prevent duplicate messages
          if (
            messageId &&
            prev.some(
              (message) =>
                String(message._id) ===
                String(messageId)
            )
          ) {
            return prev;
          }

          return [
            ...prev,
            normalizeMessageForCurrentUser(
              data.message
            ),
          ];
        });
      }
    };

    socket.on(
      'receive-message',
      handleReceiveMessage
    );

    return () => {
      socket.off(
        'receive-message',
        handleReceiveMessage
      );
    };
  }, [socket, chatId]);

  // =====================================================
  // SOCKET - MESSAGE UNSENT
  // =====================================================

  useEffect(() => {
    if (!socket) return;

    const handleMessageUnsent = (data) => {
      if (
        chatId &&
        String(data.chatId) === String(chatId)
      ) {
        setMessages((prev) =>
          prev.map((msg) =>
            String(msg._id) === String(data.messageId)
              ? { ...msg, isUnsent: true }
              : msg
          )
        );
      }
    };

    socket.on('message-unsent', handleMessageUnsent);

    return () => {
      socket.off('message-unsent', handleMessageUnsent);
    };
  }, [socket, chatId]);

  // Close message menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      setMessageMenuId(null);
      if (
        showEmojiPicker &&
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(e.target)
      ) {
        setShowEmojiPicker(false);
      }
    };
    if (messageMenuId || showEmojiPicker) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [messageMenuId, showEmojiPicker]);

  // =====================================================
  // SCROLL TO BOTTOM
  // =====================================================

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // =====================================================
  // FETCH USERS
  // =====================================================

  const fetchUsers = async () => {
    try {
      const [friends, helpers] =
        await Promise.all([
          userAPI.getFriends(),
          userAPI.getPrimaryHelpers(),
        ]);

      const allUsers = [
        ...friends.data,
        ...helpers.data,
      ];

      const uniqueUsers = allUsers.filter(
        (u, i, self) =>
          i ===
          self.findIndex(
            (t) => t._id === u._id
          )
      );

      setUsers(uniqueUsers);
    } catch (error) {
      console.error(
        'Error fetching users:',
        error
      );
    }
  };

  // =====================================================
  // FETCH CHAT
  // =====================================================

  const fetchChat = async (userId) => {
    try {
      const { data } = await axios.get(
        `${API_URL}/chat/${userId}`
      );

      setChatId(data._id);

      const loadedMessages =
        (data.messages || []).map(
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

      // Mark messages as read
      if (data._id) {
        axios
          .put(
            `${API_URL}/chat/${data._id}/read`
          )
          .catch((error) =>
            console.error(
              'Mark read error:',
              error
            )
          );
      }
    } catch (error) {
      console.error(
        'Error fetching chat:',
        error
      );

      setChatId(null);
      setMessages([]);
    }
  };

  // =====================================================
  // SEND TEXT MESSAGE
  // =====================================================

  const sendMessage = async () => {
    const content = newMessage.trim();

    if (
      !content ||
      !chatId ||
      !selectedUser
    ) {
      return;
    }

    try {
      const { data } =
        await axios.post(
          `${API_URL}/chat/${chatId}/messages`,
          {
            content,
            type: 'text',
          }
        );

      setMessages((prev) => {
        if (
          data?._id &&
          prev.some(
            (message) =>
              String(message._id) ===
              String(data._id)
          )
        ) {
          return prev;
        }

        return [
          ...prev,
          normalizeMessageForCurrentUser({
            ...data,
            senderId:
              getCurrentUserMessageId(),
          }),
        ];
      });

      setNewMessage('');

      // Backend already sends the message
      // to the receiver through Socket.IO.
    } catch (error) {
      console.error(
        'Send message error:',
        error
      );

      toast.error(
        error.response?.data?.message ||
          'Failed to send message'
      );
    }
  };

  // =====================================================
  // FILE / IMAGE UPLOAD
  // =====================================================

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];

    // Allow selecting the same file again
    e.target.value = '';

    if (!file || !chatId) {
      return;
    }

    // 5MB limit
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        'File must be 5MB or smaller'
      );
      return;
    }

    const isImage =
      file.type.startsWith('image/');

    const allowedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (
      !isImage &&
      !allowedTypes.includes(file.type)
    ) {
      toast.error(
        'Only images, PDF, DOC, DOCX and TXT files are allowed'
      );
      return;
    }

    try {
      const formData = new FormData();

      // IMPORTANT:
      // Backend multer expects the field name "file"
      formData.append('file', file);

      toast.loading(
        'Uploading file...',
        {
          id: 'chat-upload',
        }
      );

      /*
       * IMPORTANT:
       *
       * Backend route is:
       *
       * POST /api/chat/:chatId/messages/file
       *
       * This endpoint:
       * 1. uploads the file
       * 2. creates the chat message
       * 3. sends the message through Socket.IO
       *
       * So we do NOT call /chat/upload separately.
       */

      const { data: message } =
        await axios.post(
          `${API_URL}/chat/${chatId}/messages/file`,
          formData
        );

      // Add the returned message locally
      setMessages((prev) => {
        if (
          message?._id &&
          prev.some(
            (item) =>
              String(item._id) ===
              String(message._id)
          )
        ) {
          return prev;
        }

        return [
          ...prev,
          normalizeMessageForCurrentUser({
            ...message,
            senderId:
              getCurrentUserMessageId(),
          }),
        ];
      });

      toast.success(
        'File sent successfully',
        {
          id: 'chat-upload',
        }
      );
    } catch (error) {
      console.error(
        'File upload error:',
        error
      );

      console.error(
        'Server response:',
        error.response?.data
      );

      const message =
        error.response?.data?.message ||
        error.response?.data?.error ||
        (error.response?.status
          ? `Upload failed (HTTP ${error.response.status})`
          : error.message) ||
        'Failed to upload/send file';

      toast.error(message, {
        id: 'chat-upload',
      });
    }
  };

  // =====================================================
  // FILE URL
  // =====================================================

  const getFileUrl = (content) => {
    if (!content) {
      return '';
    }

    // Backend currently returns an absolute URL
    if (
      /^https?:\/\//i.test(content)
    ) {
      return content;
    }

    return `${SERVER_URL}${
      content.startsWith('/')
        ? ''
        : '/'
    }${content}`;
  };

  // =====================================================
  // FILE NAME
  // =====================================================

  const getFileName = (content) => {
    try {
      const cleanUrl =
        content.split('?')[0];

      const name =
        cleanUrl.substring(
          cleanUrl.lastIndexOf('/') + 1
        );

      return (
        decodeURIComponent(name) ||
        'Shared file'
      );
    } catch (error) {
      return 'Shared file';
    }
  };

  // =====================================================
  // SCROLL
  // =====================================================

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  // =====================================================
  // USER ID HELPERS
  // =====================================================

  const getIdCandidates = (value) => {
    if (!value) {
      return [];
    }

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

  const getCurrentUserMessageId = () => {
    return (
      user?._id ||
      user?.id ||
      user?.userId ||
      null
    );
  };

  const normalizeMessageForCurrentUser = (
    message
  ) => {
    if (!message) {
      return message;
    }

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
    const senderIds =
      getIdCandidates(
        msg?.senderId ||
          msg?.sender
      );

    const currentUserIds = [
      ...getIdCandidates(
        user?._id
      ),
      ...getIdCandidates(
        user?.id
      ),
      ...getIdCandidates(
        user?.userId
      ),
    ];

    return senderIds.some(
      (senderId) =>
        currentUserIds.includes(
          senderId
        )
    );
  };

  const canUnsend = (msg) => {
    if (!isMine(msg) || msg.isUnsent) return false;
    const age = Date.now() - new Date(msg.timestamp).getTime();
    return age <= 60 * 60 * 1000;
  };

  const handleUnsend = async (messageId) => {
    if (!chatId || !messageId) return;
    setMessageMenuId(null);

    try {
      await chatAPI.unsendMessage(chatId, messageId);
      setMessages((prev) =>
        prev.map((msg) =>
          String(msg._id) === String(messageId)
            ? { ...msg, isUnsent: true }
            : msg
        )
      );
      toast.success('Message unsent');
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to unsend message'
      );
    }
  };

  const handleEmojiSelect = (emoji) => {
    setNewMessage((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleVoiceCall = () => {
    if (!selectedUser) return;
    if (callState !== 'idle') {
      toast.error('Already in a call');
      return;
    }
    startCall(selectedUser, 'audio');
  };

  const handleVideoCall = () => {
    if (!selectedUser) return;
    if (callState !== 'idle') {
      toast.error('Already in a call');
      return;
    }
    startCall(selectedUser, 'video');
  };

  const renderUnsentBubble = (mine) => (
    <div
      className={`max-w-[70%] rounded-lg px-4 py-2 italic ${
        mine
          ? 'bg-sos-red/40 text-white/70'
          : 'bg-white/5 text-gray-500'
      }`}
    >
      <p className="text-sm flex items-center gap-2">
        <FaUndo className="text-xs" />
        This message was deleted
      </p>
    </div>
  );

  // =====================================================
  // SEARCH USERS
  // =====================================================

  const filteredUsers =
    users.filter((u) =>
      `${u.name || ''} ${
        u.userId || ''
      }`
        .toLowerCase()
        .includes(
          searchTerm.toLowerCase()
        )
    );

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-sos-dark via-sos-dark to-yellow-900/10 p-4 md:p-6">

      <div className="container mx-auto max-w-7xl">

        <div className="glass-effect rounded-2xl p-6 h-[calc(100vh-140px)]">

          <div className="grid grid-cols-1 md:grid-cols-4 h-full gap-4">

            {/* =================================================
                USERS LIST
            ================================================= */}

            <div className="md:col-span-1 bg-white/5 rounded-xl p-4 overflow-y-auto">

              <div className="relative mb-4">

                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                />

              </div>

              <div className="space-y-2">

                {filteredUsers.map(
                  (u) => (
                    <div
                      key={u._id}
                      onClick={() =>
                        setSelectedUser(
                          u
                        )
                      }
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedUser?._id ===
                        u._id
                          ? 'bg-sos-red/20 border border-sos-red'
                          : 'hover:bg-white/10'
                      }`}
                    >

                      <div className="flex items-center space-x-3">

                        <FaUserCircle className="text-3xl text-gray-400" />

                        <div>

                          <p className="text-white font-medium text-sm">
                            {u.name}
                          </p>

                          <div className="flex items-center space-x-2">

                            <span
                              className={`text-xs ${
                                u.isOnline
                                  ? 'text-green-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {u.isOnline
                                ? '● Online'
                                : '○ Offline'}
                            </span>

                            <span className="text-xs text-gray-500">
                              {u.userId}
                            </span>

                          </div>

                        </div>

                      </div>

                    </div>
                  )
                )}

                {filteredUsers.length ===
                  0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-400">
                      No friends to chat with
                    </p>
                    <a
                      href="/friends"
                      className="text-sos-red hover:text-red-400 text-sm mt-2 inline-block"
                    >
                      Add friends →
                    </a>
                  </div>
                )}

              </div>

            </div>

            {/* =================================================
                CHAT AREA
            ================================================= */}

            <div className="md:col-span-3 bg-white/5 rounded-xl p-4 flex flex-col min-h-0">

              {selectedUser ? (
                <>

                  {/* CHAT HEADER */}

                  <div className="flex justify-between items-center border-b border-white/10 pb-4 flex-shrink-0">

                    <div className="flex items-center space-x-3">

                      <FaUserCircle className="text-4xl text-gray-400" />

                      <div>

                        <p className="text-white font-medium">
                          {selectedUser.name}
                        </p>

                        <p
                          className={`text-xs ${
                            selectedUser.isOnline
                              ? 'text-green-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {selectedUser.isOnline
                            ? 'Online'
                            : 'Offline'}
                        </p>

                      </div>

                    </div>

                    <div className="flex space-x-3">

                      <button
                        type="button"
                        onClick={handleVoiceCall}
                        disabled={callState !== 'idle'}
                        className="text-gray-400 hover:text-green-400 disabled:opacity-40 transition-colors"
                        title="Voice call"
                      >
                        <FaPhone className="text-xl" />
                      </button>

                      <button
                        type="button"
                        onClick={handleVideoCall}
                        disabled={callState !== 'idle'}
                        className="text-gray-400 hover:text-blue-400 disabled:opacity-40 transition-colors"
                        title="Video call"
                      >
                        <FaVideo className="text-xl" />
                      </button>

                    </div>

                  </div>

                  {/* MESSAGES */}

                  <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-3">

                    {messages.map(
                      (msg, index) => {

                        const mine =
                          isMine(msg);

                        if (msg.isUnsent) {
                          return (
                            <div
                              key={
                                msg._id ||
                                `${msg.timestamp}-${index}`
                              }
                              className={`flex ${
                                mine
                                  ? 'justify-end'
                                  : 'justify-start'
                              }`}
                            >
                              {renderUnsentBubble(mine)}
                            </div>
                          );
                        }

                        const fileUrl =
                          getFileUrl(
                            msg.content
                          );

                        const showMenu =
                          messageMenuId === msg._id;

                        return (
                          <div
                            key={
                              msg._id ||
                              `${msg.timestamp}-${index}`
                            }
                            className={`flex group ${
                              mine
                                ? 'justify-end'
                                : 'justify-start'
                            }`}
                          >
                            <div className={`relative flex items-center gap-1 ${mine ? 'flex-row-reverse' : ''}`}>

                            {/* Unsend menu button (own messages only) */}
                            {mine && canUnsend(msg) && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMessageMenuId(
                                    showMenu ? null : msg._id
                                  );
                                }}
                                className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white p-1 transition-all"
                                title="Message options"
                              >
                                <FaEllipsisV className="text-sm" />
                              </button>
                            )}

                            {showMenu && (
                              <div
                                className="absolute top-0 z-10 bg-sos-gray border border-white/10 rounded-lg shadow-xl py-1 min-w-[140px]"
                                style={mine ? { right: 0 } : { left: 0 }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleUnsend(msg._id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/10 flex items-center gap-2"
                                >
                                  <FaUndo />
                                  Unsend
                                </button>
                              </div>
                            )}

                            {/* IMAGE */}

                            {msg.type ===
                              'image' && (
                              <div className="relative inline-block max-w-[380px]">

                                <a
                                  href={
                                    fileUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block"
                                >

                                  <img
                                    src={
                                      fileUrl
                                    }
                                    alt="Shared"
                                    className="block w-auto max-w-[380px] max-h-[350px] rounded-xl object-contain cursor-pointer shadow-md hover:opacity-95 transition-opacity"
                                    onError={() =>
                                      console.error(
                                        'Image failed to load:',
                                        fileUrl
                                      )
                                    }
                                  />

                                </a>

                                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[11px] px-2 py-1 rounded-md pointer-events-none">
                                  {new Date(
                                    msg.timestamp
                                  ).toLocaleTimeString()}
                                </span>

                              </div>
                            )}

                            {/* FILE */}

                            {msg.type ===
                              'file' && (
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-3 ${
                                  mine
                                    ? 'bg-sos-red text-white'
                                    : 'bg-white/10 text-gray-300'
                                }`}
                              >

                                <a
                                  href={
                                    fileUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download
                                  className="flex items-center gap-3 hover:underline"
                                >

                                  <FaPaperclip className="text-xl flex-shrink-0" />

                                  <span className="break-all">
                                    {getFileName(
                                      msg.content
                                    )}
                                  </span>

                                </a>

                                <p className="text-xs opacity-75 mt-1">
                                  {new Date(
                                    msg.timestamp
                                  ).toLocaleTimeString()}
                                </p>

                              </div>
                            )}

                            {/* TEXT */}

                            {(!msg.type ||
                              msg.type ===
                                'text') && (
                              <div
                                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                  mine
                                    ? 'bg-sos-red text-white'
                                    : 'bg-white/10 text-gray-300'
                                }`}
                              >

                                <p className="break-words">
                                  {
                                    msg.content
                                  }
                                </p>

                                <p className="text-xs opacity-75 mt-1">
                                  {new Date(
                                    msg.timestamp
                                  ).toLocaleTimeString()}
                                </p>

                              </div>
                            )}

                            </div>
                          </div>
                        );
                      }
                    )}

                    <div
                      ref={
                        messagesEndRef
                      }
                    />

                  </div>

                  {/* INPUT */}

                  <div className="border-t border-white/10 pt-4 flex-shrink-0">

                    <div className="flex items-center space-x-3">

                      {/* EMOJI BUTTON */}
                      <div className="relative" ref={emojiPickerRef}>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowEmojiPicker((v) => !v);
                          }}
                          className={`text-gray-400 hover:text-yellow-400 transition-colors ${
                            showEmojiPicker ? 'text-yellow-400' : ''
                          }`}
                          title="Emoji"
                        >
                          <FaSmile className="text-xl" />
                        </button>

                        {showEmojiPicker && (
                          <EmojiPicker
                            onSelect={handleEmojiSelect}
                            onClose={() => setShowEmojiPicker(false)}
                          />
                        )}
                      </div>

                      <input
                        type="text"
                        value={
                          newMessage
                        }
                        onChange={(e) =>
                          setNewMessage(
                            e.target.value
                          )
                        }
                        onKeyDown={(e) => {
                          if (
                            e.key ===
                            'Enter'
                          ) {
                            sendMessage();
                          }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-sos-red transition-colors"
                      />

                      {/* FILE BUTTON */}

                      <button
                        type="button"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                        className="text-gray-400 hover:text-white transition-colors"
                        title="Send image or file"
                      >
                        <FaImage className="text-xl" />
                      </button>

                      <input
                        type="file"
                        ref={
                          fileInputRef
                        }
                        onChange={
                          handleFileUpload
                        }
                        className="hidden"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                      />

                      {/* SEND BUTTON */}

                      <button
                        type="button"
                        onClick={
                          sendMessage
                        }
                        disabled={
                          !newMessage.trim() ||
                          !chatId
                        }
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
