using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;
using BusinessLogic.DTOs.Application.Statistic.ContractorStatitic;

namespace BusinessLogic.Services.Interfaces
{
    public interface IStatisticService
    {
        Task<IEnumerable<AdminBarChartDto>> GetBarChartStatisticsAsync(int year);
        Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year);
        Task<IEnumerable<AdminLineChartDto>> GetLineChartStatisticsAsync(int year);
        Task<AdminTopStatisticsDto> GetTopStatisticsAsync();
        Task<AdminStatStatisticDto> GetStatStatisticAsync();
        Task<IEnumerable<ContractorBarChartDto>> GetBarChartForContractorStatisticsAsync(
            int year,
            Guid userID
        );
        Task<IEnumerable<ContractorLineChartDto>> GetLineChartForContractorStatisticsAsync(
            int year,
            Guid userID
        );
    }
}
