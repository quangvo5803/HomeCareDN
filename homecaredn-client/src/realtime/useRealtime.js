import { useEffect, useContext } from 'react';
import RealtimeContext from './RealtimeContext';

export default function useRealtime(handlers = {}) {
  const { connection } = useContext(RealtimeContext);

  useEffect(() => {
    if (!connection) return;

    // Đăng ký sự kiện
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) connection.on(event, handler);
    });

    // Cleanup khi unmount
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        if (handler) connection.off(event, handler);
      });
    };
  }, [connection, handlers]);
}
