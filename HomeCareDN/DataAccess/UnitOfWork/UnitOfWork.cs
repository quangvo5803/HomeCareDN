using DataAccess.Data;
using DataAccess.Repositories;
using DataAccess.Repositories.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Ultitity.Options;
using WebApi.Repositories;

namespace DataAccess.UnitOfWork
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _db;

        public IImageRepository ImageRepository { get; private set; }
        public IDocumentRepository DocumentRepository { get; private set; }
        public IServiceRequestRepository ServiceRequestRepository { get; private set; }
        public IMaterialRepository MaterialRepository { get; private set; }
        public IServiceRepository ServiceRepository { get; private set; }
        public IContractorApplicationRepository ContractorApplicationRepository
        {
            get;
            private set;
        }
        public ICategoryRepository CategoryRepository { get; private set; }
        public IBrandRepository BrandRepository { get; private set; }
        public IConversationRepository ConversationRepository { get; private set; }
        public IChatMessageRepository ChatMessageRepository { get; private set; }
        public IContactSupportRepository ContactSupportRepository { get; private set; }
        public IPartnerRequestRepository PartnerRequestRepository { get; private set; }
        public IMaterialRequestRepository MaterialRequestRepository { get; private set; }
        public IMaterialRequestItemRepository MaterialRequestItemRepository { get; private set; }
        public IDistributorApplicationRepository DistributorApplicationRepository
        {
            get;
            private set;
        }
        public IDistributorApplicationItemRepository DistributorApplicationItemRepository
        {
            get;
            private set;
        }

        public IPaymentTransactionsRepository PaymentTransactionsRepository { get; private set; }
        public IReviewRepository ReviewRepository { get; private set; }

        public UnitOfWork(ApplicationDbContext db, IOptions<CloudinaryOptions> cloudinaryOptions)
        {
            _db = db;
            ImageRepository = new ImageRepository(_db, cloudinaryOptions);
            DocumentRepository = new DocumentRepository(_db, cloudinaryOptions);
            ServiceRequestRepository = new ServiceRequestRepository(_db);
            MaterialRepository = new MaterialRepository(_db);
            ServiceRepository = new ServiceRepository(_db);
            ContractorApplicationRepository = new ContractorApplicationRepository(_db);
            CategoryRepository = new CategoryRepository(_db);
            BrandRepository = new BrandRepository(_db);
            ConversationRepository = new ConversationRepository(_db);
            ChatMessageRepository = new ChatMessageRepository(_db);
            ContactSupportRepository = new ContactSupportRepository(_db);
            PartnerRequestRepository = new PartnerRequestRepository(_db);
            MaterialRequestRepository = new MaterialRequestRepository(_db);
            MaterialRequestItemRepository = new MaterialRequestItemRepository(_db);
            DistributorApplicationRepository = new DistributorApplicationRepository(_db);
            DistributorApplicationItemRepository = new DistributorApplicationItemRepository(_db);
            PaymentTransactionsRepository = new PaymentTransactionsRepository(_db);
            ReviewRepository = new ReviewRepository(_db);
        }

        public async Task SaveAsync()
        {
            await _db.SaveChangesAsync();
        }
    }
}
