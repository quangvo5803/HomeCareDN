using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using BusinessLogic.DTOs.Application;
using BusinessLogic.DTOs.Application.Chat.Ai;
using BusinessLogic.Services.Interfaces;
using DataAccess.UnitOfWork;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Hosting;
using Ultitity.Clients.Groqs;

namespace BusinessLogic.Services
{
    public class AiChatService : IAiChatService
    {
        private readonly IGroqClient _groq;
        private readonly IDistributedCache _cache;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IHostEnvironment _env;
        private readonly IMaterialService _materialService;
        private readonly IServicesService _servicesService;

        private const string USER = "user";
        private const string SYSTEM = "system";
        private const string ASSISTANT = "assistant";

        public AiChatService(
            IGroqClient groq,
            IDistributedCache cache,
            IUnitOfWork unitOfWork,
            IHostEnvironment env,
            IMaterialService materialService,
            IServicesService servicesService
        )
        {
            _groq = groq;
            _cache = cache;
            _unitOfWork = unitOfWork;
            _env = env;
            _materialService = materialService;
            _servicesService = servicesService;
        }

        public async Task<AiChatResponseDto> ChatSupportAsync(AiChatRequestDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Prompt))
            {
                if (dto.Language == "vi")
                {
                    return new AiChatResponseDto { Reply = "Bạn cần hỗ trợ gì không?" };
                }
                else
                {
                    return new AiChatResponseDto { Reply = "Do you need some support?" };
                }
            }

            var history = await GetHistoryFromCacheAsync(dto.SessionId);

            string internalContext = await BuildContextFromFeDataAsync(dto.Context, dto.Prompt);

            history.RemoveAll(x => x.Role == SYSTEM);

            var dynamicSystemPrompt =
                $"@\"- Write all text in {dto.Language} \n\rYou are the HomeCareDN Virtual Assistant (English/Vietnamese).\r\n   \r\n   TASKS:\r\n   1. Support searching for materials and services.\r\n   2. Answer based on the [SYSTEM DATA] below.\r\n\r\n   LINK ATTACHMENT RULES (MANDATORY):\r\n   - Look at the [SYSTEM DATA] section.\r\n   - If you see a line starting with 'LINK:', copy that line verbatim to send to the customer.\r\n   - Example: If the data has 'LINK: [Tile A](/path/123)', you reply: 'You can refer to [Tile A](/path/123)'.\r\n   - IF THERE IS NO 'LINK:' LINE -> ABSOLUTELY DO NOT MAKE UP LINKS.\r\n\r\n   RESPONSE RULES:\r\n   - If the [SYSTEM DATA] has a product matching the need -> Introduce it and attach the link.\r\n   - If the [SYSTEM DATA] returns products that DO NOT match (Other suggestions) -> Say: 'Currently we do not have the exact type you are looking for, but we have these types...' (Attach links to those types).\r\n   - If there is absolutely nothing -> Guide the user to create a 'Request'.\r\n\r\n   REQUEST CREATION RULES:\r\n   - Check the [USER PROFILE]. If 'HasAddress' = false -> Remind to update the address at [Profile](/Customer).\r\n   - Only guide creating a request when no suitable product is found.\";\r\n\n\n{internalContext}";

            history.Insert(0, new ChatHistoryItem { Role = SYSTEM, Content = dynamicSystemPrompt });

            history.Add(new ChatHistoryItem { Role = USER, Content = dto.Prompt });

            var result = await _groq.ChatAsync(history);

            if (!string.IsNullOrEmpty(result))
            {
                var historyToSave = history.Where(x => x.Role != SYSTEM).ToList();
                historyToSave.Add(new ChatHistoryItem { Role = ASSISTANT, Content = result });
                await SaveHistoryToCacheAsync(dto.SessionId, historyToSave);
            }

            return new AiChatResponseDto { Reply = result };
        }

        public async Task<List<string>> SuggestSearchAsync(AiSearchRequestDto aiSuggest)
        {
            if (aiSuggest == null || string.IsNullOrWhiteSpace(aiSuggest.SearchType))
                return new List<string>();

            if (string.IsNullOrWhiteSpace(aiSuggest.Language))
                aiSuggest.Language = "en";

            var userHistory = aiSuggest.History ?? new List<string>();

            var (systemPrompt, userPrompt) = BuildSuggestPrompt(aiSuggest, userHistory);

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

        // -------------------------------------------------------------
        // PRIVATE HELPER
        // -------------------------------------------------------------

        // ==================== Build Suggest Prompt ====================
        private static (string systemPrompt, string userPrompt) BuildSuggestPrompt(
            AiSearchRequestDto aiSuggest,
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
                    - Search Category: {aiSuggest.SearchType}
                    - Recent Searches: {historyText}
                    - Language: {aiSuggest.Language}

                    TASK:
                    Generate 8-10 relevant search keywords for ""{aiSuggest.SearchType}"" category.

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
                - Search Category: {aiSuggest.SearchType}
                - Search History: None
                - Language: {aiSuggest.Language}

                TASK:
                Suggest 8-10 MOST POPULAR keywords for ""{aiSuggest.SearchType}"" category.

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
        private static string TryExtractJsonArray(string raw)
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

        public async Task<List<object>> SearchWithAISuggestionsAsync(AiSearchRequestDto aiSuggest)
        {
            var aiKeywords = await SuggestSearchAsync(aiSuggest);
            var results = new List<object>();

            foreach (var keyword in aiKeywords)
            {
                var parameter = new QueryParameters
                {
                    Search = keyword,
                    SearchType = aiSuggest.SearchType,
                };

                switch (aiSuggest.SearchType)
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

        //============================================= EstimatePrice ===========================================

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

        //=======================================================================================================


        //=============================================ChatAsync ================================================
        private async Task<string> BuildContextFromFeDataAsync(AiContextDto? dto, string userPrompt)
        {
            var sb = new StringBuilder();

            // 1. Build Project Context
            AppendProjectInfo(sb, dto);

            // 2. Prepare Keywords
            var searchKeywords = GetSearchKeywords(dto, userPrompt);

            sb.AppendLine("\n[SYSTEM DATA]");

            // 3. Search Materials
            var matchedMaterials = await SearchMaterialsAsync(searchKeywords);

            // 4. Append Suggestions to StringBuilder
            AppendMaterialSuggestions(sb, matchedMaterials);

            return sb.ToString();
        }

        // Helper 1: ChatAsync
        private static void AppendProjectInfo(StringBuilder sb, AiContextDto? dto)
        {
            if (dto == null)
                return;

            sb.AppendLine("[PROJECT OF CUSTOMER]");
            string size = $" ({dto.Width} x {dto.Length} x {dto.Floors}m )";
            sb.AppendLine($"Project: {dto.ServiceType}, {dto.BuildingType}, {size}, {dto.Address}");

            if (!string.IsNullOrEmpty(dto.Description))
            {
                sb.AppendLine($"Note: {dto.Description}");
            }
        }

        // Helper 2: ChatAsync
        private static List<string> GetSearchKeywords(AiContextDto? dto, string userPrompt)
        {
            var keywords = new List<string>();

            if (dto != null)
            {
                if (!string.IsNullOrEmpty(dto.BuildingType))
                    keywords.Add(dto.BuildingType);
                if (!string.IsNullOrEmpty(dto.ServiceType))
                    keywords.Add(dto.ServiceType);

                if (IsAgreement(userPrompt))
                {
                    keywords.AddRange(new[] { "cement", "brick", "pain", "steel", "sand" });
                }
            }

            if (!string.IsNullOrWhiteSpace(userPrompt))
            {
                keywords.Add(userPrompt);
            }

            return keywords;
        }

        // Helper 3: ChatAsync
        private async Task<List<DataAccess.Entities.Application.Material>> SearchMaterialsAsync(
            List<string> keywords
        )
        {
            var query = _unitOfWork.MaterialRepository.GetQueryable().AsNoTracking();
            var matchedMaterials = new List<DataAccess.Entities.Application.Material>();

            if (keywords.Any())
            {
                foreach (var k in keywords)
                {
                    var foundItems = await query
                        .Where(m =>
                            !string.IsNullOrEmpty(m.Name)
                            && (
                                m.Name.Contains(k)
                                || (m.Description != null && m.Description.Contains(k))
                            )
                        )
                        .Take(10)
                        .ToListAsync();

                    matchedMaterials.AddRange(foundItems);
                }

                return matchedMaterials
                    .GroupBy(m => m.MaterialID)
                    .Select(g => g.First())
                    .Take(10)
                    .ToList();
            }

            return await query.Where(m => !string.IsNullOrEmpty(m.Name)).Take(5).ToListAsync();
        }

        // Helper 4: ChatAsync
        private static void AppendMaterialSuggestions(
            StringBuilder sb,
            List<DataAccess.Entities.Application.Material> materials
        )
        {
            if (materials.Any())
            {
                sb.AppendLine("--- SUGGESTION PRODUCTS ---");
                foreach (var m in materials)
                {
                    sb.AppendLine($"LINK: [{m.Name}](/MaterialDetail/{m.MaterialID})");
                }
            }
            else
            {
                sb.AppendLine("(The system temporary not have any material)");
            }
        }

        private static bool IsAgreement(string text)
        {
            if (string.IsNullOrEmpty(text))
                return false;
            var t = text.ToLower();
            return t.Contains("yes");
        }

        //=======================================================================================================
        private async Task<List<ChatHistoryItem>> GetHistoryFromCacheAsync(string sessionId)
        {
            var key = $"chat_history_{sessionId}";
            try
            {
                var json = await _cache.GetStringAsync(key);
                return string.IsNullOrEmpty(json)
                    ? new List<ChatHistoryItem>()
                    : JsonSerializer.Deserialize<List<ChatHistoryItem>>(json)!;
            }
            catch
            {
                return new List<ChatHistoryItem>();
            }
        }

        private async Task SaveHistoryToCacheAsync(string sessionId, List<ChatHistoryItem> history)
        {
            try
            {
                var key = $"chat_history_{sessionId}";
                await _cache.SetStringAsync(
                    key,
                    JsonSerializer.Serialize(history),
                    new DistributedCacheEntryOptions { SlidingExpiration = TimeSpan.FromDays(1) }
                );
            }
            catch
            {
                // Intentionally ignore cache errors to prevent blocking the chat flow
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
