// Danh sách sự kiện SignalR được backend emit
export const RealtimeEvents = Object.freeze({
  // ServiceRequest
  ServiceRequestCreated: 'ServiceRequest.Created',
  ServiceRequestDelete: 'ServiceRequest.Delete',
  ServiceRequestClosed: 'ServiceRequest.Closed',

  //MaterialRequest
  MaterialRequestCreated: 'MaterialRequest.Created',
  MaterialRequestDelete: 'MaterialRequest.Delete',
  MaterialRequestClosed: 'MaterialRequest.Closed',
  // ContractorApplication
  ContractorApplicationCreated: 'ContractorApplication.Created',
  ContractorApplicationAccept: 'ContractorApplication.Accept',
  ContractorApplicationRejected: 'ContractorApplication.Rejected',
  ContractorApplicationDelete: 'ContractorApplication.Delete',

  // DistributorApplication
  DistributorApplicationCreated: 'DistributorApplication.Created',
  DistributorApplicationAccept: 'DistributorApplication.Accept',
  DistributorApplicationRejected: 'DistributorApplication.Rejected',
  DistributorApplicationDelete: 'DistributorApplication.Delete',
  // Payment
  PaymentTransactionUpdated: 'PaymentTransation.Updated',

  // Chat
  ChatMessageCreated: 'Chat.MessageCreated',
  ConversationUnlocked: 'Chat.ConversationUnlocked',
  NewAdminMessage: 'Chat.NewAdminMessage',
  NewConversationForAdmin: 'Chat.NewConversationForAdmin',
});
