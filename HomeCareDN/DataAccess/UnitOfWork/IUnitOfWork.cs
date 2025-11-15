using DataAccess.Repositories.Interfaces;

namespace DataAccess.UnitOfWork
{
    public interface IUnitOfWork
    {
        IImageRepository ImageRepository { get; }
        IDocumentRepository DocumentRepository { get; }
        IServiceRequestRepository ServiceRequestRepository { get; }
        IMaterialRepository MaterialRepository { get; }
        IServiceRepository ServiceRepository { get; }
        IContractorApplicationRepository ContractorApplicationRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        IBrandRepository BrandRepository { get; }
        IConversationRepository ConversationRepository { get; }
        IChatMessageRepository ChatMessageRepository { get; }
        IContactSupportRepository ContactSupportRepository { get; }
        IPartnerRequestRepository PartnerRequestRepository { get; }
        IMaterialRequestRepository MaterialRequestRepository { get; }
        IMaterialRequestItemRepository MaterialRequestItemRepository { get; }
        IDistributorApplicationRepository DistributorApplicationRepository { get; }
        IDistributorApplicationItemRepository DistributorApplicationItemRepository { get; }
        IPaymentTransactionsRepository PaymentTransactionsRepository { get; }
        IReviewRepository ReviewRepository { get; }
        Task SaveAsync();
    }
}
