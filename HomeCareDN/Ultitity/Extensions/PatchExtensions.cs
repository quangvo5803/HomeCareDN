using System.Reflection;

namespace Ultitity.Extensions
{
    using System.Reflection;

    public static class PatchExtensions
    {
        public static void PatchFrom<TSource, TDestination>(this TDestination dest, TSource source)
        {
            var sourceProps = typeof(TSource).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );
            var destProps = typeof(TDestination).GetProperties(
                BindingFlags.Public | BindingFlags.Instance
            );

            foreach (var sourceProp in sourceProps)
            {
                var destProp = destProps.FirstOrDefault(p =>
                    p.Name == sourceProp.Name && p.CanWrite
                );
                if (destProp == null)
                    continue;

                var value = sourceProp.GetValue(source);

                try
                {
                    // Nếu kiểu destination có thể nhận trực tiếp
                    if (destProp.PropertyType.IsAssignableFrom(sourceProp.PropertyType))
                    {
                        destProp.SetValue(dest, value);
                    }
                    else
                    {
                        // Nếu kiểu source là nullable, lấy underlying type
                        var targetType =
                            Nullable.GetUnderlyingType(destProp.PropertyType)
                            ?? destProp.PropertyType;

                        // Convert kiểu và gán giá trị
                        var convertedValue = Convert.ChangeType(value, targetType);
                        destProp.SetValue(dest, convertedValue);
                    }
                }
                catch
                {
                    // Bỏ qua nếu không convert được (hoặc log nếu muốn)
                }
            }
        }
    }
}
