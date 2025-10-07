using DataAccess.Repositories.Interfaces;

namespace DataAccess.UnitOfWork
{
    public interface IUnitOfWork
    {
        IImageRepository ImageRepository { get; }
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
        Task SaveAsync();
    }
}
