import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const newSocket = io(API_URL.replace('/api', ''), {
        withCredentials: true,
      });

      setSocket(newSocket);

      newSocket.emit('join-room', user.id);

      newSocket.on('emergency-alert', (data) => {
        toast.error(`⚠️ Emergency alert from ${data.user.name}!`);
      });

      newSocket.on('receive-message', (data) => {
        toast.success(`New message received`);
      });

      newSocket.on('helper-request', (data) => {
        toast.info(`${data.name} added you as a primary helper`);
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};
