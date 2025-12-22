import { useEffect, useRef, useState, useMemo } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { useAuth } from '../hook/useAuth';
import RealtimeContext from './RealtimeContext';

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();

  const appRef = useRef(null);
  const chatRef = useRef(null);

  const [appState, setAppState] = useState('disconnected');
  const [chatState, setChatState] = useState('disconnected');

  useEffect(() => {
    // 🔴 Chưa login → ngắt hết
    if (!user) {
      appRef.current?.stop();
      chatRef.current?.stop();
      appRef.current = null;
      chatRef.current = null;
      setAppState('disconnected');
      setChatState('disconnected');
      return;
    }

    /* ========= Application Hub ========= */
    if (!appRef.current) {
      const appConn = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/application`, {
          accessTokenFactory: () => localStorage.getItem('accessToken'),
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

      appRef.current = appConn;

      appConn
        .start()
        .then(() => setAppState('connected'))
        .catch(() => setAppState('error'));

      appConn.onreconnecting(() => setAppState('reconnecting'));
      appConn.onreconnected(() => setAppState('connected'));
      appConn.onclose(() => setAppState('disconnected'));
    }

    /* ========= Chat Hub ========= */
    if (!chatRef.current) {
      const chatConn = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
          accessTokenFactory: () => localStorage.getItem('accessToken'),
        })
        .withAutomaticReconnect()
        .configureLogging(LogLevel.None)
        .build();

      chatRef.current = chatConn;

      chatConn
        .start()
        .then(() => setChatState('connected'))
        .catch(() => setChatState('error'));

      chatConn.onreconnecting(() => setChatState('reconnecting'));
      chatConn.onreconnected(() => setChatState('connected'));
      chatConn.onclose(() => setChatState('disconnected'));
    }
  }, [user]);

  const value = useMemo(
    () => ({
      applicationHub: appRef.current,
      applicationState: appState,
      chatHub: chatRef.current,
      chatState,
    }),
    [appState, chatState]
  );

  return (
    <RealtimeContext.Provider value={value}>
      {children}
    </RealtimeContext.Provider>
  );
};
