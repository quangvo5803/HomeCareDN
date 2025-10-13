using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Ultitity.Options;

namespace DataAccess.Repositories
{
    public class DocumentRepository : Repository<Document>, IDocumentRepository
    {
        private readonly ApplicationDbContext _db;
        private readonly Cloudinary _cloudinary;

        public DocumentRepository(ApplicationDbContext db, IOptions<CloudinaryOptions> options)
            : base(db)
        {
            _db = db;

            var account = new Account(
                options.Value.CloudName,
                options.Value.ApiKey,
                options.Value.ApiSecret
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task<bool> DeleteDocumentAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
                return false;

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Error != null)
                return false;

            if (result.Result == "ok" || result.Result == "not found")
            {
                var document = await _db.Documents.FirstOrDefaultAsync(i => i.PublicId == publicId);
                if (document != null)
                {
                    _db.Documents.Remove(document);
                    await _db.SaveChangesAsync();
                }
                return true;
            }

            return false;
        }
    }
}
