using AutoMapper;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Review;
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

        public async Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(QueryParameters parameters)
        {
            var query = _unitOfWork.ReviewRepository.GetQueryable();

            //Get all Partenr Reviews
            if (parameters.FilterID.HasValue)
            {
                query = query.Where(r => r.PartnerID == parameters.FilterID.ToString());
            }
            if (parameters.Rating.HasValue)
            {
                query = query.Where(r => r.Rating == parameters.Rating);
            }

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

            var userIds = serviceDtos.Select(r => r.UserID).ToList();
            var partnerIds = serviceDtos.Select(r => r.PartnerID).ToList();

            var allUserIds = userIds.Concat(partnerIds).Distinct().ToList();
            var users = await _userManager
                .Users.Where(u => allUserIds.Contains(u.Id))
                .ToListAsync();
            var userDict = users.ToDictionary(u => u.Id, u => u.FullName);

            foreach (var dto in serviceDtos)
            {
                dto.CustomerName = userDict.GetValueOrDefault(dto.UserID);
                dto.PartnerName = userDict.GetValueOrDefault(dto.PartnerID);
            }

            return new PagedResultDto<ReviewDto>
            {
                Items = serviceDtos,
                TotalCount = totalCount,
                PageNumber = parameters.PageNumber,
                PageSize = parameters.PageSize,
            };
        }

        public async Task<ReviewDto> CreateReviewAsync(ReviewCreateRequestDto request)
        {
            var review = _mapper.Map<Review>(request);
            review.ReviewID = Guid.NewGuid();

            if (request.ImageUrls != null && request.ImagePublicIds != null)
            {
                await AddReviewImagesAsync(
                    review.ReviewID,
                    request.ImageUrls,
                    request.ImagePublicIds
                );
            }

            await _unitOfWork.ReviewRepository.AddAsync(review);
            await _unitOfWork.SaveAsync();

            await UpdatePartnerStatsAsync(
                request.PartnerID,
                request.Rating,
                request.ServiceRequestID,
                request.MaterialRequestID
            );

            return _mapper.Map<ReviewDto>(review);
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

        private async Task AddReviewImagesAsync(
            Guid reviewId,
            IEnumerable<string> imageUrls,
            IEnumerable<string> imagePublicIds
        )
        {
            var ids = imagePublicIds.ToList();
            var images = imageUrls
                .Select(
                    (url, i) =>
                        new Image
                        {
                            ImageID = Guid.NewGuid(),
                            ReviewID = reviewId,
                            ImageUrl = url,
                            PublicId = i < ids.Count ? ids[i] : string.Empty,
                        }
                )
                .ToList();

            await _unitOfWork.ImageRepository.AddRangeAsync(images);
        }

        private async Task UpdatePartnerStatsAsync(
            string partnerId,
            int rating,
            Guid? serviceRequestId,
            Guid? materialRequestId
        )
        {
            var partner = await _userManager.FindByIdAsync(partnerId);
            if (partner == null)
                return;

            UpdateAverageRating(partner, rating);

            double projectValue = await GetProjectValueAsync(serviceRequestId, materialRequestId);

            int reputationChange = CalculateReputationPoints(projectValue, rating);
            partner.ReputationPoints += reputationChange;

            await _userManager.UpdateAsync(partner);
        }

        private static void UpdateAverageRating(ApplicationUser partner, int newRating)
        {
            partner.AverageRating =
                (partner.AverageRating * partner.RatingCount + newRating)
                / (partner.RatingCount + 1);
            partner.RatingCount += 1;
        }

        private async Task<double> GetProjectValueAsync(
            Guid? serviceRequestId,
            Guid? materialRequestId
        )
        {
            if (serviceRequestId.HasValue)
            {
                var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                    filter: sr => sr.ServiceRequestID == serviceRequestId.Value,
                    includeProperties: "SelectedContractorApplication"
                );

                if (serviceRequest?.SelectedContractorApplication != null)
                {
                    return serviceRequest.SelectedContractorApplication.EstimatePrice;
                }
            }
            else if (materialRequestId.HasValue)
            {
                var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                    filter: mr => mr.MaterialRequestID == materialRequestId.Value,
                    includeProperties: "SelectedDistributorApplication"
                );

                if (materialRequest?.SelectedDistributorApplication != null)
                {
                    return materialRequest.SelectedDistributorApplication.TotalEstimatePrice;
                }
            }
            return 0;
        }

        private static int CalculateReputationPoints(double projectValue, int rating)
        {
            int point = 0;

            switch (rating)
            {
                case 5:
                    point += 5;
                    break;
                case 4:
                    point += 3;
                    break;
                case 3:
                    point += 0;
                    break;
                case 2:
                    point -= 5;
                    break;
                case 1:
                    point -= 10;
                    break;
                default:
                    point += 0;
                    break;
            }

            return point;
        }
    }
}
