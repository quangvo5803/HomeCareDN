using System.ComponentModel.DataAnnotations;

namespace DataAccess.Entities.Application
{
    public class Material
    {
        [Key]
        public Guid MaterialID { get; set; }

        [Required]
        public required string UserID { get; set; }

        [Required]
        public required string Name { get; set; }
        public Brand Brand { get; set; }
        public string? Unit { get; set; }
        public string? Description { get; set; }
        public double UnitPrice { get; set; }
        public ICollection<Image>? Images { get; set; }
        public Guid CategoryID { get; set; }
        public Category Category { get; set; } = null!;
    }
    public enum Brand
    {
        // Xi măng
        [Display(Name = "Vicem Hải Vân")]
        Vicem,
        [Display(Name = "Kim Đỉnh")]
        KimDinh,
        [Display(Name = "Xuân Thành")]
        XuanThanh,
        [Display(Name = "Sông Giang")]
        SongGiang,
        [Display(Name = "Đồng Lâm")]
        DongLam,
        [Display(Name = "Thái Bình")]
        ThaiBinh,

        // Thép/Tôn
        [Display(Name = "Hòa Phát")]
        HoaPhat,
        [Display(Name = "Pomina")]
        Pomina,
        [Display(Name = "Hoa Sen")]
        HoaSen,
        [Display(Name = "Đông Á")]
        DongA,

        // Nhựa/Ống
        [Display(Name = "Tiền Phong")]
        TienPhong,
        [Display(Name = "Bình Minh")]
        BinhMinh,
        [Display(Name = "Đệ Nhất")]
        DeNhat,
        [Display(Name = "Dekko")]
        Dekko,
        [Display(Name = "Europipe")]
        Europipe,

        // Gạch/Ốp lát
        [Display(Name = "Viglacera")]
        Viglacera,
        [Display(Name = "Prime")]
        Prime,
        [Display(Name = "Đồng Tâm")]
        DongTam,
        [Display(Name = "Vietceramics")]
        Vietceramics,
        [Display(Name = "Dacera")]
        Dacera,

        // Sơn
        [Display(Name = "Jotun")]
        Jotun,
        [Display(Name = "Dulux")]
        Dulux,
        [Display(Name = "TOA")]
        TOA,
        [Display(Name = "Nippon")]
        Nippon,
        [Display(Name = "Mykolor")]
        Mykolor,

        Other
    }
}
