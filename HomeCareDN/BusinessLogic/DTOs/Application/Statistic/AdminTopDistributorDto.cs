namespace BusinessLogic.DTOs.Application.Statistic
{
    public class AdminTopDistributorDto
    {
        public Guid DistributorID { get; set; }
        public string Email { get; set; } = string.Empty;
        public int ApprovedCount { get; set; }
        public double TotalRevenue { get; set; }
    }
}
