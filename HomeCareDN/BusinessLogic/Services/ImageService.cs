using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ImageService : IImageService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ImageService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task DeleteImageAsync(string imageUrl)
        {
            var request = await _unitOfWork.ImageRepository.GetAsync(img =>
                img.ImageUrl == imageUrl
            );

            if (request == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "ImageUrl", new[] { "IMAGE_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }

            await _unitOfWork.ImageRepository.DeleteImageAsync(request.PublicId);
            await _unitOfWork.SaveAsync();
        }
    }
}
