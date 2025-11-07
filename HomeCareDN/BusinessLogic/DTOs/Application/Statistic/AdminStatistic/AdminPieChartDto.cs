using DataAccess.Entities.Application;

namespace BusinessLogic.DTOs.Application.Statistic.AdminStatistic
{
    public class AdminPieChartDto
    {
        public string Label { get; set; } = default!;
        public int Count { get; set; }
    }
}
