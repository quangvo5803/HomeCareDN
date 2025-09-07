﻿namespace Ultitity.Options
{
    public class JwtOptions
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public string Audience { get; set; } = string.Empty;
        public int AccessTokenMinutes { get; set; } = 5;
    }
}
