const socketIO = require('socket.io');

let io;

const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    socket.on('join-room', (userId) => {
      socket.join(`user-${userId}`);
    });

    socket.on('send-message', (data) => {
      io.to(`user-${data.receiverId}`).emit('receive-message', data);
    });

    socket.on('emergency-alert', (data) => {
      io.to('emergency-channel').emit('new-emergency', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initializeSocket, getIO };