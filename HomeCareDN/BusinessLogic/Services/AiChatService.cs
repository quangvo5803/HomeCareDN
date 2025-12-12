using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.DTOs.Application.ServiceRequest;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Org.BouncyCastle.Utilities.Collections;
using Ultitity.Clients.Groqs;
using Ultitity.Exceptions;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IConfiguration _config;
        private readonly IGroqClient _groq;
        private readonly IDistributedCache _cache;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostEnvironment _env;
        private readonly IMaterialService _materialService;
        private readonly IServicesService _servicesService;

        private const string MESSAGE = "Message";
        private const string SYSTEM = "system";

        private const string ERROR_EMPTY_MESSAGE = "EMPTY_MESSAGE";

        private const string SYSTEM_PROMPT_CHAT =
            @"Bạn là Trợ lý ảo HomeCareDN (Tiếng Việt).
              
              NHIỆM VỤ:
              1. Hỗ trợ tìm kiếm vật liệu, dịch vụ.
              2. Dựa vào [DỮ LIỆU HỆ THỐNG] bên dưới để trả lời.

              QUY TẮC GẮN LINK (BẮT BUỘC):
              - Hãy nhìn vào phần [DỮ LIỆU HỆ THỐNG].
              - Nếu thấy dòng bắt đầu bằng 'LINK:', hãy copy nguyên văn dòng đó để gửi cho khách.
              - Ví dụ: Nếu dữ liệu có 'LINK: [Gạch A](/path/123)', bạn hãy trả lời: 'Bạn có thể tham khảo [Gạch A](/path/123)'.
              - NẾU KHÔNG CÓ DÒNG 'LINK:' NÀO -> TUYỆT ĐỐI KHÔNG ĐƯỢC TỰ BỊA LINK.

              QUY TẮC TRẢ LỜI:
              - Nếu [DỮ LIỆU HỆ THỐNG] có sản phẩm khớp nhu cầu -> Giới thiệu và gắn link.
              - Nếu [DỮ LIỆU HỆ THỐNG] trả về sản phẩm KHÔNG khớp (Gợi ý khác) -> Bạn nói: 'Hiện tại chưa có đúng loại bạn tìm, nhưng bên mình có các loại này...' (Gắn link các loại đó).
              - Nếu hoàn toàn không có gì -> Hướng dẫn tạo 'Yêu cầu' (Request).
              
              QUY TẮC TẠO YÊU CẦU:
              - Kiểm tra [USER PROFILE]. Nếu 'HasAddress' = false -> Nhắc cập nhật địa chỉ tại [Hồ sơ](/Customer).
              - Chỉ hướng dẫn tạo yêu cầu khi không tìm thấy sản phẩm ưng ý.";

        private const string SYSTEM_PROMPT_SUGGEST =
            @"Bạn là API gợi ý từ khóa (Autocomplete). 
              Nhiệm vụ: Dựa vào input của user, hãy đoán và trả về 5 từ khóa liên quan nhất trong lĩnh vực xây dựng/sửa chữa nhà.
              BẮT BUỘC: Chỉ trả về mảng JSON thuần túy (Array String). Không Markdown, không giải thích.
              Ví dụ: [""sửa điện"", ""thợ điện"", ""bóng đèn""]";

        private const string SYSTEM_PROMPT_SEARCH =
            @"Bạn là trợ lý tìm kiếm thông minh. Nhiệm vụ của bạn là dựa trên lịch sử tìm kiếm của người dùng để gợi ý các từ khóa liên quan, có thể dùng cho tìm kiếm sản phẩm (Material) hoặc dịch vụ (Repair/Construction). Trả về kết quả dưới dạng JSON danh sách từ khóa.";

        public AiChatService(
            IGroqClient groq,
            IDistributedCache cache,
            IUnitOfWork unitOfWork,
            IConfiguration config,
            IHostEnvironment env,
            IMaterialService materialService,
            IServicesService servicesService
        )
        {
            _groq = groq;
            _cache = cache;
            _unitOfWork = unitOfWork;
            _config = config;
            _env = env;
            _materialService = materialService;
            _servicesService = servicesService;
        }

        public async Task<AiChatResponseDto> ChatSupportAsync(AiChatRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prompt))
            {
                var error = new Dictionary<string, string[]>
                {
                    { MESSAGE, new[] { ERROR_EMPTY_MESSAGE } },
                };
                throw new CustomValidationException(error);
            }
            string internalContext = await BuildInternalContextAsync(dto.Prompt);

            var history = await GetHistoryFromCacheAsync(dto.SessionId);

            history.RemoveAll(x => x.Role == SYSTEM);

            var dynamicSystemPrompt =
                $"{SYSTEM_PROMPT_CHAT}\n\n[DỮ LIỆU HỆ THỐNG HIỆN TẠI]:\n{internalContext}";

            history.Insert(0, new ChatHistoryItem { Role = SYSTEM, Content = dynamicSystemPrompt });

            history.Add(new ChatHistoryItem { Role = "user", Content = dto.Prompt });

            var result = await _groq.ChatAsync(history);

            if (!string.IsNullOrEmpty(result))
            {
                history.Add(new ChatHistoryItem { Role = "assistant", Content = result });
                await SaveHistoryToCacheAsync(dto.SessionId, history);
            }

            return new AiChatResponseDto { Reply = result };
        }

        public async Task<List<string>> SuggestSearchAsync(AiSearchRequestDto aiSearchDto)
        {
            if (aiSearchDto == null || string.IsNullOrWhiteSpace(aiSearchDto.SearchType))
                return new List<string>();

            if (string.IsNullOrWhiteSpace(aiSearchDto.Language))
                aiSearchDto.Language = "en";

            var userHistory = aiSearchDto.History ?? new List<string>();

            var (systemPrompt, userPrompt) = BuildSuggestPrompt(aiSearchDto, userHistory);

            string raw = await _groq.ChatAsync(systemPrompt, userPrompt);

            if (string.IsNullOrWhiteSpace(raw))
                return new List<string>();

            string json = TryExtractJsonArray(raw);

            try
            {
                var result = JsonSerializer.Deserialize<List<string>>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                return result ?? new List<string>();
            }
            catch
            {
                return new List<string>();
            }
        }

        // ==================== Build Suggest Prompt ====================
        private (string systemPrompt, string userPrompt) BuildSuggestPrompt(
            AiSearchRequestDto aiSearchDto,
            List<string> userHistory
        )
        {
            string systemPrompt =
                @"You are a search keyword suggestion system for a construction and home repair marketplace.

CRITICAL RULES:
1. Response must be ONLY a valid JSON array of strings
2. NO markdown, NO ```json wrapper, NO explanation
3. NO extra text before or after JSON
4. Output format EXACTLY: [""keyword1"", ""keyword2"", ""keyword3""]
5. Each keyword must be relevant to the search category
6. Keywords should be practical and commonly searched";

            string userPrompt;

            if (userHistory.Any())
            {
                string historyText = string.Join(", ", userHistory.Take(5));

                userPrompt =
                    $@"Generate search suggestions based on user history.

USER PROFILE:
- Search Category: {aiSearchDto.SearchType}
- Recent Searches: {historyText}
- Language: {aiSearchDto.Language}

TASK:
Generate 8-10 relevant search keywords for ""{aiSearchDto.SearchType}"" category.

STRATEGY:
- 60% related to user's search history
- 40% popular items in this category

EXAMPLES FOR CATEGORIES:
- Material: ""xi măng"", ""sắt thép"", ""gạch ốp lát"", ""sơn tường"", ""ống nước"", ""cát xây dựng"", ""đá"", ""thép"", ""gỗ""
- Repair: ""sửa điện"", ""sửa ống nước"", ""sơn nhà"", ""chống thấm"", ""sửa mái"", ""lắp điều hòa"", ""sửa tường""
- Construction: ""xây nhà"", ""sửa chữa nhà"", ""đổ bê tông"", ""làm móng"", ""xây tường"", ""lợp mái"", ""hoàn thiện""

OUTPUT (start with [ immediately):
[""keyword1"", ""keyword2"", ""keyword3"", ""keyword4"", ""keyword5"", ""keyword6"", ""keyword7"", ""keyword8""]";
            }
            else
            {
                userPrompt =
                    $@"Generate popular search suggestions for first-time visitor.

USER PROFILE:
- Search Category: {aiSearchDto.SearchType}
- Search History: None
- Language: {aiSearchDto.Language}

TASK:
Suggest 8-10 MOST POPULAR keywords for ""{aiSearchDto.SearchType}"" category.

FOCUS ON:
- Best-selling products/services
- Most frequently searched items
- Essential items people often look for

EXAMPLES FOR CATEGORIES:
- Material: ""xi măng"", ""sắt thép"", ""gạch ốp lát"", ""sơn tường"", ""ống nước"", ""cát xây dựng"", ""đá"", ""thép"", ""gỗ""
- Repair: ""sửa điện"", ""sửa ống nước"", ""sơn nhà"", ""chống thấm"", ""sửa mái"", ""lắp điều hòa"", ""sửa tường""
- Construction: ""xây nhà"", ""sửa chữa nhà"", ""đổ bê tông"", ""làm móng"", ""xây tường"", ""lợp mái"", ""hoàn thiện""

OUTPUT (start with [ immediately):
[""keyword1"", ""keyword2"", ""keyword3"", ""keyword4"", ""keyword5"", ""keyword6"", ""keyword7"", ""keyword8""]";
            }

            return (systemPrompt, userPrompt);
        }

        // ==================== Extract JSON Array ====================
        private string TryExtractJsonArray(string raw)
        {
            raw = raw.Trim();

            if (raw.StartsWith("```json"))
                raw = raw.Substring(7);
            if (raw.StartsWith("```"))
                raw = raw.Substring(3);
            if (raw.EndsWith("```"))
                raw = raw.Substring(0, raw.Length - 3);

            raw = raw.Trim();

            int start = raw.IndexOf('[');
            int end = raw.LastIndexOf(']');

            if (start == -1 || end == -1 || end <= start)
                return "[]";

            return raw.Substring(start, end - start + 1);
        }

        public async Task<List<object>> SearchWithAISuggestionsAsync(AiSearchRequestDto aiSearchDto)
        {
            var aiKeywords = await SuggestSearchAsync(aiSearchDto);
            var results = new List<object>();

            foreach (var keyword in aiKeywords)
            {
                var parameter = new QueryParameters
                {
                    Search = keyword,
                    SearchType = aiSearchDto.SearchType,
                };

                switch (aiSearchDto.SearchType)
                {
                    case "Material":
                        var materialResult = await _materialService.GetAllMaterialAsync(parameter);
                        if (materialResult?.Items != null)
                            results.AddRange(materialResult.Items);
                        break;

                    case "Repair":
                    case "Construction":
                        var serviceResult = await _servicesService.GetAllServicesAsync(parameter);
                        if (serviceResult?.Items != null)
                            results.AddRange(serviceResult.Items);
                        break;
                }
            }

            return results.Distinct().ToList();
        }

        public async Task<AiServiceRequestPredictionResponseDto> EstimatePriceAsync(
            AIServiceRequestPredictionRequestDto dto
        )
        {
            // 1. Load JSON config
            var configPath = Path.Combine(_env.ContentRootPath, "wwwroot/base_price_config.json");
            if (!File.Exists(configPath))
                throw new FileNotFoundException("Missing base_price_config.json", configPath);

            string configContent = await File.ReadAllTextAsync(configPath);

            // 2. Build system + user prompt
            var (systemPrompt, userPrompt) = BuildPrompt(dto, configContent);

            // 3. Call AI (Groq)
            string raw = await _groq.ChatAsync(systemPrompt, userPrompt);

            if (string.IsNullOrWhiteSpace(raw))
                return new AiServiceRequestPredictionResponseDto
                {
                    SuggestedDescription = "AI did not return any result.",
                    LowEstimate = 0,
                    MidEstimate = 0,
                    HighEstimate = 0,
                };

            // 4. Extract JSON from AI response
            string json = TryExtractJson(raw);

            // 5. Deserialize
            try
            {
                var result = JsonSerializer.Deserialize<AiServiceRequestPredictionResponseDto>(
                    json,
                    new JsonSerializerOptions { PropertyNameCaseInsensitive = true }
                );

                return result!;
            }
            catch
            {
                return new AiServiceRequestPredictionResponseDto
                {
                    SuggestedDescription = "Invalid JSON returned by AI",
                    LowEstimate = 0,
                    MidEstimate = 0,
                    HighEstimate = 0,
                };
            }
        }

        private (string systemPrompt, string userPrompt) BuildPrompt(
            AIServiceRequestPredictionRequestDto dto,
            string jsonConfig
        )
        {
            // Serialize config to readable JSON string
            var config = JsonSerializer.Deserialize<JsonElement>(jsonConfig);
            string configJson = JsonSerializer.Serialize(
                config,
                new JsonSerializerOptions { WriteIndented = true }
            );

            // Basic project info
            int floors = dto.Floors > 0 ? dto.Floors : 1;

            double areaPerFloor = dto.Width * dto.Length;
            double totalArea = areaPerFloor * floors;

            string systemPrompt =
                $@"You are an expert architectural consultant. You MUST respond with ONLY valid JSON.

                CRITICAL RULES:
                1. Response must start with {{ and end with }}
                2. NO markdown, NO ```json wrapper, NO explanation
                3. Write all text in {dto.Language} language
                4. Use numbers for estimates (not strings)
                5. Field names: SuggestedDescription, LowEstimate, MidEstimate, HighEstimate

                PRICING CONFIGURATION (refer to and search elsewhere for the most accurate figures reflecting current reality and estimates):
                {configJson}

                HOW TO CALCULATE ESTIMATES:
                1. Find base price from buildingTypeBasePrice based on building type
                2. Calculate: basePrice × area × floors
                3. Apply serviceTypeMultiplier (Construction or Repair)
                4. Apply adjustment based on quality level (low/mid/high)
                5. Adjust further based on materials and features you describe
                6. Round to nearest 10,000,000 VND
                7. Ensure: 500,000,000 ≤ estimate ≤ 20,000,000,000
                8. Ensure: LowEstimate < MidEstimate < HighEstimate

                ADJUSTMENT GUIDELINES:
                - Premium materials (marble, hardwood, imported) → +10-30%
                - Basic materials (standard ceramic, laminate) → -5-15%
                - Smart home, central AC, high-end appliances → +15-25%
                - Minimal features, basic finishes → -10-20%";

            string userPrompt =
                $@"Create detailed property description and cost estimate:

                PROJECT INFO:
                - Type: {dto.ServiceType}
                - Area per floor: {areaPerFloor:N0} m² (Width: {dto.Width}m × Length: {dto.Length}m)
                - Total construction area: {totalArea:N0} m²
                - Floors: {floors}

                OUTPUT JSON (start with {{ immediately):

                {{
                  ""SuggestedDescription"": ""Write EXACTLY 40-50 sentences in {dto.Language} describing the COMPLETED building in great detail. Each sentence must end with a period.

                REQUIRED CONTENT (be very specific and detailed):

                EXTERIOR ARCHITECTURE (8-10 sentences):
                - Overall architectural style and design philosophy
                - Building facade materials, textures, and colors
                - Roof design and materials
                - Main entrance design and features
                - Windows style, size, and placement
                - Balconies, terraces, or outdoor extensions
                - Exterior lighting and decorative elements
                - Driveway and approach to the building

                INTERIOR LAYOUT AND SPACES (15-18 sentences):
                - Main entrance foyer and first impressions
                - Living room: exact size in m², ceiling height, flooring, windows, natural light direction
                - Dining area: location, size, connection to kitchen and living room
                - Kitchen: layout type (L-shape, U-shape, island), countertop material, cabinet material and color, appliance specifications, backsplash, lighting
                - Master bedroom: size, closet space, window placement, ensuite bathroom details
                - Additional bedrooms: individual sizes, features, storage solutions
                - Bathrooms: number, fixtures (toilet, sink, shower/bathtub), tile materials, colors, ventilation
                - Hallways and circulation spaces
                - Staircase design if multi-floor (material, railing, lighting)
                - Additional rooms (study, storage, laundry, utility)

                MATERIALS AND FINISHES (8-10 sentences):
                - Flooring in each area: specific materials (ceramic, porcelain, marble, hardwood, laminate, vinyl)
                - Wall finishes: paint colors, wallpaper, accent walls, textures
                - Ceiling design: height throughout, finish type, crown molding, special features
                - Interior doors: material (wood, composite), color, style, hardware
                - Window frames: material (aluminum, wood, UPVC), color, glass type (clear, tinted, double-glazed)
                - Built-in furniture: wardrobes, shelving, TV units, material and finish
                - Trim and baseboards: style and finish
                - Overall quality of workmanship and attention to detail

                SYSTEMS AND TECHNOLOGY (6-8 sentences):
                - Electrical system: number and placement of outlets, switch types, circuit capacity
                - Lighting: types of fixtures (recessed, pendant, track), placement strategy, warm/cool tones
                - Plumbing: pipe materials, water pressure, hot water system, drainage
                - Air conditioning: type (split units, central), BTU capacity, coverage areas
                - Ventilation: exhaust fans, natural airflow design
                - Smart home readiness: wiring for internet, security cameras, automation

                AMENITIES AND OUTDOOR (5-6 sentences):
                - Storage solutions throughout the property
                - Parking: garage, carport, or open space, capacity
                - Garden or yard: size, landscaping, features
                - Balcony or terrace: size, view, flooring, railing
                - Security features: gate, fencing, door locks
                - Overall lifestyle comfort and convenience

                Write naturally and engagingly. NO price mentions. Each sentence ends with period."",
                  ""LowEstimate"": [Use the PRICING CONFIGURATION to calculate. Start with base price for building type × {areaPerFloor:N0} m² × {floors} floors. Apply serviceTypeMultiplier. Apply quality adjustment (low = 0.92x). Adjust based on your description materials. Round to nearest 10,000,000 VND. Must be 400,000,000 minimum.],
                  ""MidEstimate"": [Calculate using base price × {areaPerFloor:N0} × {floors} × service multiplier × quality adjustment (mid = 1.0x). Adjust based on features you described. Must be higher than LowEstimate. Round to nearest 10,000,000 VND.],
                  ""HighEstimate"": [Calculate using base price × {areaPerFloor:N0} × {floors} × service multiplier × quality adjustment (high = 1.15x). Add premium for luxury features you described. Must be higher than MidEstimate. Round to nearest 10,000,000 VND. Max 20,000,000,000 VND.]
                }}

                CRITICAL PRICING INSTRUCTIONS:
                ⚠️ Use the PRICING CONFIGURATION provided to calculate all estimates
                ⚠️ The estimates MUST reflect the quality and features in your description
                ⚠️ Same input but different descriptions = different prices
                ⚠️ Premium materials = HIGHER price (+10-30%)
                ⚠️ Basic materials = LOWER price (-5-15%)
                ⚠️ Smart home, central AC = HIGHER price (+15-25%)
                ⚠️ LowEstimate < MidEstimate < HighEstimate (ALWAYS)
                ⚠️ Minimum: 400,000,000 VND, Maximum: 20,000,000,000 VND

                CALCULATION EXAMPLE:
                If building type is Villa ({areaPerFloor:N0} m², {floors} floors):
                1. Base: 9,500,000 VND/m² × {areaPerFloor:N0} m² × {floors} = [calculate]
                2. Service: × 1.0 (Construction) or × 0.65 (Repair)
                3. Quality: × 0.92 (low) or × 1.0 (mid) or × 1.15 (high)
                4. Material adjustment: +/- 10-30% based on what you describe
                5. Round to nearest 10,000,000 VND

                WRITING EXAMPLES (use this style in {dto.Language}):
                ✓ ""The modern two-story villa showcases a contemporary architectural design with clean lines and minimalist aesthetics.""
                ✓ ""Premium porcelain floor tiles in light gray tones with subtle marble veining cover the main living areas.""
                ✓ ""The spacious living room measures 42 m² with impressive 3.5-meter high ceilings that create an airy, open atmosphere.""
                ✓ ""The modern kitchen boasts an L-shaped layout with white quartz countertops and soft-close oak veneer cabinets.""

                VALIDATION CHECKLIST:
                ✓ Start with {{ and end with }}
                ✓ NO ```json wrapper
                ✓ EXACTLY 40-50 sentences in {dto.Language}
                ✓ Every sentence ends with period (.)
                ✓ Very specific details (sizes, materials, colors, features)
                ✓ NO price/cost mentions in description
                ✓ Estimates calculated using PRICING CONFIGURATION
                ✓ Numbers for all estimates (not strings)
                ✓ LowEstimate < MidEstimate < HighEstimate
                ✓ All estimates between 400,000,000 and 20,000,000,000 VND

                Generate the JSON now:";

            return (systemPrompt, userPrompt);
        }

        private string TryExtractJson(string raw)
        {
            raw = raw.Trim();
            if (raw.StartsWith("```json"))
                raw = raw.Substring(7);
            if (raw.StartsWith("```"))
                raw = raw.Substring(3);
            if (raw.EndsWith("```"))
                raw = raw.Substring(0, raw.Length - 3);

            raw = raw.Trim();

            int start = raw.IndexOf('{');
            int end = raw.LastIndexOf('}');

            if (start == -1 || end == -1 || end <= start)
                return raw;

            return raw.Substring(start, end - start + 1);
        }

        // -----------------------------
        // PRIVATE HELPER
        // -----------------------------
        private async Task<string> BuildInternalContextAsync(string userPrompt)
        {
            var sb = new StringBuilder();

            List<string> keywords = new List<string>();
            try
            {
                var extractResult = await _groq.ChatAsync(SYSTEM_PROMPT_SUGGEST, userPrompt);
                keywords = ExtractJsonList(extractResult, userPrompt);
            }
            catch
            {
                keywords.Add(userPrompt);
            }

            var allMaterials = await _unitOfWork.MaterialRepository.GetAllAsync();

            var foundMaterials = allMaterials
                .Where(m =>
                    keywords.Any(k => m.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                )
                .Take(5)
                .ToList();

            if (!foundMaterials.Any())
            {
                foundMaterials = allMaterials.Take(5).ToList();
            }

            if (foundMaterials.Any())
            {
                sb.AppendLine("--- DANH SÁCH VẬT LIỆU CÓ SẴN TRONG HỆ THỐNG ---");
                foreach (var m in foundMaterials)
                {
                    sb.AppendLine($"LINK: [{m.Name}](/MaterialDetail/{m.MaterialID})");
                }
            }

            var allServices = await _unitOfWork.ServiceRepository.GetAllAsync();

            var foundServices = allServices
                .Where(s =>
                    keywords.Any(k => s.Name.Contains(k, StringComparison.OrdinalIgnoreCase))
                )
                .Take(5)
                .ToList();

            if (!foundServices.Any())
            {
                foundServices = allServices.Take(5).ToList();
            }

            if (foundServices.Any())
            {
                sb.AppendLine("--- DANH SÁCH DỊCH VỤ CÓ SẴN TRONG HỆ THỐNG ---");
                foreach (var s in foundServices)
                {
                    sb.AppendLine($"LINK: [{s.Name}](/ServiceDetail/{s.ServiceID})");
                }
            }

            if (sb.Length == 0)
            {
                sb.AppendLine(
                    "HỆ THỐNG: Hiện tại kho dữ liệu đang trống. Hãy hướng dẫn khách tạo yêu cầu."
                );
            }

            return sb.ToString();
        }

        private async Task<List<ChatHistoryItem>> GetHistoryFromCacheAsync(string sessionId)
        {
            var key = $"chat_history_{sessionId}";

            try
            {
                var json = await _cache.GetStringAsync(key);
                if (string.IsNullOrEmpty(json))
                {
                    return new List<ChatHistoryItem>
                    {
                        new ChatHistoryItem { Role = SYSTEM, Content = SYSTEM_PROMPT_CHAT },
                    };
                }
                return JsonSerializer.Deserialize<List<ChatHistoryItem>>(json)
                    ?? new List<ChatHistoryItem>();
            }
            catch
            {
                return new List<ChatHistoryItem>
                {
                    new ChatHistoryItem { Role = SYSTEM, Content = SYSTEM_PROMPT_CHAT },
                };
            }
        }

        private async Task SaveHistoryToCacheAsync(string sessionId, List<ChatHistoryItem> history)
        {
            try
            {
                var key = $"chat_history_{sessionId}";
                var options = new DistributedCacheEntryOptions
                {
                    SlidingExpiration = TimeSpan.FromDays(3),
                };

                var result = JsonSerializer.Serialize(history);
                await _cache.SetStringAsync(key, result, options);
            }
            catch
            {
                // Ignore cache save errors
            }
        }

        private static List<string> ExtractJsonList(string aiResponse, string originalQuery)
        {
            try
            {
                int startIndex = aiResponse.IndexOf('[');
                int endIndex = aiResponse.LastIndexOf(']');

                if (startIndex != -1 && endIndex != -1 && endIndex > startIndex)
                {
                    string jsonPart = aiResponse.Substring(startIndex, endIndex - startIndex + 1);
                    var result = JsonSerializer.Deserialize<List<string>>(jsonPart);
                    return result ?? new List<string> { originalQuery };
                }

                return new List<string> { originalQuery };
            }
            catch
            {
                return new List<string> { originalQuery };
            }
        }

        // -----------------------------
        // PRIVATE CLASS HELPER
        // -----------------------------

        private sealed record ChatHistoryItem
        {
            [JsonPropertyName("role")]
            public string Role { get; set; } = "";

            [JsonPropertyName("content")]
            public string Content { get; set; } = "";
        }
    }
}
