import { useEffect, useContext } from 'react';
import RealtimeContext from './RealtimeContext';

export default function useRealtime(
  handlers = {},
  connectionType = 'application'
) {
  const { connection, chatConnection } = useContext(RealtimeContext);
  const targetConnection =
    connectionType === 'chat' ? chatConnection : connection;
  useEffect(() => {
    if (!targetConnection) return;

    // Đăng ký sự kiện
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) targetConnection.on(event, handler);
    });

    // Cleanup khi unmount
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        if (handler) targetConnection.off(event, handler);
      });
    };
  }, [targetConnection, handlers]);
}
