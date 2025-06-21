using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using DataAccess.Data;
using DataAccess.Entities.Application;
using DataAccess.Repositories;
using DataAccess.Repositories.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace WebApi.Repositories
{
    public class ImageRepository : Repository<Image>, IImageRepository
    {
        private readonly ApplicationDbContext _db;
        private readonly Cloudinary _cloudinary;
        private readonly IConfiguration _configuration;

        public ImageRepository(ApplicationDbContext db, IConfiguration configuration)
            : base(db)
        {
            _db = db;
            _configuration = configuration;
            var account = new Account(
                _configuration["Cloudinary:CloudName"],
                _configuration["Cloudinary:ApiKey"],
                _configuration["Cloudinary:ApiSecret"]
            );
            _cloudinary = new Cloudinary(account);
        }

        public async Task UploadImageAsync(IFormFile file, string folder, Image image)
        {
            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = folder,
                UseFilename = true,
                UniqueFilename = true,
                Overwrite = false,
            };

            var result = await _cloudinary.UploadAsync(uploadParams);
            image.PublicId = result.PublicId;
            image.ImageUrl = result.SecureUrl.ToString();
            _db.Images.Add(image);
            await _db.SaveChangesAsync();
        }

        public async Task<bool> DeleteImageAsync(string publicId)
        {
            if (string.IsNullOrEmpty(publicId))
            {
                return false;
            }

            var deletionParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deletionParams);

            if (result.Error != null)
            {
                return false;
            }

            if (result.Result == "ok" || result.Result == "not found")
            {
                var image = await _db.Images.FirstOrDefaultAsync(i => i.PublicId == publicId);
                if (image != null)
                {
                    _db.Images.Remove(image);
                    await _db.SaveChangesAsync();
                }

                return true;
            }

            return false;
        }
    }
}
