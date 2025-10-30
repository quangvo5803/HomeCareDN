import { useEffect, useMemo } from 'react';
import {
  HubConnectionBuilder,
  LogLevel,
  HttpTransportType,
} from '@microsoft/signalr';

export default function useRealtime(user, role, handlers = {}) {
  // Memo hóa handlers tránh tạo object mới mỗi render
  const handlersMemo = useMemo(() => handlers, [handlers]);

  useEffect(() => {
    if (!user?.id || !role) return;

    const connection = new HubConnectionBuilder()
      .withUrl(
        `${import.meta.env.VITE_API_URL}/hubs/application?userId=${
          user.id
        }&role=${role}`,
        {
          accessTokenFactory: () => localStorage.getItem('accessToken'),
          transport: HttpTransportType.WebSockets, // fallback LongPolling nếu cần
        }
      )
      .configureLogging(LogLevel.None)
      .withAutomaticReconnect()
      .build();

    connection.start();

    // Register handlers
    if (handlersMemo.onNewServiceRequest)
      connection.on('ServiceRequest.Created', handlersMemo.onNewServiceRequest);
    if (handlersMemo.onDeleteServiceRequest)
      connection.on(
        'ServiceRequest.Delete',
        handlersMemo.onDeleteServiceRequest
      );
    if (handlersMemo.onServiceRequestClosed)
      connection.on(
        'ServiceRequest.Closed',
        handlersMemo.onServiceRequestClosed
      );
    if (handlersMemo.onNewContractorApplication)
      connection.on(
        'ContractorApplication.Created',
        handlersMemo.onNewContractorApplication
      );
    if (handlersMemo.onAcceptedContractorApplication)
      connection.on(
        'ContractorApplication.Accept',
        handlersMemo.onAcceptedContractorApplication
      );
    if (handlersMemo.onRejectedContractorApplication)
      connection.on(
        'ContractorApplication.Rejected',
        handlersMemo.onRejectedContractorApplication
      );
    if (handlersMemo.onDeleteContractorApplication)
      connection.on(
        'ContractorApplication.Delete',
        handlersMemo.onDeleteContractorApplication
      );
    if (handlersMemo.onPaymentUpdate)
      connection.on('PaymentTransation.Updated', handlersMemo.onPaymentUpdate);

    return () => {
      // Cleanup handlers trước khi stop connection
      if (handlersMemo.onNewServiceRequest)
        connection.off(
          'ServiceRequest.Created',
          handlersMemo.onNewServiceRequest
        );
      if (handlersMemo.onDeleteServiceRequest)
        connection.off(
          'ServiceRequest.Delete',
          handlersMemo.onDeleteServiceRequest
        );
      if (handlersMemo.onServiceRequestClosed)
        connection.off(
          'ServiceRequest.Closed',
          handlersMemo.onServiceRequestClosed
        );
      if (handlersMemo.onNewContractorApplication)
        connection.off(
          'ContractorApplication.Created',
          handlersMemo.onNewContractorApplication
        );
      if (handlersMemo.onAcceptedContractorApplication)
        connection.off(
          'ContractorApplication.Accept',
          handlersMemo.onAcceptedContractorApplication
        );
      if (handlersMemo.onRejectedContractorApplication)
        connection.off(
          'ContractorApplication.Rejected',
          handlersMemo.onRejectedContractorApplication
        );
      if (handlersMemo.onDeleteContractorApplication)
        connection.off(
          'ContractorApplication.Delete',
          handlersMemo.onDeleteContractorApplication
        );
      if (handlersMemo.onPaymentUpdate)
        connection.off(
          'PaymentTransation.Updated',
          handlersMemo.onPaymentUpdate
        );

      connection.stop();
    };
  }, [user?.id, role, handlersMemo]);
}
