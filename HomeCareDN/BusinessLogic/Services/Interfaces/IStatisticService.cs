using BusinessLogic.DTOs.Application.Statistic;
using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;
using BusinessLogic.DTOs.Application.Statistic.ContractorStatistic;

namespace BusinessLogic.Services.Interfaces
{
    public interface IStatisticService
    {
        //================= Admin =================
        Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year);
        Task<IEnumerable<BarChartDto>> GetAdminBarChartAsync(int year);
        Task<IEnumerable<LineChartDto>> GetAdminLineChartAsync(int year);
        Task<AdminTopDto> GetAdminTopAsync();
        Task<AdminStatDto> GetAdminStatAsync();

        //================= Contractor =================
        Task<IEnumerable<BarChartDto>> GetContractorBarChartAsync(int year, Guid contractorID);
        Task<IEnumerable<LineChartDto>> GetContractorLineChartAsync(int year, Guid contractorID);
        Task<ContractorStatDto> GetContractorStatAsync(Guid contractorID);
    }
}
