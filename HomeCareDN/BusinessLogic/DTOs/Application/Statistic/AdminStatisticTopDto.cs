using BusinessLogic.DTOs.Application.Statistic;
using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Static
{
    public class AdminTopStatisticsDto
    {
        public List<AdminTopContractorDto> TopContractors { get; set; } = new();
        public List<AdminTopDistributorDto> TopDistributors { get; set; } = new();
    }
}
