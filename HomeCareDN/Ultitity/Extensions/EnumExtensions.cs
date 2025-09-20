﻿using System.ComponentModel.DataAnnotations;
using System.Reflection;

namespace Ultitity.Extensions
{
    public static class EnumExtensions
    {
        public static string GetDisplayName(this Enum enumValue)
        {
            var memberInfo = enumValue.GetType().GetMember(enumValue.ToString()).FirstOrDefault();
            if (memberInfo != null)
            {
                var displayAttr = memberInfo.GetCustomAttribute<DisplayAttribute>();
                if (displayAttr != null)
                    return displayAttr.Name ?? enumValue.ToString();
            }

            return enumValue.ToString();
        }

        public static List<EnumDto> GetEnumList<T>()
            where T : Enum
        {
            return Enum.GetValues(typeof(T))
                .Cast<T>()
                .Select(e => new EnumDto
                {
                    Value = e.ToString(),
                    DisplayName =
                        e.GetType()
                            .GetMember(e.ToString())[0]
                            .GetCustomAttribute<DisplayAttribute>()
                            ?.Name ?? e.ToString(),
                })
                .ToList();
        }
    }
}
