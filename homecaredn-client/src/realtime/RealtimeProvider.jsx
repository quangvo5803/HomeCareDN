import { useEffect, useRef, useState, useMemo } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from '../hook/useAuth';
import RealtimeContext from './RealtimeContext';

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const connectionRef = useRef(null);
  const chatConnectionRef = useRef(null);

  const [connectionState, setConnectionState] = useState('disconnected');
  const [chatConnectionState, setChatConnectionState] =
    useState('disconnected');

  useEffect(() => {
    if (!user) return;

    if (!connectionRef.current) {
      connectionRef.current = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/application`, {
          accessTokenFactory: () => localStorage.getItem('accessToken'),
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

      connectionRef.current
        .start()
        .then(() => setConnectionState('connected'))
        .catch(() => setConnectionState('error'));
    }

    if (!chatConnectionRef.current) {
      chatConnectionRef.current = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
          accessTokenFactory: () => localStorage.getItem('accessToken'),
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

      chatConnectionRef.current
        .start()
        .then(() => setChatConnectionState('connected'))
        .catch(() => setChatConnectionState('error'));
    }

    return () => {
      connectionRef.current?.stop();
      chatConnectionRef.current?.stop();
      connectionRef.current = null;
      chatConnectionRef.current = null;
    };
  }, [user]);

  const value = useMemo(
    () => ({
      connection: connectionRef.current,
      chatConnection: chatConnectionRef.current,
      connectionState,
      chatConnectionState,
    }),
    [connectionState, chatConnectionState]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
