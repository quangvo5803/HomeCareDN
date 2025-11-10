namespace BusinessLogic.DTOs.Application.Statistic.AdminStatistic
{
    public class AdminTopPartnerDto
    {
        /// ======= Contractor =======
        public Guid ContractorID { get; set; }
        public string ContractorEmail { get; set; } = string.Empty;
        public int ContractorApprovedCount { get; set; }
        public double ContractorTotalRevenue { get; set; }

        /// ======= Distributor =======
        public Guid DistributorID { get; set; }
        public string DistributorEmail { get; set; } = string.Empty;
        public int DistributorApprovedCount { get; set; }
        public double DistributorTotalRevenue { get; set; }
    }
}
