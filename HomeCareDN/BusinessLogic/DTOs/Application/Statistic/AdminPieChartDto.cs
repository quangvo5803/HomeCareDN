using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Statistic
{
    public class AdminPieChartDto
    {
        public ServiceType ServiceType { get; set; }
        public int Count { get; set; }
    }
}
