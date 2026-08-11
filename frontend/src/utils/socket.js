import io from 'socket.io-client';

let socket = null;

export const initializeSocket = (token) => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
  const socketURL = API_URL.replace('/api', '');

  socket = io(socketURL, {
    transports: ['websocket'],
    auth: {
      token,
    },
  });

  socket.on('connect', () => {
    console.log('Socket connected successfully');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error('Socket not initialized. Call initializeSocket first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Socket event helpers
export const socketEvents = {
  // Join a room (user's personal room)
  joinRoom: (userId) => {
    getSocket().emit('join-room', userId);
  },

  // Send a message
  sendMessage: (data) => {
    getSocket().emit('send-message', data);
  },

  // Emergency alert
  sendEmergencyAlert: (data) => {
    getSocket().emit('emergency-alert', data);
  },

  // Helper confirmation
  confirmHelp: (data) => {
    getSocket().emit('confirm-help', data);
  },

  // Typing indicator
  startTyping: (data) => {
    getSocket().emit('typing-start', data);
  },

  stopTyping: (data) => {
    getSocket().emit('typing-stop', data);
  },

  // Listeners
  onReceiveMessage: (callback) => {
    getSocket().on('receive-message', callback);
  },

  onEmergencyAlert: (callback) => {
    getSocket().on('emergency-alert', callback);
  },

  onHelperConfirmed: (callback) => {
    getSocket().on('helper-confirmed', callback);
  },

  onHelperRequest: (callback) => {
    getSocket().on('helper-request', callback);
  },

  onTyping: (callback) => {
    getSocket().on('typing', callback);
  },

  // Remove listeners
  off: (event) => {
    getSocket().off(event);
  },
};