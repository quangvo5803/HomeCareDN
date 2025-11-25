using BusinessLogic.DTOs.Application.Statistic;
using BusinessLogic.DTOs.Application.Statistic.AdminStatistic;
using BusinessLogic.DTOs.Application.Statistic.ContractorStatistic;
using BusinessLogic.DTOs.Application.Statistic.DistributorStatistic;

namespace BusinessLogic.Services.Interfaces
{
    public interface IStatisticService
    {
        Task<IEnumerable<BarChartDto>> GetBarChartAsync(
            int year,
            string role,
            Guid? contractorId = null,
            Guid? ditributorId = null
        );
        Task<IEnumerable<LineChartDto>> GetLineChartAsync(
            int year,
            string role,
            Guid? contractorId = null,
            Guid? ditributorId = null
        );

        //================= Admin =================
        Task<IEnumerable<AdminPieChartDto>> GetPieChartStatisticsAsync(int year);
        Task<AdminTopDto> GetAdminTopAsync();
        Task<AdminStatDto> GetAdminStatAsync();

        //================= Contractor =================
        Task<ContractorStatDto> GetContractorStatAsync(Guid contractorID);

        //================= Distributor =================
        Task<DistributorStatDto> GetDistributorStatAsync(Guid distributorID);
    }
}
