import { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';
import { useAuth } from '../hook/useAuth';
import RealtimeContext from './RealtimeContext';

export const RealtimeProvider = ({ children }) => {
  const { user, logout } = useAuth();
  const connectionRef = useRef(null);
  const chatConnectionRef = useRef(null);

  const [connectionState, setConnectionState] = useState('disconnected');
  const [chatConnectionState, setChatConnectionState] =
    useState('disconnected');

  useEffect(() => {
    let isCancelled = false;

    if (!user?.id) {
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionState('disconnected');
      }
      if (chatConnectionRef.current) {
        chatConnectionRef.current.stop();
        chatConnectionRef.current = null;
        setChatConnectionState('disconnected');
      }
      return;
    }

    if (connectionRef.current) return;
    if (chatConnectionRef.current) return;

    const startHub = async (hubUrl, ref, setState) => {
      const connection = new HubConnectionBuilder()
        .withUrl(hubUrl, {
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
        })
        .configureLogging(LogLevel.None)
        .withAutomaticReconnect([0, 2000, 5000, 10000])
        .build();

      ref.current = connection;

      connection.onclose((err) => {
        setState('disconnected');
        if (err?.message?.includes('Unauthorized')) {
          logout();
        }
      });
      connection.onreconnecting(() => setState('reconnecting'));
      connection.onreconnected(() => setState('connected'));

      try {
        await connection.start();
        if (!isCancelled) setState('connected');
      } catch {
        if (!isCancelled) setState('error');
      }
    };

    startHub(
      `${import.meta.env.VITE_API_URL}/hubs/application?userId=${
        user.id
      }&role=${user.role}`,
      connectionRef,
      setConnectionState
    );
    startHub(
      `${import.meta.env.VITE_API_URL}/hubs/chat?userId=${user.id}`,
      chatConnectionRef,
      setChatConnectionState
    );

    return () => {
      isCancelled = true;
      if (connectionRef.current) connectionRef.current.stop();
      if (chatConnectionRef.current) chatConnectionRef.current.stop();
      setConnectionState('disconnected');
      setChatConnectionState('disconnected');
      connectionRef.current = null;
      chatConnectionRef.current = null;
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const contextValue = useMemo(
    () => ({
      connection: connectionRef.current,
      connectionState,
      chatConnection: chatConnectionRef.current,
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
