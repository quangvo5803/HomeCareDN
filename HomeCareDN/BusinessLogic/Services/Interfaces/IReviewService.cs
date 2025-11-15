using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Review;

namespace BusinessLogic.Services.Interfaces
{
    public interface IReviewService
    {
        Task<ReviewDto> CreateReviewAsync(ReviewCreateRequestDto request);
        Task<PagedResultDto<ReviewDto>> GetAllReviewsAsync(QueryParameters parameters);
        Task DeleteReviewAsync(Guid id);
    }
}
