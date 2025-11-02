import { useEffect, useRef, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';
import { toast } from 'react-toastify';
import { useAuth } from '../hook/useAuth';
import RealtimeContext from './RealtimeContext';

export const RealtimeProvider = ({ children }) => {
  const { user } = useAuth();
  const connectionRef = useRef(null);
  const [connectionState, setConnectionState] = useState('disconnected');

  useEffect(() => {
    if (!user?.id) {
      // Khi logout -> ngắt kết nối
      if (connectionRef.current) {
        connectionRef.current.stop();
        connectionRef.current = null;
        setConnectionState('disconnected');
      }
      return;
    }

    // Nếu đã có connection rồi thì không tạo lại
    if (connectionRef.current) return;

    const connection = new HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_URL}/hubs/application?userId=${
          user.id
        }&role=${user.role}`,
        {
          transport: HttpTransportType.WebSockets,
          skipNegotiation: true,
        }
      )
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection
      .start()
      .then(() => setConnectionState('connected'))
      .catch((err) => {
        setConnectionState('error');
        toast.error(`SignalR connection failed: ${err.message}`);
      });

    connection.onreconnecting(() => setConnectionState('reconnecting'));
    connection.onreconnected(() => setConnectionState('connected'));
    connection.onclose(() => setConnectionState('disconnected'));

    return () => {
      connection.stop();
      connectionRef.current = null;
      setConnectionState('disconnected');
    };
  }, [user]);

  const contextValue = useMemo(
    () => ({
      connection: connectionRef.current,
      connectionState,
    }),
    [connectionState]
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
