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

            var partner = await _userManager.FindByIdAsync(request.PartnerID);
            if (partner != null)
            {
                partner.AverageRating =
                    (partner.AverageRating * partner.RatingCount + request.Rating)
                    / (partner.RatingCount + 1);
                partner.RatingCount += 1;

                double projectValue = 0;
                // Case 1: Review for Service Request (Contractor)
                if (request.ServiceRequestID.HasValue)
                {
                    var serviceRequest = await _unitOfWork.ServiceRequestRepository.GetAsync(
                        filter: sr => sr.ServiceRequestID == request.ServiceRequestID.Value,
                        includeProperties: "SelectedContractorApplication"
                    );

                    if (
                        serviceRequest != null
                        && serviceRequest.SelectedContractorApplication != null
                    )
                    {
                        projectValue = serviceRequest.SelectedContractorApplication.EstimatePrice;
                    }
                }
                // Case 2: Review for Material Request (Distributor)
                else if (request.MaterialRequestID.HasValue)
                {
                    var materialRequest = await _unitOfWork.MaterialRequestRepository.GetAsync(
                        filter: mr => mr.MaterialRequestID == request.MaterialRequestID.Value,
                        includeProperties: "SelectedDistributorApplication"
                    );

                    if (
                        materialRequest != null
                        && materialRequest.SelectedDistributorApplication != null
                    )
                    {
                        projectValue = materialRequest
                            .SelectedDistributorApplication
                            .TotalEstimatePrice;
                    }
                }

                int reputationChange = CalculateReputationPoints(projectValue, request.Rating);

                partner.ReputationPoints += reputationChange;
                await _userManager.UpdateAsync(partner);
            }
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

        private int CalculateReputationPoints(double projectValue, int rating)
        {
            if (projectValue < 10_000_000)
                return 0;

            double logValue = Math.Log10(projectValue);
            int basePoints = (int)Math.Max(1, (logValue - 7) * 3);

            basePoints = Math.Min(basePoints, 50);

            double multiplier;

            switch (rating)
            {
                case 5:
                    multiplier = 1.5;
                    break;
                case 4:
                    multiplier = 1.0;
                    break;
                case 3:
                    multiplier = 0.0;
                    break;
                case 2:
                    multiplier = -1.0;
                    break;
                case 1:
                    multiplier = -2.0;
                    break;
                default:
                    multiplier = 0;
                    break;
            }

            int finalPoints = (int)Math.Round(basePoints * multiplier);

            return finalPoints;
        }
    }
}
