using BusinessLogic.DTOs.Application.Static;
using BusinessLogic.DTOs.Application.Statistic;

namespace BusinessLogic.Services.Interfaces
{
    public interface IStatisticService
    {
        Task<IEnumerable<AdminLineChartDto>> GetLineStatisticsAsync(int year);
        Task<IEnumerable<AdminPieChartDto>> GetPieStatisticsAsync(int year);
        Task<AdminTopStatisticsDto> GetTopStatisticsAsync();
    }
}
