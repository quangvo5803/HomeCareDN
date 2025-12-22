import { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
  HubConnectionState,
} from '@microsoft/signalr';
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
    let isCancelled = false;

    // 🔴 Logout → stop all connections
    if (!user?.id) {
      connectionRef.current?.stop();
      chatConnectionRef.current?.stop();

      connectionRef.current = null;
      chatConnectionRef.current = null;

      setConnectionState('disconnected');
      setChatConnectionState('disconnected');
      return;
    }

    // 🟢 Create Application Hub
    if (!connectionRef.current) {
      const connection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/application`, {
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
          accessTokenFactory: () => localStorage.getItem('accessToken') || '',
        })
        .configureLogging(LogLevel.None)
        .withAutomaticReconnect()
        .build();

      connectionRef.current = connection;

      connection.onreconnecting(() => setConnectionState('reconnecting'));
      connection.onreconnected(() => setConnectionState('connected'));
      connection.onclose(() => setConnectionState('disconnected'));

      (async () => {
        try {
          await connection.start();
          if (!isCancelled) setConnectionState('connected');
        } catch {
          if (!isCancelled) setConnectionState('error');
        }
      })();
    }

    // 🟢 Create Chat Hub
    if (!chatConnectionRef.current) {
      const chatConnection = new HubConnectionBuilder()
        .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat`, {
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
          accessTokenFactory: () => localStorage.getItem('accessToken') || '',
        })
        .configureLogging(LogLevel.None)
        .withAutomaticReconnect()
        .build();

      chatConnectionRef.current = chatConnection;

      chatConnection.onreconnecting(() =>
        setChatConnectionState('reconnecting')
      );
      chatConnection.onreconnected(() => setChatConnectionState('connected'));
      chatConnection.onclose(() => setChatConnectionState('disconnected'));

      (async () => {
        try {
          await chatConnection.start();
          if (!isCancelled) setChatConnectionState('connected');
        } catch {
          if (!isCancelled) setChatConnectionState('error');
        }
      })();
    }

    return () => {
      isCancelled = true;
    };
  }, [user]);

  /* 🛡️ Safe wrapper: chỉ expose connection khi CONNECTED */
  const contextValue = useMemo(
    () => ({
      connection:
        connectionRef.current?.state === HubConnectionState.Connected
          ? connectionRef.current
          : null,
      connectionState,

      chatConnection:
        chatConnectionRef.current?.state === HubConnectionState.Connected
          ? chatConnectionRef.current
          : null,
      chatConnectionState,
    }),
    [connectionState, chatConnectionState]
  );

  return (
    <RealtimeContext.Provider value={contextValue}>
      {children}
    </RealtimeContext.Provider>
  );
};

RealtimeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
