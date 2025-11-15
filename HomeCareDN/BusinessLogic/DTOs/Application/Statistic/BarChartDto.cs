namespace BusinessLogic.DTOs.Application.Statistic
{
    public class BarChartDto : BaseChartDto
    {
        public int RepairCount { get; set; }
        public int ConstructionCount { get; set; }
        public int MaterialCount { get; set; }
    }
}
