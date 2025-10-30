import { useEffect } from 'react';
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';

export default function useRealtime(user, role, handlers = {}) {
  useEffect(() => {
    if (!user?.id) return;

    const connection = new HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_URL}/hubs/application?userId=${
          user.id
        }&role=${role}`
      )
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connection.start().catch(() => {
      // có thể thêm xử lý reconnect hoặc báo lỗi nếu cần
    });

    connection.on('ServiceRequest.Created', (payload) => {
      handlers.onNewServiceRequest?.(payload);
    });
    connection.on('ServiceRequest.Delete', (payload) => {
      handlers.onDeleteServiceRequest?.(payload);
    });
    connection.on('ServiceRequest.Closed', (payload) =>
      handlers.onServiceRequestClosed?.(payload)
    );
    connection.on('ContractorApplication.Created', (payload) => {
      handlers.onNewContractorApplication?.(payload);
    });

    connection.on('ContractorApplication.Accept', (payload) => {
      handlers.onAcceptedContractorApplication?.(payload);
    });

    connection.on('ContractorApplication.Rejected', (payload) => {
      handlers.onRejectedContractorApplication?.(payload);
    });
    connection.on('ContractorApplication.Delete', (payload) => {
      handlers.onDeleteContractorApplication?.(payload);
    });
    connection.on('PaymentTransation.Updated', (payload) => {
      handlers.onPaymentUpdate?.(payload);
    });

    return () => {
      connection.stop();
    };
  }, [user?.id, role, handlers]);
}
