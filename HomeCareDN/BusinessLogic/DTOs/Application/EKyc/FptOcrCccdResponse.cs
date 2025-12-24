namespace BusinessLogic.DTOs.Application.EKyc
{
    public class FptOcrCccdResponse
    {
        public int ErrorCode { get; set; }
        public string ErrorMessage { get; set; } = string.Empty;
        public List<FptOcrCccdData> Data { get; set; } = new();
    }
    public class FptOcrCccdData
    {
        public string Id { get; set; } = "";
        public string Id_prob { get; set; } = "";
        public string Name { get; set; } = "";
        public string Name_prob { get; set; } = "";
        public string Dob { get; set; } = "";
        public string Dob_prob { get; set; } = "";
        public string Address { get; set; } = "";
        public string Address_prob { get; set; } = "";
        public string Type { get; set; } = "";
    }
}
