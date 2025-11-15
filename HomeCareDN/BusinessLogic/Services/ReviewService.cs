using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Review;
using BusinessLogic.DTOs.Application.Service;
using BusinessLogic.Services.Interfaces;
using DataAccess.Entities.Application;
using DataAccess.Entities.Authorize;
using DataAccess.UnitOfWork;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class ReviewService : IReviewService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly UserManager<ApplicationUser> _userManager;

        public ReviewService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            UserManager<ApplicationUser> userManager
        )
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _userManager = userManager;
        }

        public async Task<ReviewDto> CreateReviewAsync(ReviewCreateRequestDto request)
        {
            var review = _mapper.Map<Review>(request);
            review.ReviewID = Guid.NewGuid();
            if (request.ImageUrls != null && request.ImagePublicIds != null)
            {
                var ids = request.ImagePublicIds?.ToList() ?? new List<string>();

                var images = request
                    .ImageUrls.Select(
                        (url, i) =>
                            new Image
                            {
                                ImageID = Guid.NewGuid(),
                                ReviewID = review.ReviewID,
                                ImageUrl = url,
                                PublicId = i < ids.Count ? ids[i] : string.Empty,
                            }
                    )
                    .ToList();

                await _unitOfWork.ImageRepository.AddRangeAsync(images);
            }
            await _unitOfWork.ReviewRepository.AddAsync(review);
            await _unitOfWork.SaveAsync();
            var partner = await _userManager.FindByIdAsync(request.PartnerID);
            if (partner != null)
            {
                partner.AverageRating =
                    (partner.AverageRating * partner.RatingCount + request.Rating)
                    / (partner.RatingCount + 1);
                partner.RatingCount += 1;
                await _userManager.UpdateAsync(partner);
            }
            return _mapper.Map<ReviewDto>(review);
        }

        public async Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(QueryParameters parameters)
        {
            var query = _unitOfWork.ReviewRepository.GetQueryable(asNoTracking: false);

            var totalCount = await query.CountAsync();

            query = parameters.SortBy switch
            {
                "createat" => query.OrderBy(s => s.CreatedAt),
                "createat_desc" => query.OrderByDescending(s => s.CreatedAt),
                "rating" => query.OrderBy(s => s.Rating),
                "rating_desc" => query.OrderByDescending(s => s.Rating),
                "random" => query.OrderBy(s => s.ReviewID),
                _ => query.OrderBy(b => b.CreatedAt),
            };
            query = query
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);
            var items = await query.ToListAsync();

            var serviceDtos = _mapper.Map<IEnumerable<ReviewDto>>(items);
            return new PagedResultDto<ReviewDto>
            {
                Items = serviceDtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task DeleteReviewAsync(Guid id)
        {
            var review = await _unitOfWork.ReviewRepository.GetAsync(r => r.ReviewID == id);
            if (review == null)
            {
                var errors = new Dictionary<string, string[]>
                {
                    { "REVIEW_ID", new[] { "REVIEW_NOT_FOUND" } },
                };
                throw new CustomValidationException(errors);
            }
            var images = await _unitOfWork.ImageRepository.GetRangeAsync(i => i.ReviewID == id);
            if (images != null && images.Any())
            {
                foreach (var image in images)
                {
                    await _unitOfWork.ImageRepository.DeleteImageAsync(image.PublicId);
                }
            }
            _unitOfWork.ReviewRepository.Remove(review);
            await _unitOfWork.SaveAsync();
        }
    }
}
