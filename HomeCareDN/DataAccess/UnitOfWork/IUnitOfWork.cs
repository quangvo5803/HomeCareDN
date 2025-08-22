using DataAccess.Repositories.Interfaces;

namespace DataAccess.UnitOfWork
{
    public interface IUnitOfWork
    {
        IImageRepository ImageRepository { get; }
        IServiceRequestRepository ServiceRequestRepository { get; }
        IMaterialRepository MaterialRepository { get; }
        ICartItemRepository CartItemRepository { get; }
        ICartRepository CartRepository { get; }
        IServiceRepository ServiceRepository { get; }
        IContractorApplicationRepository ContractorApplicationRepository { get; }
        ICategoryRepository CategoryRepository { get; }
        Task SaveAsync();
    }
}
