namespace BusinessLogic.DTOs.Application.Statistic.ContractorStatitic
{
    public class ContractorBarChartDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public double RevenueCount { get; set; }
        public int RepairCount { get; set; }
        public int ConstructionCount { get; set; }
    }
}
