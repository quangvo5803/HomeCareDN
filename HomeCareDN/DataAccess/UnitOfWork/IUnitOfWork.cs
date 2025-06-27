using DataAccess.Repositories.Interfaces;

namespace DataAccess.UnitOfWork
{
    public interface IUnitOfWork
    {
        IImageRepository ImageRepository { get; }
        IServiceRequestRepository ServiceRequestRepository { get; }
        IServiceRepository ServiceRepository { get; }
        IContractorApplicationRepository ContractorApplicationRepository { get; }
        Task SaveAsync();
    }
}
