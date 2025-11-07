using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;

namespace BusinessLogic.Services.Interfaces
{
    public interface IStatisticService
    {
        Task<IEnumerable<AdminLineChartDto>> GetLineChartStatisticsAsync(int year);
        Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year);
        Task<AdminTopStatisticsDto> GetTopStatisticsAsync();
        Task<AdminStatStatisticDto> GetStatStatisticAsync();
    }
}
