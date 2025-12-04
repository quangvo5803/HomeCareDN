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
  const { user } = useAuth();
  const connectionRef = useRef(null);
  const chatConnectionRef = useRef(null);

  const [connectionState, setConnectionState] = useState('disconnected');
  const [chatConnectionState, setChatConnectionState] =
    useState('disconnected');

  useEffect(() => {
    let isCancelled = false;

    // Nếu chưa đăng nhập thì ngắt kết nối
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

    // Nếu đã có connection thì không tạo lại
    if (connectionRef.current) return;
    if (chatConnectionRef.current) return;

    const connection = new HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_URL}/hubs/application?userId=${
          user.id
        }&role=${user.role}`,
        {
          transport:
            HttpTransportType.WebSockets |
            HttpTransportType.ServerSentEvents |
            HttpTransportType.LongPolling,
          skipNegotiation: false,
        }
      )
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    connectionRef.current = connection;

    // Dùng async function để tránh race condition
    const startConnection = async () => {
      try {
        await connection.start();
        if (!isCancelled) setConnectionState('connected');
      } catch {
        if (!isCancelled) {
          setConnectionState('error');
        }
      }
    };

    startConnection();

    connection.onreconnecting(() => setConnectionState('reconnecting'));
    connection.onreconnected(() => setConnectionState('connected'));
    connection.onclose(() => setConnectionState('disconnected'));

    const chatConnection = new HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_URL}/hubs/chat?userId=${user.id}`, {
        transport:
          HttpTransportType.WebSockets |
          HttpTransportType.ServerSentEvents |
          HttpTransportType.LongPolling,
        skipNegotiation: false,
      })
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect([0, 2000, 10000, 30000])
      .build();

    chatConnectionRef.current = chatConnection;

    // Dùng async function để tránh race condition
    const startChatConnection = async () => {
      try {
        await chatConnection.start();
        if (!isCancelled) setChatConnectionState('connected');
      } catch {
        if (!isCancelled) {
          setChatConnectionState('error');
        }
      }
    };

    startChatConnection();

    chatConnection.onreconnecting(() => setChatConnectionState('reconnecting'));
    chatConnection.onreconnected(() => setChatConnectionState('connected'));
    chatConnection.onclose(() => setChatConnectionState('disconnected'));

    // Cleanup
    return () => {
      isCancelled = true;
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
    };
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
