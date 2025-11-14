using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Statistic.AdminStatistic
{
    public class AdminTopDto
    {
        public List<AdminTopPartnerDto> TopContractors { get; set; } = new();
        public List<AdminTopPartnerDto> TopDistributors { get; set; } = new();
    }
}
